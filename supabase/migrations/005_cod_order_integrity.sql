-- ============================================================
-- AK QIMAASH — Migration 005: COD Order Integrity & State Machine
-- 1. Atomic COD Order Creation RPC with:
--    - Server-side price verification
--    - Atomic inventory reservation & ledger logging
--    - Idempotency / duplicate order protection
--    - Cash on Delivery (COD) abuse prevention & risk limits
-- 2. Strict Order Status Transition State Machine Trigger
-- 3. Automatic payment collection on DELIVERED
-- 4. Automatic stock restoration on CANCELLED
-- 5. Tightened RLS on orders and order items
-- ============================================================

-- Add idempotency_key column to orders table if not present
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_orders_idempotency ON public.orders(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON public.orders(user_id, status);

-- ─── 1. ORDER STATUS TRANSITION VALIDATION & RESTORATION TRIGGER ────────────

CREATE OR REPLACE FUNCTION public.validate_order_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id UUID;
  item_record RECORD;
BEGIN
  -- Only execute if status has changed
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  caller_id := auth.uid();

  -- Verify caller has ORDER_MANAGER or ADMIN role for any status change
  IF caller_id IS NOT NULL AND NOT (
    public.has_role(caller_id, 'ORDER_MANAGER') OR public.has_role(caller_id, 'ADMIN')
  ) THEN
    RAISE EXCEPTION 'Permission denied. Only Order Managers and Administrators can update order status.'
      USING ERRCODE = '42501';
  END IF;

  -- 1. Terminal state check: DELIVERED cannot be changed
  IF OLD.status = 'DELIVERED' THEN
    RAISE EXCEPTION 'Cannot update an order that has already been delivered.'
      USING ERRCODE = '23514';
  END IF;

  -- 2. Terminal state check: CANCELLED cannot be changed
  IF OLD.status = 'CANCELLED' THEN
    RAISE EXCEPTION 'Cannot reopen an order that has been cancelled.'
      USING ERRCODE = '23514';
  END IF;

  -- 3. Strict valid status transition paths
  -- PLACED -> CONFIRMED, CANCELLED
  -- CONFIRMED -> PROCESSING, CANCELLED
  -- PROCESSING -> SHIPPED, CANCELLED
  -- SHIPPED -> OUT_FOR_DELIVERY
  -- OUT_FOR_DELIVERY -> DELIVERED
  IF NOT (
    (OLD.status = 'PLACED' AND NEW.status IN ('CONFIRMED', 'CANCELLED')) OR
    (OLD.status = 'CONFIRMED' AND NEW.status IN ('PROCESSING', 'CANCELLED')) OR
    (OLD.status = 'PROCESSING' AND NEW.status IN ('SHIPPED', 'CANCELLED')) OR
    (OLD.status = 'SHIPPED' AND NEW.status = 'OUT_FOR_DELIVERY') OR
    (OLD.status = 'OUT_FOR_DELIVERY' AND NEW.status = 'DELIVERED')
  ) THEN
    RAISE EXCEPTION 'Invalid order status transition from % to %.', OLD.status, NEW.status
      USING ERRCODE = '23514';
  END IF;

  -- 4. Automatic COD payment collection on DELIVERED
  IF NEW.status = 'DELIVERED' AND NEW.payment_method = 'COD' THEN
    NEW.payment_status := 'PAID';
  END IF;

  -- 5. Automatic stock restoration and ledger recording on CANCELLED
  IF NEW.status = 'CANCELLED' THEN
    FOR item_record IN
      SELECT variant_id, quantity
      FROM public.order_items
      WHERE order_id = NEW.id
    LOOP
      -- Restore inventory
      UPDATE public.product_variants
      SET stock_quantity = stock_quantity + item_record.quantity,
          updated_at = NOW()
      WHERE id = item_record.variant_id;

      -- Record inventory transaction
      INSERT INTO public.inventory_transactions (
        variant_id,
        transaction_type,
        quantity_delta,
        quantity_before,
        quantity_after,
        order_id,
        reason,
        created_by
      )
      VALUES (
        item_record.variant_id,
        'ORDER_CANCELLATION',
        item_record.quantity,
        (SELECT stock_quantity - item_record.quantity FROM public.product_variants WHERE id = item_record.variant_id),
        (SELECT stock_quantity FROM public.product_variants WHERE id = item_record.variant_id),
        NEW.id,
        'Stock restored upon order cancellation',
        caller_id
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_order_status_transition ON public.orders;
CREATE TRIGGER trg_validate_order_status_transition
  BEFORE UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_order_status_transition();


-- ─── 2. ATOMIC COD ORDER CREATION RPC FUNCTION ──────────────────────────────

CREATE OR REPLACE FUNCTION public.create_cod_order(
  p_address JSONB,
  p_items JSONB,
  p_idempotency_key TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_existing_order JSONB;
  v_pending_count INTEGER;
  v_cancelled_count INTEGER;
  v_subtotal INTEGER := 0;
  v_gst INTEGER := 0;
  v_delivery INTEGER := 0;
  v_total INTEGER := 0;
  v_order_id UUID;
  v_order_number TEXT;
  v_item JSONB;
  v_variant_id UUID;
  v_qty INTEGER;
  v_db_variant RECORD;
  v_item_total INTEGER;
  v_stock_before INTEGER;
  v_stock_after INTEGER;
BEGIN
  -- 1. Verify authentication
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED: You must be signed in to place an order.'
      USING ERRCODE = '42501';
  END IF;

  -- 2. Idempotency Check: Return existing order if key was already processed
  IF p_idempotency_key IS NOT NULL THEN
    SELECT jsonb_build_object(
      'order_id', id,
      'order_number', order_number,
      'status', status,
      'total_cents', total_cents,
      'idempotent_replay', true
    )
    INTO v_existing_order
    FROM public.orders
    WHERE idempotency_key = p_idempotency_key
      AND user_id = v_user_id;

    IF v_existing_order IS NOT NULL THEN
      RETURN v_existing_order;
    END IF;
  END IF;

  -- 3. COD Risk Rules & Abuse Prevention
  -- Rule A: Check unfulfilled pending COD orders (maximum 3 allowed in flight)
  SELECT COUNT(*) INTO v_pending_count
  FROM public.orders
  WHERE user_id = v_user_id
    AND status IN ('PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY')
    AND payment_method = 'COD';

  IF v_pending_count >= 3 THEN
    RAISE EXCEPTION 'COD_LIMIT_EXCEEDED: You have % active Cash on Delivery orders in transit. Please receive or settle current orders before placing new ones.', v_pending_count
      USING ERRCODE = '23514';
  END IF;

  -- Rule B: Check high cancellation rate in past 30 days (max 2 cancelled orders)
  SELECT COUNT(*) INTO v_cancelled_count
  FROM public.orders
  WHERE user_id = v_user_id
    AND status = 'CANCELLED'
    AND payment_method = 'COD'
    AND created_at >= NOW() - INTERVAL '30 days';

  IF v_cancelled_count >= 2 THEN
    RAISE EXCEPTION 'COD_RESTRICTED: Cash on Delivery is temporarily paused due to previous order cancellations. Please contact atelier support at orders@akqimaash.sg.'
      USING ERRCODE = '23514';
  END IF;

  -- 4. Validate items array
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'EMPTY_BAG: Order must contain at least one item.'
      USING ERRCODE = '23514';
  END IF;

  -- 5. Calculate Server-Side Prices and Verify Stock with Row-Level Locks
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_variant_id := (v_item->>'variant_id')::UUID;
    v_qty := (v_item->>'quantity')::INTEGER;

    IF v_qty <= 0 THEN
      RAISE EXCEPTION 'INVALID_QUANTITY: Quantity must be at least 1.' USING ERRCODE = '23514';
    END IF;

    -- Lock the variant row to prevent race conditions during concurrent orders
    SELECT
      v.id,
      v.product_id,
      v.sku,
      v.size,
      v.color,
      v.price_cents,
      v.stock_quantity,
      v.is_active,
      p.name AS product_name,
      p.is_published,
      p.is_archived
    INTO v_db_variant
    FROM public.product_variants v
    JOIN public.products p ON p.id = v.product_id
    WHERE v.id = v_variant_id
    FOR UPDATE OF v;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'VARIANT_NOT_FOUND: Garment variant not found (ID: %).', v_variant_id
        USING ERRCODE = '23503';
    END IF;

    IF NOT v_db_variant.is_active OR NOT v_db_variant.is_published OR v_db_variant.is_archived THEN
      RAISE EXCEPTION 'PRODUCT_UNAVAILABLE: Garment "%" is no longer available.', v_db_variant.product_name
        USING ERRCODE = '23514';
    END IF;

    IF v_db_variant.stock_quantity < v_qty THEN
      RAISE EXCEPTION 'OUT_OF_STOCK: Insufficient inventory for "%" (SKU: %). Only % available.',
        v_db_variant.product_name, v_db_variant.sku, v_db_variant.stock_quantity
        USING ERRCODE = '23514';
    END IF;

    v_item_total := v_db_variant.price_cents * v_qty;
    v_subtotal := v_subtotal + v_item_total;
  END LOOP;

  -- Rule C: Single COD Order Ceiling (Max SGD $1,500 = 150,000 cents)
  IF v_subtotal > 150000 THEN
    RAISE EXCEPTION 'COD_MAX_AMOUNT_EXCEEDED: Cash on Delivery orders cannot exceed SGD $1,500. For large bespoke atelier orders, please contact support.'
      USING ERRCODE = '23514';
  END IF;

  -- 6. Server-Side Commerce Calculations
  -- Singapore 9% GST inclusive: gst = round(subtotal - (subtotal / 1.09))
  v_gst := ROUND(v_subtotal - (v_subtotal / 1.09));
  
  -- Complimentary delivery if subtotal >= SGD $100 (10,000 cents), otherwise SGD $5 (500 cents)
  IF v_subtotal >= 10000 THEN
    v_delivery := 0;
  ELSE
    v_delivery := 500;
  END IF;

  v_total := v_subtotal + v_delivery;

  -- 7. Ensure User Profile Exists
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (
    v_user_id,
    COALESCE((SELECT email FROM auth.users WHERE id = v_user_id), ''),
    COALESCE(p_address->>'recipient_name', 'Customer'),
    COALESCE(p_address->>'phone', '')
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
      phone = COALESCE(EXCLUDED.phone, profiles.phone);

  -- 8. Insert Order Record
  INSERT INTO public.orders (
    user_id,
    address_snapshot,
    status,
    payment_method,
    payment_status,
    subtotal_cents,
    gst_cents,
    delivery_cents,
    total_cents,
    notes,
    idempotency_key
  )
  VALUES (
    v_user_id,
    p_address,
    'PLACED',
    'COD',
    'PENDING',
    v_subtotal,
    v_gst,
    v_delivery,
    v_total,
    p_notes,
    p_idempotency_key
  )
  RETURNING id, order_number INTO v_order_id, v_order_number;

  -- 9. Insert Order Items & Atomically Deduct Stock & Write Ledger
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_variant_id := (v_item->>'variant_id')::UUID;
    v_qty := (v_item->>'quantity')::INTEGER;

    SELECT
      v.id,
      v.product_id,
      v.sku,
      v.size,
      v.color,
      v.price_cents,
      v.stock_quantity,
      p.name AS product_name
    INTO v_db_variant
    FROM public.product_variants v
    JOIN public.products p ON p.id = v.product_id
    WHERE v.id = v_variant_id;

    v_stock_before := v_db_variant.stock_quantity;
    v_stock_after := v_stock_before - v_qty;

    -- Insert order item
    INSERT INTO public.order_items (
      order_id,
      variant_id,
      product_id,
      product_name,
      variant_sku,
      variant_size,
      variant_color,
      quantity,
      unit_price_cents,
      total_price_cents
    )
    VALUES (
      v_order_id,
      v_variant_id,
      v_db_variant.product_id,
      v_db_variant.product_name,
      v_db_variant.sku,
      v_db_variant.size,
      v_db_variant.color,
      v_qty,
      v_db_variant.price_cents,
      v_db_variant.price_cents * v_qty
    );

    -- Atomic stock reduction
    UPDATE public.product_variants
    SET stock_quantity = v_stock_after,
        updated_at = NOW()
    WHERE id = v_variant_id;

    -- Immutable inventory transaction
    INSERT INTO public.inventory_transactions (
      variant_id,
      transaction_type,
      quantity_delta,
      quantity_before,
      quantity_after,
      order_id,
      reason,
      created_by
    )
    VALUES (
      v_variant_id,
      'ORDER_RESERVATION',
      -v_qty,
      v_stock_before,
      v_stock_after,
      v_order_id,
      'Atomic reservation for order ' || v_order_number,
      v_user_id
    );
  END LOOP;

  -- 10. Initial Status History
  INSERT INTO public.order_status_history (
    order_id,
    status,
    note,
    created_by
  )
  VALUES (
    v_order_id,
    'PLACED',
    'Order placed via Cash on Delivery checkout',
    v_user_id
  );

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'order_number', v_order_number,
    'subtotal_cents', v_subtotal,
    'gst_cents', v_gst,
    'delivery_cents', v_delivery,
    'total_cents', v_total,
    'status', 'PLACED',
    'payment_method', 'COD',
    'idempotency_key', p_idempotency_key
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_cod_order(JSONB, JSONB, TEXT, TEXT) TO authenticated;


-- ─── 3. TIGHTEN RLS ON ORDERS AND ORDER ITEMS ───────────────────────────────

-- Ensure customers cannot directly INSERT orders with arbitrary prices or DELIVERED status
DROP POLICY IF EXISTS "orders_customer_insert" ON public.orders;
CREATE POLICY "orders_customer_insert" ON public.orders FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    status = 'PLACED' AND
    payment_method = 'COD' AND
    payment_status = 'PENDING'
  );

-- Disallow customer UPDATE/DELETE on orders
DROP POLICY IF EXISTS "orders_customer_update" ON public.orders;
DROP POLICY IF EXISTS "orders_customer_delete" ON public.orders;

-- Disallow customer UPDATE/DELETE on order items
DROP POLICY IF EXISTS "order_items_customer_update" ON public.order_items;
DROP POLICY IF EXISTS "order_items_customer_delete" ON public.order_items;
