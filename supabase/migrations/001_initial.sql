-- ============================================================
-- AK QIMAASH — Complete Database Migration
-- Run this in the Supabase SQL Editor (or via Supabase CLI)
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── ENUMS ──────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('CUSTOMER', 'ADMIN', 'ORDER_MANAGER', 'CONTENT_MANAGER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('COD', 'STRIPE', 'PAYNOW');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE inventory_transaction_type AS ENUM (
    'STOCK_RECEIVED', 'STOCK_ADJUSTMENT', 'ORDER_RESERVATION',
    'ORDER_CANCELLATION', 'ORDER_FULFILLMENT', 'RETURN'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── AUTH / RBAC ─────────────────────────────────────────────────────────────

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  phone       TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role       user_role NOT NULL DEFAULT 'CUSTOMER',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL)
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'CUSTOMER');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper function: get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role LANGUAGE sql SECURITY DEFINER AS $$
  SELECT role FROM public.user_roles WHERE user_roles.user_id = $1 LIMIT 1;
$$;

-- Helper function: check if user has role
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, required_role user_role)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = $1
    AND (user_roles.role = $2 OR user_roles.role = 'ADMIN')
  );
$$;

-- ─── PRODUCT CATALOG ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id   UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  image_url   TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  position    INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.products (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  description       TEXT,
  short_description TEXT,
  category_id       UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  is_published      BOOLEAN NOT NULL DEFAULT false,
  is_archived       BOOLEAN NOT NULL DEFAULT false,
  tags              TEXT[] NOT NULL DEFAULT '{}',
  material          TEXT,
  care_instructions TEXT,
  origin            TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_variants (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id          UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku                 TEXT NOT NULL UNIQUE,
  size                TEXT,
  color               TEXT,
  color_hex           TEXT,
  price_cents         INTEGER NOT NULL CHECK (price_cents >= 0),
  compare_price_cents INTEGER CHECK (compare_price_cents >= 0),
  stock_quantity      INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  is_active           BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_images (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  alt        TEXT,
  position   INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── SHOPPING ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.carts (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT cart_owner CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS public.cart_items (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id    UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  quantity   INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(cart_id, variant_id)
);

CREATE TABLE IF NOT EXISTS public.wishlists (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wishlist_id UUID NOT NULL REFERENCES public.wishlists(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(wishlist_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.addresses (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label            TEXT,
  recipient_name   TEXT NOT NULL,
  phone            TEXT NOT NULL,
  block_building   TEXT,
  street           TEXT NOT NULL,
  unit_number      TEXT,
  postal_code      TEXT NOT NULL CHECK (postal_code ~ '^\d{6}$'),
  additional_info  TEXT,
  is_default       BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── FULFILLMENT ─────────────────────────────────────────────────────────────

-- Order number sequence
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1000;

CREATE TABLE IF NOT EXISTS public.orders (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number      TEXT NOT NULL UNIQUE DEFAULT 'AKQ-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0'),
  user_id           UUID NOT NULL REFERENCES public.profiles(id),
  address_snapshot  JSONB NOT NULL,
  status            order_status NOT NULL DEFAULT 'PLACED',
  payment_method    payment_method NOT NULL DEFAULT 'COD',
  payment_status    payment_status NOT NULL DEFAULT 'PENDING',
  payment_reference TEXT,
  subtotal_cents    INTEGER NOT NULL CHECK (subtotal_cents >= 0),
  gst_cents         INTEGER NOT NULL CHECK (gst_cents >= 0),
  delivery_cents    INTEGER NOT NULL DEFAULT 0 CHECK (delivery_cents >= 0),
  total_cents       INTEGER NOT NULL CHECK (total_cents >= 0),
  notes             TEXT,
  courier_name      TEXT,
  tracking_number   TEXT,
  estimated_delivery DATE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id          UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  variant_id        UUID NOT NULL REFERENCES public.product_variants(id),
  product_id        UUID NOT NULL REFERENCES public.products(id),
  product_name      TEXT NOT NULL,
  variant_sku       TEXT NOT NULL,
  variant_size      TEXT,
  variant_color     TEXT,
  quantity          INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_cents  INTEGER NOT NULL CHECK (unit_price_cents >= 0),
  total_price_cents INTEGER NOT NULL CHECK (total_price_cents >= 0),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_status_history (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id   UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status     order_status NOT NULL,
  note       TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Immutable inventory transaction ledger
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_id       UUID NOT NULL REFERENCES public.product_variants(id),
  transaction_type inventory_transaction_type NOT NULL,
  quantity_delta   INTEGER NOT NULL,
  quantity_before  INTEGER NOT NULL,
  quantity_after   INTEGER NOT NULL,
  order_id         UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  reference        TEXT,
  reason           TEXT,
  created_by       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prevent updates/deletes on inventory ledger
CREATE OR REPLACE FUNCTION prevent_inventory_modification()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Inventory transactions are immutable and cannot be modified or deleted.';
END;
$$;

DROP TRIGGER IF EXISTS prevent_inventory_update ON public.inventory_transactions;
CREATE TRIGGER prevent_inventory_update
  BEFORE UPDATE OR DELETE ON public.inventory_transactions
  FOR EACH ROW EXECUTE FUNCTION prevent_inventory_modification();

-- ─── SUPPORT ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.reviews (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id       UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id         UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  rating           SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title            TEXT,
  body             TEXT,
  is_approved      BOOLEAN NOT NULL DEFAULT false,
  is_flagged       BOOLEAN NOT NULL DEFAULT false,
  moderation_note  TEXT,
  moderated_by     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  moderated_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

-- Immutable audit log
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action     TEXT NOT NULL,
  entity     TEXT NOT NULL,
  entity_id  UUID,
  metadata   JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id) WHERE NOT is_archived;
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products(is_published, is_archived);
CREATE INDEX IF NOT EXISTS idx_products_name_search ON public.products USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_variants_product ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_sku ON public.product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_images_product ON public.product_images(product_id, position);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_status_history_order ON public.order_status_history(order_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_variant ON public.inventory_transactions(variant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_time ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON public.wishlists(user_id);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ── Profiles ──
DROP POLICY IF EXISTS "profiles_own_read" ON public.profiles;
CREATE POLICY "profiles_own_read" ON public.profiles FOR SELECT
  USING (auth.uid() = id OR has_role(auth.uid(), 'ADMIN'));

DROP POLICY IF EXISTS "profiles_own_update" ON public.profiles;
CREATE POLICY "profiles_own_update" ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ── User Roles ──
DROP POLICY IF EXISTS "user_roles_own_read" ON public.user_roles;
CREATE POLICY "user_roles_own_read" ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'ADMIN'));

-- ── Categories — public read, admin write ──
DROP POLICY IF EXISTS "categories_public_read" ON public.categories;
CREATE POLICY "categories_public_read" ON public.categories FOR SELECT
  USING (is_active = true OR has_role(auth.uid(), 'CONTENT_MANAGER'));

DROP POLICY IF EXISTS "categories_admin_write" ON public.categories;
CREATE POLICY "categories_admin_write" ON public.categories FOR ALL
  USING (has_role(auth.uid(), 'CONTENT_MANAGER'));

-- ── Products — public read published, admin write ──
DROP POLICY IF EXISTS "products_public_read" ON public.products;
CREATE POLICY "products_public_read" ON public.products FOR SELECT
  USING (is_published = true AND is_archived = false OR has_role(auth.uid(), 'CONTENT_MANAGER'));

DROP POLICY IF EXISTS "products_admin_write" ON public.products;
CREATE POLICY "products_admin_write" ON public.products FOR ALL
  USING (has_role(auth.uid(), 'CONTENT_MANAGER'));

-- ── Product Variants — public read active variants of published products, admin write ──
DROP POLICY IF EXISTS "variants_public_read" ON public.product_variants;
CREATE POLICY "variants_public_read" ON public.product_variants FOR SELECT
  USING (
    is_active = true AND
    EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND is_published = true AND is_archived = false)
    OR has_role(auth.uid(), 'CONTENT_MANAGER')
  );

DROP POLICY IF EXISTS "variants_admin_write" ON public.product_variants;
CREATE POLICY "variants_admin_write" ON public.product_variants FOR ALL
  USING (has_role(auth.uid(), 'CONTENT_MANAGER'));

-- ── Product Images — public read, admin write ──
DROP POLICY IF EXISTS "images_public_read" ON public.product_images;
CREATE POLICY "images_public_read" ON public.product_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "images_admin_write" ON public.product_images;
CREATE POLICY "images_admin_write" ON public.product_images FOR ALL
  USING (has_role(auth.uid(), 'CONTENT_MANAGER'));

-- ── Addresses — own only ──
DROP POLICY IF EXISTS "addresses_own" ON public.addresses;
CREATE POLICY "addresses_own" ON public.addresses FOR ALL
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'ADMIN'));

-- ── Carts ──
DROP POLICY IF EXISTS "carts_own" ON public.carts;
CREATE POLICY "carts_own" ON public.carts FOR ALL
  USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "cart_items_own" ON public.cart_items;
CREATE POLICY "cart_items_own" ON public.cart_items FOR ALL
  USING (EXISTS (SELECT 1 FROM public.carts WHERE id = cart_id AND (user_id = auth.uid() OR user_id IS NULL)));

-- ── Wishlists ──
DROP POLICY IF EXISTS "wishlists_own" ON public.wishlists;
CREATE POLICY "wishlists_own" ON public.wishlists FOR ALL
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "wishlist_items_own" ON public.wishlist_items;
CREATE POLICY "wishlist_items_own" ON public.wishlist_items FOR ALL
  USING (EXISTS (SELECT 1 FROM public.wishlists WHERE id = wishlist_id AND user_id = auth.uid()));

-- ── Orders — own orders for customers, all for order managers ──
DROP POLICY IF EXISTS "orders_own_read" ON public.orders;
CREATE POLICY "orders_own_read" ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'ORDER_MANAGER'));

DROP POLICY IF EXISTS "orders_customer_insert" ON public.orders;
CREATE POLICY "orders_customer_insert" ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "orders_manager_update" ON public.orders;
CREATE POLICY "orders_manager_update" ON public.orders FOR UPDATE
  USING (has_role(auth.uid(), 'ORDER_MANAGER'));

-- ── Order Items ──
DROP POLICY IF EXISTS "order_items_read" ON public.order_items;
CREATE POLICY "order_items_read" ON public.order_items FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
    OR has_role(auth.uid(), 'ORDER_MANAGER')
  );

DROP POLICY IF EXISTS "order_items_insert" ON public.order_items;
CREATE POLICY "order_items_insert" ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
  );

-- ── Order Status History ──
DROP POLICY IF EXISTS "status_history_read" ON public.order_status_history;
CREATE POLICY "status_history_read" ON public.order_status_history FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
    OR has_role(auth.uid(), 'ORDER_MANAGER')
  );

DROP POLICY IF EXISTS "status_history_insert" ON public.order_status_history;
CREATE POLICY "status_history_insert" ON public.order_status_history FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
      OR has_role(auth.uid(), 'ORDER_MANAGER')
    )
  );

-- ── Inventory Transactions ──
DROP POLICY IF EXISTS "inventory_admin_read" ON public.inventory_transactions;
CREATE POLICY "inventory_admin_read" ON public.inventory_transactions FOR SELECT
  USING (has_role(auth.uid(), 'ORDER_MANAGER'));

DROP POLICY IF EXISTS "inventory_admin_insert" ON public.inventory_transactions;
CREATE POLICY "inventory_admin_insert" ON public.inventory_transactions FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'ORDER_MANAGER'));

-- ── Reviews ──
DROP POLICY IF EXISTS "reviews_public_read" ON public.reviews;
CREATE POLICY "reviews_public_read" ON public.reviews FOR SELECT
  USING (is_approved = true OR auth.uid() = user_id OR has_role(auth.uid(), 'CONTENT_MANAGER'));

DROP POLICY IF EXISTS "reviews_customer_insert" ON public.reviews;
CREATE POLICY "reviews_customer_insert" ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reviews_own_update" ON public.reviews;
CREATE POLICY "reviews_own_update" ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'CONTENT_MANAGER'));

-- ── Audit Logs — admin read, system insert ──
DROP POLICY IF EXISTS "audit_admin_read" ON public.audit_logs;
CREATE POLICY "audit_admin_read" ON public.audit_logs FOR SELECT
  USING (has_role(auth.uid(), 'ADMIN'));

DROP POLICY IF EXISTS "audit_admin_insert" ON public.audit_logs;
CREATE POLICY "audit_admin_insert" ON public.audit_logs FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'ADMIN') OR has_role(auth.uid(), 'ORDER_MANAGER') OR has_role(auth.uid(), 'CONTENT_MANAGER'));

-- ─── SEED DATA ───────────────────────────────────────────────────────────────

-- Categories
INSERT INTO public.categories (name, slug, description, position, is_active) VALUES
  ('Tops', 'tops', 'Shirts, blouses, and upper-body pieces.', 1, true),
  ('Bottoms', 'bottoms', 'Trousers, skirts, and shorts.', 2, true),
  ('Dresses', 'dresses', 'One-piece and two-piece dress styles.', 3, true),
  ('Outerwear', 'outerwear', 'Jackets, coats, and layering pieces.', 4, true),
  ('Accessories', 'accessories', 'Bags, scarves, and finishing pieces.', 5, true)
ON CONFLICT (slug) DO NOTHING;

-- ─── STORAGE BUCKETS ─────────────────────────────────────────────────────────
-- Run these in the Supabase Storage UI or via API:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', false);
