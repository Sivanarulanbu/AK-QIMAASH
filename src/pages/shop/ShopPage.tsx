import { useState, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { SlidersHorizontal, X, ChevronDown, Check, ArrowUpDown } from 'lucide-react'
import { useProducts, useCategories } from '@/features/products/useProducts'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductGridSkeleton } from '@/components/ui/Skeleton'
import { Drawer } from '@/components/ui/Drawer'
import { Pagination } from '@/components/ui/Navigation'
import { SEOHead } from '@/components/seo/SEOHead'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/utils'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const COLORS = ['Black', 'White', 'Taupe', 'Olive', 'Navy', 'Beige']
const SORT_OPTIONS = [
  { value: 'newest', label: 'New Arrivals' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A–Z' },
]
const PER_PAGE = 24

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [mobileSortOpen, setMobileSortOpen] = useState(false)

  const category = searchParams.get('category') || undefined
  const sort = (searchParams.get('sort') || 'newest') as any
  const page = parseInt(searchParams.get('page') || '1', 10)
  const selectedSizes = searchParams.getAll('size')
  const selectedColors = searchParams.getAll('color')
  const inStockOnly = searchParams.get('in_stock') === 'true'

  const { data, isLoading } = useProducts({
    category_slug: category,
    sizes: selectedSizes.length ? selectedSizes : undefined,
    colors: selectedColors.length ? selectedColors : undefined,
    in_stock: inStockOnly || undefined,
    sort,
    page,
    per_page: PER_PAGE,
  })

  const { data: categories } = useCategories()

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(searchParams)
      if (value === null) {
        next.delete(key)
      } else {
        next.set(key, value)
      }
      next.delete('page')
      setSearchParams(next)
    },
    [searchParams, setSearchParams]
  )

  const toggleArrayParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(searchParams)
      const current = next.getAll(key)
      next.delete(key)
      if (current.includes(value)) {
        current.filter((v) => v !== value).forEach((v) => next.append(key, v))
      } else {
        [...current, value].forEach((v) => next.append(key, v))
      }
      next.delete('page')
      setSearchParams(next)
    },
    [searchParams, setSearchParams]
  )

  const clearAllFilters = () => {
    const next = new URLSearchParams()
    if (sort !== 'newest') next.set('sort', sort)
    setSearchParams(next)
  }

  const hasActiveFilters = category || selectedSizes.length > 0 || selectedColors.length > 0 || inStockOnly
  const totalCount = data?.total ?? 0
  const totalPages = data ? Math.ceil(data.total / PER_PAGE) : 0
  const activeCategory = categories?.find((c) => c.slug === category)

  return (
    <>
      <SEOHead
        title={activeCategory ? `${activeCategory.name} — AK QIMAASH` : 'Shop All — AK QIMAASH'}
        description={
          activeCategory
            ? `Shop ${activeCategory.name} at AK QIMAASH. Contemporary luxury fashion designed for Singapore.`
            : 'Explore the complete AK QIMAASH collection. Modest luxury fashion crafted with quiet elegance.'
        }
        canonical={category ? `/shop?category=${category}` : '/shop'}
      />

      <div className="container-main py-8 sm:py-12">
        {/* ── Editorial Page Title ── */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <p className="editorial-subheading mb-2">The Collection</p>
          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-brand-black tracking-tight uppercase font-medium">
            {activeCategory ? activeCategory.name : 'SHOP'}
          </h1>
          {activeCategory?.description && (
            <p className="font-sans text-xs sm:text-sm text-text-muted mt-2 font-light max-w-md mx-auto">
              {activeCategory.description}
            </p>
          )}
        </div>

        {/* ── Category Sub-Navigation Bar ── */}
        <div className="flex items-center justify-center gap-6 sm:gap-10 border-b border-border/80 overflow-x-auto scrollbar-none pb-3 mb-8">
          <button
            onClick={() => updateParam('category', null)}
            className={cn(
              'text-xs uppercase tracking-[0.2em] font-sans whitespace-nowrap transition-colors pb-1 relative',
              !category
                ? 'text-brand-black font-semibold after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-[2px] after:bg-brand-black'
                : 'text-text-muted hover:text-brand-black'
            )}
          >
            All Pieces
          </button>
          {categories?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateParam('category', cat.slug)}
              className={cn(
                'text-xs uppercase tracking-[0.2em] font-sans whitespace-nowrap transition-colors pb-1 relative',
                category === cat.slug
                  ? 'text-brand-black font-semibold after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-[2px] after:bg-brand-black'
                  : 'text-text-muted hover:text-brand-black'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* ── Desktop Horizontal Filter & Sort Bar ── */}
        <div className="hidden lg:flex items-center justify-between py-4 border-b border-border/60 mb-8">
          {/* Left: Horizontal filters */}
          <div className="flex items-center gap-6">
            <span className="text-xs uppercase tracking-[0.15em] font-sans font-medium text-text-muted">
              Filter:
            </span>

            {/* Sizes */}
            <div className="flex items-center gap-1.5">
              {SIZES.map((size) => {
                const isSelected = selectedSizes.includes(size)
                return (
                  <button
                    key={size}
                    onClick={() => toggleArrayParam('size', size)}
                    className={cn(
                      'px-2.5 py-1 text-xs font-sans rounded-xs transition-colors border',
                      isSelected
                        ? 'bg-brand-black text-white border-brand-black font-medium'
                        : 'bg-transparent text-text-secondary border-border/80 hover:border-brand-black'
                    )}
                  >
                    {size}
                  </button>
                )
              })}
            </div>

            <div className="h-4 w-[1px] bg-border/80" />

            {/* Colors */}
            <div className="flex items-center gap-2">
              {COLORS.map((color) => {
                const isSelected = selectedColors.includes(color)
                return (
                  <button
                    key={color}
                    onClick={() => toggleArrayParam('color', color)}
                    className={cn(
                      'text-xs font-sans px-2.5 py-1 rounded-xs border transition-colors',
                      isSelected
                        ? 'bg-brand-black text-white border-brand-black font-medium'
                        : 'bg-transparent text-text-secondary border-border/80 hover:border-brand-black'
                    )}
                  >
                    {color}
                  </button>
                )
              })}
            </div>

            <div className="h-4 w-[1px] bg-border/80" />

            {/* In stock toggle */}
            <label className="flex items-center gap-2 cursor-pointer text-xs font-sans text-text-secondary select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => updateParam('in_stock', e.target.checked ? 'true' : null)}
                className="w-3.5 h-3.5 accent-brand-black rounded-xs"
              />
              In Stock Only
            </label>
          </div>

          {/* Right: Piece Count + Sort */}
          <div className="flex items-center gap-6">
            <span className="text-xs font-sans text-text-muted tracking-wider">
              {totalCount} {totalCount === 1 ? 'piece' : 'pieces'}
            </span>

            <div className="flex items-center gap-2">
              <span className="text-xs font-sans uppercase tracking-wider text-text-muted font-medium">Sort:</span>
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="bg-transparent border-0 border-b border-border/80 text-xs font-sans font-medium text-brand-black py-1 pr-6 focus:ring-0 focus:outline-none cursor-pointer"
                aria-label="Sort options"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── Active Filter Tags (Desktop & Mobile) ── */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs uppercase font-sans tracking-wider text-text-muted">Active:</span>
            {activeCategory && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-ivory text-brand-black text-xs rounded-full border border-border/80">
                {activeCategory.name}
                <button onClick={() => updateParam('category', null)} aria-label="Remove category filter">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedSizes.map((size) => (
              <span
                key={size}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-ivory text-brand-black text-xs rounded-full border border-border/80"
              >
                Size: {size}
                <button onClick={() => toggleArrayParam('size', size)} aria-label={`Remove size ${size}`}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {selectedColors.map((color) => (
              <span
                key={color}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-ivory text-brand-black text-xs rounded-full border border-border/80"
              >
                {color}
                <button onClick={() => toggleArrayParam('color', color)} aria-label={`Remove color ${color}`}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {inStockOnly && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-ivory text-brand-black text-xs rounded-full border border-border/80">
                In Stock
                <button onClick={() => updateParam('in_stock', null)} aria-label="Remove in stock filter">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="text-xs text-text-muted hover:text-brand-black underline underline-offset-4 ml-2"
            >
              Clear all
            </button>
          </div>
        )}

        {/* ── Sticky Mobile Filter / Sort Bar (< 1024px) ── */}
        <div className="lg:hidden sticky top-[57px] z-20 -mx-4 px-4 py-3 bg-surface/95 backdrop-blur-md border-y border-border/80 flex items-center justify-between mb-6 shadow-xs">
          <span className="text-xs font-sans tracking-wider text-text-muted">
            {totalCount} {totalCount === 1 ? 'piece' : 'pieces'}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-sans uppercase tracking-wider font-medium border border-brand-black bg-white rounded-xs"
              aria-label="Open filter drawer"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filter
              {hasActiveFilters && (
                <span className="w-4 h-4 bg-brand-black text-white text-[10px] rounded-full flex items-center justify-center -mr-1">
                  {selectedSizes.length + selectedColors.length + (category ? 1 : 0) + (inStockOnly ? 1 : 0)}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileSortOpen(!mobileSortOpen)}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-sans uppercase tracking-wider font-medium border border-border bg-white rounded-xs"
              aria-label="Toggle sort options"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              Sort
            </button>
          </div>
        </div>

        {/* Mobile Sort Dropdown Popover */}
        {mobileSortOpen && (
          <div className="lg:hidden mb-6 p-4 bg-surface-raised border border-border rounded-md shadow-md animate-fade-in">
            <p className="text-xs uppercase font-sans font-medium text-text-muted mb-2 tracking-wider">Sort by</p>
            <div className="space-y-1">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    updateParam('sort', opt.value)
                    setMobileSortOpen(false)
                  }}
                  className={cn(
                    'w-full text-left py-2 px-3 text-xs font-sans rounded-xs flex items-center justify-between',
                    sort === opt.value ? 'bg-brand-smoke text-brand-black font-semibold' : 'text-text-secondary'
                  )}
                >
                  <span>{opt.label}</span>
                  {sort === opt.value && <Check className="h-3.5 w-3.5 text-brand-black" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Product Grid ── */}
        {isLoading ? (
          <ProductGridSkeleton count={8} />
        ) : data?.products.length === 0 ? (
          <EmptyState
            type="search"
            title="NO PIECES MATCH YOUR FILTER"
            description="Try adjusting your size, color, or category selection to find what you are looking for."
            actionLabel="CLEAR FILTERS"
            onAction={clearAllFilters}
          />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12">
              {data?.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-16 flex justify-center">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={(p) => updateParam('page', String(p))}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Mobile Filter Drawer ── */}
      <Drawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        title="FILTERS"
        side="left"
        width="w-[320px]"
      >
        <div className="flex flex-col h-full p-6 justify-between">
          <div className="space-y-6 overflow-y-auto">
            {/* Category */}
            <div>
              <p className="text-xs uppercase font-sans font-medium text-text-muted tracking-[0.2em] mb-3">
                Category
              </p>
              <div className="space-y-1.5">
                <button
                  onClick={() => updateParam('category', null)}
                  className={cn(
                    'w-full text-left py-1 text-xs uppercase tracking-wider',
                    !category ? 'font-semibold text-brand-black' : 'text-text-secondary hover:text-brand-black'
                  )}
                >
                  All
                </button>
                {categories?.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => updateParam('category', cat.slug)}
                    className={cn(
                      'w-full text-left py-1 text-xs uppercase tracking-wider',
                      category === cat.slug ? 'font-semibold text-brand-black' : 'text-text-secondary hover:text-brand-black'
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div>
              <p className="text-xs uppercase font-sans font-medium text-text-muted tracking-[0.2em] mb-3">
                Size
              </p>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((size) => {
                  const isSelected = selectedSizes.includes(size)
                  return (
                    <button
                      key={size}
                      onClick={() => toggleArrayParam('size', size)}
                      className={cn(
                        'w-10 h-10 text-xs font-sans rounded-xs border transition-colors flex items-center justify-center',
                        isSelected
                          ? 'bg-brand-black text-white border-brand-black font-semibold'
                          : 'bg-transparent text-text-primary border-border hover:border-brand-black'
                      )}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Color */}
            <div>
              <p className="text-xs uppercase font-sans font-medium text-text-muted tracking-[0.2em] mb-3">
                Color
              </p>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((color) => {
                  const isSelected = selectedColors.includes(color)
                  return (
                    <button
                      key={color}
                      onClick={() => toggleArrayParam('color', color)}
                      className={cn(
                        'px-3 py-1.5 text-xs font-sans rounded-xs border transition-colors',
                        isSelected
                          ? 'bg-brand-black text-white border-brand-black font-medium'
                          : 'bg-transparent text-text-secondary border-border hover:border-brand-black'
                      )}
                    >
                      {color}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* In stock */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer text-xs font-sans text-text-primary">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => updateParam('in_stock', e.target.checked ? 'true' : null)}
                  className="w-4 h-4 accent-brand-black rounded-xs"
                />
                In Stock Only
              </label>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-6 border-t border-border flex gap-3">
            <button
              onClick={clearAllFilters}
              className="flex-1 py-3 text-xs uppercase tracking-widest font-medium border border-border hover:border-brand-black transition-colors"
            >
              Reset
            </button>
            <button
              onClick={() => setFilterDrawerOpen(false)}
              className="flex-1 py-3 text-xs uppercase tracking-widest font-medium bg-brand-black text-white hover:bg-brand-charcoal transition-colors"
            >
              View Results
            </button>
          </div>
        </div>
      </Drawer>
    </>
  )
}
