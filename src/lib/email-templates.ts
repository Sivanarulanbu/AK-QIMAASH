/**
 * AK QIMAASH — Email Template System
 * Premium, responsive HTML email templates for all transactional emails.
 *
 * Brand palette:
 *   Black:      #0E0E0E
 *   Charcoal:   #1C1C1C
 *   Graphite:   #2E2E2E
 *   Stone:      #4A4A4A
 *   Slate:      #757575
 *   Ivory:      #F5F4F0
 *   Smoke:      #EBEBEB
 *   Accent:     #B05C3A (terracotta)
 *   AccentDark: #8B4427
 */

// ─── Brand Constants ────────────────────────────────────────────
const BRAND = {
  name: 'AK QIMAASH',
  tagline: 'Modest Luxury, Redefined',
  website: 'https://akqimaash.sg',
  supportEmail: 'support@akqimaash.sg',
  instagram: 'https://instagram.com/akqimaash',
  colors: {
    black: '#0E0E0E',
    charcoal: '#1C1C1C',
    graphite: '#2E2E2E',
    stone: '#4A4A4A',
    slate: '#757575',
    silver: '#A8A8A8',
    mist: '#D4D4D4',
    smoke: '#EBEBEB',
    ivory: '#F5F4F0',
    white: '#FAFAFA',
    accent: '#B05C3A',
    accentLight: '#C97A55',
    accentDark: '#8B4427',
    accentMuted: '#E8C4B0',
    accentSubtle: '#F5EAE3',
    success: '#2D6A4F',
    successLight: '#D8F3DC',
    warning: '#B5700A',
    warningLight: '#FEF3C7',
    error: '#9B2335',
    errorLight: '#FEE2E2',
  },
} as const

// ─── Helpers ────────────────────────────────────────────────────
export function formatCurrency(cents: number): string {
  return `S$${(cents / 100).toFixed(2)}`
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-SG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function statusDisplayName(status: string): string {
  const map: Record<string, string> = {
    PLACED: 'Order Placed',
    CONFIRMED: 'Confirmed',
    PROCESSING: 'Processing',
    SHIPPED: 'Shipped',
    OUT_FOR_DELIVERY: 'Out for Delivery',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
  }
  return map[status] || status
}

// ─── Reusable Status Badge Color ────────────────────────────────
function statusBadge(status: string): string {
  let bg: string = BRAND.colors.accentSubtle
  let fg: string = BRAND.colors.accent
  switch (status) {
    case 'PLACED':
    case 'CONFIRMED':
      bg = BRAND.colors.accentSubtle
      fg = BRAND.colors.accent
      break
    case 'PROCESSING':
      bg = BRAND.colors.warningLight
      fg = BRAND.colors.warning
      break
    case 'SHIPPED':
    case 'OUT_FOR_DELIVERY':
      bg = '#DBEAFE'
      fg = '#1E3A5F'
      break
    case 'DELIVERED':
      bg = BRAND.colors.successLight
      fg = BRAND.colors.success
      break
    case 'CANCELLED':
      bg = BRAND.colors.errorLight
      fg = BRAND.colors.error
      break
  }
  return `<span style="display:inline-block;padding:4px 14px;border-radius:100px;font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;background:${bg};color:${fg};">${statusDisplayName(status)}</span>`
}

// ─── Base Layout Wrapper ────────────────────────────────────────
function baseLayout(content: string, preheaderText = ''): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
  <title>${BRAND.name}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    * { box-sizing: border-box; }
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: ${BRAND.colors.ivory}; }
    .email-body { background-color: ${BRAND.colors.ivory}; }
    .email-container { max-width: 600px; margin: 0 auto; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; padding: 0 16px !important; }
      .stack-column { display: block !important; width: 100% !important; }
      .mobile-padding { padding: 24px 20px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.colors.ivory};font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <!-- Preheader text (hidden) -->
  <div style="display:none;font-size:1px;color:${BRAND.colors.ivory};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    ${preheaderText}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:${BRAND.colors.ivory};" class="email-body">
    <tr>
      <td align="center" style="padding:24px 16px 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="email-container">

          <!-- ═══ HEADER ═══ -->
          <tr>
            <td style="padding:32px 40px 24px;text-align:center;background:linear-gradient(135deg,${BRAND.colors.charcoal} 0%,${BRAND.colors.black} 100%);border-radius:12px 12px 0 0;" class="mobile-padding">
              <!-- Logo Text -->
              <h1 style="margin:0;font-size:28px;font-weight:300;letter-spacing:0.18em;color:${BRAND.colors.white};text-transform:uppercase;font-family:'Inter',-apple-system,sans-serif;">
                ${BRAND.name}
              </h1>
              <!-- Accent line -->
              <div style="width:48px;height:2px;background:${BRAND.colors.accent};margin:16px auto 8px;border-radius:1px;"></div>
              <p style="margin:0;font-size:11px;letter-spacing:0.12em;color:${BRAND.colors.slate};text-transform:uppercase;">
                ${BRAND.tagline}
              </p>
            </td>
          </tr>

          <!-- ═══ BODY ═══ -->
          <tr>
            <td style="padding:40px 40px 32px;background-color:#FFFFFF;border-left:1px solid ${BRAND.colors.smoke};border-right:1px solid ${BRAND.colors.smoke};" class="mobile-padding">
              ${content}
            </td>
          </tr>

          <!-- ═══ FOOTER ═══ -->
          <tr>
            <td style="padding:32px 40px;background-color:${BRAND.colors.charcoal};border-radius:0 0 12px 12px;text-align:center;" class="mobile-padding">
              <!-- Social links -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto 20px;">
                <tr>
                  <td style="padding:0 8px;">
                    <a href="${BRAND.website}" style="display:inline-block;padding:8px 16px;border:1px solid ${BRAND.colors.stone};border-radius:6px;color:${BRAND.colors.mist};font-size:11px;text-decoration:none;letter-spacing:0.05em;text-transform:uppercase;">
                      Shop
                    </a>
                  </td>
                  <td style="padding:0 8px;">
                    <a href="${BRAND.instagram}" style="display:inline-block;padding:8px 16px;border:1px solid ${BRAND.colors.stone};border-radius:6px;color:${BRAND.colors.mist};font-size:11px;text-decoration:none;letter-spacing:0.05em;text-transform:uppercase;">
                      Instagram
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <div style="width:100%;height:1px;background:${BRAND.colors.graphite};margin:0 0 20px;"></div>

              <!-- Help -->
              <p style="margin:0 0 6px;font-size:12px;color:${BRAND.colors.silver};line-height:1.6;">
                Questions? Reply to this email or contact
              </p>
              <a href="mailto:${BRAND.supportEmail}" style="font-size:12px;color:${BRAND.colors.accentLight};text-decoration:none;font-weight:500;">
                ${BRAND.supportEmail}
              </a>

              <!-- Legal -->
              <p style="margin:20px 0 0;font-size:10px;color:${BRAND.colors.stone};line-height:1.5;letter-spacing:0.02em;">
                © ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.<br>
                Singapore
              </p>
            </td>
          </tr>

          <!-- Spacer -->
          <tr><td style="height:32px;"></td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ─── Reusable Components ────────────────────────────────────────

function sectionHeading(text: string, icon?: string): string {
  return `
    <h2 style="margin:0 0 16px;font-size:22px;font-weight:600;letter-spacing:-0.02em;color:${BRAND.colors.black};line-height:1.3;">
      ${icon ? icon + '&nbsp;&nbsp;' : ''}${text}
    </h2>`
}

function divider(): string {
  return `<div style="width:100%;height:1px;background:${BRAND.colors.smoke};margin:24px 0;"></div>`
}

function ctaButton(text: string, url: string): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px auto;">
      <tr>
        <td style="border-radius:8px;background:linear-gradient(135deg,${BRAND.colors.accent} 0%,${BRAND.colors.accentDark} 100%);">
          <a href="${url}" target="_blank" style="display:inline-block;padding:14px 36px;font-size:13px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#FFFFFF;text-decoration:none;border-radius:8px;">
            ${text}
          </a>
        </td>
      </tr>
    </table>`
}

function infoCard(title: string, content: string): string {
  return `
    <div style="background:${BRAND.colors.ivory};border:1px solid ${BRAND.colors.smoke};border-radius:10px;padding:20px 24px;margin:20px 0;">
      <h3 style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:${BRAND.colors.slate};">
        ${title}
      </h3>
      <div style="font-size:14px;line-height:1.7;color:${BRAND.colors.stone};">
        ${content}
      </div>
    </div>`
}

function greeting(name: string): string {
  return `<p style="margin:0 0 20px;font-size:15px;color:${BRAND.colors.stone};line-height:1.7;">
    Dear <strong style="color:${BRAND.colors.charcoal}">${name}</strong>,
  </p>`
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;font-size:14px;color:${BRAND.colors.stone};line-height:1.7;">${text}</p>`
}

// ─── Order Items Table ──────────────────────────────────────────
export interface OrderItem {
  product_name: string
  variant_size?: string | null
  variant_color?: string | null
  quantity: number
  unit_price_cents: number
  total_price_cents: number
}

function orderItemsTable(items: OrderItem[]): string {
  const rows = items.map((item, i) => {
    const isLast = i === items.length - 1
    const meta = [item.variant_size, item.variant_color].filter(Boolean).join(' · ')
    return `
      <tr>
        <td style="padding:14px 0;${isLast ? '' : `border-bottom:1px solid ${BRAND.colors.smoke};`}vertical-align:top;">
          <p style="margin:0 0 2px;font-size:14px;font-weight:500;color:${BRAND.colors.charcoal};">
            ${item.product_name}
          </p>
          ${meta ? `<p style="margin:0;font-size:12px;color:${BRAND.colors.slate};">${meta}</p>` : ''}
          <p style="margin:4px 0 0;font-size:12px;color:${BRAND.colors.silver};">Qty: ${item.quantity}</p>
        </td>
        <td style="padding:14px 0;${isLast ? '' : `border-bottom:1px solid ${BRAND.colors.smoke};`}text-align:right;vertical-align:top;white-space:nowrap;">
          <p style="margin:0;font-size:14px;font-weight:500;color:${BRAND.colors.charcoal};">
            ${formatCurrency(item.total_price_cents)}
          </p>
          ${item.quantity > 1 ? `<p style="margin:2px 0 0;font-size:11px;color:${BRAND.colors.silver};">${formatCurrency(item.unit_price_cents)} each</p>` : ''}
        </td>
      </tr>`
  }).join('')

  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:16px 0;">
      <thead>
        <tr>
          <td style="padding:0 0 10px;font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:${BRAND.colors.slate};border-bottom:2px solid ${BRAND.colors.charcoal};">
            Item
          </td>
          <td style="padding:0 0 10px;font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:${BRAND.colors.slate};text-align:right;border-bottom:2px solid ${BRAND.colors.charcoal};">
            Amount
          </td>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>`
}

// ─── Order Total Summary ────────────────────────────────────────
export interface OrderTotals {
  subtotal_cents: number
  gst_cents: number
  delivery_cents: number
  total_cents: number
}

function orderTotalsSummary(totals: OrderTotals): string {
  const lines = [
    { label: 'Subtotal', value: formatCurrency(totals.subtotal_cents) },
    { label: 'GST (9%)', value: formatCurrency(totals.gst_cents) },
    { label: 'Delivery', value: totals.delivery_cents === 0 ? '<span style="color:' + BRAND.colors.success + ';font-weight:500;">Free</span>' : formatCurrency(totals.delivery_cents) },
  ]

  const lineRows = lines.map(l => `
    <tr>
      <td style="padding:4px 0;font-size:13px;color:${BRAND.colors.slate};">${l.label}</td>
      <td style="padding:4px 0;font-size:13px;color:${BRAND.colors.stone};text-align:right;">${l.value}</td>
    </tr>
  `).join('')

  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:8px 0 0;">
      ${lineRows}
      <tr>
        <td colspan="2" style="padding:8px 0 0;">
          <div style="height:1px;background:${BRAND.colors.charcoal};"></div>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 0 0;font-size:16px;font-weight:600;color:${BRAND.colors.black};">Total</td>
        <td style="padding:12px 0 0;font-size:16px;font-weight:600;color:${BRAND.colors.black};text-align:right;">${formatCurrency(totals.total_cents)}</td>
      </tr>
    </table>`
}

// ─── Address Block ──────────────────────────────────────────────
export interface AddressSnapshot {
  recipient_name: string
  phone: string
  block_building?: string | null
  street: string
  unit_number?: string | null
  postal_code: string
}

function addressBlock(address: AddressSnapshot): string {
  const lines = [
    address.recipient_name,
    [address.block_building, address.street].filter(Boolean).join(', '),
    address.unit_number,
    `Singapore ${address.postal_code}`,
    `Phone: ${address.phone}`,
  ].filter(Boolean)

  return infoCard('Delivery Address', lines.map(l => `${l}<br>`).join(''))
}

// ─── Order Status Timeline ──────────────────────────────────────
function statusTimeline(currentStatus: string): string {
  const statuses = ['PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED']
  const currentIdx = statuses.indexOf(currentStatus)

  // If cancelled, show a single cancelled indicator
  if (currentStatus === 'CANCELLED') {
    return `
      <div style="text-align:center;padding:20px 0;">
        ${statusBadge('CANCELLED')}
      </div>`
  }

  const steps = statuses.map((s, i) => {
    const isActive = i <= currentIdx
    const isCurrent = i === currentIdx
    const dotColor = isActive ? BRAND.colors.accent : BRAND.colors.mist
    const dotSize = isCurrent ? '14px' : '10px'
    const dotBorder = isCurrent ? `3px solid ${BRAND.colors.accentMuted}` : 'none'
    const labelColor = isActive ? BRAND.colors.charcoal : BRAND.colors.silver
    const fontWeight = isCurrent ? '600' : '400'

    return `
      <td style="text-align:center;padding:0 2px;width:${100 / statuses.length}%;">
        <div style="width:${dotSize};height:${dotSize};border-radius:50%;background:${dotColor};margin:0 auto 6px;border:${dotBorder};"></div>
        <p style="margin:0;font-size:9px;letter-spacing:0.04em;color:${labelColor};font-weight:${fontWeight};line-height:1.3;">
          ${statusDisplayName(s).replace(' ', '<br>')}
        </p>
      </td>`
  })

  // Build connecting lines
  const connectors = statuses.slice(0, -1).map((_, i) => {
    const isActive = i < currentIdx
    const lineColor = isActive ? BRAND.colors.accent : BRAND.colors.mist
    return `<td style="width:${80 / (statuses.length - 1)}%;vertical-align:top;padding-top:5px;">
      <div style="height:2px;background:${lineColor};margin:0 -4px;border-radius:1px;"></div>
    </td>`
  })

  // Interleave dots and connectors
  const interleaved: string[] = []
  steps.forEach((step, i) => {
    interleaved.push(step)
    if (i < connectors.length) interleaved.push(connectors[i])
  })

  return `
    <div style="margin:24px 0;padding:20px 8px;background:${BRAND.colors.ivory};border-radius:10px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>${interleaved.join('')}</tr>
      </table>
    </div>`
}

// ─────────────────────────────────────────────────────────────────
// EMAIL TEMPLATES
// ─────────────────────────────────────────────────────────────────

export interface OrderEmailData {
  order_number: string
  order_id: string
  customer_name: string
  status: string
  items: OrderItem[]
  totals: OrderTotals
  address: AddressSnapshot
  payment_method: string
  tracking_number?: string | null
  courier_name?: string | null
  estimated_delivery?: string | null
  created_at: string
  notes?: string | null
}

// ─── 1. ORDER PLACED ────────────────────────────────────────────
export function orderPlacedEmail(data: OrderEmailData): { subject: string; html: string } {
  const paymentLabel = data.payment_method === 'COD'
    ? 'Cash on Delivery'
    : data.payment_method === 'PAYNOW'
    ? 'PayNow'
    : 'Card Payment'

  const content = `
    ${sectionHeading('Thank You for Your Order ✨')}
    ${greeting(data.customer_name)}
    ${paragraph(`Your order <strong style="color:${BRAND.colors.charcoal}">${data.order_number}</strong> has been received and is being prepared with care.`)}

    <!-- Status Badge -->
    <div style="text-align:center;margin:24px 0;">
      ${statusBadge('PLACED')}
    </div>

    ${statusTimeline('PLACED')}

    <!-- Order Details -->
    <div style="background:${BRAND.colors.ivory};border:1px solid ${BRAND.colors.smoke};border-radius:10px;padding:24px;margin:20px 0;">
      <h3 style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:${BRAND.colors.slate};">Order Number</h3>
      <p style="margin:0 0 16px;font-size:18px;font-weight:600;letter-spacing:0.04em;color:${BRAND.colors.charcoal};">${data.order_number}</p>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td width="50%">
            <p style="margin:0 0 2px;font-size:10px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.colors.slate};">Date</p>
            <p style="margin:0;font-size:13px;color:${BRAND.colors.stone};">${formatDate(data.created_at)}</p>
          </td>
          <td width="50%">
            <p style="margin:0 0 2px;font-size:10px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.colors.slate};">Payment</p>
            <p style="margin:0;font-size:13px;color:${BRAND.colors.stone};">${paymentLabel}</p>
          </td>
        </tr>
      </table>
    </div>

    ${divider()}

    <!-- Items -->
    <h3 style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:${BRAND.colors.slate};">Items Ordered</h3>
    ${orderItemsTable(data.items)}
    ${orderTotalsSummary(data.totals)}

    ${divider()}

    <!-- Address -->
    ${addressBlock(data.address)}

    ${data.payment_method === 'COD' ? `
    <div style="background:${BRAND.colors.warningLight};border-left:3px solid ${BRAND.colors.warning};border-radius:0 8px 8px 0;padding:14px 18px;margin:20px 0;">
      <p style="margin:0;font-size:13px;color:${BRAND.colors.warning};line-height:1.6;">
        <strong>💰 Cash on Delivery</strong><br>
        Please prepare <strong>${formatCurrency(data.totals.total_cents)}</strong> in exact change for our delivery partner.
      </p>
    </div>` : ''}

    ${ctaButton('View Your Order', `${BRAND.website}/account/orders/${data.order_id}`)}

    ${paragraph('We\'ll send you another email when your order ships. If you have any questions, simply reply to this email.')}
  `

  return {
    subject: `Order Confirmed — ${data.order_number} | ${BRAND.name}`,
    html: baseLayout(content, `Thank you! Your order ${data.order_number} has been received.`),
  }
}

// ─── 2. ORDER CONFIRMED ─────────────────────────────────────────
export function orderConfirmedEmail(data: OrderEmailData): { subject: string; html: string } {
  const content = `
    ${sectionHeading('Your Order is Confirmed ✓')}
    ${greeting(data.customer_name)}
    ${paragraph(`Great news! Your order <strong style="color:${BRAND.colors.charcoal}">${data.order_number}</strong> has been confirmed and will be prepared shortly.`)}

    ${statusTimeline('CONFIRMED')}

    <div style="background:${BRAND.colors.successLight};border-left:3px solid ${BRAND.colors.success};border-radius:0 8px 8px 0;padding:14px 18px;margin:20px 0;">
      <p style="margin:0;font-size:13px;color:${BRAND.colors.success};line-height:1.6;">
        <strong>✓ Payment & order verified</strong><br>
        Your order is now in our queue and will be prepared soon.
      </p>
    </div>

    <!-- Order Summary Card -->
    <div style="background:${BRAND.colors.ivory};border:1px solid ${BRAND.colors.smoke};border-radius:10px;padding:20px 24px;margin:20px 0;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td>
            <p style="margin:0 0 2px;font-size:10px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.colors.slate};">Order</p>
            <p style="margin:0;font-size:15px;font-weight:600;color:${BRAND.colors.charcoal};">${data.order_number}</p>
          </td>
          <td style="text-align:right;">
            <p style="margin:0 0 2px;font-size:10px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.colors.slate};">Total</p>
            <p style="margin:0;font-size:15px;font-weight:600;color:${BRAND.colors.charcoal};">${formatCurrency(data.totals.total_cents)}</p>
          </td>
        </tr>
      </table>
    </div>

    ${ctaButton('Track Your Order', `${BRAND.website}/account/orders/${data.order_id}`)}

    ${paragraph('We\'ll notify you once your items are being prepared. Thank you for shopping with us!')}
  `

  return {
    subject: `Order Confirmed — ${data.order_number}`,
    html: baseLayout(content, `Your order ${data.order_number} has been confirmed.`),
  }
}

// ─── 3. ORDER PROCESSING ────────────────────────────────────────
export function orderProcessingEmail(data: OrderEmailData): { subject: string; html: string } {
  const content = `
    ${sectionHeading('We\'re Preparing Your Order 🧵')}
    ${greeting(data.customer_name)}
    ${paragraph(`Your order <strong style="color:${BRAND.colors.charcoal}">${data.order_number}</strong> is now being carefully prepared and packaged for delivery.`)}

    ${statusTimeline('PROCESSING')}

    <div style="background:${BRAND.colors.warningLight};border-left:3px solid ${BRAND.colors.warning};border-radius:0 8px 8px 0;padding:14px 18px;margin:20px 0;">
      <p style="margin:0;font-size:13px;color:${BRAND.colors.warning};line-height:1.6;">
        <strong>📦 Packing in progress</strong><br>
        Our team is carefully preparing your items. You'll receive a shipping notification soon.
      </p>
    </div>

    <!-- Items being prepared -->
    <h3 style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:${BRAND.colors.slate};">Items Being Prepared</h3>
    ${orderItemsTable(data.items)}

    ${ctaButton('View Order Status', `${BRAND.website}/account/orders/${data.order_id}`)}

    ${paragraph('We\'ll email you as soon as your order has been shipped.')}
  `

  return {
    subject: `Preparing Your Order — ${data.order_number}`,
    html: baseLayout(content, `Your order ${data.order_number} is being prepared.`),
  }
}

// ─── 4. ORDER SHIPPED ───────────────────────────────────────────
export function orderShippedEmail(data: OrderEmailData): { subject: string; html: string } {
  const content = `
    ${sectionHeading('Your Order is On Its Way! 🚚')}
    ${greeting(data.customer_name)}
    ${paragraph(`Exciting news! Your order <strong style="color:${BRAND.colors.charcoal}">${data.order_number}</strong> has been shipped and is on its way to you.`)}

    ${statusTimeline('SHIPPED')}

    <!-- Shipping Details Card -->
    <div style="background:linear-gradient(135deg,#EEF2FF 0%,#DBEAFE 100%);border:1px solid #C7D2FE;border-radius:10px;padding:24px;margin:20px 0;">
      <h3 style="margin:0 0 16px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#1E3A5F;">Shipping Details</h3>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        ${data.courier_name ? `
        <tr>
          <td style="padding:4px 0;font-size:12px;color:#4A5568;width:40%;">Courier</td>
          <td style="padding:4px 0;font-size:13px;font-weight:500;color:#1A202C;">${data.courier_name}</td>
        </tr>` : ''}
        ${data.tracking_number ? `
        <tr>
          <td style="padding:4px 0;font-size:12px;color:#4A5568;width:40%;">Tracking No.</td>
          <td style="padding:4px 0;font-size:13px;font-weight:600;color:#1A202C;letter-spacing:0.02em;">${data.tracking_number}</td>
        </tr>` : ''}
        ${data.estimated_delivery ? `
        <tr>
          <td style="padding:4px 0;font-size:12px;color:#4A5568;width:40%;">Est. Delivery</td>
          <td style="padding:4px 0;font-size:13px;font-weight:500;color:#1A202C;">${formatDate(data.estimated_delivery)}</td>
        </tr>` : `
        <tr>
          <td style="padding:4px 0;font-size:12px;color:#4A5568;width:40%;">Est. Delivery</td>
          <td style="padding:4px 0;font-size:13px;font-weight:500;color:#1A202C;">Within 2 business days</td>
        </tr>`}
      </table>
    </div>

    ${data.payment_method === 'COD' ? `
    <div style="background:${BRAND.colors.warningLight};border-left:3px solid ${BRAND.colors.warning};border-radius:0 8px 8px 0;padding:14px 18px;margin:20px 0;">
      <p style="margin:0;font-size:13px;color:${BRAND.colors.warning};line-height:1.6;">
        <strong>💰 Payment on delivery</strong><br>
        Please prepare <strong>${formatCurrency(data.totals.total_cents)}</strong> for our delivery partner.
      </p>
    </div>` : ''}

    ${addressBlock(data.address)}

    ${ctaButton('Track Your Package', `${BRAND.website}/account/orders/${data.order_id}`)}

    ${paragraph('If no one is available at the delivery address, the courier may contact you to arrange redelivery.')}
  `

  return {
    subject: `Your Order Has Shipped! — ${data.order_number}`,
    html: baseLayout(content, `Your order ${data.order_number} has been shipped.`),
  }
}

// ─── 5. OUT FOR DELIVERY ────────────────────────────────────────
export function orderOutForDeliveryEmail(data: OrderEmailData): { subject: string; html: string } {
  const content = `
    ${sectionHeading('Arriving Today! 📍')}
    ${greeting(data.customer_name)}
    ${paragraph(`Your order <strong style="color:${BRAND.colors.charcoal}">${data.order_number}</strong> is out for delivery and will arrive today.`)}

    ${statusTimeline('OUT_FOR_DELIVERY')}

    <div style="background:linear-gradient(135deg,${BRAND.colors.accentSubtle} 0%,#FFF 100%);border:1px solid ${BRAND.colors.accentMuted};border-radius:10px;padding:24px;margin:20px 0;text-align:center;">
      <p style="margin:0 0 8px;font-size:36px;">🎉</p>
      <h3 style="margin:0 0 8px;font-size:16px;font-weight:600;color:${BRAND.colors.charcoal};">Almost there!</h3>
      <p style="margin:0;font-size:13px;color:${BRAND.colors.stone};line-height:1.6;">
        Our delivery partner is en route to your address.<br>
        Please ensure someone is available to receive the package.
      </p>
    </div>

    ${data.payment_method === 'COD' ? `
    <div style="background:${BRAND.colors.warningLight};border-left:3px solid ${BRAND.colors.warning};border-radius:0 8px 8px 0;padding:14px 18px;margin:20px 0;">
      <p style="margin:0;font-size:13px;color:${BRAND.colors.warning};line-height:1.6;">
        <strong>💰 Cash on Delivery</strong><br>
        Amount due: <strong>${formatCurrency(data.totals.total_cents)}</strong>
      </p>
    </div>` : ''}

    ${addressBlock(data.address)}

    ${ctaButton('Track Delivery', `${BRAND.website}/account/orders/${data.order_id}`)}
  `

  return {
    subject: `Arriving Today — Order ${data.order_number}`,
    html: baseLayout(content, `Your order ${data.order_number} is out for delivery!`),
  }
}

// ─── 6. ORDER DELIVERED ─────────────────────────────────────────
export function orderDeliveredEmail(data: OrderEmailData): { subject: string; html: string } {
  const content = `
    ${sectionHeading('Your Order Has Been Delivered ✨')}
    ${greeting(data.customer_name)}
    ${paragraph(`Your order <strong style="color:${BRAND.colors.charcoal}">${data.order_number}</strong> has been successfully delivered.`)}

    ${statusTimeline('DELIVERED')}

    <div style="background:${BRAND.colors.successLight};border:1px solid #B7E4C7;border-radius:10px;padding:24px;margin:24px 0;text-align:center;">
      <p style="margin:0 0 8px;font-size:36px;">✅</p>
      <h3 style="margin:0 0 8px;font-size:16px;font-weight:600;color:${BRAND.colors.success};">Delivered Successfully</h3>
      <p style="margin:0;font-size:13px;color:${BRAND.colors.stone};line-height:1.6;">
        We hope you love your new pieces!
      </p>
    </div>

    ${paragraph('We\'d love to hear what you think. Your feedback helps us improve and helps other customers make informed choices.')}

    ${ctaButton('Leave a Review', `${BRAND.website}/account/orders/${data.order_id}#review`)}

    ${divider()}

    <!-- Help & Returns -->
    <div style="background:${BRAND.colors.ivory};border:1px solid ${BRAND.colors.smoke};border-radius:10px;padding:20px 24px;margin:20px 0;">
      <h3 style="margin:0 0 12px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:${BRAND.colors.slate};">Need Help?</h3>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding:6px 0;">
            <p style="margin:0;font-size:13px;color:${BRAND.colors.stone};">
              📧 <a href="mailto:${BRAND.supportEmail}" style="color:${BRAND.colors.accent};text-decoration:none;">${BRAND.supportEmail}</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;">
            <p style="margin:0;font-size:13px;color:${BRAND.colors.stone};">
              🔄 Exchange or return within 7 days of delivery
            </p>
          </td>
        </tr>
      </table>
    </div>

    ${paragraph('Thank you for choosing AK QIMAASH. We look forward to serving you again!')}
  `

  return {
    subject: `Delivered — Order ${data.order_number}`,
    html: baseLayout(content, `Your order ${data.order_number} has been delivered. We hope you love it!`),
  }
}

// ─── 7. ORDER CANCELLED ─────────────────────────────────────────
export function orderCancelledEmail(data: OrderEmailData & { cancellation_reason?: string }): { subject: string; html: string } {
  const content = `
    ${sectionHeading('Order Cancelled')}
    ${greeting(data.customer_name)}
    ${paragraph(`Your order <strong style="color:${BRAND.colors.charcoal}">${data.order_number}</strong> has been cancelled.`)}

    <div style="background:${BRAND.colors.errorLight};border-left:3px solid ${BRAND.colors.error};border-radius:0 8px 8px 0;padding:18px;margin:20px 0;">
      <p style="margin:0;font-size:13px;color:${BRAND.colors.error};line-height:1.6;">
        <strong>Order cancelled</strong><br>
        ${data.cancellation_reason || 'This order has been cancelled. If this was unexpected, please contact our support team.'}
      </p>
    </div>

    <!-- Order Summary -->
    <div style="background:${BRAND.colors.ivory};border:1px solid ${BRAND.colors.smoke};border-radius:10px;padding:20px 24px;margin:20px 0;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td>
            <p style="margin:0 0 2px;font-size:10px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.colors.slate};">Order</p>
            <p style="margin:0;font-size:15px;font-weight:600;color:${BRAND.colors.charcoal};text-decoration:line-through;">${data.order_number}</p>
          </td>
          <td style="text-align:right;">
            <p style="margin:0 0 2px;font-size:10px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.colors.slate};">Refund</p>
            <p style="margin:0;font-size:15px;font-weight:600;color:${BRAND.colors.success};">
              ${data.payment_method !== 'COD' ? formatCurrency(data.totals.total_cents) : 'N/A'}
            </p>
          </td>
        </tr>
      </table>
    </div>

    ${data.payment_method !== 'COD' ? paragraph('If a payment was collected, a refund will be processed within 5–7 business days.') : ''}

    ${ctaButton('Continue Shopping', BRAND.website)}

    ${paragraph('We\'re sorry to see this order go. If you have any questions, please don\'t hesitate to reply to this email.')}
  `

  return {
    subject: `Order Cancelled — ${data.order_number}`,
    html: baseLayout(content, `Your order ${data.order_number} has been cancelled.`),
  }
}

// ─── 8. WELCOME EMAIL ───────────────────────────────────────────
export function welcomeEmail(data: { customer_name: string; email: string }): { subject: string; html: string } {
  const content = `
    ${sectionHeading('Welcome to AK QIMAASH ✨')}
    ${greeting(data.customer_name)}

    <p style="margin:0 0 20px;font-size:15px;color:${BRAND.colors.stone};line-height:1.8;">
      Thank you for joining us. At AK QIMAASH, we curate modest fashion that blends timeless elegance with contemporary style — crafted with the finest materials and attention to detail.
    </p>

    <!-- Feature Grid -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:24px 0;">
      <tr>
        <td width="50%" style="padding:0 8px 16px 0;vertical-align:top;" class="stack-column">
          <div style="background:${BRAND.colors.ivory};border:1px solid ${BRAND.colors.smoke};border-radius:10px;padding:20px;text-align:center;">
            <p style="margin:0 0 8px;font-size:24px;">🧕</p>
            <h4 style="margin:0 0 4px;font-size:12px;font-weight:600;color:${BRAND.colors.charcoal};letter-spacing:0.04em;">Curated Collection</h4>
            <p style="margin:0;font-size:11px;color:${BRAND.colors.slate};line-height:1.5;">Handpicked modest fashion pieces</p>
          </div>
        </td>
        <td width="50%" style="padding:0 0 16px 8px;vertical-align:top;" class="stack-column">
          <div style="background:${BRAND.colors.ivory};border:1px solid ${BRAND.colors.smoke};border-radius:10px;padding:20px;text-align:center;">
            <p style="margin:0 0 8px;font-size:24px;">🚚</p>
            <h4 style="margin:0 0 4px;font-size:12px;font-weight:600;color:${BRAND.colors.charcoal};letter-spacing:0.04em;">Fast Delivery</h4>
            <p style="margin:0;font-size:11px;color:${BRAND.colors.slate};line-height:1.5;">Delivered right to your door</p>
          </div>
        </td>
      </tr>
      <tr>
        <td width="50%" style="padding:0 8px 0 0;vertical-align:top;" class="stack-column">
          <div style="background:${BRAND.colors.ivory};border:1px solid ${BRAND.colors.smoke};border-radius:10px;padding:20px;text-align:center;">
            <p style="margin:0 0 8px;font-size:24px;">✨</p>
            <h4 style="margin:0 0 4px;font-size:12px;font-weight:600;color:${BRAND.colors.charcoal};letter-spacing:0.04em;">Premium Quality</h4>
            <p style="margin:0;font-size:11px;color:${BRAND.colors.slate};line-height:1.5;">Finest fabrics & craftsmanship</p>
          </div>
        </td>
        <td width="50%" style="padding:0 0 0 8px;vertical-align:top;" class="stack-column">
          <div style="background:${BRAND.colors.ivory};border:1px solid ${BRAND.colors.smoke};border-radius:10px;padding:20px;text-align:center;">
            <p style="margin:0 0 8px;font-size:24px;">💎</p>
            <h4 style="margin:0 0 4px;font-size:12px;font-weight:600;color:${BRAND.colors.charcoal};letter-spacing:0.04em;">Exclusive Styles</h4>
            <p style="margin:0;font-size:11px;color:${BRAND.colors.slate};line-height:1.5;">Limited edition releases</p>
          </div>
        </td>
      </tr>
    </table>

    ${ctaButton('Start Shopping', BRAND.website)}

    ${paragraph('Follow us on Instagram for the latest drops, styling inspiration, and exclusive offers.')}

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto;">
      <tr>
        <td>
          <a href="${BRAND.instagram}" target="_blank" style="display:inline-block;padding:10px 24px;border:1px solid ${BRAND.colors.smoke};border-radius:8px;font-size:12px;color:${BRAND.colors.stone};text-decoration:none;font-weight:500;">
            📸&nbsp;&nbsp;Follow @akqimaash
          </a>
        </td>
      </tr>
    </table>
  `

  return {
    subject: `Welcome to ${BRAND.name} ✨`,
    html: baseLayout(content, `Welcome to AK QIMAASH! Discover modest luxury fashion.`),
  }
}

// ─── 9. PASSWORD RESET ──────────────────────────────────────────
export function passwordResetEmail(data: { customer_name: string; reset_link: string }): { subject: string; html: string } {
  const content = `
    ${sectionHeading('Reset Your Password 🔐')}
    ${greeting(data.customer_name)}
    ${paragraph('We received a request to reset the password for your AK QIMAASH account. Click the button below to set a new password.')}

    ${ctaButton('Reset Password', data.reset_link)}

    <div style="background:${BRAND.colors.ivory};border:1px solid ${BRAND.colors.smoke};border-radius:10px;padding:20px 24px;margin:24px 0;">
      <p style="margin:0;font-size:12px;color:${BRAND.colors.slate};line-height:1.7;">
        ⏳ This link expires in <strong>1 hour</strong>.<br>
        🔒 If you didn't request this, you can safely ignore this email.<br>
        ⚠️ Never share this link with anyone.
      </p>
    </div>

    ${paragraph('For security, this link can only be used once. If you need to reset your password again, please request a new link from our website.')}
  `

  return {
    subject: `Reset Your Password — ${BRAND.name}`,
    html: baseLayout(content, `Reset your AK QIMAASH account password.`),
  }
}

// ─── 10. REVIEW REQUEST (POST-DELIVERY) ─────────────────────────
export function reviewRequestEmail(data: {
  customer_name: string
  order_number: string
  order_id: string
  items: Array<{ product_name: string; variant_size?: string | null; variant_color?: string | null }>
}): { subject: string; html: string } {
  const itemsList = data.items.map(item => {
    const meta = [item.variant_size, item.variant_color].filter(Boolean).join(' · ')
    return `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${BRAND.colors.smoke};">
          <p style="margin:0;font-size:14px;font-weight:500;color:${BRAND.colors.charcoal};">${item.product_name}</p>
          ${meta ? `<p style="margin:2px 0 0;font-size:12px;color:${BRAND.colors.slate};">${meta}</p>` : ''}
        </td>
        <td style="padding:10px 0;border-bottom:1px solid ${BRAND.colors.smoke};text-align:right;">
          <span style="font-size:18px;">⭐</span>
        </td>
      </tr>`
  }).join('')

  const content = `
    ${sectionHeading('How Was Your Order? 💬')}
    ${greeting(data.customer_name)}
    ${paragraph(`We hope you're enjoying your recent purchase from order <strong style="color:${BRAND.colors.charcoal}">${data.order_number}</strong>! Your feedback means the world to us.`)}

    <div style="background:${BRAND.colors.ivory};border:1px solid ${BRAND.colors.smoke};border-radius:10px;padding:24px;margin:20px 0;">
      <h3 style="margin:0 0 12px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:${BRAND.colors.slate};">Your Items</h3>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        ${itemsList}
      </table>
    </div>

    <!-- Star Rating Visual -->
    <div style="text-align:center;margin:28px 0;">
      <p style="margin:0 0 12px;font-size:13px;color:${BRAND.colors.slate};">Tap a star to rate your experience</p>
      <a href="${BRAND.website}/account/orders/${data.order_id}#review" style="text-decoration:none;">
        <span style="font-size:32px;letter-spacing:8px;">⭐⭐⭐⭐⭐</span>
      </a>
    </div>

    ${ctaButton('Write a Review', `${BRAND.website}/account/orders/${data.order_id}#review`)}

    ${paragraph('Your review helps other shoppers make confident decisions, and it helps us continue improving.')}
  `

  return {
    subject: `How was your order? — ${data.order_number}`,
    html: baseLayout(content, `We'd love your feedback on your recent order ${data.order_number}.`),
  }
}

// ─── 11. GENERIC ORDER STATUS UPDATE ────────────────────────────
export function orderStatusUpdateEmail(data: OrderEmailData): { subject: string; html: string } {
  const content = `
    ${sectionHeading('Order Status Update')}
    ${greeting(data.customer_name)}
    ${paragraph(`Your order <strong style="color:${BRAND.colors.charcoal}">${data.order_number}</strong> has been updated.`)}

    <div style="text-align:center;margin:24px 0;">
      ${statusBadge(data.status)}
    </div>

    ${statusTimeline(data.status)}

    <!-- Order Summary -->
    <div style="background:${BRAND.colors.ivory};border:1px solid ${BRAND.colors.smoke};border-radius:10px;padding:20px 24px;margin:20px 0;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td>
            <p style="margin:0 0 2px;font-size:10px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.colors.slate};">Order</p>
            <p style="margin:0;font-size:15px;font-weight:600;color:${BRAND.colors.charcoal};">${data.order_number}</p>
          </td>
          <td style="text-align:right;">
            <p style="margin:0 0 2px;font-size:10px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.colors.slate};">Total</p>
            <p style="margin:0;font-size:15px;font-weight:600;color:${BRAND.colors.charcoal};">${formatCurrency(data.totals.total_cents)}</p>
          </td>
        </tr>
      </table>
    </div>

    ${ctaButton('View Order', `${BRAND.website}/account/orders/${data.order_id}`)}

    ${paragraph('If you have any questions about this update, please reply to this email.')}
  `

  return {
    subject: `Order Update — ${data.order_number} (${statusDisplayName(data.status)})`,
    html: baseLayout(content, `Your order ${data.order_number} status: ${statusDisplayName(data.status)}.`),
  }
}

// ─── Template Router ────────────────────────────────────────────
export function getOrderEmailTemplate(data: OrderEmailData & { cancellation_reason?: string }): { subject: string; html: string } {
  switch (data.status) {
    case 'PLACED':
      return orderPlacedEmail(data)
    case 'CONFIRMED':
      return orderConfirmedEmail(data)
    case 'PROCESSING':
      return orderProcessingEmail(data)
    case 'SHIPPED':
      return orderShippedEmail(data)
    case 'OUT_FOR_DELIVERY':
      return orderOutForDeliveryEmail(data)
    case 'DELIVERED':
      return orderDeliveredEmail(data)
    case 'CANCELLED':
      return orderCancelledEmail(data)
    default:
      return orderStatusUpdateEmail(data)
  }
}
