import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Plus } from 'lucide-react'
import { cn } from '@/utils'
import { formatPrice } from '@/lib/commerce'
import { useWishlistStore } from '@/store/wishlistStore'
import { useCartStore } from '@/store/cartStore'
import { useToast } from '@/components/ui/Toast'
import type { ProductWithDetails } from '@/features/products/useProducts'

interface ProductCardProps {
  product: ProductWithDetails
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { isInWishlist, toggleProduct } = useWishlistStore()
  const { addItem } = useCartStore()
  const { toast } = useToast()
  const [showQuickAdd, setShowQuickAdd] = useState(false)

  const isWishlisted = isInWishlist(product.id)

  // Primary & secondary photography
  const primaryImg = product.primary_image || product.images[0]?.url
  const secondaryImg = product.images.length > 1 ? product.images[1]?.url : primaryImg

  // Available in-stock variants
  const activeVariants = product.variants.filter((v) => v.is_active && v.stock_quantity > 0)
  const isOutOfStock = activeVariants.length === 0
  const isLowStock = !isOutOfStock && activeVariants.some((v) => v.stock_quantity <= 3)

  // Distinct color list
  const colors = Array.from(new Set(product.variants.map((v) => v.color).filter(Boolean))) as string[]

  // Check if "New Season" (e.g. created in last 60 days or first 3 products)
  const isNew = product.tags?.includes('new') || product.tags?.includes('featured')

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleProduct(product.id)
    if (!isWishlisted) {
      toast({
        title: 'Added to Wishlist',
        description: product.name,
        variant: 'default',
      })
    }
  }

  const handleQuickAdd = (e: React.MouseEvent, variantId: string) => {
    e.preventDefault()
    e.stopPropagation()
    const variant = product.variants.find((v) => v.id === variantId)
    if (!variant) return

    addItem({
      variantId: variant.id,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      variantSku: variant.sku,
      variantSize: variant.size,
      variantColor: variant.color,
      imageUrl: primaryImg,
      priceCents: variant.price_cents,
      quantity: 1,
    })

    toast({
      title: 'Added to Bag',
      description: `${product.name} — Size ${variant.size || 'One Size'}`,
      variant: 'default',
    })

    setShowQuickAdd(false)
  }

  return (
    <div
      className={cn('group relative block product-card transition-all duration-300', className)}
      onMouseLeave={() => setShowQuickAdd(false)}
    >
      {/* ── Image Container (Aspect 3:4) ── */}
      <div className="relative aspect-[3/4] overflow-hidden bg-brand-ivory/80 rounded-xs">
        <Link to={`/products/${product.slug}`} className="block w-full h-full" aria-label={product.name}>
          {/* Primary image */}
          {primaryImg ? (
            <img
              src={primaryImg}
              alt={product.name}
              className={cn(
                'w-full h-full object-cover transition-all duration-700 ease-out',
                secondaryImg && secondaryImg !== primaryImg
                  ? 'group-hover:opacity-0 group-hover:scale-102'
                  : 'group-hover:scale-102'
              )}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-surface-sunken text-xs text-text-disabled uppercase tracking-widest">
              AK QIMAASH
            </div>
          )}

          {/* Secondary hover image cross-fade */}
          {secondaryImg && secondaryImg !== primaryImg && (
            <img
              src={secondaryImg}
              alt={`${product.name} alternate view`}
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 group-hover:scale-102 transition-all duration-700 ease-out"
              loading="lazy"
            />
          )}
        </Link>

        {/* Minimalist Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          {isOutOfStock ? (
            <span className="text-[10px] uppercase font-sans font-medium tracking-[0.15em] px-2 py-0.5 bg-brand-charcoal text-white rounded-xs">
              Sold Out
            </span>
          ) : isLowStock ? (
            <span className="text-[10px] uppercase font-sans font-medium tracking-[0.15em] px-2 py-0.5 bg-amber-900/90 text-white rounded-xs">
              Low Stock
            </span>
          ) : isNew ? (
            <span className="text-[10px] uppercase font-sans font-medium tracking-[0.15em] px-2 py-0.5 bg-brand-black/85 text-brand-white rounded-xs">
              New
            </span>
          ) : null}
        </div>

        {/* Wishlist Button (Corner Heart) */}
        <button
          onClick={handleWishlistToggle}
          className={cn(
            'absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center',
            'bg-white/80 hover:bg-white text-brand-black backdrop-blur-md transition-all duration-200 shadow-xs',
            'opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
            isWishlisted && 'opacity-100 text-accent'
          )}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          aria-pressed={isWishlisted}
        >
          <Heart
            className={cn(
              'h-3.5 w-3.5 stroke-[1.5] transition-colors',
              isWishlisted ? 'fill-accent stroke-accent' : 'stroke-brand-black'
            )}
          />
        </button>

        {/* Quick Add Slide-up Strip */}
        {!isOutOfStock && (
          <div
            className={cn(
              'absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-md py-2.5 px-3 border-t border-border/60 transition-transform duration-300 ease-out flex items-center justify-center',
              showQuickAdd ? 'translate-y-0' : 'translate-y-full group-hover:translate-y-0'
            )}
          >
            {activeVariants.length === 1 && !activeVariants[0].size ? (
              // Single one-size item
              <button
                onClick={(e) => handleQuickAdd(e, activeVariants[0].id)}
                className="w-full text-center text-xs font-sans uppercase tracking-widest font-medium text-brand-black hover:text-accent transition-colors py-1"
              >
                + Quick Add
              </button>
            ) : (
              // Multi-size selector strip
              <div className="flex items-center gap-1.5 w-full justify-center">
                <span className="text-[10px] uppercase font-sans text-text-muted tracking-wider mr-1 hidden sm:inline">
                  Add:
                </span>
                {activeVariants.map((v) => (
                  <button
                    key={v.id}
                    onClick={(e) => handleQuickAdd(e, v.id)}
                    className="h-7 min-w-[28px] px-1.5 text-xs font-sans font-medium text-brand-black hover:bg-brand-black hover:text-white border border-border/80 rounded-xs transition-colors flex items-center justify-center"
                    title={`Add size ${v.size}`}
                  >
                    {v.size || 'OS'}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Product Information ── */}
      <div className="pt-3 pb-1">
        {/* Category / Material subtitle */}
        <p className="text-[11px] font-sans text-text-muted uppercase tracking-[0.15em] mb-1">
          {product.category?.name || 'Collection'}
        </p>

        {/* Product Title */}
        <Link to={`/products/${product.slug}`} className="block">
          <h3 className="font-editorial text-lg text-brand-black group-hover:text-accent transition-colors tracking-tight line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Price & Swatches row */}
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs font-sans font-medium text-brand-black tracking-wide">
            {formatPrice(product.min_price_cents)}
            {product.min_price_cents !== product.max_price_cents && (
              <span className="text-text-muted font-normal"> — {formatPrice(product.max_price_cents)}</span>
            )}
          </p>

          {/* Color swatches */}
          {colors.length > 1 && (
            <div className="flex items-center gap-1">
              {colors.slice(0, 4).map((color, idx) => (
                <span
                  key={idx}
                  className="w-2.5 h-2.5 rounded-full border border-border/80"
                  style={{
                    backgroundColor:
                      color.toLowerCase() === 'black' ? '#1c1c1c' :
                      color.toLowerCase() === 'white' ? '#f5f5f5' :
                      color.toLowerCase() === 'taupe' ? '#8b8589' :
                      color.toLowerCase() === 'olive' ? '#556b2f' :
                      color.toLowerCase() === 'navy' ? '#000080' :
                      color.toLowerCase() === 'beige' ? '#d4be8d' : '#cccccc',
                  }}
                  title={color}
                />
              ))}
              {colors.length > 4 && (
                <span className="text-[10px] text-text-muted font-sans font-light">+{colors.length - 4}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
