import { useParams } from 'react-router-dom'
import { SEOHead } from '@/components/seo/SEOHead'
import { AboutPage } from '@/pages/about/AboutPage'

const STATIC_PAGES: Record<string, { title: string; content: string }> = {
  shipping: {
    title: 'Shipping & Delivery',
    content: `We deliver across Singapore within 2–4 business days.

Standard delivery: $5.00
Free delivery on orders above $100.

Orders are dispatched Monday to Saturday. Orders placed after 2pm will be processed the following business day.

Delivery is available to all Singapore residential and commercial addresses.`,
  },
  returns: {
    title: 'Returns & Exchanges',
    content: `We accept returns within 14 days of delivery.

Items must be unworn, unwashed, and in original condition with all tags attached.

To request a return, email orders@akqimaash.sg with your order number and reason.

Refunds are processed within 5–7 business days of receiving the returned item.`,
  },
  sizing: {
    title: 'Size Guide',
    content: `Our sizes run true to standard Singapore sizing.

XS: Bust 82–85cm, Waist 66–69cm, Hip 88–91cm
S: Bust 86–89cm, Waist 70–73cm, Hip 92–95cm
M: Bust 90–93cm, Waist 74–77cm, Hip 96–99cm
L: Bust 94–97cm, Waist 78–81cm, Hip 100–103cm
XL: Bust 98–101cm, Waist 82–85cm, Hip 104–107cm
XXL: Bust 102–105cm, Waist 86–89cm, Hip 108–111cm

For garment-specific measurements, refer to the individual product pages.`,
  },
  faq: {
    title: 'Frequently Asked Questions',
    content: `Do you offer cash on delivery?
Yes. All orders are fulfilled via Cash on Delivery. Payment is collected when your order arrives.

Can I change or cancel my order?
Orders can be modified or cancelled within 2 hours of placement. Contact us at orders@akqimaash.sg.

Where do you deliver?
Singapore only, at this time.

How do I track my order?
Log in to your account and visit My Orders. Tracking information is updated as your order progresses.`,
  },
  contact: {
    title: 'Contact',
    content: `For all order enquiries and support:
Email: orders@akqimaash.sg

We respond to all emails within 1 business day.`,
  },
  privacy: {
    title: 'Privacy Policy',
    content: `AK QIMAASH collects personal information only as required to fulfil your orders and provide customer support.

We do not sell or share your personal data with third parties, except as required for order fulfillment (e.g. delivery partners).

Data is stored securely and retained only as long as necessary.

To request deletion of your data, email orders@akqimaash.sg.`,
  },
  terms: {
    title: 'Terms of Service',
    content: `By placing an order with AK QIMAASH, you agree to these terms.

Prices are listed in Singapore Dollars (SGD) inclusive of GST.

Payment is via Cash on Delivery. Orders are not confirmed until dispatched.

We reserve the right to cancel any order at our discretion, with full refund where applicable.`,
  },
  cookies: {
    title: 'Cookie Policy',
    content: `We use essential cookies to maintain your session, cart, and wishlist.

We do not use tracking or advertising cookies.

By using our website, you consent to our use of essential cookies.`,
  },
}

export function StaticPage() {
  const { slug } = useParams<{ slug: string }>()

  if (slug === 'about') {
    return <AboutPage />
  }

  const page = STATIC_PAGES[slug || '']

  if (!page) {
    return (
      <div className="container-main py-16 text-center">
        <p className="text-text-muted text-sm">Page not found.</p>
      </div>
    )
  }

  return (
    <>
      <SEOHead title={`${page.title} — AK QIMAASH`} description={page.title} canonical={`/pages/${slug}`} />
      <div className="container-main py-12 md:py-16 max-w-2xl">
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight mb-6">
          {page.title}
        </h1>
        <div className="prose prose-sm max-w-none text-text-secondary leading-relaxed whitespace-pre-line">
          {page.content}
        </div>
      </div>
    </>
  )
}
