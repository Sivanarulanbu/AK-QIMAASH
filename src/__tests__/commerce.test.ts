import { describe, it, expect } from 'vitest'
import {
  COMMERCE_CONFIG,
  formatPrice,
  calculateGST,
  calculateDeliveryFee,
  calculateOrderTotals,
  isValidSGPostalCode,
} from '@/lib/commerce'

describe('Commerce Configuration & Business Rules', () => {
  it('has valid default commerce configurations', () => {
    expect(COMMERCE_CONFIG.GST_RATE).toBe(0.09)
    expect(COMMERCE_CONFIG.DELIVERY_FEE_CENTS).toBe(500) // S$5.00
    expect(COMMERCE_CONFIG.FREE_DELIVERY_THRESHOLD_CENTS).toBe(10000) // S$100.00
    expect(COMMERCE_CONFIG.CURRENCY).toBe('SGD')
    expect(COMMERCE_CONFIG.LOCALE).toBe('en-SG')
    expect(COMMERCE_CONFIG.COUNTRY).toBe('Singapore')
  })

  describe('calculateGST', () => {
    it('calculates 9% GST rounded to the nearest cent', () => {
      // 10000 cents ($100.00) * 0.09 = 900 cents ($9.00)
      expect(calculateGST(10000)).toBe(900)

      // 5550 cents ($55.50) * 0.09 = 499.5 cents -> rounded to 500 cents ($5.00)
      expect(calculateGST(5550)).toBe(500)

      // 1234 cents ($12.34) * 0.09 = 111.06 cents -> rounded to 111 cents
      expect(calculateGST(1234)).toBe(111)

      // 0 cents -> 0 cents GST
      expect(calculateGST(0)).toBe(0)
    })
  })

  describe('calculateDeliveryFee', () => {
    it('charges delivery fee for orders below the threshold', () => {
      expect(calculateDeliveryFee(0)).toBe(500)
      expect(calculateDeliveryFee(5000)).toBe(500) // $50 -> $5 fee
      expect(calculateDeliveryFee(9999)).toBe(500) // $99.99 -> $5 fee
    })

    it('waives delivery fee for orders at or above threshold ($100.00 / 10000 cents)', () => {
      expect(calculateDeliveryFee(10000)).toBe(0) // Exactly $100 -> Free delivery
      expect(calculateDeliveryFee(15000)).toBe(0) // $150 -> Free delivery
      expect(calculateDeliveryFee(50000)).toBe(0) // $500 -> Free delivery
    })
  })

  describe('calculateOrderTotals', () => {
    it('correctly calculates breakdown for order under free delivery threshold', () => {
      // Subtotal = S$60.00 (6000 cents)
      // GST = 9% of 6000 = 540 cents
      // Delivery = 500 cents
      // Total = 6000 + 540 + 500 = 7040 cents (S$70.40)
      const breakdown = calculateOrderTotals(6000)
      expect(breakdown).toEqual({
        subtotal: 6000,
        gst: 540,
        delivery: 500,
        total: 7040,
      })
    })

    it('correctly calculates breakdown for order meeting free delivery threshold', () => {
      // Subtotal = S$120.00 (12000 cents)
      // GST = 9% of 12000 = 1080 cents
      // Delivery = 0 cents (free delivery >= 10000 cents)
      // Total = 12000 + 1080 + 0 = 13080 cents (S$130.80)
      const breakdown = calculateOrderTotals(12000)
      expect(breakdown).toEqual({
        subtotal: 12000,
        gst: 1080,
        delivery: 0,
        total: 13080,
      })
    })

    it('handles zero subtotal correctly', () => {
      const breakdown = calculateOrderTotals(0)
      expect(breakdown).toEqual({
        subtotal: 0,
        gst: 0,
        delivery: 500,
        total: 500,
      })
    })
  })

  describe('isValidSGPostalCode', () => {
    it('accepts valid 6-digit Singapore postal codes', () => {
      expect(isValidSGPostalCode('238801')).toBe(true) // Orchard
      expect(isValidSGPostalCode('049318')).toBe(true) // Raffles Place
      expect(isValidSGPostalCode('569830')).toBe(true) // Ang Mo Kio
      expect(isValidSGPostalCode('000000')).toBe(true)
    })

    it('rejects invalid postal code formats', () => {
      expect(isValidSGPostalCode('')).toBe(false)
      expect(isValidSGPostalCode('12345')).toBe(false) // 5 digits
      expect(isValidSGPostalCode('1234567')).toBe(false) // 7 digits
      expect(isValidSGPostalCode('23880A')).toBe(false) // Alphanumeric
      expect(isValidSGPostalCode('238 801')).toBe(false) // Space
      expect(isValidSGPostalCode('SG238801')).toBe(false) // Country prefix
      expect(isValidSGPostalCode('-23880')).toBe(false)
    })
  })

  describe('Order Status Lifecycle & State Transitions', () => {
    const { STATUS_TRANSITIONS } = COMMERCE_CONFIG

    it('defines valid forward transitions from PLACED', () => {
      expect(STATUS_TRANSITIONS.PLACED).toContain('CONFIRMED')
      expect(STATUS_TRANSITIONS.PLACED).toContain('CANCELLED')
      expect(STATUS_TRANSITIONS.PLACED).not.toContain('DELIVERED')
    })

    it('defines valid transitions from CONFIRMED', () => {
      expect(STATUS_TRANSITIONS.CONFIRMED).toContain('PROCESSING')
      expect(STATUS_TRANSITIONS.CONFIRMED).toContain('CANCELLED')
    })

    it('defines valid transitions from PROCESSING', () => {
      expect(STATUS_TRANSITIONS.PROCESSING).toContain('SHIPPED')
      expect(STATUS_TRANSITIONS.PROCESSING).toContain('CANCELLED')
    })

    it('defines valid transitions from SHIPPED', () => {
      expect(STATUS_TRANSITIONS.SHIPPED).toContain('OUT_FOR_DELIVERY')
      expect(STATUS_TRANSITIONS.SHIPPED).not.toContain('CANCELLED') // Cannot cancel once shipped
    })

    it('defines valid transitions from OUT_FOR_DELIVERY', () => {
      expect(STATUS_TRANSITIONS.OUT_FOR_DELIVERY).toContain('DELIVERED')
    })

    it('treats DELIVERED and CANCELLED as terminal states', () => {
      expect(STATUS_TRANSITIONS.DELIVERED).toEqual([])
      expect(STATUS_TRANSITIONS.CANCELLED).toEqual([])
    })
  })

  describe('formatPrice', () => {
    it('formats cents into SGD currency string', () => {
      const formatted = formatPrice(2490) // S$24.90
      expect(formatted).toMatch(/24\.90/)
      expect(formatted).toMatch(/\$|SGD/)
    })

    it('formats zero and large values', () => {
      expect(formatPrice(0)).toMatch(/0\.00/)
      const large = formatPrice(125000) // S$1,250.00
      expect(large).toMatch(/1,250\.00/)
    })
  })
})
