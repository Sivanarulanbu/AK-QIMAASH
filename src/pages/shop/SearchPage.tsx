import { useSearchParams, Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useProducts } from '@/features/products/useProducts'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductGridSkeleton } from '@/components/ui/Skeleton'
import { SEOHead } from '@/components/seo/SEOHead'

export function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''

  const { data, isLoading } = useProducts({
    search: query,
    per_page: 24,
  })

  return (
    <>
      <SEOHead
        title={query ? `"${query}" — AK QIMAASH` : 'Search — AK QIMAASH'}
        description="Search AK QIMAASH products."
        canonical={`/search?q=${encodeURIComponent(query)}`}
        noIndex={!query}
      />
      <div className="container-main py-8 md:py-12">
        {query ? (
          <>
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight mb-2">
              Results for &ldquo;{query}&rdquo;
            </h1>
            {data && (
              <p className="text-sm text-text-muted mb-8">
                {data.total} {data.total === 1 ? 'result' : 'results'}
              </p>
            )}

            {isLoading ? (
              <ProductGridSkeleton count={8} />
            ) : data?.products.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-text-muted text-sm mb-3">
                  No products found for &ldquo;{query}&rdquo;.
                </p>
                <Link to="/shop" className="btn-md btn-secondary">
                  Browse all products
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {data?.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <Search className="h-10 w-10 text-text-muted mx-auto mb-4" aria-hidden="true" />
            <p className="text-text-muted text-sm">Enter a search term to find products.</p>
          </div>
        )}
      </div>
    </>
  )
}
