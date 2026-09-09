import { supabase } from '@/lib/supabase'
import { getOrderEmailTemplate, type OrderEmailData } from '@/lib/email-templates'

export interface OrderEmailItem {
  product_name: string
  variant_size?: string | null
  variant_color?: string | null
  quantity: number
  unit_price_cents: number
  total_price_cents: number
}

export interface SendOrderEmailParams {
  orderId: string
  status: string
  tracking_number?: string
  courier_name?: string
  cancellation_reason?: string
  // Optional pre-computed data to avoid extra DB queries
  orderNumber?: string
  customerEmail?: string
  customerName?: string
  items?: OrderEmailItem[]
  totals?: {
    subtotal_cents: number
    gst_cents: number
    delivery_cents: number
    total_cents: number
  }
  address?: {
    recipient_name: string
    phone: string
    block_building?: string
    street: string
    unit_number?: string
    postal_code: string
  }
  paymentMethod?: string
}

// Brevo environment configurations
const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY || ''

const SENDER_EMAIL = import.meta.env.VITE_BREVO_SENDER_EMAIL || 'krishnananbu99@gmail.com'
const SENDER_NAME = import.meta.env.VITE_BREVO_SENDER_NAME || 'AK QIMAASH'

/**
 * Directly dispatch an HTML email via Brevo REST API.
 * Uses dev proxy if in local development to prevent CORS or adblock issues,
 * and falls back to direct Brevo endpoint.
 */
export async function sendBrevoEmail(
  toEmail: string,
  toName: string,
  subject: string,
  htmlContent: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!toEmail) {
    console.error('[EmailService] Cannot send email: recipient email is missing')
    return { success: false, error: 'Recipient email missing' }
  }

  const payload = {
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: [{ email: toEmail, name: toName || 'Customer' }],
    subject,
    htmlContent,
  }

  // List of endpoints to try: first the dev proxy, then direct Brevo API
  const endpoints = ['/api/brevo/smtp/email', 'https://api.brevo.com/v3/smtp/email']

  let lastError = ''
  for (const endpoint of endpoints) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': BREVO_API_KEY,
          },
          body: JSON.stringify(payload),
        })

        if (res.ok) {
          const data = await res.json()
          console.info(`[EmailService] Email sent successfully via Brevo (${endpoint}) to ${toEmail}. Message ID:`, data.messageId)
          return { success: true, messageId: data.messageId }
        }

        const errData = await res.json().catch(() => ({}))
        lastError = errData.message || `HTTP ${res.status} ${res.statusText}`
        console.warn(`[EmailService] Endpoint ${endpoint} (attempt ${attempt}) returned error:`, lastError)
      } catch (err: any) {
        lastError = err?.message || String(err)
        console.warn(`[EmailService] Network attempt to ${endpoint} (attempt ${attempt}) failed:`, lastError)
      }

      // Short delay before second attempt
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 300))
      }
    }
  }

  console.error('[EmailService] All Brevo delivery attempts failed:', lastError)
  return { success: false, error: lastError }
}

/**
 * Dispatches an order email (confirmation, shipping, delivery, cancellation, etc.).
 *
 * Strategy:
 * 1. Tries invoking the Supabase Edge Function 'send-order-email'.
 * 2. If the edge function is undeployed (404) or fails, falls back automatically
 *    to direct client-side Brevo API dispatch using our responsive email templates.
 */
export async function sendOrderEmail(
  params: SendOrderEmailParams
): Promise<{ success: boolean; provider?: string; error?: string }> {
  const { orderId, status, tracking_number, courier_name, cancellation_reason } = params

  console.info(`[EmailService] Preparing email for Order ${orderId} (Status: ${status})...`)

  // Step 1: Attempt Edge Function invocation
  try {
    const { data, error } = await supabase.functions.invoke('send-order-email', {
      body: {
        order_id: orderId,
        status,
        tracking_number,
        courier_name,
        cancellation_reason,
      },
    })

    if (!error && data?.success) {
      console.info('[EmailService] Order email dispatched via Supabase Edge Function:', data)
      return { success: true, provider: 'supabase-edge-function' }
    }

    console.warn(
      '[EmailService] Supabase Edge Function unavailable or returned error. Falling back to direct Brevo dispatch.',
      error || data
    )
  } catch (edgeErr) {
    console.warn('[EmailService] Edge Function invocation failed, switching to direct Brevo fallback:', edgeErr)
  }

  // Step 2: Fallback to direct Brevo email generation and dispatch
  try {
    let orderNumber = params.orderNumber
    let customerEmail = params.customerEmail
    let customerName = params.customerName
    let items = params.items
    let totals = params.totals
    let address = params.address
    let paymentMethod = params.paymentMethod || 'COD'
    let createdAt = new Date().toISOString()

    // If details weren't passed in params, fetch from DB
    if (!customerEmail || !items || !totals || !address) {
      const { data: order, error: fetchErr } = await (supabase.from('orders') as any)
        .select(`
          *,
          profiles!orders_user_id_fkey(full_name, email),
          order_items(*)
        `)
        .eq('id', orderId)
        .single()

      if (fetchErr || !order) {
        console.error('[EmailService] Could not fetch order for email fallback:', fetchErr)
        return { success: false, error: 'Order not found for fallback delivery' }
      }

      orderNumber = orderNumber || order.order_number
      customerEmail = customerEmail || order.profiles?.email
      customerName = customerName || order.profiles?.full_name || order.address_snapshot?.recipient_name
      address = address || order.address_snapshot
      paymentMethod = order.payment_method || paymentMethod
      createdAt = order.created_at || createdAt

      totals = totals || {
        subtotal_cents: order.subtotal_cents,
        gst_cents: order.gst_cents,
        delivery_cents: order.delivery_cents,
        total_cents: order.total_cents,
      }

      items =
        items ||
        (order.order_items || []).map((item: any) => ({
          product_name: item.product_name,
          variant_size: item.variant_size,
          variant_color: item.variant_color,
          quantity: item.quantity,
          unit_price_cents: item.unit_price_cents,
          total_price_cents: item.total_price_cents,
        }))
    }

    // If customerEmail is still missing, attempt to get it from current auth session
    if (!customerEmail) {
      const { data: sessionData } = await supabase.auth.getUser()
      customerEmail = sessionData?.user?.email
    }

    if (!customerEmail) {
      console.error('[EmailService] Cannot send order email: No customer email found')
      return { success: false, error: 'Customer email missing' }
    }

    const templateData: OrderEmailData & { cancellation_reason?: string } = {
      order_number: orderNumber || `AKQ-${orderId.slice(0, 8).toUpperCase()}`,
      order_id: orderId,
      customer_name: customerName || 'Valued Customer',
      status,
      items: items || [],
      totals: totals || { subtotal_cents: 0, gst_cents: 0, delivery_cents: 0, total_cents: 0 },
      address: address || {
        recipient_name: customerName || 'Customer',
        phone: '',
        street: 'Singapore',
        postal_code: '',
      },
      payment_method: paymentMethod,
      tracking_number,
      courier_name,
      estimated_delivery: '2-3 business days',
      created_at: createdAt,
      cancellation_reason,
    }

    const { subject, html } = getOrderEmailTemplate(templateData)

    const result = await sendBrevoEmail(customerEmail, customerName || 'Customer', subject, html)
    return {
      success: result.success,
      provider: 'brevo-direct',
      error: result.error,
    }
  } catch (fallbackErr: any) {
    console.error('[EmailService] Brevo direct fallback encountered an error:', fallbackErr)
    return { success: false, error: fallbackErr?.message || String(fallbackErr) }
  }
}
