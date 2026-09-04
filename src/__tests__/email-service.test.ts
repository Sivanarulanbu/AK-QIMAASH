import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { sendOrderEmail, sendBrevoEmail } from '@/services/emailService'
import { supabase } from '@/lib/supabase'

describe('emailService: resilient dual-path delivery', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('sendBrevoEmail returns failure if recipient email is empty', async () => {
    const res = await sendBrevoEmail('', 'Customer', 'Test', '<p>Hi</p>')
    expect(res.success).toBe(false)
    expect(res.error).toMatch(/recipient email/i)
  })

  it('sendBrevoEmail successfully sends email via Brevo endpoint', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ messageId: '<test-msg-123@smtp-brevo.com>' }),
    } as Response)

    const res = await sendBrevoEmail('buyer@example.com', 'Buyer Name', 'Subject', '<p>Order details</p>')
    expect(res.success).toBe(true)
    expect(res.messageId).toBe('<test-msg-123@smtp-brevo.com>')
    expect(globalThis.fetch).toHaveBeenCalled()
  })

  it('sendOrderEmail successfully uses edge function when available', async () => {
    const invokeSpy = vi.spyOn(Object.getPrototypeOf(supabase.functions), 'invoke').mockResolvedValue({
      data: { success: true },
      error: null,
    })

    const res = await sendOrderEmail({
      orderId: 'ord-123',
      status: 'PLACED',
      customerEmail: 'buyer@example.com',
      customerName: 'Buyer',
    })

    expect(res.success).toBe(true)
    expect(res.provider).toBe('supabase-edge-function')
  })

  it('sendOrderEmail automatically falls back to Brevo when Edge Function returns error/404', async () => {
    // Edge function returns 404 (not found)
    vi.spyOn(Object.getPrototypeOf(supabase.functions), 'invoke').mockResolvedValue({
      data: null,
      error: { message: 'Function not found', status: 404 },
    })

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ messageId: '<brevo-fallback-999>' }),
    } as Response)

    const res = await sendOrderEmail({
      orderId: 'ord-456',
      orderNumber: 'AKQ-2026-001',
      status: 'PLACED',
      customerEmail: 'customer@example.com',
      customerName: 'Aisha',
      totals: {
        subtotal_cents: 12000,
        gst_cents: 1080,
        delivery_cents: 0,
        total_cents: 13080,
      },
      items: [
        {
          product_name: 'Silk Kaftan',
          variant_size: 'M',
          variant_color: 'Emerald',
          quantity: 1,
          unit_price_cents: 12000,
          total_price_cents: 12000,
        },
      ],
      address: {
        recipient_name: 'Aisha',
        phone: '+6591234567',
        street: 'Orchard Road',
        postal_code: '238801',
      },
    })

    expect(res.success).toBe(true)
    expect(res.provider).toBe('brevo-direct')
  })
})
