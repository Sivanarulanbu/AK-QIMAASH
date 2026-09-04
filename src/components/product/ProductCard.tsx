import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { cn } from '@/utils'
import { formatPrice } from '@/lib/commerce'
import { useWishlistStore } from '@/store/wishlistStore'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import type { ProductWithDetails } from '@/features/products/useProducts'

interface ProductCardProps {
  product: ProductWithDetails
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { isInWishlist, toggleProduct } = useWishlistStore()
  const isWishlisted = isInWishlist(product.id)

  const hasDiscount = product.variants.some(
    (v) => v.compare_price_cents && v.compare_price_cents > v.price_cents
  )

  const isOutOfStock = !product.variants.some(
    (v) => v.is_active && v.stock_quantity > 0
  )

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleProduct(product.id)
  }

  return (
    <Link
      to={`/products/${product.slug}`}
      className={cn('product-card group block', className)}
      aria-label={product.name}
    >
      {/* Image container */}
      <div className="product-card-image">
        {product.primary_image ? (
          <ImageWithFallback
            src={product.primary_image}
            alt={product.name}
            className="group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-surface-sunken flex items-center justify-center">
            <span className="text-xs text-text-disabled">No image</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasDiscount && (
            <span className="badge-accent text-[10px] px-2 py-0.5 uppercase tracking-wide">
              Sale
            </span>
          )}
          {isOutOfStock && (
            <span className="badge-default text-[10px] px-2 py-0.5 uppercase tracking-wide">
              Sold out
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlistToggle}
          className={cn(
            'absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center',
            'bg-white/80 backdrop-blur-sm transition-colors duration-150',
            'opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
            isWishlisted && 'opacity-100'
          )}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={isWishlisted}
        >
          <Heart
            className={cn(
              'h-4 w-4 transition-colors duration-150',
              isWishlisted ? 'fill-accent stroke-accent' : 'stroke-text-secondary'
            )}
          />
        </button>
      </div>

      {/* Product info */}
      <div className="mt-3 px-0.5">
        {product.category && (
          <p className="text-2xs text-text-muted uppercase tracking-caps mb-1">
            {product.category.name}
          </p>
        )}
        <h3 className="text-sm font-medium text-text-primary leading-snug line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2 mt-1.5">
          <span className="text-sm font-semibold text-text-primary">
            {formatPrice(product.min_price_cents)}
          </span>
          {product.min_price_cents !== product.max_price_cents && (
            <span className="text-xs text-text-muted">
              — {formatPrice(product.max_price_cents)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
