import { useState, useEffect } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { Heart, Minus, Plus, ShieldCheck, Truck, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'
import { useProduct } from '@/features/products/useProducts'
import { ProductGallery } from '@/components/product/ProductGallery'
import { VariantSelector } from '@/components/product/VariantSelector'
import { ProductCard } from '@/components/product/ProductCard'
import { Breadcrumb } from '@/components/ui/Navigation'
import { Button } from '@/components/ui/Button'
import { DetailSkeleton } from '@/components/ui/Skeleton'
import { SEOHead } from '@/components/seo/SEOHead'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { formatPrice } from '@/lib/commerce'
import { cn } from '@/utils'
import type { Database } from '@/types/database'

type Variant = Database['public']['Tables']['product_variants']['Row']

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: product, isLoading, error } = useProduct(slug!)
  const { isInWishlist, toggleProduct } = useWishlistStore()
  const { addItem } = useCartStore()

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [addedFeedback, setAddedFeedback] = useState(false)

  // Auto-select first in-stock variant when product loads or changes
  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      const defaultVariant =
        product.variants.find((v) => v.is_active && v.stock_quantity > 0) ??
        product.variants.find((v) => v.is_active) ??
        product.variants[0]
      setSelectedVariant(defaultVariant)
    }
  }, [product?.id])

  if (isLoading) {
    return (
      <div className="container-main py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-product bg-surface-sunken rounded-lg animate-skeleton" />
          <div className="space-y-4 py-4">
            <DetailSkeleton />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return <Navigate to="/shop" replace />
  }

  const isWishlisted = isInWishlist(product.id)
  const inStock = selectedVariant
    ? selectedVariant.stock_quantity > 0 && selectedVariant.is_active
    : product.variants.some((v) => v.is_active && v.stock_quantity > 0)

  const maxQuantity = selectedVariant ? selectedVariant.stock_quantity : 99

  const handleAddToCart = () => {
    if (!selectedVariant) return
    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      variantSku: selectedVariant.sku,
      variantSize: selectedVariant.size,
      variantColor: selectedVariant.color,
      imageUrl: product.primary_image,
      priceCents: selectedVariant.price_cents,
      quantity,
    })
    setAddedFeedback(true)
    setTimeout(() => setAddedFeedback(false), 2000)
  }

  const displayPrice = selectedVariant?.price_cents ?? product.min_price_cents
  const comparePrice = selectedVariant?.compare_price_cents

  // Structured data for SEO
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.short_description || product.description || '',
    image: product.primary_image || undefined,
    sku: selectedVariant?.sku || product.variants[0]?.sku,
    brand: { '@type': 'Brand', name: 'AK QIMAASH' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'SGD',
      price: (displayPrice / 100).toFixed(2),
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'AK QIMAASH' },
    },
  }

  return (
    <>
      <SEOHead
        title={`${product.name} — AK QIMAASH`}
        description={product.short_description || `Shop ${product.name} at AK QIMAASH.`}
        canonical={`/products/${product.slug}`}
        ogImage={product.primary_image || undefined}
        schema={productSchema}
      />

      <div className="container-main py-6 md:py-10">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Shop', href: '/shop' },
            ...(product.category
              ? [{ label: product.category.name, href: `/shop?category=${product.category.slug}` }]
              : []),
            { label: product.name },
          ]}
          className="mb-6"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          {/* Gallery */}
          <div>
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          {/* Product info */}
          <div className="md:py-2">
            {/* Category */}
            {product.category && (
              <Link
                to={`/shop?category=${product.category.slug}`}
                className="text-xs text-text-muted uppercase tracking-caps hover:text-text-primary transition-colors"
              >
                {product.category.name}
              </Link>
            )}

            <h1 className="text-2xl md:text-3xl font-semibold text-text-primary tracking-tight mt-2 mb-1">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-5">
              <span className="price-lg">{formatPrice(displayPrice)}</span>
              {comparePrice && comparePrice > displayPrice && (
                <span className="price-original">{formatPrice(comparePrice)}</span>
              )}
            </div>

            {/* Short description */}
            {product.short_description && (
              <p className="text-sm text-text-secondary leading-relaxed mb-5">
                {product.short_description}
              </p>
            )}

            {/* Variant selector */}
            <div className="mb-5">
              <VariantSelector
                variants={product.variants}
                selectedVariantId={selectedVariant?.id ?? null}
                onSelect={setSelectedVariant}
              />
            </div>

            {/* Stock status */}
            {selectedVariant && (
              <p className={cn('text-sm mb-4', inStock ? 'text-success' : 'text-error')}>
                {inStock
                  ? selectedVariant.stock_quantity <= 5
                    ? `Only ${selectedVariant.stock_quantity} left`
                    : 'In stock'
                  : 'Sold out'}
              </p>
            )}

            {/* Quantity + Add to cart */}
            <div className="flex gap-3 mb-5">
              {/* Quantity */}
              <div className="flex items-center border border-border rounded h-12">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-full flex items-center justify-center text-text-secondary hover:text-text-primary"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                  className="w-10 h-full flex items-center justify-center text-text-secondary hover:text-text-primary"
                  aria-label="Increase quantity"
                  disabled={quantity >= maxQuantity}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Add to cart */}
              <Button
                variant={addedFeedback ? 'ghost' : 'primary'}
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={!selectedVariant || !inStock}
                aria-label="Add to bag"
              >
                {addedFeedback
                  ? 'Added to bag'
                  : !selectedVariant
                  ? 'Select Size'
                  : !inStock
                  ? 'Sold Out'
                  : 'Add to Bag'}
              </Button>

              {/* Wishlist */}
              <button
                onClick={() => toggleProduct(product.id)}
                className={cn(
                  'w-12 h-12 border rounded flex items-center justify-center flex-shrink-0',
                  'transition-colors duration-150',
                  isWishlisted
                    ? 'border-accent bg-accent-subtle text-accent'
                    : 'border-border text-text-secondary hover:border-brand-black hover:text-text-primary'
                )}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                aria-pressed={isWishlisted}
              >
                <Heart
                  className={cn(
                    'h-4.5 w-4.5',
                    isWishlisted ? 'fill-accent stroke-accent' : ''
                  )}
                />
              </button>
            </div>

            {/* SKU */}
            {selectedVariant && (
              <p className="text-xs text-text-muted mb-5">
                SKU: {selectedVariant.sku}
              </p>
            )}

            {/* Service assurance */}
            <div className="border-t border-border pt-5 space-y-2.5">
              {[
                { icon: Truck, text: 'Singapore delivery · 2–4 business days' },
                { icon: ShieldCheck, text: 'Cash on Delivery · Pay on arrival' },
                { icon: RotateCcw, text: 'Returns within 14 days' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5 text-sm text-text-secondary">
                  <Icon className="h-4 w-4 text-text-muted flex-shrink-0" aria-hidden="true" />
                  <span>{text}</span>
                </div>
              ))}
            </div>

            {/* Accordion info */}
            <div className="border-t border-border mt-5 space-y-0">
              {product.description && (
                <AccordionItem title="Details">
                  <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </AccordionItem>
              )}
              {product.material && (
                <AccordionItem title="Material & Composition">
                  <p className="text-sm text-text-secondary">{product.material}</p>
                </AccordionItem>
              )}
              {product.care_instructions && (
                <AccordionItem title="Care Instructions">
                  <p className="text-sm text-text-secondary whitespace-pre-line">
                    {product.care_instructions}
                  </p>
                </AccordionItem>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function AccordionItem({ title, children }: { title: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="flex items-center justify-between w-full py-4 text-sm font-medium text-text-primary"
        aria-expanded={isOpen}
      >
        {title}
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-text-muted" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-4 w-4 text-text-muted" aria-hidden="true" />
        )}
      </button>
      {isOpen && <div className="pb-4">{children}</div>}
    </div>
  )
}
