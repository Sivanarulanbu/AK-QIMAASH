import { Link } from 'react-router-dom'
import { SEOHead } from '@/components/seo/SEOHead'

export function NotFoundPage() {
  return (
    <>
      <SEOHead title="Page Not Found — AK QIMAASH" description="The page you're looking for doesn't exist." noIndex />
      <div className="container-main py-24 text-center">
        <p className="text-xs uppercase tracking-caps text-text-muted mb-3">404</p>
        <h1 className="text-3xl font-semibold text-text-primary tracking-tight mb-3">
          Page not found
        </h1>
        <p className="text-sm text-text-muted mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-lg btn-primary">
            Return to home
          </Link>
          <Link to="/shop" className="btn-lg btn-secondary">
            Browse products
          </Link>
        </div>
      </div>
    </>
  )
}
