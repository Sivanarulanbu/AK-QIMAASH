// Supabase Edge Function: send-order-email
// Triggered via Database Webhook or called directly via supabase.functions.invoke('send-order-email')
//
// Supports all order statuses: PLACED, CONFIRMED, PROCESSING, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED
// Also supports standalone emails: WELCOME, PASSWORD_RESET, REVIEW_REQUEST
// Supports Resend (RESEND_API_KEY) and Brevo (BREVO_API_KEY)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
  getOrderEmailTemplate,
  welcomeEmail,
  passwordResetEmail,
  reviewRequestEmail,
  type OrderEmailData,
} from '../_shared/email-templates.ts'

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY') || ''
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const EMAIL_FROM_ADDRESS = Deno.env.get('EMAIL_FROM_ADDRESS') || 'krishnananbu99@gmail.com'
const EMAIL_FROM_NAME = Deno.env.get('EMAIL_FROM_NAME') || 'AK QIMAASH'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || Deno.env.get('VITE_SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailPayload {
  // Order-related emails
  order_id?: string
  status?: string
  tracking_number?: string
  courier_name?: string
  cancellation_reason?: string

  // Standalone emails
  email_type?: 'WELCOME' | 'PASSWORD_RESET' | 'REVIEW_REQUEST'
  customer_email?: string
  customer_name?: string
  reset_link?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const payload: EmailPayload = await req.json()

    // ─── Handle standalone emails ────────────────────────────
    if (payload.email_type) {
      return await handleStandaloneEmail(payload)
    }

    // ─── Handle order status emails ──────────────────────────
    const { order_id, status, tracking_number, courier_name, cancellation_reason } = payload

    if (!order_id || !status) {
      return new Response(JSON.stringify({ error: 'Missing required parameters: order_id and status' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY || Deno.env.get('SUPABASE_ANON_KEY') || ''
    )

    // Fetch order, items, and customer details
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select(`
        *,
        profiles!orders_user_id_fkey(full_name, email),
        order_items(*)
      `)
      .eq('id', order_id)
      .single()

    if (orderErr || !order) {
      return new Response(JSON.stringify({ error: 'Order not found', details: orderErr?.message }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const customerEmail = order.profiles?.email
    const customerName = order.profiles?.full_name || 'Customer'
    const address = (order.address_snapshot as any) || {}

    if (!customerEmail) {
      return new Response(JSON.stringify({ error: 'Customer email missing' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Build template data
    const templateData = {
      order_number: order.order_number,
      order_id: order.id,
      customer_name: customerName,
      status,
      items: (order.order_items || []).map((item: any) => ({
        product_name: item.product_name,
        variant_size: item.variant_size,
        variant_color: item.variant_color,
        quantity: item.quantity,
        unit_price_cents: item.unit_price_cents,
        total_price_cents: item.total_price_cents,
      })),
      totals: {
        subtotal_cents: order.subtotal_cents,
        gst_cents: order.gst_cents,
        delivery_cents: order.delivery_cents,
        total_cents: order.total_cents,
      },
      address: {
        recipient_name: address.recipient_name,
        phone: address.phone,
        block_building: address.block_building,
        street: address.street,
        unit_number: address.unit_number,
        postal_code: address.postal_code,
      },
      payment_method: order.payment_method,
      tracking_number: tracking_number || order.tracking_number,
      courier_name: courier_name || order.courier_name,
      estimated_delivery: order.estimated_delivery,
      created_at: order.created_at,
      notes: order.notes,
      cancellation_reason,
    }

    // Generate email from template
    const { subject, html } = getOrderEmailTemplate(templateData)

    // Send email
    return await sendEmail(customerEmail, customerName, subject, html)
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

// ─── Standalone Email Handler ───────────────────────────────────
async function handleStandaloneEmail(payload: EmailPayload): Promise<Response> {
  const { email_type, customer_email, customer_name } = payload

  if (!customer_email || !customer_name) {
    return new Response(JSON.stringify({ error: 'Missing customer_email or customer_name' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let subject: string
  let html: string

  switch (email_type) {
    case 'WELCOME': {
      const result = welcomeEmail({ customer_name, email: customer_email })
      subject = result.subject
      html = result.html
      break
    }

    case 'PASSWORD_RESET': {
      if (!payload.reset_link) {
        return new Response(JSON.stringify({ error: 'Missing reset_link' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      const result = passwordResetEmail({ customer_name, reset_link: payload.reset_link })
      subject = result.subject
      html = result.html
      break
    }

    case 'REVIEW_REQUEST': {
      if (!payload.order_id) {
        return new Response(JSON.stringify({ error: 'Missing order_id for review request' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const supabase = createClient(
        SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY || Deno.env.get('SUPABASE_ANON_KEY') || ''
      )
      const { data: order, error } = await supabase
        .from('orders')
        .select('order_number, order_items(product_name, variant_size, variant_color)')
        .eq('id', payload.order_id)
        .single()

      if (error || !order) {
        return new Response(JSON.stringify({ error: 'Order not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const result = reviewRequestEmail({
        customer_name,
        order_number: order.order_number,
        order_id: payload.order_id,
        items: (order.order_items || []).map((item: any) => ({
          product_name: item.product_name,
          variant_size: item.variant_size,
          variant_color: item.variant_color,
        })),
      })
      subject = result.subject
      html = result.html
      break
    }

    default:
      return new Response(JSON.stringify({ error: `Unknown email_type: ${email_type}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
  }

  return await sendEmail(customer_email, customer_name, subject, html)
}

// ─── Dispatch Email via Brevo (Primary) or Resend ─────────────
async function sendEmail(
  to: string,
  toName: string,
  subject: string,
  htmlContent: string
): Promise<Response> {
  // Option 1: Brevo (Primary)
  if (BREVO_API_KEY) {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: { name: EMAIL_FROM_NAME, email: EMAIL_FROM_ADDRESS },
          to: [{ email: to, name: toName }],
          subject,
          htmlContent,
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        console.error('Brevo API error:', result)
        return new Response(
          JSON.stringify({ error: 'Brevo delivery failed', details: result }),
          {
            status: response.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      return new Response(JSON.stringify({ success: true, provider: 'brevo', result }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } catch (err: any) {
      console.error('Brevo network error:', err)
      return new Response(JSON.stringify({ error: 'Brevo network failure: ' + err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  }

  // Option 2: Resend (Secondary fallback)
  if (RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: `${EMAIL_FROM_NAME} <${EMAIL_FROM_ADDRESS}>`,
          to: [to],
          subject,
          html: htmlContent,
        }),
      })

      const data = await res.json()
      return new Response(JSON.stringify({ success: res.ok, provider: 'resend', data }), {
        status: res.ok ? 200 : res.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } catch (err: any) {
      return new Response(JSON.stringify({ error: 'Resend delivery failed: ' + err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  }

  // Fallback: No API Key provided yet
  console.warn('Neither RESEND_API_KEY nor BREVO_API_KEY is configured in Supabase secrets.')
  return new Response(
    JSON.stringify({
      status: 'simulated',
      message: 'Email rendered successfully, but no email provider API key is set in Supabase secrets (RESEND_API_KEY or BREVO_API_KEY).',
      to,
      subject,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  )
}
