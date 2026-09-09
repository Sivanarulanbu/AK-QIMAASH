import { useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Menu, X, ChevronDown } from 'lucide-react'
import { useProducts, useCategories } from '@/features/products/useProducts'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductGridSkeleton } from '@/components/ui/Skeleton'
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

export const PRICE_RANGES = [
  { label: 'All', id: 'all', min: undefined, max: undefined },
  { label: '< $150', id: 'under-150', min: 0, max: 15000 },
  { label: '$150 – $250', id: '150-250', min: 15000, max: 25000 },
  { label: '$250 – $350', id: '250-350', min: 25000, max: 35000 },
  { label: '$350+', id: 'over-350', min: 35000, max: undefined },
]

const PER_PAGE = 24

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  // Persistent sidebar stays open by default on desktop
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Collapsible filter groups state
  const [categoryOpen, setCategoryOpen] = useState(true)
  const [sizeOpen, setSizeOpen] = useState(true)
  const [colorOpen, setColorOpen] = useState(true)
  const [priceOpen, setPriceOpen] = useState(true)
  const [availabilityOpen, setAvailabilityOpen] = useState(true)

  const category = searchParams.get('category') || undefined
  const sort = (searchParams.get('sort') || 'newest') as any
  const page = parseInt(searchParams.get('page') || '1', 10)
  const selectedSizes = searchParams.getAll('size')
  const selectedColors = searchParams.getAll('color')
  const inStockOnly = searchParams.get('in_stock') === 'true'
  const priceRangeId = searchParams.get('price') || 'all'
  const selectedPriceRange = PRICE_RANGES.find((r) => r.id === priceRangeId) || PRICE_RANGES[0]

  const maxPriceParam = searchParams.get('max_price')
  const [sliderMaxPrice, setSliderMaxPrice] = useState<number>(() =>
    maxPriceParam ? parseInt(maxPriceParam, 10) : 400
  )
  const customMaxPriceCents = maxPriceParam ? parseInt(maxPriceParam, 10) * 100 : undefined

  const { data, isLoading } = useProducts({
    category_slug: category,
    sizes: selectedSizes.length ? selectedSizes : undefined,
    colors: selectedColors.length ? selectedColors : undefined,
    min_price_cents: selectedPriceRange.min,
    max_price_cents: customMaxPriceCents ?? selectedPriceRange.max,
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
    setSliderMaxPrice(400)
  }

  const hasActiveFilters =
    Boolean(category) ||
    selectedSizes.length > 0 ||
    selectedColors.length > 0 ||
    inStockOnly ||
    priceRangeId !== 'all' ||
    Boolean(maxPriceParam)

  const totalCount = data?.total ?? 0
  const totalPages = data ? Math.ceil(data.total / PER_PAGE) : 0
  const activeCategory = categories?.find((c) => c.slug === category)

  // ── Render Filter Groups (shared between desktop sidebar and mobile drawer) ──
  const renderFilterGroups = () => (
    <div className="space-y-1">
      {/* 1. Category */}
      <FilterGroup
        title="Category"
        isOpen={categoryOpen}
        onToggle={() => setCategoryOpen(!categoryOpen)}
        badgeCount={category ? 1 : 0}
      >
        <div className="space-y-1 pt-1">
          <label className="flex items-center gap-2.5 text-[13px] text-[var(--text-primary)] hover:text-[var(--text-accent)] cursor-pointer select-none transition-colors py-1">
            <input
              type="checkbox"
              checked={!category}
              onChange={() => updateParam('category', null)}
              className="w-4 h-4 rounded-[var(--radius)] border-[0.5px] border-[var(--border)] accent-[var(--text-accent)] hover:border-[var(--text-accent)] focus:ring-1 focus:ring-[var(--text-accent)] cursor-pointer"
            />
            <span>All Pieces</span>
          </label>
          {categories?.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center justify-between text-[13px] text-[var(--text-primary)] hover:text-[var(--text-accent)] cursor-pointer select-none transition-colors py-1"
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={category === cat.slug}
                  onChange={() => updateParam('category', category === cat.slug ? null : cat.slug)}
                  className="w-4 h-4 rounded-[var(--radius)] border-[0.5px] border-[var(--border)] accent-[var(--text-accent)] hover:border-[var(--text-accent)] focus:ring-1 focus:ring-[var(--text-accent)] cursor-pointer"
                />
                <span>{cat.name}</span>
              </div>
            </label>
          ))}
        </div>
      </FilterGroup>

      {/* 2. Size */}
      <FilterGroup
        title="Size"
        isOpen={sizeOpen}
        onToggle={() => setSizeOpen(!sizeOpen)}
        badgeCount={selectedSizes.length}
      >
        <div className="grid grid-cols-2 gap-2 pt-1">
          {SIZES.map((size) => {
            const isSelected = selectedSizes.includes(size)
            return (
              <label
                key={size}
                className="flex items-center gap-2 text-[13px] text-[var(--text-primary)] hover:text-[var(--text-accent)] cursor-pointer select-none transition-colors py-1"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleArrayParam('size', size)}
                  className="w-4 h-4 rounded-[var(--radius)] border-[0.5px] border-[var(--border)] accent-[var(--text-accent)] hover:border-[var(--text-accent)] focus:ring-1 focus:ring-[var(--text-accent)] cursor-pointer"
                />
                <span>{size}</span>
              </label>
            )
          })}
        </div>
      </FilterGroup>

      {/* 3. Color */}
      <FilterGroup
        title="Color"
        isOpen={colorOpen}
        onToggle={() => setColorOpen(!colorOpen)}
        badgeCount={selectedColors.length}
      >
        <div className="space-y-1 pt-1">
          {COLORS.map((color) => {
            const isSelected = selectedColors.includes(color)
            const colorHex =
              color.toLowerCase() === 'black' ? '#1c1c1c' :
              color.toLowerCase() === 'white' ? '#f5f5f5' :
              color.toLowerCase() === 'taupe' ? '#8b8589' :
              color.toLowerCase() === 'olive' ? '#556b2f' :
              color.toLowerCase() === 'navy' ? '#000080' :
              color.toLowerCase() === 'beige' ? '#d4be8d' : '#cccccc'
            return (
              <label
                key={color}
                className="flex items-center justify-between text-[13px] text-[var(--text-primary)] hover:text-[var(--text-accent)] cursor-pointer select-none transition-colors py-1"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleArrayParam('color', color)}
                    className="w-4 h-4 rounded-[var(--radius)] border-[0.5px] border-[var(--border)] accent-[var(--text-accent)] hover:border-[var(--text-accent)] focus:ring-1 focus:ring-[var(--text-accent)] cursor-pointer"
                  />
                  <span
                    className="w-3.5 h-3.5 rounded-full border-[0.5px] border-[var(--border)] shadow-3xs"
                    style={{ backgroundColor: colorHex }}
                  />
                  <span>{color}</span>
                </div>
              </label>
            )
          })}
        </div>
      </FilterGroup>

      {/* 4. Price Range (Range Slider & Quick Presets) */}
      <FilterGroup
        title="Price Range"
        isOpen={priceOpen}
        onToggle={() => setPriceOpen(!priceOpen)}
        badgeCount={priceRangeId !== 'all' || maxPriceParam ? 1 : 0}
      >
        <div className="space-y-3 pt-1">
          {/* Range Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[13px] text-text-muted">
              <span>$0 SGD</span>
              <span className="font-medium text-[var(--text-primary)]">
                Up to ${sliderMaxPrice} SGD
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="400"
              step="10"
              value={sliderMaxPrice}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10)
                setSliderMaxPrice(val)
                updateParam('max_price', val >= 400 ? null : String(val))
                updateParam('price', null)
              }}
              className="w-full h-1.5 bg-[var(--surface-2)] rounded-lg appearance-none cursor-pointer accent-[var(--text-accent)] hover:opacity-90 transition-opacity"
            />
          </div>

          {/* Quick Presets */}
          <div className="space-y-1 border-t border-[0.5px] border-[var(--border)] pt-2.5">
            <span className="text-[11px] uppercase tracking-wider text-text-muted font-medium block mb-1">
              Preset Bands
            </span>
            {PRICE_RANGES.map((range) => {
              const isSelected = priceRangeId === range.id
              return (
                <label
                  key={range.id}
                  className="flex items-center gap-2 text-[13px] text-[var(--text-primary)] hover:text-[var(--text-accent)] cursor-pointer select-none transition-colors py-0.5"
                >
                  <input
                    type="radio"
                    name="price-band"
                    checked={isSelected && !maxPriceParam}
                    onChange={() => {
                      updateParam('price', range.id === 'all' ? null : range.id)
                      updateParam('max_price', null)
                      if (range.max) setSliderMaxPrice(Math.round(range.max / 100))
                      else setSliderMaxPrice(400)
                    }}
                    className="w-3.5 h-3.5 border-[0.5px] border-[var(--border)] accent-[var(--text-accent)] cursor-pointer"
                  />
                  <span>{range.label}</span>
                </label>
              )
            })}
          </div>
        </div>
      </FilterGroup>

      {/* 5. Availability */}
      <FilterGroup
        title="Availability"
        isOpen={availabilityOpen}
        onToggle={() => setAvailabilityOpen(!availabilityOpen)}
        badgeCount={inStockOnly ? 1 : 0}
      >
        <div className="pt-1">
          <label className="flex items-center gap-2.5 text-[13px] text-[var(--text-primary)] hover:text-[var(--text-accent)] cursor-pointer select-none transition-colors py-1">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => updateParam('in_stock', e.target.checked ? 'true' : null)}
              className="w-4 h-4 rounded-[var(--radius)] border-[0.5px] border-[var(--border)] accent-[var(--text-accent)] hover:border-[var(--text-accent)] focus:ring-1 focus:ring-[var(--text-accent)] cursor-pointer"
            />
            <span>In Stock Only</span>
          </label>
        </div>
      </FilterGroup>
    </div>
  )

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

      <div className="container-main py-6 sm:py-8">
        {/* ── Editorial Collection Header ── */}
        <div className="text-center max-w-xl mx-auto mb-6">
          <p className="editorial-subheading mb-2">The Collection</p>
          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-brand-black tracking-tight uppercase font-medium">
            {activeCategory ? activeCategory.name : 'SHOP ALL'}
          </h1>
          {activeCategory?.description && (
            <p className="font-sans text-xs sm:text-sm text-text-muted mt-2 font-light max-w-md mx-auto">
              {activeCategory.description}
            </p>
          )}
        </div>

        {/* ── 56px Fixed/Sticky Control Header (Requirement 1 & 5) ── */}
        <header
          className="sticky top-14 sm:top-16 lg:top-20 z-20 h-[56px] bg-surface/95 backdrop-blur-md border-y border-[0.5px] border-[var(--border)] flex items-center justify-between px-4 sm:px-6 lg:px-8 mb-8 transition-colors"
          style={{ borderWidth: '0.5px' }}
        >
          {/* Left: Hamburger menu icon button to collapse/expand sidebar */}
          <div className="flex items-center gap-4 sm:gap-5">
            <button
              type="button"
              onClick={() => setSidebarOpen((s) => !s)}
              className="inline-flex items-center justify-center gap-3 h-10 px-4 sm:px-5 rounded-[var(--radius)] border-[0.5px] border-[var(--border)] bg-surface hover:bg-[var(--surface-2)] text-[var(--text-primary)] transition-all cursor-pointer select-none group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--text-accent)]"
              aria-label={sidebarOpen ? 'Collapse sidebar filters' : 'Expand sidebar filters'}
              title={sidebarOpen ? 'Collapse filters sidebar' : 'Expand filters sidebar'}
            >
              <Menu className="h-4 w-4 shrink-0 text-[var(--text-primary)] group-hover:text-[var(--text-accent)] transition-colors" />
              <span className="text-[13px] sm:text-[14px] font-[500] uppercase tracking-wider leading-none">
                {sidebarOpen ? 'Hide Filters' : 'Filters'}
              </span>
              {hasActiveFilters && (
                <span
                  className="w-2 h-2 rounded-full bg-[var(--text-accent)] shrink-0"
                  aria-label="Filters active"
                />
              )}
            </button>

            <span className="text-[13px] font-sans text-text-muted border-l border-[0.5px] border-[var(--border)] pl-4 hidden xs:inline leading-none">
              {totalCount} {totalCount === 1 ? 'piece' : 'pieces'}
            </span>
          </div>

          {/* Center: Active filter chips with comfortable inner spacing */}
          {hasActiveFilters && (
            <div className="hidden md:flex items-center gap-2 overflow-x-auto max-w-[45%] scrollbar-none px-3">
              <span className="text-[11px] uppercase tracking-wider text-text-muted font-medium shrink-0">
                Active:
              </span>
              {activeCategory && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--surface-2)] text-[var(--text-primary)] text-[12px] leading-tight rounded-[var(--radius)] border-[0.5px] border-[var(--border)] shrink-0">
                  <span>{activeCategory.name}</span>
                  <button
                    onClick={() => updateParam('category', null)}
                    aria-label="Remove category"
                    className="p-0.5 hover:text-[var(--text-accent)] transition-colors cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedSizes.map((size) => (
                <span
                  key={size}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--surface-2)] text-[var(--text-primary)] text-[12px] leading-tight rounded-[var(--radius)] border-[0.5px] border-[var(--border)] shrink-0"
                >
                  <span>{size}</span>
                  <button
                    onClick={() => toggleArrayParam('size', size)}
                    aria-label={`Remove size ${size}`}
                    className="p-0.5 hover:text-[var(--text-accent)] transition-colors cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {selectedColors.map((color) => (
                <span
                  key={color}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--surface-2)] text-[var(--text-primary)] text-[12px] leading-tight rounded-[var(--radius)] border-[0.5px] border-[var(--border)] shrink-0"
                >
                  <span>{color}</span>
                  <button
                    onClick={() => toggleArrayParam('color', color)}
                    aria-label={`Remove color ${color}`}
                    className="p-0.5 hover:text-[var(--text-accent)] transition-colors cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {inStockOnly && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--surface-2)] text-[var(--text-primary)] text-[12px] leading-tight rounded-[var(--radius)] border-[0.5px] border-[var(--border)] shrink-0">
                  <span>In Stock</span>
                  <button
                    onClick={() => updateParam('in_stock', null)}
                    aria-label="Remove in stock filter"
                    className="p-0.5 hover:text-[var(--text-accent)] transition-colors cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {(priceRangeId !== 'all' || maxPriceParam) && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--surface-2)] text-[var(--text-primary)] text-[12px] leading-tight rounded-[var(--radius)] border-[0.5px] border-[var(--border)] shrink-0">
                  <span>{maxPriceParam ? `< $${maxPriceParam}` : selectedPriceRange.label}</span>
                  <button
                    onClick={() => {
                      updateParam('price', null)
                      updateParam('max_price', null)
                      setSliderMaxPrice(400)
                    }}
                    aria-label="Remove price filter"
                    className="p-0.5 hover:text-[var(--text-accent)] transition-colors cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="text-[12px] text-text-muted hover:text-[var(--text-accent)] underline underline-offset-2 ml-1 cursor-pointer shrink-0 transition-colors"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Right: Flat Sort selector with balanced padding */}
          <div className="flex items-center gap-2.5">
            <span className="text-[13px] font-sans text-text-muted hidden sm:inline">Sort:</span>
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="h-10 px-3.5 sm:px-4 bg-surface border-[0.5px] border-[var(--border)] rounded-[var(--radius)] text-[13px] font-sans text-[var(--text-primary)] hover:border-[var(--text-accent)] focus:outline-none focus:border-[var(--text-accent)] cursor-pointer transition-colors"
              aria-label="Sort products"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* ── Main Layout: 280px Persistent Sidebar + Auto-fit Grid (Requirement 2, 4, 5) ── */}
        <div className="flex items-start transition-all duration-300 ease-in-out">
          {/* Desktop Persistent Sidebar (280px fixed width, smooth collapse) */}
          <aside
            aria-label="Product filters"
            className={cn(
              'hidden lg:block flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden',
              sidebarOpen
                ? 'w-[280px] opacity-100 mr-8'
                : 'w-0 opacity-0 mr-0 pointer-events-none'
            )}
          >
            <div className="w-[280px] bg-surface border-[0.5px] border-[var(--border)] rounded-[var(--radius)] p-5 space-y-4 sticky top-[124px] max-h-[calc(100vh-140px)] overflow-y-auto scrollbar-thin">
              <div className="flex items-center justify-between pb-3 border-b border-[0.5px] border-[var(--border)]">
                <span className="text-[14px] font-[500] uppercase tracking-wider text-[var(--text-primary)]">
                  Filter by
                </span>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-[12px] font-sans text-text-muted hover:text-[var(--text-accent)] underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    Reset All
                  </button>
                )}
              </div>

              {renderFilterGroups()}
            </div>
          </aside>

          {/* Mobile Overlay Sidebar Drawer (< 1024px) */}
          {sidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-modal flex">
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
                onClick={() => setSidebarOpen(false)}
                aria-hidden="true"
              />
              {/* Drawer */}
              <div className="relative w-[280px] max-w-[85vw] bg-surface h-full shadow-2xl border-r border-[0.5px] border-[var(--border)] p-4 sm:p-5 overflow-y-auto z-10 flex flex-col justify-between animate-slide-in-left">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[0.5px] border-[var(--border)]">
                    <span className="text-[14px] font-[500] uppercase tracking-wider text-[var(--text-primary)]">
                      Filter by
                    </span>
                    <button
                      type="button"
                      onClick={() => setSidebarOpen(false)}
                      className="p-1.5 rounded-[var(--radius)] hover:bg-[var(--surface-2)] text-[var(--text-primary)] transition-colors cursor-pointer"
                      aria-label="Close filters"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  {renderFilterGroups()}
                </div>
                <div className="pt-4 border-t border-[0.5px] border-[var(--border)] mt-4">
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="w-full py-2.5 bg-brand-black text-white text-[13px] font-sans font-[500] uppercase tracking-wider rounded-[var(--radius)] hover:bg-black/85 transition-colors cursor-pointer"
                  >
                    Show {totalCount} {totalCount === 1 ? 'Piece' : 'Pieces'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Content Area (Auto-fit Grid) */}
          <main className="flex-1 min-w-0 transition-all duration-300 ease-in-out">
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
                {/* Auto-fit columns grid: when sidebar collapses, grid smoothly re-flows */}
                <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4 sm:gap-6 transition-all duration-300">
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
          </main>
        </div>
      </div>
    </>
  )
}

// ── Collapsible Filter Group Component ──
function FilterGroup({
  title,
  isOpen,
  onToggle,
  children,
  badgeCount,
}: {
  title: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
  badgeCount?: number
}) {
  return (
    <div className="border-b border-[0.5px] border-[var(--border)] py-3 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full py-1 text-left group cursor-pointer select-none"
        aria-expanded={isOpen}
      >
        <span className="text-[14px] font-[500] text-[var(--text-primary)] group-hover:text-[var(--text-accent)] transition-colors flex items-center gap-2">
          {title}
          {Boolean(badgeCount && badgeCount > 0) && (
            <span className="w-4 h-4 rounded-full bg-[var(--text-accent)] text-white text-[10px] flex items-center justify-center font-medium">
              {badgeCount}
            </span>
          )}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-text-muted transition-transform duration-200 transform group-hover:text-[var(--text-primary)]',
            isOpen ? 'rotate-180' : 'rotate-0'
          )}
        />
      </button>
      {isOpen && <div className="pt-2 pb-1 space-y-2 animate-fade-in">{children}</div>}
    </div>
  )
}
