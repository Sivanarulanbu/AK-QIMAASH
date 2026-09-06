-- ============================================================
-- AK QIMAASH — RBAC & Staff Management Migration
-- Safe role assignment RPC, last-admin protection, staff query view
-- ============================================================

-- ─── 1. SAFE ROLE ASSIGNMENT RPC FUNCTION ──────────────────────────────────
-- Enforces:
--   1. Caller must be an active 'ADMIN'.
--   2. Prevents self-demotion (an admin cannot remove their own admin privileges).
--   3. Prevents demoting the last remaining administrator in the system.
--   4. Emits an audit log entry for the role change.

CREATE OR REPLACE FUNCTION public.assign_user_role(
  target_user_id UUID,
  new_role public.user_role
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id UUID;
  current_target_role public.user_role;
  admin_count INTEGER;
  target_email TEXT;
BEGIN
  caller_id := auth.uid();

  -- 1. Verify caller is authenticated
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.' USING ERRCODE = '42501';
  END IF;

  -- 2. Verify caller has ADMIN role
  IF NOT public.has_role(caller_id, 'ADMIN') THEN
    RAISE EXCEPTION 'Permission denied. Only Administrators can assign roles.' USING ERRCODE = '42501';
  END IF;

  -- 3. Prevent self-demotion
  IF caller_id = target_user_id AND new_role <> 'ADMIN' THEN
    RAISE EXCEPTION 'Self-demotion is not permitted. Another administrator must change your role.' USING ERRCODE = '23514';
  END IF;

  -- 4. Get target's current role
  SELECT role INTO current_target_role
  FROM public.user_roles
  WHERE user_id = target_user_id;

  -- 5. If target was ADMIN and new role is NOT ADMIN, ensure they are not the last admin
  IF current_target_role = 'ADMIN' AND new_role <> 'ADMIN' THEN
    SELECT COUNT(*) INTO admin_count
    FROM public.user_roles
    WHERE role = 'ADMIN';

    IF admin_count <= 1 THEN
      RAISE EXCEPTION 'Cannot demote the last remaining administrator in the system.' USING ERRCODE = '23514';
    END IF;
  END IF;

  -- 6. Upsert the role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, new_role)
  ON CONFLICT (user_id)
  DO UPDATE SET role = EXCLUDED.role;

  -- 7. Get user email for audit log
  SELECT email INTO target_email FROM public.profiles WHERE id = target_user_id;

  -- 8. Audit the role modification
  INSERT INTO public.audit_logs (actor_id, action, entity, entity_id, metadata)
  VALUES (
    caller_id,
    'ASSIGN_ROLE',
    'user_roles',
    target_user_id,
    jsonb_build_object(
      'previous_role', current_target_role,
      'new_role', new_role,
      'target_email', target_email
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'user_id', target_user_id,
    'role', new_role,
    'message', format('Role updated to %s successfully.', new_role)
  );
END;
$$;

-- Grant execution to authenticated users (internal checks enforce ADMIN role)
GRANT EXECUTE ON FUNCTION public.assign_user_role(UUID, public.user_role) TO authenticated;

-- ─── 2. STAFF DIRECTORY RPC FUNCTION ───────────────────────────────────────
-- Returns all staff accounts (ADMIN, ORDER_MANAGER, CONTENT_MANAGER)
-- Only accessible to users with ADMIN role.

CREATE OR REPLACE FUNCTION public.get_staff_members()
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  role public.user_role,
  created_at TIMESTAMPTZ,
  mfa_enrolled BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify caller is ADMIN
  IF NOT public.has_role(auth.uid(), 'ADMIN') THEN
    RAISE EXCEPTION 'Permission denied. Only Administrators can view staff members.' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.email,
    p.full_name,
    p.phone,
    ur.role,
    p.created_at,
    p.mfa_enrolled
  FROM public.profiles p
  JOIN public.user_roles ur ON ur.user_id = p.id
  WHERE ur.role IN ('ADMIN', 'ORDER_MANAGER', 'CONTENT_MANAGER')
  ORDER BY
    CASE ur.role
      WHEN 'ADMIN' THEN 1
      WHEN 'ORDER_MANAGER' THEN 2
      WHEN 'CONTENT_MANAGER' THEN 3
      ELSE 4
    END,
    p.created_at ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_staff_members() TO authenticated;

-- ─── 3. PREVENT DIRECT DELETION OF LAST ADMIN ON USER_ROLES ─────────────────

CREATE OR REPLACE FUNCTION public.prevent_orphan_admin_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  admin_count INTEGER;
BEGIN
  IF OLD.role = 'ADMIN' THEN
    SELECT COUNT(*) INTO admin_count
    FROM public.user_roles
    WHERE role = 'ADMIN' AND id <> OLD.id;

    IF admin_count < 1 THEN
      RAISE EXCEPTION 'Cannot delete the last remaining administrator.' USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_orphan_admin ON public.user_roles;
CREATE TRIGGER trg_prevent_orphan_admin
  BEFORE DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_orphan_admin_deletion();

-- ─── 4. RESTRICT ORDER MODIFICATION FIELDS FOR MANAGERS ──────────────────────
-- Order managers can update status, tracking, courier, and notes, but NOT pricing or user.

CREATE OR REPLACE FUNCTION public.validate_order_update_privileges()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- If not an admin, ensure protected financial and customer fields are not mutated
  IF NOT public.has_role(auth.uid(), 'ADMIN') AND public.has_role(auth.uid(), 'ORDER_MANAGER') THEN
    IF NEW.user_id <> OLD.user_id OR
       NEW.total_cents <> OLD.total_cents OR
       NEW.subtotal_cents <> OLD.subtotal_cents OR
       NEW.gst_cents <> OLD.gst_cents OR
       NEW.delivery_cents <> OLD.delivery_cents OR
       NEW.order_number <> OLD.order_number THEN
      RAISE EXCEPTION 'Order managers may only modify fulfillment statuses, notes, and tracking information.'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_order_update ON public.orders;
CREATE TRIGGER trg_validate_order_update
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_order_update_privileges();
