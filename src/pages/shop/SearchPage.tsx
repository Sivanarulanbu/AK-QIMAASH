import React, { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { Search, X, ArrowRight } from 'lucide-react'
import { useProducts } from '@/features/products/useProducts'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductGridSkeleton } from '@/components/ui/Skeleton'
import { SEOHead } from '@/components/seo/SEOHead'

const POPULAR_SEARCHES = ['Linen', 'Trousers', 'Dresses', 'Abaya', 'Tops', 'Accessories']

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [inputValue, setInputValue] = useState(query)
  const navigate = useNavigate()

  useEffect(() => {
    setInputValue(query)
  }, [query])

  const { data, isLoading } = useProducts({
    search: query || undefined,
    per_page: 24,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = inputValue.trim()
    if (trimmed) {
      setSearchParams({ q: trimmed })
    } else {
      setSearchParams({})
    }
  }

  const handleSuggestionClick = (term: string) => {
    setInputValue(term)
    setSearchParams({ q: term })
  }

  const handleClear = () => {
    setInputValue('')
    setSearchParams({})
  }

  return (
    <>
      <SEOHead
        title={query ? `"${query}" — Search — AK QIMAASH` : 'Search Collection — AK QIMAASH'}
        description="Search our contemporary luxury modest fashion collection."
        canonical={query ? `/search?q=${encodeURIComponent(query)}` : '/search'}
        noIndex={!query}
      />
      <div className="container-main py-8 md:py-14">
        {/* Editorial Heading */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <p className="editorial-subheading mb-2">Singapore Atelier</p>
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-brand-black uppercase tracking-tight font-medium">
            Search Collection
          </h1>
        </div>

        {/* Integrated Search Input Form */}
        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <Search className="absolute left-4 h-5 w-5 text-text-muted pointer-events-none" aria-hidden="true" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search garments, fabrics (e.g. linen, silk), or silhouettes..."
              aria-label="Search collection"
              className="w-full pl-12 pr-24 py-3.5 bg-surface border border-border rounded-[var(--radius)] text-sm font-sans text-brand-black placeholder:text-text-muted/70 focus:outline-none focus:border-brand-black transition-colors"
            />
            {inputValue && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search query"
                className="absolute right-12 p-1.5 text-text-muted hover:text-brand-black transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              type="submit"
              aria-label="Submit search"
              className="absolute right-2.5 px-3 py-1.5 bg-brand-black text-white text-xs uppercase tracking-wider font-medium rounded-xs hover:bg-brand-charcoal transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Quick Search Chips */}
          <div className="flex items-center gap-2 mt-3 flex-wrap justify-center text-xs">
            <span className="text-text-muted font-sans text-[11px] uppercase tracking-wider">Popular:</span>
            {POPULAR_SEARCHES.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => handleSuggestionClick(term)}
                className="px-2.5 py-1 bg-[var(--surface-2)] text-[var(--text-primary)] hover:border-[var(--text-accent)] hover:text-[var(--text-accent)] border border-[0.5px] border-[var(--border)] rounded-[var(--radius)] transition-colors cursor-pointer"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Results Section */}
        {query ? (
          <div>
            <div className="flex items-baseline justify-between pb-4 mb-6 border-b border-border/80">
              <h2 className="text-lg font-sans font-medium text-brand-black">
                Results for &ldquo;{query}&rdquo;
              </h2>
              {data && (
                <span className="text-xs font-sans text-text-muted">
                  {data.total} {data.total === 1 ? 'piece found' : 'pieces found'}
                </span>
              )}
            </div>

            {isLoading ? (
              <ProductGridSkeleton count={8} />
            ) : data?.products.length === 0 ? (
              <div className="text-center py-16 max-w-md mx-auto">
                <p className="text-brand-black font-medium text-sm mb-1">
                  No pieces match &ldquo;{query}&rdquo;
                </p>
                <p className="text-text-muted text-xs mb-6 font-light leading-relaxed">
                  Try checking for spelling variations or exploring our signature fabrics and collection categories.
                </p>
                <Link
                  to="/shop"
                  className="inline-flex items-center justify-center px-6 py-2.5 bg-brand-black text-white text-xs uppercase tracking-widest rounded-xs hover:bg-brand-charcoal transition-colors"
                >
                  Browse Full Collection
                  <ArrowRight className="h-3.5 w-3.5 ml-2" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {data?.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 max-w-md mx-auto">
            <p className="text-text-muted text-xs font-light leading-relaxed mb-6">
              Enter a keyword above or select one of the popular collections to discover our tailored modest silhouettes.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-medium text-brand-black hover:text-accent underline underline-offset-4 transition-colors"
            >
              Explore All Collections
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
