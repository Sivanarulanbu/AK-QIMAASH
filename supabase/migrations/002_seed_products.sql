-- ============================================================
-- AK QIMAASH — Seed Products & Profile Fix (Bulletproof)
-- ============================================================

-- 1. Ensure all existing auth.users have profiles and roles
INSERT INTO public.profiles (id, email, full_name)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1))
FROM auth.users
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'CUSTOMER'
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- 2. Ensure users can insert/upsert their own profile if needed
DROP POLICY IF EXISTS "profiles_own_insert" ON public.profiles;
CREATE POLICY "profiles_own_insert" ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 3. Seed Products, Variants, and Images with variables
DO $$
DECLARE
  cat_tops UUID;
  cat_bottoms UUID;
  cat_dresses UUID;
  cat_outerwear UUID;
  cat_accessories UUID;

  p1 UUID := '11111111-1111-4111-a111-111111111111';
  p2 UUID := '22222222-2222-4222-a222-222222222222';
  p3 UUID := '33333333-3333-4333-a333-333333333333';
  p4 UUID := '44444444-4444-4444-a444-444444444444';
  p5 UUID := '55555555-5555-4555-a555-555555555555';
  p6 UUID := '66666666-6666-4666-a666-666666666666';
BEGIN
  SELECT id INTO cat_tops FROM public.categories WHERE slug = 'tops' LIMIT 1;
  SELECT id INTO cat_bottoms FROM public.categories WHERE slug = 'bottoms' LIMIT 1;
  SELECT id INTO cat_dresses FROM public.categories WHERE slug = 'dresses' LIMIT 1;
  SELECT id INTO cat_outerwear FROM public.categories WHERE slug = 'outerwear' LIMIT 1;
  SELECT id INTO cat_accessories FROM public.categories WHERE slug = 'accessories' LIMIT 1;

  -- ─── Product 1: Relaxed French Linen Shirt ───
  INSERT INTO public.products (id, name, slug, description, short_description, category_id, is_published, is_archived, tags, material, care_instructions, origin)
  VALUES (
    p1,
    'Relaxed French Linen Shirt',
    'relaxed-french-linen-shirt',
    'Crafted from premium 100% Normandy linen, this oversized shirt is cut with dropped shoulders and a curved hem. Breathable and effortlessly structured for Singapore tropical climate.',
    'Breathable 100% French linen cut for a relaxed, modern drape.',
    cat_tops,
    true,
    false,
    ARRAY['linen', 'summer', 'minimalist'],
    '100% French Normandy Linen',
    'Machine wash cold on gentle cycle. Hang dry in shade. Warm iron while slightly damp.',
    'Designed in Singapore'
  ) ON CONFLICT (id) DO UPDATE SET is_published = true, is_archived = false;

  INSERT INTO public.product_variants (id, product_id, sku, size, color, color_hex, price_cents, compare_price_cents, stock_quantity, is_active) VALUES
    ('11111111-1111-4111-a111-000000000001', p1, 'AK-FLS-WHT-S', 'S', 'Optic White', '#FFFFFF', 8900, 11900, 12, true),
    ('11111111-1111-4111-a111-000000000002', p1, 'AK-FLS-WHT-M', 'M', 'Optic White', '#FFFFFF', 8900, 11900, 18, true),
    ('11111111-1111-4111-a111-000000000003', p1, 'AK-FLS-WHT-L', 'L', 'Optic White', '#FFFFFF', 8900, 11900, 8, true),
    ('11111111-1111-4111-a111-000000000004', p1, 'AK-FLS-BLK-S', 'S', 'Charcoal Black', '#1E1E1E', 8900, NULL, 15, true),
    ('11111111-1111-4111-a111-000000000005', p1, 'AK-FLS-BLK-M', 'M', 'Charcoal Black', '#1E1E1E', 8900, NULL, 20, true),
    ('11111111-1111-4111-a111-000000000006', p1, 'AK-FLS-BLK-L', 'L', 'Charcoal Black', '#1E1E1E', 8900, NULL, 6, true)
  ON CONFLICT (id) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;

  INSERT INTO public.product_images (id, product_id, url, alt, position, is_primary) VALUES
    ('11111111-1111-4111-a111-000000000010', p1, '/images/products/french-linen-shirt.jpg', 'Relaxed French Linen Shirt — Front', 1, true),
    ('11111111-1111-4111-a111-000000000011', p1, '/images/products/french-linen-shirt-2.jpg', 'Relaxed French Linen Shirt — Detail', 2, false)
  ON CONFLICT (id) DO NOTHING;

  -- ─── Product 2: Pleated High-Waist Trousers ───
  INSERT INTO public.products (id, name, slug, description, short_description, category_id, is_published, is_archived, tags, material, care_instructions, origin)
  VALUES (
    p2,
    'Pleated High-Waist Trousers',
    'pleated-high-waist-trousers',
    'Tailored with crisp front pleats and a relaxed wide leg, these high-waisted trousers are cut in a mid-weight crepe that resists wrinkles and drapes fluidly from hip to ankle.',
    'Fluid wide-leg trousers with structured deep front pleats.',
    cat_bottoms,
    true,
    false,
    ARRAY['workwear', 'tailored', 'trousers'],
    '72% Viscose, 26% Recycled Polyester, 2% Elastane',
    'Dry clean recommended, or machine wash gentle at 30°C in wash bag.',
    'Designed in Singapore'
  ) ON CONFLICT (id) DO UPDATE SET is_published = true, is_archived = false;

  INSERT INTO public.product_variants (id, product_id, sku, size, color, color_hex, price_cents, compare_price_cents, stock_quantity, is_active) VALUES
    ('22222222-2222-4222-a222-000000000001', p2, 'AK-PHT-SND-XS', 'XS', 'Sand Taupe', '#C2B69D', 12900, NULL, 4, true),
    ('22222222-2222-4222-a222-000000000002', p2, 'AK-PHT-SND-S', 'S', 'Sand Taupe', '#C2B69D', 12900, NULL, 14, true),
    ('22222222-2222-4222-a222-000000000003', p2, 'AK-PHT-SND-M', 'M', 'Sand Taupe', '#C2B69D', 12900, NULL, 11, true),
    ('22222222-2222-4222-a222-000000000004', p2, 'AK-PHT-SND-L', 'L', 'Sand Taupe', '#C2B69D', 12900, NULL, 7, true)
  ON CONFLICT (id) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;

  INSERT INTO public.product_images (id, product_id, url, alt, position, is_primary) VALUES
    ('22222222-2222-4222-a222-000000000010', p2, '/images/products/pleated-trousers.jpg', 'Pleated High-Waist Trousers — Front', 1, true)
  ON CONFLICT (id) DO NOTHING;

  -- ─── Product 3: Sleeveless Column Midi Dress ───
  INSERT INTO public.products (id, name, slug, description, short_description, category_id, is_published, is_archived, tags, material, care_instructions, origin)
  VALUES (
    p3,
    'Sleeveless Column Midi Dress',
    'sleeveless-column-midi-dress',
    'An architectural column dress featuring a clean boat neckline, high side slit, and hidden side zip. Designed to transition seamlessly from desk to evening.',
    'Clean architectural column dress with discreet side slit.',
    cat_dresses,
    true,
    false,
    ARRAY['dress', 'evening', 'minimalist'],
    '95% Compact Cotton, 5% Spandex',
    'Hand wash cold or gentle machine wash inside out. Lay flat to dry.',
    'Designed in Singapore'
  ) ON CONFLICT (id) DO UPDATE SET is_published = true, is_archived = false;

  INSERT INTO public.product_variants (id, product_id, sku, size, color, color_hex, price_cents, compare_price_cents, stock_quantity, is_active) VALUES
    ('33333333-3333-4333-a333-000000000001', p3, 'AK-CMD-BLK-S', 'S', 'Pitch Black', '#111111', 14900, NULL, 9, true),
    ('33333333-3333-4333-a333-000000000002', p3, 'AK-CMD-BLK-M', 'M', 'Pitch Black', '#111111', 14900, NULL, 16, true),
    ('33333333-3333-4333-a333-000000000003', p3, 'AK-CMD-BLK-L', 'L', 'Pitch Black', '#111111', 14900, NULL, 5, true)
  ON CONFLICT (id) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;

  INSERT INTO public.product_images (id, product_id, url, alt, position, is_primary) VALUES
    ('33333333-3333-4333-a333-000000000010', p3, '/images/products/column-midi-dress.jpg', 'Sleeveless Column Midi Dress', 1, true)
  ON CONFLICT (id) DO NOTHING;

  -- ─── Product 4: Structured Poplin Cocoon Shirt ───
  INSERT INTO public.products (id, name, slug, description, short_description, category_id, is_published, is_archived, tags, material, care_instructions, origin)
  VALUES (
    p4,
    'Structured Poplin Cocoon Shirt',
    'structured-poplin-cocoon-shirt',
    'Engineered with sculptural darted sleeves that form an organic cocoon contour. Made with high-thread-count organic cotton poplin with a silky crisp handfeel.',
    'Sculptural sleeve poplin shirt in organic combed cotton.',
    cat_tops,
    true,
    false,
    ARRAY['shirt', 'poplin', 'sculptural'],
    '100% GOTS Certified Organic Cotton Poplin',
    'Machine wash 40°C. Medium iron with steam for a crisp finish.',
    'Designed in Singapore'
  ) ON CONFLICT (id) DO UPDATE SET is_published = true, is_archived = false;

  INSERT INTO public.product_variants (id, product_id, sku, size, color, color_hex, price_cents, compare_price_cents, stock_quantity, is_active) VALUES
    ('44444444-4444-4444-a444-000000000001', p4, 'AK-SCS-IVR-S', 'S', 'Warm Ivory', '#F5F2EB', 9900, NULL, 8, true),
    ('44444444-4444-4444-a444-000000000002', p4, 'AK-SCS-IVR-M', 'M', 'Warm Ivory', '#F5F2EB', 9900, NULL, 12, true),
    ('44444444-4444-4444-a444-000000000003', p4, 'AK-SCS-IVR-L', 'L', 'Warm Ivory', '#F5F2EB', 9900, NULL, 4, true)
  ON CONFLICT (id) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;

  INSERT INTO public.product_images (id, product_id, url, alt, position, is_primary) VALUES
    ('44444444-4444-4444-a444-000000000010', p4, '/images/products/poplin-cocoon-shirt.jpg', 'Structured Poplin Cocoon Shirt', 1, true)
  ON CONFLICT (id) DO NOTHING;

  -- ─── Product 5: Tailored Minimalist Trench Vest ───
  INSERT INTO public.products (id, name, slug, description, short_description, category_id, is_published, is_archived, tags, material, care_instructions, origin)
  VALUES (
    p5,
    'Tailored Minimalist Trench Vest',
    'tailored-minimalist-trench-vest',
    'A modern sleeveless interpretation of the classic double-breasted trench. Features a storm flap, fabric belt with horn buckle, and deep welt pockets.',
    'Sleeveless double-breasted trench vest with waist tie.',
    cat_outerwear,
    true,
    false,
    ARRAY['outerwear', 'trench', 'tailored'],
    '65% Cotton, 35% Polyamide water-resistant twill',
    'Specialist dry clean only.',
    'Designed in Singapore'
  ) ON CONFLICT (id) DO UPDATE SET is_published = true, is_archived = false;

  INSERT INTO public.product_variants (id, product_id, sku, size, color, color_hex, price_cents, compare_price_cents, stock_quantity, is_active) VALUES
    ('55555555-5555-4555-a555-000000000001', p5, 'AK-TTV-KHK-S', 'S', 'Olive Khaki', '#5A5F4B', 18900, NULL, 6, true),
    ('55555555-5555-4555-a555-000000000002', p5, 'AK-TTV-KHK-M', 'M', 'Olive Khaki', '#5A5F4B', 18900, NULL, 9, true)
  ON CONFLICT (id) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;

  INSERT INTO public.product_images (id, product_id, url, alt, position, is_primary) VALUES
    ('55555555-5555-4555-a555-000000000010', p5, '/images/products/trench-vest.jpg', 'Tailored Minimalist Trench Vest', 1, true)
  ON CONFLICT (id) DO NOTHING;

  -- ─── Product 6: Supple Calf Leather Tote ───
  INSERT INTO public.products (id, name, slug, description, short_description, category_id, is_published, is_archived, tags, material, care_instructions, origin)
  VALUES (
    p6,
    'Supple Calf Leather Tote',
    'supple-calf-leather-tote',
    'Handcrafted from full-grain vegetable-tanned leather. Unlined raw interior with magnetic closure and detachable zipped pouch for essentials.',
    'Full-grain vegetable-tanned leather unlined tote.',
    cat_accessories,
    true,
    false,
    ARRAY['leather', 'bag', 'accessories'],
    '100% Full-grain Italian Calf Leather',
    'Clean with soft dry cloth. Condition periodically with leather balm.',
    'Crafted in Florence, Designed in Singapore'
  ) ON CONFLICT (id) DO UPDATE SET is_published = true, is_archived = false;

  INSERT INTO public.product_variants (id, product_id, sku, size, color, color_hex, price_cents, compare_price_cents, stock_quantity, is_active) VALUES
    ('66666666-6666-4666-a666-000000000001', p6, 'AK-CLT-ESPR', 'One Size', 'Espresso', '#2B1E1A', 22900, NULL, 7, true)
  ON CONFLICT (id) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;

  INSERT INTO public.product_images (id, product_id, url, alt, position, is_primary) VALUES
    ('66666666-6666-4666-a666-000000000010', p6, '/images/products/leather-tote.jpg', 'Supple Calf Leather Tote', 1, true)
  ON CONFLICT (id) DO NOTHING;

END $$;
