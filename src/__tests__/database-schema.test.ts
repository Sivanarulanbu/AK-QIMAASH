import { describe, it, expect } from 'vitest'
import sql from '../../supabase/migrations/001_initial.sql?raw'

describe('Database Migration & Schema Integrity (001_initial.sql)', () => {

  describe('Enums and Domain Types', () => {
    it('defines order_status enum with all required lifecycle states', () => {
      expect(sql).toMatch(/CREATE TYPE order_status AS ENUM/)
      const requiredStatuses = [
        'PLACED',
        'CONFIRMED',
        'PROCESSING',
        'SHIPPED',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED',
      ]
      for (const status of requiredStatuses) {
        expect(sql).toContain(`'${status}'`)
      }
    })

    it('defines user_role enum with customer and staff roles', () => {
      expect(sql).toMatch(/CREATE TYPE user_role AS ENUM/)
      for (const role of ['CUSTOMER', 'ADMIN', 'ORDER_MANAGER', 'CONTENT_MANAGER']) {
        expect(sql).toContain(`'${role}'`)
      }
    })

    it('defines payment_method enum supporting COD, Stripe, and PayNow', () => {
      expect(sql).toMatch(/CREATE TYPE payment_method AS ENUM/)
      for (const method of ['COD', 'STRIPE', 'PAYNOW']) {
        expect(sql).toContain(`'${method}'`)
      }
    })

    it('defines payment_status enum', () => {
      expect(sql).toMatch(/CREATE TYPE payment_status AS ENUM/)
      for (const status of ['PENDING', 'PAID', 'FAILED', 'REFUNDED']) {
        expect(sql).toContain(`'${status}'`)
      }
    })

    it('defines inventory_transaction_type enum with comprehensive transaction types', () => {
      expect(sql).toMatch(/CREATE TYPE inventory_transaction_type AS ENUM/)
      for (const type of [
        'STOCK_RECEIVED',
        'STOCK_ADJUSTMENT',
        'ORDER_RESERVATION',
        'ORDER_CANCELLATION',
        'ORDER_FULFILLMENT',
        'RETURN',
      ]) {
        expect(sql).toContain(`'${type}'`)
      }
    })
  })

  describe('Core Database Tables', () => {
    const requiredTables = [
      'public.profiles',
      'public.user_roles',
      'public.categories',
      'public.products',
      'public.product_variants',
      'public.product_images',
      'public.carts',
      'public.cart_items',
      'public.wishlists',
      'public.wishlist_items',
      'public.addresses',
      'public.orders',
      'public.order_items',
      'public.order_status_history',
      'public.inventory_transactions',
      'public.reviews',
      'public.audit_logs',
    ]

    for (const table of requiredTables) {
      it(`creates table ${table}`, () => {
        expect(sql).toContain(`CREATE TABLE IF NOT EXISTS ${table}`)
      })
    }
  })

  describe('Check Constraints & Data Integrity', () => {
    it('enforces 6-digit Singapore postal code check on addresses', () => {
      expect(sql).toMatch(/postal_code\s+TEXT NOT NULL CHECK\s*\(postal_code ~ '\^\\d\{6\}\$'\)/)
    })

    it('enforces non-negative price and non-negative stock on product variants', () => {
      expect(sql).toMatch(/price_cents\s+INTEGER NOT NULL CHECK\s*\(price_cents >= 0\)/)
      expect(sql).toMatch(/stock_quantity\s+INTEGER NOT NULL DEFAULT 0 CHECK\s*\(stock_quantity >= 0\)/)
    })

    it('enforces positive quantities on cart items and order items', () => {
      expect(sql).toMatch(/quantity\s+INTEGER NOT NULL DEFAULT 1 CHECK\s*\(quantity > 0\)/)
      expect(sql).toMatch(/quantity\s+INTEGER NOT NULL CHECK\s*\(quantity > 0\)/)
    })

    it('enforces review rating between 1 and 5', () => {
      expect(sql).toMatch(/rating\s+SMALLINT NOT NULL CHECK\s*\(rating BETWEEN 1 AND 5\)/)
    })

    it('enforces cart owner check constraint (user_id or session_id)', () => {
      expect(sql).toContain('CONSTRAINT cart_owner CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)')
    })

    it('enforces non-negative totals on orders', () => {
      expect(sql).toMatch(/subtotal_cents\s+INTEGER NOT NULL CHECK \(subtotal_cents >= 0\)/)
      expect(sql).toMatch(/gst_cents\s+INTEGER NOT NULL CHECK \(gst_cents >= 0\)/)
      expect(sql).toMatch(/delivery_cents\s+INTEGER NOT NULL DEFAULT 0 CHECK \(delivery_cents >= 0\)/)
      expect(sql).toMatch(/total_cents\s+INTEGER NOT NULL CHECK \(total_cents >= 0\)/)
    })
  })

  describe('Immutable Inventory Ledger Rules', () => {
    it('defines prevent_inventory_modification function that raises an exception', () => {
      expect(sql).toContain('CREATE OR REPLACE FUNCTION prevent_inventory_modification()')
      expect(sql).toContain("RAISE EXCEPTION 'Inventory transactions are immutable and cannot be modified or deleted.'")
    })

    it('attaches BEFORE UPDATE OR DELETE trigger to inventory_transactions table', () => {
      expect(sql).toMatch(/CREATE TRIGGER prevent_inventory_update\s+BEFORE UPDATE OR DELETE ON public\.inventory_transactions/)
    })
  })

  describe('Order Sequencing', () => {
    it('creates order_number_seq starting at 1000', () => {
      expect(sql).toContain('CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1000;')
    })

    it('formats order numbers with AKQ prefix, date, and 4-digit padded sequence', () => {
      expect(sql).toContain("'AKQ-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0')")
    })
  })

  describe('Row Level Security (RLS) Policy Coverage', () => {
    const tablesWithRLS = [
      'public.profiles',
      'public.user_roles',
      'public.categories',
      'public.products',
      'public.product_variants',
      'public.product_images',
      'public.carts',
      'public.cart_items',
      'public.wishlists',
      'public.wishlist_items',
      'public.addresses',
      'public.orders',
      'public.order_items',
      'public.order_status_history',
      'public.inventory_transactions',
      'public.reviews',
      'public.audit_logs',
    ]

    for (const table of tablesWithRLS) {
      it(`enables RLS on ${table}`, () => {
        expect(sql).toContain(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`)
      })
    }

    it('protects orders table with customer and order manager policies', () => {
      expect(sql).toContain('CREATE POLICY "orders_own_read" ON public.orders')
      expect(sql).toContain('CREATE POLICY "orders_customer_insert" ON public.orders')
      expect(sql).toContain('CREATE POLICY "orders_manager_update" ON public.orders')
    })

    it('restricts inventory_transactions to ORDER_MANAGER', () => {
      expect(sql).toContain('CREATE POLICY "inventory_admin_read" ON public.inventory_transactions')
      expect(sql).toContain('CREATE POLICY "inventory_admin_insert" ON public.inventory_transactions')
      expect(sql).toContain("has_role(auth.uid(), 'ORDER_MANAGER')")
    })
  })

  describe('Security Definer Functions', () => {
    it('defines handle_new_user with SECURITY DEFINER', () => {
      expect(sql).toContain('FUNCTION public.handle_new_user()')
      expect(sql).toContain('SECURITY DEFINER')
    })

    it('defines has_role with SECURITY DEFINER and ADMIN hierarchy check', () => {
      expect(sql).toContain('FUNCTION public.has_role(')
      expect(sql).toContain("(user_roles.role = $2 OR user_roles.role = 'ADMIN')")
    })
  })
})
