-- ============================================================
-- AK QIMAASH — Admin Security Hardening Migration
-- Tightens RLS, adds audit triggers, prepares MFA columns
-- ============================================================

-- ─── 1. MFA COLUMNS ON PROFILES ─────────────────────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS mfa_enrolled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS mfa_enforced_at TIMESTAMPTZ;

-- ─── 2. ADMIN SESSION VALIDATION HELPER ─────────────────────────────────────

-- Returns TRUE if the current session belongs to an admin/manager role.
-- Can be extended later to also check MFA (AAL2) via auth.jwt()->'amr'.
CREATE OR REPLACE FUNCTION public.is_admin_session()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('ADMIN', 'ORDER_MANAGER', 'CONTENT_MANAGER')
  );
$$;

-- Returns TRUE if the current session has MFA (AAL2) verified.
-- Reads the 'aal' claim from the JWT. Falls back to true if claim is missing
-- (graceful degradation for sessions created before MFA was configured).
CREATE OR REPLACE FUNCTION public.is_mfa_verified()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'aal')::text = '"aal2"',
    true
  );
$$;

-- ─── 3. TIGHTEN RLS: CATEGORIES ─────────────────────────────────────────────
-- Currently uses FOR ALL which allows DELETE by CONTENT_MANAGER.
-- Split into granular policies.

DROP POLICY IF EXISTS "categories_admin_write" ON public.categories;

-- CONTENT_MANAGER + ADMIN can insert
CREATE POLICY "categories_insert" ON public.categories FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'CONTENT_MANAGER'));

-- CONTENT_MANAGER + ADMIN can update
CREATE POLICY "categories_update" ON public.categories FOR UPDATE
  USING (has_role(auth.uid(), 'CONTENT_MANAGER'));

-- Only ADMIN can delete categories
CREATE POLICY "categories_delete" ON public.categories FOR DELETE
  USING (has_role(auth.uid(), 'ADMIN'));

-- ─── 4. TIGHTEN RLS: PRODUCTS ───────────────────────────────────────────────

DROP POLICY IF EXISTS "products_admin_write" ON public.products;

CREATE POLICY "products_insert" ON public.products FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'CONTENT_MANAGER'));

CREATE POLICY "products_update" ON public.products FOR UPDATE
  USING (has_role(auth.uid(), 'CONTENT_MANAGER'));

CREATE POLICY "products_delete" ON public.products FOR DELETE
  USING (has_role(auth.uid(), 'ADMIN'));

-- ─── 5. TIGHTEN RLS: PRODUCT VARIANTS ───────────────────────────────────────

DROP POLICY IF EXISTS "variants_admin_write" ON public.product_variants;

CREATE POLICY "variants_insert" ON public.product_variants FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'CONTENT_MANAGER'));

CREATE POLICY "variants_update" ON public.product_variants FOR UPDATE
  USING (has_role(auth.uid(), 'CONTENT_MANAGER'));

CREATE POLICY "variants_delete" ON public.product_variants FOR DELETE
  USING (has_role(auth.uid(), 'ADMIN'));

-- ─── 6. TIGHTEN RLS: PRODUCT IMAGES ─────────────────────────────────────────

DROP POLICY IF EXISTS "images_admin_write" ON public.product_images;

CREATE POLICY "images_insert" ON public.product_images FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'CONTENT_MANAGER'));

CREATE POLICY "images_update" ON public.product_images FOR UPDATE
  USING (has_role(auth.uid(), 'CONTENT_MANAGER'));

CREATE POLICY "images_delete" ON public.product_images FOR DELETE
  USING (has_role(auth.uid(), 'CONTENT_MANAGER'));

-- ─── 7. TIGHTEN RLS: USER ROLES ─────────────────────────────────────────────
-- Only ADMIN should be able to modify user roles.

DROP POLICY IF EXISTS "user_roles_admin_insert" ON public.user_roles;
CREATE POLICY "user_roles_admin_insert" ON public.user_roles FOR INSERT
  WITH CHECK (
    -- Allow system trigger (handle_new_user) which runs as SECURITY DEFINER,
    -- or ADMIN users to insert roles
    has_role(auth.uid(), 'ADMIN')
  );

DROP POLICY IF EXISTS "user_roles_admin_update" ON public.user_roles;
CREATE POLICY "user_roles_admin_update" ON public.user_roles FOR UPDATE
  USING (has_role(auth.uid(), 'ADMIN'));

DROP POLICY IF EXISTS "user_roles_admin_delete" ON public.user_roles;
CREATE POLICY "user_roles_admin_delete" ON public.user_roles FOR DELETE
  USING (has_role(auth.uid(), 'ADMIN'));

-- ─── 8. TIGHTEN RLS: PROFILES (admin/manager can read all) ──────────────────

-- Drop old restrictive read policy and create broader one for admin staff
DROP POLICY IF EXISTS "profiles_own_read" ON public.profiles;
CREATE POLICY "profiles_read" ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR has_role(auth.uid(), 'ADMIN')
    OR has_role(auth.uid(), 'ORDER_MANAGER')
  );

-- ─── 9. MAKE AUDIT LOGS TRULY APPEND-ONLY ──────────────────────────────────

-- Prevent updates and deletes on audit_logs
CREATE OR REPLACE FUNCTION public.prevent_audit_modification()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are immutable and cannot be modified or deleted.';
END;
$$;

DROP TRIGGER IF EXISTS prevent_audit_update ON public.audit_logs;
CREATE TRIGGER prevent_audit_update
  BEFORE UPDATE OR DELETE ON public.audit_logs
  FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_modification();

-- Expand who can insert audit logs (all admin roles can create entries)
DROP POLICY IF EXISTS "audit_admin_insert" ON public.audit_logs;
CREATE POLICY "audit_insert" ON public.audit_logs FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND is_admin_session()
  );

-- ─── 10. AUTOMATIC AUDIT TRIGGER FUNCTION ───────────────────────────────────
-- Automatically logs admin mutations on critical tables to audit_logs.

CREATE OR REPLACE FUNCTION public.audit_admin_action()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  action_type TEXT;
  entity_name TEXT;
  entity_uuid UUID;
  meta JSONB;
  actor UUID;
BEGIN
  actor := auth.uid();

  -- Only log if the actor has an admin/manager role
  IF actor IS NULL THEN
    -- System/service role action — still log but with NULL actor
    actor := NULL;
  END IF;

  action_type := TG_OP;
  entity_name := TG_TABLE_NAME;

  IF TG_OP = 'DELETE' THEN
    entity_uuid := OLD.id;
    meta := jsonb_build_object('deleted_record', to_jsonb(OLD));
  ELSIF TG_OP = 'INSERT' THEN
    entity_uuid := NEW.id;
    meta := jsonb_build_object('new_record', to_jsonb(NEW));
  ELSE -- UPDATE
    entity_uuid := NEW.id;
    -- Capture only changed fields to keep metadata lean
    meta := jsonb_build_object(
      'changes', (
        SELECT jsonb_object_agg(key, jsonb_build_object('old', old_val, 'new', new_val))
        FROM (
          SELECT
            key,
            (to_jsonb(OLD))->>key AS old_val,
            (to_jsonb(NEW))->>key AS new_val
          FROM jsonb_each_text(to_jsonb(NEW)) sub(key, val)
          WHERE (to_jsonb(OLD))->>key IS DISTINCT FROM (to_jsonb(NEW))->>key
        ) diffs
      )
    );
  END IF;

  INSERT INTO public.audit_logs (actor_id, action, entity, entity_id, metadata)
  VALUES (actor, action_type, entity_name, entity_uuid, meta);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- ─── 11. ATTACH AUDIT TRIGGERS TO CRITICAL TABLES ───────────────────────────

-- Orders
DROP TRIGGER IF EXISTS audit_orders ON public.orders;
CREATE TRIGGER audit_orders
  AFTER INSERT OR UPDATE OR DELETE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.audit_admin_action();

-- Products
DROP TRIGGER IF EXISTS audit_products ON public.products;
CREATE TRIGGER audit_products
  AFTER INSERT OR UPDATE OR DELETE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.audit_admin_action();

-- Product Variants
DROP TRIGGER IF EXISTS audit_product_variants ON public.product_variants;
CREATE TRIGGER audit_product_variants
  AFTER INSERT OR UPDATE OR DELETE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.audit_admin_action();

-- Categories
DROP TRIGGER IF EXISTS audit_categories ON public.categories;
CREATE TRIGGER audit_categories
  AFTER INSERT OR UPDATE OR DELETE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.audit_admin_action();

-- Reviews (moderation)
DROP TRIGGER IF EXISTS audit_reviews ON public.reviews;
CREATE TRIGGER audit_reviews
  AFTER UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.audit_admin_action();

-- User Roles
DROP TRIGGER IF EXISTS audit_user_roles ON public.user_roles;
CREATE TRIGGER audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_admin_action();

-- Order Status History
DROP TRIGGER IF EXISTS audit_order_status_history ON public.order_status_history;
CREATE TRIGGER audit_order_status_history
  AFTER INSERT ON public.order_status_history
  FOR EACH ROW EXECUTE FUNCTION public.audit_admin_action();

-- ─── 12. INDEX FOR AUDIT LOG QUERIES ────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
