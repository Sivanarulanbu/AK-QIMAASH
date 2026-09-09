import { Link } from 'react-router-dom'
import { Plus, Minus, X, ArrowRight, ShoppingBag, Truck, ShieldCheck, RotateCcw } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { formatPrice, calculateOrderTotals, COMMERCE_CONFIG } from '@/lib/commerce'
import { SEOHead } from '@/components/seo/SEOHead'
import { EmptyState } from '@/components/ui/EmptyState'
import { Breadcrumb } from '@/components/ui/Navigation'
import { cn } from '@/utils'

export function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, subtotalCents } = useCartStore()
  const subtotal = subtotalCents()
  const { gst, delivery, total } = calculateOrderTotals(subtotal)
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const freeShippingThreshold = COMMERCE_CONFIG.FREE_DELIVERY_THRESHOLD_CENTS
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))
  const remainingForFree = Math.max(0, freeShippingThreshold - subtotal)

  return (
    <>
      <SEOHead
        title={totalItemCount > 0 ? `Shopping Bag (${totalItemCount}) — AK QIMAASH` : 'Shopping Bag — AK QIMAASH'}
        description="Review selected pieces and garments in your shopping bag before continuing to checkout."
        canonical="/cart"
      />

      <div className="container-main py-8 sm:py-12">
        <Breadcrumb
          items={[
            { label: 'Shop', href: '/shop' },
            { label: 'Shopping Bag' },
          ]}
          className="mb-8"
        />

        {items.length === 0 ? (
          <div className="max-w-md mx-auto py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-brand-smoke flex items-center justify-center text-brand-black">
              <ShoppingBag className="h-7 w-7 stroke-[1.2]" />
            </div>
            <p className="editorial-subheading mb-2">Singapore Atelier</p>
            <h1 className="font-editorial text-3xl sm:text-4xl text-brand-black tracking-tight uppercase font-medium mb-3">
              Your Bag is Empty
            </h1>
            <p className="font-sans text-sm text-text-muted mb-8 font-light leading-relaxed">
              Explore our contemporary collection of modest garments, tailored silhouettes, and organic textiles.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-brand-black text-white text-xs uppercase tracking-[0.2em] font-sans font-medium hover:bg-brand-charcoal transition-colors rounded-xs shadow-xs"
            >
              Explore Pieces
              <ArrowRight className="h-3.5 w-3.5 ml-2" />
            </Link>
          </div>
        ) : (
          <div>
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-border/80 pb-5 mb-8 gap-2">
              <div>
                <p className="editorial-subheading mb-1">Singapore Atelier</p>
                <h1 className="font-editorial text-3xl sm:text-4xl text-brand-black tracking-tight uppercase font-medium">
                  Shopping Bag{' '}
                  <span className="font-sans text-sm font-normal text-text-muted align-middle ml-2">
                    ({totalItemCount} {totalItemCount === 1 ? 'piece' : 'pieces'})
                  </span>
                </h1>
              </div>
              <Link
                to="/shop"
                className="text-xs font-sans uppercase tracking-widest text-text-muted hover:text-brand-black transition-colors"
              >
                &larr; Continue Shopping
              </Link>
            </div>

            {/* 2-Column Editorial Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-14 items-start">
              {/* Left: Item List */}
              <div className="divide-y divide-border/60">
                {items.map((item) => (
                  <div key={item.id} className="py-6 first:pt-0 last:pb-0 flex gap-4 sm:gap-6">
                    {/* Thumbnail */}
                    <Link
                      to={`/products/${item.productSlug}`}
                      className="w-24 sm:w-28 aspect-[3/4] bg-brand-ivory flex-shrink-0 overflow-hidden rounded-xs block group"
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-text-disabled">
                          AK
                        </div>
                      )}
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <Link
                            to={`/products/${item.productSlug}`}
                            className="font-editorial text-base sm:text-lg text-brand-black hover:text-accent transition-colors tracking-tight line-clamp-1 uppercase"
                          >
                            {item.productName}
                          </Link>
                          <button
                            onClick={() => removeItem(item.variantId)}
                            className="text-text-muted hover:text-brand-black p-1 transition-colors"
                            aria-label={`Remove ${item.productName}`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Specs */}
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-sans text-text-secondary">
                          {item.variantColor && <span>Color: {item.variantColor}</span>}
                          {item.variantColor && item.variantSize && <span>&middot;</span>}
                          {item.variantSize && <span>Size: {item.variantSize}</span>}
                        </div>

                        {/* Unit price */}
                        <p className="text-xs font-sans text-text-muted mt-1 font-light">
                          Price per piece: {formatPrice(item.priceCents)}
                        </p>
                      </div>

                      {/* Quantity & Item Subtotal */}
                      <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-3">
                        <div className="flex items-center border border-border h-8 rounded-xs bg-surface-raised">
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="w-8 h-full flex items-center justify-center text-text-secondary hover:text-brand-black transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-sans font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            className="w-8 h-full flex items-center justify-center text-text-secondary hover:text-brand-black transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <span className="font-sans text-sm font-medium text-brand-black">
                          {formatPrice(item.priceCents * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Clear Cart Button */}
                <div className="pt-6 flex justify-end">
                  <button
                    onClick={clearCart}
                    className="text-xs font-sans text-text-muted hover:text-rose-700 underline underline-offset-4 transition-colors"
                  >
                    Clear shopping bag
                  </button>
                </div>
              </div>

              {/* Right: Elevated Order Summary */}
              <div className="bg-surface-raised border border-border/80 rounded-xs p-6 sm:p-7 space-y-5 sticky top-28 shadow-xs">
                <h2 className="font-editorial text-xl text-brand-black uppercase tracking-tight font-medium pb-3 border-b border-border/80">
                  Summary
                </h2>

                {/* Free Delivery Meter */}
                <div className="space-y-2 pb-4 border-b border-border/60">
                  <div className="text-xs font-sans">
                    {remainingForFree > 0 ? (
                      <span className="text-text-secondary">
                        Add <strong className="text-brand-black font-semibold">{formatPrice(remainingForFree)}</strong> more to unlock complimentary Singapore delivery.
                      </span>
                    ) : (
                      <span className="text-emerald-800 font-medium flex items-center gap-1.5">
                        <span>✓</span> Complimentary Singapore delivery unlocked.
                      </span>
                    )}
                  </div>
                  <div className="w-full h-1.5 bg-brand-smoke rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-black transition-all duration-500 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2.5 text-xs font-sans">
                  <div className="flex justify-between text-text-secondary">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>GST (9%) Included</span>
                    <span>{formatPrice(gst)}</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Estimated Delivery</span>
                    <span>
                      {delivery === 0 ? (
                        <span className="text-emerald-800 font-medium uppercase tracking-wider">Free</span>
                      ) : (
                        formatPrice(delivery)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-medium text-brand-black pt-3 border-t border-border">
                    <span>Total</span>
                    <span className="font-semibold">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Primary Checkout CTA */}
                <div className="space-y-2 pt-2">
                  <Link
                    to="/checkout"
                    className="w-full py-4 bg-brand-black text-brand-white text-xs uppercase tracking-[0.2em] font-sans font-medium flex items-center justify-center gap-2 hover:bg-brand-charcoal transition-colors rounded-xs shadow-xs"
                  >
                    Proceed to Checkout
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                  <p className="text-[11px] font-sans text-text-muted text-center tracking-wide">
                    Cash on Delivery Available &middot; Inspect on arrival
                  </p>
                </div>

                {/* Assurance points */}
                <div className="pt-4 border-t border-border/60 space-y-2.5 text-[11px] font-sans text-text-secondary">
                  <div className="flex items-center gap-2.5">
                    <Truck className="h-3.5 w-3.5 text-text-muted flex-shrink-0" />
                    <span>2–4 business days delivery across Singapore</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-text-muted flex-shrink-0" />
                    <span>Secure ordering directly with Singapore atelier</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <RotateCcw className="h-3.5 w-3.5 text-text-muted flex-shrink-0" />
                    <span>14-day unworn returns and size exchanges</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
