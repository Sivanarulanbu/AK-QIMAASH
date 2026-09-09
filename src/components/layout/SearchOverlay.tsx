import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, X, ArrowRight, Sparkles } from 'lucide-react'
import { useProducts, type ProductWithDetails } from '@/features/products/useProducts'
import { formatPrice } from '@/lib/commerce'
import { cn } from '@/utils'

import { useSearchOverlayStore } from '@/store/searchOverlayStore'

interface SearchOverlayProps {
  isOpen?: boolean
  onClose?: () => void
}

interface SubFilter {
  id: string
  label: string
  match: (product: ProductWithDetails) => boolean
}

const SUB_FILTERS: SubFilter[] = [
  {
    id: 'all',
    label: 'ALL',
    match: () => true,
  },
  {
    id: 'linen',
    label: 'ORGANIC LINEN',
    match: (p) =>
      Boolean(
        p.material?.toLowerCase().includes('linen') ||
        p.tags?.some((t) => t.toLowerCase().includes('linen')) ||
        p.name.toLowerCase().includes('linen') ||
        p.description?.toLowerCase().includes('linen')
      ),
  },
  {
    id: 'tailored',
    label: 'TAILORED & SUITING',
    match: (p) =>
      Boolean(
        p.tags?.some((t) => ['tailored', 'workwear', 'trousers', 'blazer', 'outerwear', 'trench'].includes(t.toLowerCase())) ||
        p.name.toLowerCase().includes('trouser') ||
        p.name.toLowerCase().includes('vest') ||
        p.name.toLowerCase().includes('trench') ||
        p.category?.slug === 'bottoms' ||
        p.category?.slug === 'outerwear'
      ),
  },
  {
    id: 'dresses',
    label: 'DRESSES & ABAYAS',
    match: (p) =>
      Boolean(
        p.category?.slug === 'dresses' ||
        p.name.toLowerCase().includes('dress') ||
        p.name.toLowerCase().includes('abaya') ||
        p.name.toLowerCase().includes('column') ||
        p.tags?.some((t) => ['dress', 'abaya', 'maxi', 'kaftan'].includes(t.toLowerCase()))
      ),
  },
  {
    id: 'cotton',
    label: 'COTTON & POPLIN',
    match: (p) =>
      Boolean(
        p.material?.toLowerCase().includes('cotton') ||
        p.tags?.some((t) => t.toLowerCase().includes('poplin') || t.toLowerCase().includes('cotton')) ||
        p.name.toLowerCase().includes('poplin') ||
        p.name.toLowerCase().includes('shirt')
      ),
  },
  {
    id: 'leather',
    label: 'LEATHER & ACCENTS',
    match: (p) =>
      Boolean(
        p.category?.slug === 'accessories' ||
        p.material?.toLowerCase().includes('leather') ||
        p.name.toLowerCase().includes('tote') ||
        p.tags?.some((t) => ['leather', 'bag', 'accessories'].includes(t.toLowerCase()))
      ),
  },
]

const RECENT_KEY = 'akq_recent_searches'

export function SearchOverlay({ isOpen: propIsOpen, onClose: propOnClose }: SearchOverlayProps = {}) {
  const storeIsOpen = useSearchOverlayStore((s) => s.isOpen)
  const storeClose = useSearchOverlayStore((s) => s.closeSearch)

  const isOpen = propIsOpen !== undefined ? propIsOpen : storeIsOpen
  const onClose = propOnClose || storeClose
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_KEY)
      if (saved) {
        setRecentSearches(JSON.parse(saved).slice(0, 5))
      }
    } catch {
      // ignore
    }
  }, [isOpen])

  // Debounce query to eliminate typing latency
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim())
    }, 180)
    return () => clearTimeout(timer)
  }, [query])

  // Focus on input when opened and lock scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      const focusTimer = setTimeout(() => inputRef.current?.focus(), 50)
      return () => {
        clearTimeout(focusTimer)
        document.body.style.overflow = ''
      }
    } else {
      document.body.style.overflow = ''
      setQuery('')
      setDebouncedQuery('')
      setActiveFilter('all')
    }
  }, [isOpen])

  // Keydown listener for Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Query catalog: featured/default pool or active search query
  const { data: defaultData, isLoading: defaultLoading } = useProducts({ per_page: 12, sort: 'newest' })
  const { data: searchResults, isLoading: searchLoading } = useProducts(
    debouncedQuery.length >= 2 ? { search: debouncedQuery, per_page: 16 } : {}
  )

  const hasActiveQuery = query.trim().length >= 2
  const isLoading = hasActiveQuery ? searchLoading : defaultLoading

  const baseProducts = useMemo(() => {
    if (hasActiveQuery) {
      return searchResults?.products || []
    }
    return defaultData?.products || []
  }, [hasActiveQuery, searchResults, defaultData])

  // Calculate matching counts for each sub-filter in the current pool
  const filterCounts = useMemo(() => {
    return SUB_FILTERS.reduce((acc, filter) => {
      acc[filter.id] = baseProducts.filter(filter.match).length
      return acc
    }, {} as Record<string, number>)
  }, [baseProducts])

  // Filter pool by active selected sub-filter
  const displayedProducts = useMemo(() => {
    const currentFilter = SUB_FILTERS.find((f) => f.id === activeFilter) || SUB_FILTERS[0]
    return baseProducts.filter(currentFilter.match)
  }, [baseProducts, activeFilter])

  const saveRecentSearch = (term: string) => {
    try {
      const updated = [term, ...recentSearches.filter((s) => s.toLowerCase() !== term.toLowerCase())].slice(0, 5)
      setRecentSearches(updated)
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
    } catch {
      // ignore
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const term = query.trim()
    if (term) {
      saveRecentSearch(term)
      navigate(`/search?q=${encodeURIComponent(term)}`)
      onClose()
    }
  }

  const handleKeywordClick = (term: string) => {
    setQuery(term)
    setActiveFilter('all')
    saveRecentSearch(term)
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem(RECENT_KEY)
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-modal flex flex-col bg-[#FAF9F7] animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Site Search"
    >
      {/* ── 1. TOP HEADER BAR ────────────────────────────────────────────── */}
      <div className="w-full px-6 sm:px-12 py-3.5 sm:py-4 flex items-center justify-between border-b border-border/70 bg-[#FAF9F7]/95 backdrop-blur-xs sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-accent stroke-[1.5]" />
          <span className="text-xs font-sans uppercase tracking-[0.25em] text-brand-stone font-medium">
            AK QIMAASH Discovery Atelier
          </span>
        </div>
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-sans uppercase tracking-widest text-text-secondary hover:text-brand-black hover:bg-black/5 transition-colors"
          aria-label="Close search"
        >
          <span className="hidden sm:inline text-[11px] text-text-muted">ESC</span>
          <X className="h-4 w-4 stroke-[1.5]" />
        </button>
      </div>

      {/* ── 2. MAIN SCROLLABLE BODY ──────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="container-main max-w-6xl py-4 sm:py-6">
          {/* Centered Search Input Bar (Prototype 3 Style) */}
          <div className="max-w-2xl mx-auto mb-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-stone/70 stroke-[1.5] pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setActiveFilter('all')
                }}
                placeholder="Search by silhouette, tactile fabric, or piece..."
                style={{ outline: 'none', boxShadow: 'none' }}
                className="w-full bg-white border border-border/90 focus:border-brand-black focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 pl-12 sm:pl-14 pr-12 py-3 sm:py-3.5 rounded-full text-base sm:text-lg font-editorial text-brand-black placeholder:text-brand-stone/60 placeholder:font-sans placeholder:text-sm transition-all shadow-xs"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('')
                    setActiveFilter('all')
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-brand-black transition-colors"
                  aria-label="Clear search input"
                >
                  <X className="h-4 w-4 stroke-[1.5]" />
                </button>
              )}
            </form>

            {/* Recent Searches Sub-strip */}
            {recentSearches.length > 0 && (
              <div className="flex items-center justify-center gap-2 text-xs text-brand-stone mt-3 flex-wrap">
                <span className="uppercase tracking-[0.15em] font-medium text-[10px] text-brand-stone/70">
                  Recent:
                </span>
                {recentSearches.map((term, i) => (
                  <button
                    key={i}
                    onClick={() => handleKeywordClick(term)}
                    className="hover:text-brand-black hover:underline text-xs"
                  >
                    {term}
                  </button>
                ))}
                <span className="text-border">·</span>
                <button
                  onClick={clearRecentSearches}
                  className="text-[10px] uppercase tracking-wider text-text-disabled hover:text-brand-black"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* ── 3. DYNAMIC FABRIC & CATEGORY SUB-FILTERS (PROTOTYPE 3) ──────── */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-8 sm:mb-10">
            {SUB_FILTERS.map((filter) => {
              const count = filterCounts[filter.id] || 0
              // In active query state, only show sub-filters that have matches or 'all'
              if (hasActiveQuery && count === 0 && filter.id !== 'all') return null
              const isActive = activeFilter === filter.id
              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={cn(
                    'px-4 py-1.5 sm:py-2 rounded-full text-xs font-sans uppercase tracking-[0.14em] font-medium transition-all duration-200',
                    isActive
                      ? 'bg-[#1a1a1a] text-white shadow-xs'
                      : 'bg-white border border-border/80 text-brand-stone hover:border-brand-black hover:text-brand-black'
                  )}
                >
                  {filter.label} ({count})
                </button>
              )
            })}
          </div>

          {/* ── 4. RESULTS / CURATION HEADER ───────────────────────────────── */}
          <div className="flex items-baseline justify-between mb-6 pb-2 border-b border-border/60">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] font-sans font-medium text-brand-stone">
                {hasActiveQuery ? (
                  isLoading ? (
                    'Searching catalog...'
                  ) : (
                    <>
                      Results for &ldquo;{query.trim()}&rdquo; ({displayedProducts.length})
                    </>
                  )
                ) : (
                  <>Curated Editions ({displayedProducts.length})</>
                )}
              </p>
            </div>
            {hasActiveQuery && searchResults && searchResults.total > 0 && (
              <button
                onClick={() => {
                  saveRecentSearch(query.trim())
                  navigate(`/search?q=${encodeURIComponent(query.trim())}`)
                  onClose()
                }}
                className="text-xs uppercase tracking-wider text-brand-black hover:underline inline-flex items-center gap-1 font-medium"
              >
                View all in shop <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* ── 5. FOUR-COLUMN LUXURY PRODUCT GRID (PROTOTYPE 3) ───────────── */}
          {displayedProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-10">
              {displayedProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.slug}`}
                  onClick={() => {
                    if (query.trim()) saveRecentSearch(query.trim())
                    onClose()
                  }}
                  className="group block"
                >
                  {/* Photo Container */}
                  <div className="relative aspect-[3/4] bg-white overflow-hidden rounded-xs border border-border/40 mb-3">
                    {product.primary_image ? (
                      <img
                        src={product.primary_image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-700 ease-out"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-text-disabled">
                        No image
                      </div>
                    )}

                    {/* Centered 'VIEW PIECE' overlay button on hover */}
                    <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                      <span className="px-4 py-2 bg-white/95 text-brand-black text-[11px] uppercase tracking-[0.2em] font-sans font-medium shadow-md rounded-xs">
                        View Piece
                      </span>
                    </div>
                  </div>

                  {/* Typography & Details */}
                  <h3 className="font-editorial text-base sm:text-lg text-[#1a1a1a] group-hover:text-accent tracking-tight transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-xs font-sans text-brand-stone font-light line-clamp-1 mt-0.5">
                    {product.material || product.category?.name || 'Modest Luxury Edition'}
                  </p>
                  <p className="text-xs sm:text-sm font-sans font-medium text-brand-black mt-1">
                    {formatPrice(product.min_price_cents)}
                  </p>
                </Link>
              ))}
            </div>
          ) : !isLoading ? (
            /* Empty State */
            <div className="py-16 text-center max-w-md mx-auto">
              <p className="font-editorial text-2xl text-brand-black mb-2">No matching pieces found</p>
              <p className="text-xs text-brand-stone leading-relaxed mb-6">
                We could not find any items matching &ldquo;{query}&rdquo; under the selected filter. Try exploring our foundational silhouettes or textiles.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {['French Linen', 'Pleated Trousers', 'Abaya', 'Silk', 'Blazer'].map((term) => (
                  <button
                    key={term}
                    onClick={() => handleKeywordClick(term)}
                    className="px-3 py-1.5 rounded-full border border-border/80 bg-white text-xs text-brand-stone hover:text-brand-black hover:border-brand-black transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  navigate('/shop')
                  onClose()
                }}
                className="px-6 py-3 bg-[#1a1a1a] text-white text-xs uppercase tracking-[0.2em] font-sans font-medium hover:bg-black transition-colors rounded-xs"
              >
                Explore Full Catalog
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
