import { describe, it, expect } from 'vitest'
import {
  COMMERCE_CONFIG,
  isValidStatusTransition,
  validateCodEligibility,
  calculateOrderTotals,
  type OrderStatus,
} from '@/lib/commerce'
import fs from 'node:fs'
import path from 'node:path'

describe('COD Order State Machine & Integrity', () => {
  describe('Valid Order Status Transitions', () => {
    it('allows PLACED to transition to CONFIRMED or CANCELLED', () => {
      expect(isValidStatusTransition('PLACED', 'CONFIRMED')).toBe(true)
      expect(isValidStatusTransition('PLACED', 'CANCELLED')).toBe(true)
    })

    it('allows CONFIRMED to transition to PROCESSING or CANCELLED', () => {
      expect(isValidStatusTransition('CONFIRMED', 'PROCESSING')).toBe(true)
      expect(isValidStatusTransition('CONFIRMED', 'CANCELLED')).toBe(true)
    })

    it('allows PROCESSING to transition to SHIPPED or CANCELLED', () => {
      expect(isValidStatusTransition('PROCESSING', 'SHIPPED')).toBe(true)
      expect(isValidStatusTransition('PROCESSING', 'CANCELLED')).toBe(true)
    })

    it('allows SHIPPED to transition to OUT_FOR_DELIVERY', () => {
      expect(isValidStatusTransition('SHIPPED', 'OUT_FOR_DELIVERY')).toBe(true)
      expect(isValidStatusTransition('SHIPPED', 'CANCELLED')).toBe(false)
    })

    it('allows OUT_FOR_DELIVERY to transition to DELIVERED', () => {
      expect(isValidStatusTransition('OUT_FOR_DELIVERY', 'DELIVERED')).toBe(true)
      expect(isValidStatusTransition('OUT_FOR_DELIVERY', 'CANCELLED')).toBe(false)
    })
  })

  describe('Invalid & Terminal Order Status Transitions', () => {
    it('prohibits skipping lifecycle states', () => {
      expect(isValidStatusTransition('PLACED', 'DELIVERED')).toBe(false)
      expect(isValidStatusTransition('PLACED', 'SHIPPED')).toBe(false)
      expect(isValidStatusTransition('CONFIRMED', 'DELIVERED')).toBe(false)
    })

    it('prohibits backwards status transitions', () => {
      expect(isValidStatusTransition('PROCESSING', 'PLACED')).toBe(false)
      expect(isValidStatusTransition('SHIPPED', 'CONFIRMED')).toBe(false)
      expect(isValidStatusTransition('OUT_FOR_DELIVERY', 'PROCESSING')).toBe(false)
    })

    it('enforces DELIVERED as a terminal immutable state', () => {
      expect(isValidStatusTransition('DELIVERED', 'CANCELLED')).toBe(false)
      expect(isValidStatusTransition('DELIVERED', 'PLACED')).toBe(false)
      expect(isValidStatusTransition('DELIVERED', 'PROCESSING')).toBe(false)
    })

    it('enforces CANCELLED as a terminal immutable state', () => {
      expect(isValidStatusTransition('CANCELLED', 'PLACED')).toBe(false)
      expect(isValidStatusTransition('CANCELLED', 'CONFIRMED')).toBe(false)
      expect(isValidStatusTransition('CANCELLED', 'DELIVERED')).toBe(false)
    })

    it('prohibits transitioning to the exact same status', () => {
      expect(isValidStatusTransition('PLACED', 'PLACED')).toBe(false)
      expect(isValidStatusTransition('PROCESSING', 'PROCESSING')).toBe(false)
      expect(isValidStatusTransition('DELIVERED', 'DELIVERED')).toBe(false)
    })
  })

  describe('COD Risk Rules & Abuse Prevention (validateCodEligibility)', () => {
    it('approves legitimate customers with zero risk signals', () => {
      const result = validateCodEligibility({
        pendingCodOrdersCount: 1,
        recentCancelledCount: 0,
        orderSubtotalCents: 28000, // S$ 280.00
      })
      expect(result.eligible).toBe(true)
      expect(result.reason).toBeUndefined()
    })

    it('rejects customers with >= 3 active unfulfilled COD orders', () => {
      const result = validateCodEligibility({
        pendingCodOrdersCount: 3,
        recentCancelledCount: 0,
        orderSubtotalCents: 15000,
      })
      expect(result.eligible).toBe(false)
      expect(result.code).toBe('COD_LIMIT_EXCEEDED')
      expect(result.reason).toContain('3 active Cash on Delivery orders')
    })

    it('rejects customers with >= 2 cancellations in past 30 days', () => {
      const result = validateCodEligibility({
        pendingCodOrdersCount: 0,
        recentCancelledCount: 2,
        orderSubtotalCents: 15000,
      })
      expect(result.eligible).toBe(false)
      expect(result.code).toBe('COD_RESTRICTED')
      expect(result.reason).toContain('temporarily paused due to previous order cancellations')
    })

    it('rejects COD orders exceeding the SGD $1,500 maximum ceiling', () => {
      const result = validateCodEligibility({
        pendingCodOrdersCount: 0,
        recentCancelledCount: 0,
        orderSubtotalCents: 150001, // S$ 1,500.01
      })
      expect(result.eligible).toBe(false)
      expect(result.code).toBe('COD_MAX_AMOUNT_EXCEEDED')
      expect(result.reason).toContain('$1,500.00')
    })
  })

  describe('Commerce Calculations & Pricing Validation', () => {
    it('calculates 9% Singapore GST inclusive and free shipping for orders >= S$ 100', () => {
      const subtotal = 12000 // S$ 120.00
      const totals = calculateOrderTotals(subtotal)

      expect(totals.subtotal).toBe(12000)
      expect(totals.delivery).toBe(0) // Free delivery
      expect(totals.gst).toBe(Math.round(12000 * 0.09))
      expect(totals.total).toBe(12000 + totals.gst)
    })

    it('applies S$ 5 delivery fee for orders below S$ 100', () => {
      const subtotal = 6500 // S$ 65.00
      const totals = calculateOrderTotals(subtotal)

      expect(totals.delivery).toBe(500) // S$ 5.00 delivery
      expect(totals.total).toBe(6500 + totals.gst + 500)
    })
  })

  describe('Database Migration 005 Integrity Verification', () => {
    it('verifies 005_cod_order_integrity.sql defines all required atomic functions and triggers', () => {
      const migrationPath = path.resolve(__dirname, '../../supabase/migrations/005_cod_order_integrity.sql')
      expect(fs.existsSync(migrationPath)).toBe(true)

      const sqlContent = fs.readFileSync(migrationPath, 'utf8')

      // 1. Idempotency column
      expect(sqlContent).toContain('idempotency_key TEXT UNIQUE')

      // 2. State machine trigger
      expect(sqlContent).toContain('validate_order_status_transition()')
      expect(sqlContent).toContain('trg_validate_order_status_transition')
      expect(sqlContent).toContain("NEW.payment_status := 'PAID'")
      expect(sqlContent).toContain("'ORDER_CANCELLATION'")

      // 3. Atomic RPC
      expect(sqlContent).toContain('CREATE OR REPLACE FUNCTION public.create_cod_order')
      expect(sqlContent).toContain('FOR UPDATE OF v')
      expect(sqlContent).toContain('OUT_OF_STOCK')
      expect(sqlContent).toContain('COD_LIMIT_EXCEEDED')
      expect(sqlContent).toContain('COD_RESTRICTED')
      expect(sqlContent).toContain('ORDER_RESERVATION')
    })
  })
})
