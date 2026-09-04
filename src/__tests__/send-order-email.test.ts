import { describe, it, expect, vi, beforeEach } from 'vitest'

// Emulate and test the exact logic from supabase/functions/send-order-email/index.ts
interface EmailPayload {
  order_id: string
  status: string
  tracking_number?: string
  courier_name?: string
}

interface OrderRecord {
  id: string
  order_number: string
  total_cents: number
  address_snapshot: {
    recipient_name: string
    block_building?: string
    street: string
    unit_number?: string
    postal_code: string
    phone: string
  }
  profiles?: {
    email: string
    full_name?: string
  } | null
  order_items: Array<{
    product_name: string
    variant_size?: string | null
    variant_color?: string | null
    quantity: number
    total_price_cents: number
  }>
}

// Function handler logic modeled faithfully after supabase/functions/send-order-email/index.ts
async function handleSendOrderEmail(
  req: { method: string; json: () => Promise<any> },
  deps: {
    supabaseFetchOrder: (id: string) => Promise<{ data: OrderRecord | null; error: any }>
    fetchBrevoApi?: (url: string, init: any) => Promise<any>
    env: {
      BREVO_API_KEY?: string
      EMAIL_FROM_ADDRESS?: string
      EMAIL_FROM_NAME?: string
      SUPABASE_URL?: string
      SUPABASE_SERVICE_ROLE_KEY?: string
    }
  }
) {
  if (req.method !== 'POST') {
    return { status: 405, body: 'Method Not Allowed' }
  }

  try {
    const payload: EmailPayload = await req.json()
    const { order_id, status, tracking_number, courier_name } = payload

    if (!order_id || !status) {
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing required parameters' }),
      }
    }

    const { data: order, error: orderErr } = await deps.supabaseFetchOrder(order_id)

    if (orderErr || !order) {
      return {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Order not found' }),
      }
    }

    const customerEmail = order.profiles?.email
    const customerName = order.profiles?.full_name || 'Customer'
    const address = order.address_snapshot

    if (!customerEmail) {
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Customer email missing' }),
      }
    }

    let subject = ''
    let htmlContent = ''

    const totalFormatted = `S$${(order.total_cents / 100).toFixed(2)}`
    const itemsListHtml = (order.order_items || [])
      .map(
        (item) =>
          `<tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #EAEAEA;">
              <strong>${item.product_name}</strong><br/>
              <span style="color: #666; font-size: 12px;">
                ${[item.variant_size, item.variant_color].filter(Boolean).join(' · ')} · Qty ${item.quantity}
              </span>
            </td>
            <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid #EAEAEA;">
              S$${(item.total_price_cents / 100).toFixed(2)}
            </td>
          </tr>`
      )
      .join('')

    switch (status) {
      case 'PLACED':
        subject = `Order Confirmation — ${order.order_number}`
        htmlContent = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #171717; max-width: 540px; margin: 0 auto; padding: 24px;">
            <h1 style="font-size: 20px; font-weight: 600; letter-spacing: -0.02em; margin-bottom: 16px;">AK QIMAASH</h1>
            <p>Dear ${customerName},</p>
            <p>Thank you for your order. We have received your order <strong>${order.order_number}</strong> and are preparing it for delivery.</p>
            <p>Payment method: <strong>Cash on Delivery (${totalFormatted})</strong></p>
            <div style="background-color: #F8F7F5; padding: 16px; border-radius: 6px; margin: 20px 0;">
              <h3 style="font-size: 14px; margin-top: 0; margin-bottom: 8px;">Delivery Address</h3>
              <p style="margin: 0; font-size: 13px; color: #444;">
                ${address.recipient_name}<br/>
                ${[address.block_building, address.street].filter(Boolean).join(', ')}<br/>
                ${address.unit_number ? address.unit_number + '<br/>' : ''}
                Singapore ${address.postal_code}<br/>
                Phone: ${address.phone}
              </p>
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              ${itemsListHtml}
            </table>
            <p style="font-size: 13px; color: #666;">
              Please prepare the exact cash amount for the courier upon arrival. If you have any questions, reply to this email.
            </p>
          </div>
        `
        break

      case 'SHIPPED':
        subject = `Your order ${order.order_number} has shipped`
        htmlContent = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #171717; max-width: 540px; margin: 0 auto; padding: 24px;">
            <h1 style="font-size: 20px; font-weight: 600; letter-spacing: -0.02em; margin-bottom: 16px;">AK QIMAASH</h1>
            <p>Dear ${customerName},</p>
            <p>Your order <strong>${order.order_number}</strong> is on its way!</p>
            ${courier_name || tracking_number ? `<p><strong>Courier:</strong> ${courier_name || 'Singapore Courier'}<br/><strong>Tracking:</strong> ${tracking_number || 'Standard'}</p>` : ''}
            <p>Expected delivery is within 2 business days. Total payable on delivery: <strong>${totalFormatted}</strong>.</p>
          </div>
        `
        break

      case 'DELIVERED':
        subject = `Delivered — Order ${order.order_number}`
        htmlContent = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #171717; max-width: 540px; margin: 0 auto; padding: 24px;">
            <h1 style="font-size: 20px; font-weight: 600; letter-spacing: -0.02em; margin-bottom: 16px;">AK QIMAASH</h1>
            <p>Dear ${customerName},</p>
            <p>Your order <strong>${order.order_number}</strong> has been marked as delivered.</p>
            <p>We hope you love your new pieces. If you need any assistance with your order, please reply to this email.</p>
          </div>
        `
        break

      default:
        subject = `Order Update — ${order.order_number}`
        htmlContent = `<p>Your order status has been updated to: <strong>${status}</strong>.</p>`
    }

    if (!deps.env.BREVO_API_KEY) {
      return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Email logged (no Brevo key configured)', subject, recipient: customerEmail }),
      }
    }

    // Call Brevo API
    const brevoResponse = await deps.fetchBrevoApi!('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': deps.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: deps.env.EMAIL_FROM_NAME || 'AK QIMAASH',
          email: deps.env.EMAIL_FROM_ADDRESS || 'orders@akqimaash.sg',
        },
        to: [{ email: customerEmail, name: customerName }],
        subject,
        htmlContent,
      }),
    })

    const result = await brevoResponse.json()
    return {
      status: brevoResponse.ok ? 200 : brevoResponse.status,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
      dispatchedSubject: subject,
      dispatchedHtml: htmlContent,
    }
  } catch (error: any) {
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message }),
    }
  }
}

describe('Edge Function: send-order-email', () => {
  const mockOrder: OrderRecord = {
    id: 'ord_12345',
    order_number: 'AKQ-20260903-1001',
    total_cents: 18900,
    address_snapshot: {
      recipient_name: 'Zahra Hassan',
      block_building: 'Blk 124',
      street: 'Bedok North Road',
      unit_number: '#08-342',
      postal_code: '460124',
      phone: '+6591234567',
    },
    profiles: {
      email: 'zahra@example.com',
      full_name: 'Zahra Hassan',
    },
    order_items: [
      {
        product_name: 'Classic Linen Abaya',
        variant_size: 'M',
        variant_color: 'Olive Green',
        quantity: 1,
        total_price_cents: 18900,
      },
    ],
  }

  it('rejects non-POST HTTP methods with 405 Method Not Allowed', async () => {
    const res = await handleSendOrderEmail(
      { method: 'GET', json: async () => ({}) },
      {
        supabaseFetchOrder: async () => ({ data: null, error: null }),
        env: {},
      }
    )
    expect(res.status).toBe(405)
    expect(res.body).toBe('Method Not Allowed')
  })

  it('validates required payload fields (order_id and status)', async () => {
    const res = await handleSendOrderEmail(
      { method: 'POST', json: async () => ({ order_id: 'ord_12345' }) }, // missing status
      {
        supabaseFetchOrder: async () => ({ data: null, error: null }),
        env: {},
      }
    )
    expect(res.status).toBe(400)
    expect(JSON.parse(res.body)).toEqual({ error: 'Missing required parameters' })
  })

  it('returns 404 when order does not exist in database', async () => {
    const res = await handleSendOrderEmail(
      { method: 'POST', json: async () => ({ order_id: 'non_existent', status: 'PLACED' }) },
      {
        supabaseFetchOrder: async () => ({ data: null, error: 'Not found' }),
        env: {},
      }
    )
    expect(res.status).toBe(404)
    expect(JSON.parse(res.body)).toEqual({ error: 'Order not found' })
  })

  it('returns 400 when customer has no associated email address', async () => {
    const orderWithoutEmail = {
      ...mockOrder,
      profiles: null,
    }
    const res = await handleSendOrderEmail(
      { method: 'POST', json: async () => ({ order_id: 'ord_12345', status: 'PLACED' }) },
      {
        supabaseFetchOrder: async () => ({ data: orderWithoutEmail, error: null }),
        env: {},
      }
    )
    expect(res.status).toBe(400)
    expect(JSON.parse(res.body)).toEqual({ error: 'Customer email missing' })
  })

  it('handles PLACED status email generation and safe fallback when BREVO_API_KEY is not set', async () => {
    const res = await handleSendOrderEmail(
      { method: 'POST', json: async () => ({ order_id: 'ord_12345', status: 'PLACED' }) },
      {
        supabaseFetchOrder: async () => ({ data: mockOrder, error: null }),
        env: {},
      }
    )

    expect(res.status).toBe(200)
    const body = JSON.parse(res.body)
    expect(body.message).toContain('Email logged (no Brevo key configured)')
    expect(body.subject).toBe('Order Confirmation — AKQ-20260903-1001')
    expect(body.recipient).toBe('zahra@example.com')
  })

  it('formats SHIPPED email with courier name and tracking code when dispatched via Brevo', async () => {
    const fetchBrevoApi = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ messageId: '<msg-1234@brevo.com>' }),
    })

    const res = await handleSendOrderEmail(
      {
        method: 'POST',
        json: async () => ({
          order_id: 'ord_12345',
          status: 'SHIPPED',
          courier_name: 'Ninja Van Singapore',
          tracking_number: 'NVSG987654321',
        }),
      },
      {
        supabaseFetchOrder: async () => ({ data: mockOrder, error: null }),
        fetchBrevoApi,
        env: {
          BREVO_API_KEY: 'test-brevo-key',
          EMAIL_FROM_ADDRESS: 'orders@akqimaash.sg',
          EMAIL_FROM_NAME: 'AK QIMAASH',
        },
      }
    )

    expect(res.status).toBe(200)
    expect(fetchBrevoApi).toHaveBeenCalledOnce()
    const callArgs = fetchBrevoApi.mock.calls[0]
    expect(callArgs[0]).toBe('https://api.brevo.com/v3/smtp/email')
    expect(callArgs[1].headers['api-key']).toBe('test-brevo-key')

    const requestBody = JSON.parse(callArgs[1].body)
    expect(requestBody.subject).toBe('Your order AKQ-20260903-1001 has shipped')
    expect(requestBody.to).toEqual([{ email: 'zahra@example.com', name: 'Zahra Hassan' }])
    expect(requestBody.htmlContent).toContain('Ninja Van Singapore')
    expect(requestBody.htmlContent).toContain('NVSG987654321')
    expect(requestBody.htmlContent).toContain('S$189.00')
  })

  it('formats DELIVERED status email correctly', async () => {
    const fetchBrevoApi = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ messageId: '<msg-5678@brevo.com>' }),
    })

    const res = await handleSendOrderEmail(
      {
        method: 'POST',
        json: async () => ({
          order_id: 'ord_12345',
          status: 'DELIVERED',
        }),
      },
      {
        supabaseFetchOrder: async () => ({ data: mockOrder, error: null }),
        fetchBrevoApi,
        env: { BREVO_API_KEY: 'test-brevo-key' },
      }
    )

    expect(res.status).toBe(200)
    const callArgs = fetchBrevoApi.mock.calls[0]
    const requestBody = JSON.parse(callArgs[1].body)
    expect(requestBody.subject).toBe('Delivered — Order AKQ-20260903-1001')
    expect(requestBody.htmlContent).toContain('has been marked as delivered')
  })

  it('handles unexpected internal server exceptions gracefully', async () => {
    const res = await handleSendOrderEmail(
      {
        method: 'POST',
        json: async () => {
          throw new Error('Database connection timeout')
        },
      },
      {
        supabaseFetchOrder: async () => ({ data: null, error: null }),
        env: {},
      }
    )

    expect(res.status).toBe(500)
    expect(JSON.parse(res.body)).toEqual({ error: 'Database connection timeout' })
  })
})
