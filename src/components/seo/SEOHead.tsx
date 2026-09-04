import { Helmet } from 'react-helmet-async'

interface SEOHeadProps {
  title: string
  description?: string
  canonical?: string
  ogImage?: string
  schema?: Record<string, unknown>
  noIndex?: boolean
}

const SITE_URL = import.meta.env.VITE_APP_URL || 'https://akqimaash.sg'
const SITE_NAME = 'AK QIMAASH'

export function SEOHead({
  title,
  description,
  canonical,
  ogImage,
  schema,
  noIndex = false,
}: SEOHeadProps) {
  const fullUrl = canonical ? `${SITE_URL}${canonical}` : SITE_URL
  const defaultDescription =
    'Contemporary fashion for everyday Singapore living. Shop at AK QIMAASH.'
  const metaDescription = description || defaultDescription

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={metaDescription} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}

      {/* Canonical */}
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={metaDescription} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {/* Structured data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  )
}
