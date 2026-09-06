import { Link } from 'react-router-dom'

const shopLinks = [
  { to: '/shop?sort=newest', label: 'New Arrivals' },
  { to: '/shop', label: 'All Products' },
  { to: '/shop?category=tops', label: 'Tops' },
  { to: '/shop?category=bottoms', label: 'Bottoms' },
  { to: '/shop?category=dresses', label: 'Dresses' },
  { to: '/shop?category=accessories', label: 'Accessories' },
]

const helpLinks = [
  { to: '/pages/about', label: 'Our Story & Philosophy' },
  { to: '/pages/shipping', label: 'Shipping & Delivery' },
  { to: '/pages/returns', label: 'Returns & Exchanges' },
  { to: '/pages/sizing', label: 'Size Guide' },
  { to: '/pages/faq', label: 'FAQ' },
  { to: '/pages/contact', label: 'Contact' },
]

const legalLinks = [
  { to: '/pages/privacy', label: 'Privacy Policy' },
  { to: '/pages/terms', label: 'Terms of Service' },
  { to: '/pages/cookies', label: 'Cookie Policy' },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-brand-black text-text-inverse mt-24" role="contentinfo">
      <div className="container-main">
        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-14 border-b border-brand-graphite">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-block mb-4" aria-label="AK QIMAASH Home">
              <span className="font-editorial font-medium text-xl tracking-tighter text-white">
                AK QIMAASH
              </span>
            </Link>
            <p className="text-sm text-brand-silver leading-relaxed max-w-xs">
              Contemporary fashion for everyday life. Designed in Singapore, made to last.
            </p>
            <div className="mt-6">
              <p className="text-xs text-brand-stone uppercase tracking-caps mb-2">
                Accepted payment
              </p>
              <span className="text-sm text-brand-silver">Cash on Delivery</span>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-caps text-brand-silver mb-4">
              Shop
            </h3>
            <ul className="space-y-2.5">
              {shopLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-brand-silver hover:text-white transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-caps text-brand-silver mb-4">
              Support
            </h3>
            <ul className="space-y-2.5">
              {helpLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-brand-silver hover:text-white transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Delivery */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-caps text-brand-silver mb-4">
              Delivery
            </h3>
            <div className="space-y-3 text-sm text-brand-silver">
              <p>Singapore only</p>
              <p>2–4 business days</p>
              <p>Free above $100</p>
              <p>Cash on Delivery</p>
            </div>
            <div className="mt-6">
              <h3 className="text-xs font-semibold uppercase tracking-caps text-brand-silver mb-2">
                Contact
              </h3>
              <a
                href="mailto:orders@akqimaash.sg"
                className="text-sm text-brand-silver hover:text-white transition-colors duration-150"
              >
                orders@akqimaash.sg
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between py-5 gap-3">
          <p className="text-xs text-brand-stone">
            &copy; {year} AK QIMAASH. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {legalLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-xs text-brand-stone hover:text-brand-silver transition-colors duration-150"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
