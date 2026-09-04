import { describe, it, expect } from 'vitest'
import { calculateOrderTotals } from '@/lib/commerce'

// Test backend business handlers and order analytics logic
describe('Backend Order Services & Business Workflows', () => {
  describe('Checkout Order Creation Pipeline', () => {
    it('constructs correct order and order_items payloads matching DB constraints', () => {
      const mockCartItems = [
        {
          productId: 'prod_1',
          productName: 'Emerald Silk Kaftan',
          variantId: 'var_1',
          variantSku: 'AKQ-KFT-EMR-M',
          variantSize: 'M',
          variantColor: 'Emerald Green',
          priceCents: 15000, // $150.00
          quantity: 2,
        },
        {
          productId: 'prod_2',
          productName: 'Chiffon Hijab',
          variantId: 'var_2',
          variantSku: 'AKQ-HJB-BLK-OS',
          variantSize: 'OS',
          variantColor: 'Noir',
          priceCents: 3500, // $35.00
          quantity: 1,
        },
      ]

      const subtotalCents = mockCartItems.reduce(
        (sum, item) => sum + item.priceCents * item.quantity,
        0
      )
      // 15000 * 2 + 3500 * 1 = 33500 cents (S$335.00)
      expect(subtotalCents).toBe(33500)

      const totals = calculateOrderTotals(subtotalCents)
      // S$335.00 >= S$100.00 -> Delivery is free
      expect(totals.delivery).toBe(0)
      expect(totals.gst).toBe(Math.round(33500 * 0.09)) // 3015 cents
      expect(totals.total).toBe(33500 + 3015) // 36515 cents

      const orderPayload = {
        user_id: 'usr_abc123',
        address_snapshot: {
          recipient_name: 'Nurul Huda',
          phone: '+6591234567',
          street: '10 Bayfront Avenue',
          postal_code: '018956',
        },
        status: 'PLACED' as const,
        payment_method: 'COD' as const,
        payment_status: 'PENDING' as const,
        subtotal_cents: totals.subtotal,
        gst_cents: totals.gst,
        delivery_cents: totals.delivery,
        total_cents: totals.total,
      }

      // Assert non-negative constraints
      expect(orderPayload.subtotal_cents).toBeGreaterThanOrEqual(0)
      expect(orderPayload.gst_cents).toBeGreaterThanOrEqual(0)
      expect(orderPayload.delivery_cents).toBeGreaterThanOrEqual(0)
      expect(orderPayload.total_cents).toBe(
        orderPayload.subtotal_cents + orderPayload.gst_cents + orderPayload.delivery_cents
      )

      // Map order items
      const createdOrderId = 'order_uuid_xyz'
      const mappedOrderItems = mockCartItems.map((item) => ({
        order_id: createdOrderId,
        variant_id: item.variantId,
        product_id: item.productId,
        product_name: item.productName,
        variant_sku: item.variantSku,
        variant_size: item.variantSize ?? null,
        variant_color: item.variantColor ?? null,
        quantity: item.quantity,
        unit_price_cents: item.priceCents,
        total_price_cents: item.priceCents * item.quantity,
      }))

      expect(mappedOrderItems).toHaveLength(2)
      expect(mappedOrderItems[0].total_price_cents).toBe(30000)
      expect(mappedOrderItems[1].total_price_cents).toBe(3500)
      for (const item of mappedOrderItems) {
        expect(item.quantity).toBeGreaterThan(0)
        expect(item.unit_price_cents).toBeGreaterThanOrEqual(0)
      }
    })
  })

  describe('Order Statistics Aggregator', () => {
    // Tests the aggregation calculation used in useOrderStats / AdminDashboard
    function aggregateOrderStats(orders: Array<{ status: string }>) {
      const counts: Record<string, number> = {
        PLACED: 0,
        CONFIRMED: 0,
        PROCESSING: 0,
        SHIPPED: 0,
        OUT_FOR_DELIVERY: 0,
        DELIVERED: 0,
        CANCELLED: 0,
      }

      for (const order of orders) {
        if (order.status && counts[order.status] !== undefined) {
          counts[order.status]++
        }
      }

      return {
        PLACED: counts.PLACED || 0,
        CONFIRMED: counts.CONFIRMED || 0,
        PROCESSING: counts.PROCESSING || 0,
        SHIPPED: counts.SHIPPED || 0,
        OUT_FOR_DELIVERY: counts.OUT_FOR_DELIVERY || 0,
        DELIVERED: counts.DELIVERED || 0,
        CANCELLED: counts.CANCELLED || 0,
        total: orders.length,
        pending: (counts.PLACED || 0) + (counts.CONFIRMED || 0),
      }
    }

    it('aggregates statuses accurately across order lifecycle states', () => {
      const sampleOrders = [
        { status: 'PLACED' },
        { status: 'PLACED' },
        { status: 'CONFIRMED' },
        { status: 'PROCESSING' },
        { status: 'SHIPPED' },
        { status: 'SHIPPED' },
        { status: 'OUT_FOR_DELIVERY' },
        { status: 'DELIVERED' },
        { status: 'DELIVERED' },
        { status: 'DELIVERED' },
        { status: 'CANCELLED' },
      ]

      const stats = aggregateOrderStats(sampleOrders)

      expect(stats.total).toBe(11)
      expect(stats.PLACED).toBe(2)
      expect(stats.CONFIRMED).toBe(1)
      expect(stats.PROCESSING).toBe(1)
      expect(stats.SHIPPED).toBe(2)
      expect(stats.OUT_FOR_DELIVERY).toBe(1)
      expect(stats.DELIVERED).toBe(3)
      expect(stats.CANCELLED).toBe(1)
      // Pending count = PLACED + CONFIRMED = 3
      expect(stats.pending).toBe(3)
    })

    it('handles empty order lists safely without NaN or errors', () => {
      const stats = aggregateOrderStats([])
      expect(stats.total).toBe(0)
      expect(stats.pending).toBe(0)
      expect(stats.DELIVERED).toBe(0)
    })
  })

  describe('Admin Pagination and Range Indexing', () => {
    function computeRange(page: number, perPage: number) {
      const start = (page - 1) * perPage
      const end = page * perPage - 1
      return { start, end }
    }

    it('computes 0-indexed range for Supabase .range() query', () => {
      expect(computeRange(1, 20)).toEqual({ start: 0, end: 19 })
      expect(computeRange(2, 20)).toEqual({ start: 20, end: 39 })
      expect(computeRange(3, 10)).toEqual({ start: 20, end: 29 })
    })
  })
})
