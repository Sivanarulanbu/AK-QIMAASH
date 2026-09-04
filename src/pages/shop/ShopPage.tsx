import { useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react'
import { useProducts, useCategories } from '@/features/products/useProducts'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductGridSkeleton } from '@/components/ui/Skeleton'
import { Drawer } from '@/components/ui/Drawer'
import { Button } from '@/components/ui/Button'
import { Breadcrumb, Pagination } from '@/components/ui/Navigation'
import { SEOHead } from '@/components/seo/SEOHead'
import { cn } from '@/utils'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
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

  const category = searchParams.get('category') || undefined
  const sort = (searchParams.get('sort') || 'newest') as any
  const page = parseInt(searchParams.get('page') || '1', 10)
  const selectedSizes = searchParams.getAll('size')
  const selectedColors = searchParams.getAll('color')

  const { data, isLoading } = useProducts({
    category_slug: category,
    sizes: selectedSizes.length ? selectedSizes : undefined,
    colors: selectedColors.length ? selectedColors : undefined,
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

  const hasActiveFilters = category || selectedSizes.length > 0 || selectedColors.length > 0

  const totalPages = data ? Math.ceil(data.total / PER_PAGE) : 0

  const filterPanel = (
    <FilterPanel
      categories={categories || []}
      selectedCategory={category}
      selectedSizes={selectedSizes}
      onCategoryChange={(slug) => updateParam('category', slug)}
      onSizeToggle={(size) => toggleArrayParam('size', size)}
      onClearAll={clearAllFilters}
      hasActiveFilters={!!hasActiveFilters}
    />
  )

  const activeCategory = categories?.find((c) => c.slug === category)

  return (
    <>
      <SEOHead
        title={activeCategory ? `${activeCategory.name} — AK QIMAASH` : 'Shop All — AK QIMAASH'}
        description={
          activeCategory
            ? `Shop ${activeCategory.name} at AK QIMAASH. Contemporary fashion for Singapore.`
            : 'Browse the complete AK QIMAASH collection. Contemporary fashion for everyday Singapore living.'
        }
        canonical={category ? `/shop?category=${category}` : '/shop'}
      />

      <div className="container-main py-5">
        <Breadcrumb
          items={[
            { label: 'Shop', href: '/shop' },
            ...(activeCategory ? [{ label: activeCategory.name }] : []),
          ]}
          className="mb-5"
        />

        <div className="flex items-baseline justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-text-primary tracking-tight">
              {activeCategory ? activeCategory.name : 'All Products'}
            </h1>
            {data && (
              <p className="text-sm text-text-muted mt-1">
                {data.total} {data.total === 1 ? 'product' : 'products'}
              </p>
            )}
          </div>

          {/* Sort + Filter controls */}
          <div className="flex items-center gap-2">
            {/* Sort dropdown */}
            <div className="relative hidden sm:block">
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="select-base pr-8 text-sm h-9"
                aria-label="Sort products"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile filter button */}
            <button
              className="btn-md btn-secondary gap-2 lg:hidden"
              onClick={() => setFilterDrawerOpen(true)}
              aria-label="Open filters"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Filters
              {hasActiveFilters && (
                <span className="w-5 h-5 bg-brand-black text-white text-xs rounded-full flex items-center justify-center">
                  {(selectedSizes.length || 0) + (selectedColors.length || 0) + (category ? 1 : 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Active filter pills */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-5" role="list" aria-label="Active filters">
            {activeCategory && (
              <FilterPill
                label={activeCategory.name}
                onRemove={() => updateParam('category', null)}
              />
            )}
            {selectedSizes.map((size) => (
              <FilterPill
                key={size}
                label={`Size: ${size}`}
                onRemove={() => toggleArrayParam('size', size)}
              />
            ))}
            <button
              onClick={clearAllFilters}
              className="text-xs text-text-muted hover:text-text-primary underline underline-offset-2"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-24">
              {filterPanel}
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {/* Mobile sort */}
            <div className="sm:hidden mb-4">
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="select-base text-sm"
                aria-label="Sort products"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {isLoading ? (
              <ProductGridSkeleton count={8} />
            ) : data?.products.length === 0 ? (
              <EmptyState onClearFilters={clearAllFilters} hasFilters={!!hasActiveFilters} />
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {data?.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-12">
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
        </div>
      </div>

      {/* Mobile filter drawer */}
      <Drawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        title="Filter"
        side="left"
        width="w-[300px]"
      >
        <div className="px-5 py-4">
          {filterPanel}
          <Button
            variant="primary"
            size="lg"
            className="w-full mt-6"
            onClick={() => setFilterDrawerOpen(false)}
          >
            Apply Filters
          </Button>
        </div>
      </Drawer>
    </>
  )
}

function FilterPanel({
  categories,
  selectedCategory,
  selectedSizes,
  onCategoryChange,
  onSizeToggle,
  onClearAll,
  hasActiveFilters,
}: {
  categories: any[]
  selectedCategory: string | undefined
  selectedSizes: string[]
  onCategoryChange: (slug: string | null) => void
  onSizeToggle: (size: string) => void
  onClearAll: () => void
  hasActiveFilters: boolean
}) {
  return (
    <div className="space-y-6">
      {hasActiveFilters && (
        <button
          onClick={onClearAll}
          className="text-xs text-text-muted hover:text-text-primary underline underline-offset-2"
        >
          Clear all filters
        </button>
      )}

      {/* Category filter */}
      <FilterSection title="Category">
        <div className="space-y-1.5">
          <FilterOption
            label="All"
            isActive={!selectedCategory}
            onClick={() => onCategoryChange(null)}
          />
          {categories.map((cat) => (
            <FilterOption
              key={cat.id}
              label={cat.name}
              isActive={selectedCategory === cat.slug}
              onClick={() => onCategoryChange(cat.slug)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Size filter */}
      <FilterSection title="Size">
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => onSizeToggle(size)}
              aria-pressed={selectedSizes.includes(size)}
              className={cn(
                'min-w-[36px] h-9 px-2.5 text-sm font-medium border rounded',
                'transition-all duration-150',
                selectedSizes.includes(size)
                  ? 'border-brand-black bg-brand-black text-white'
                  : 'border-border text-text-secondary hover:border-brand-black'
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  )
}

function FilterSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(true)
  return (
    <div className="border-b border-border pb-6">
      <button
        className="flex items-center justify-between w-full mb-3"
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
      >
        <span className="text-sm font-semibold text-text-primary">{title}</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-text-muted" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-4 w-4 text-text-muted" aria-hidden="true" />
        )}
      </button>
      {isOpen && children}
    </div>
  )
}

function FilterOption({
  label,
  isActive,
  onClick,
}: {
  label: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'block text-sm transition-colors duration-150 py-0.5',
        isActive
          ? 'text-text-primary font-medium'
          : 'text-text-secondary hover:text-text-primary'
      )}
    >
      {label}
    </button>
  )
}

function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-smoke
                     text-xs font-medium text-text-secondary rounded" role="listitem">
      {label}
      <button
        onClick={onRemove}
        className="ml-0.5 hover:text-text-primary"
        aria-label={`Remove ${label} filter`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  )
}

function EmptyState({
  onClearFilters,
  hasFilters,
}: {
  onClearFilters: () => void
  hasFilters: boolean
}) {
  return (
    <div className="text-center py-20">
      <p className="text-text-muted text-sm mb-4">
        {hasFilters
          ? 'No products match the selected filters.'
          : 'No products available yet.'}
      </p>
      {hasFilters && (
        <Button variant="secondary" size="md" onClick={onClearFilters}>
          Clear filters
        </Button>
      )}
    </div>
  )
}
