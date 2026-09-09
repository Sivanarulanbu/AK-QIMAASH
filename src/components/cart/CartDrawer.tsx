import { Plus, Minus, ArrowRight, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import { Drawer } from '@/components/ui/Drawer'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatPrice, calculateOrderTotals, COMMERCE_CONFIG } from '@/lib/commerce'

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotalCents } = useCartStore()
  const subtotal = subtotalCents()
  const { gst, delivery, total } = calculateOrderTotals(subtotal)
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const freeShippingThreshold = COMMERCE_CONFIG.FREE_DELIVERY_THRESHOLD_CENTS
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))
  const remainingForFree = Math.max(0, freeShippingThreshold - subtotal)

  return (
    <Drawer
      isOpen={isOpen}
      onClose={closeCart}
      title="YOUR BAG"
      width="w-full sm:w-[440px]"
    >
      <div className="flex flex-col h-full min-h-0 bg-surface overflow-hidden">
        {items.length === 0 ? (
          // Refined Empty State
          <div className="flex-1 flex items-center justify-center p-6">
            <EmptyState
              type="bag"
              onAction={closeCart}
              actionLabel="EXPLORE PIECES"
              actionTo="/shop"
            />
          </div>
        ) : (
          <>
            {/* Header sub-info */}
            <div className="flex-shrink-0 px-5 sm:px-6 py-2.5 border-b border-border/70 flex items-center justify-between text-xs font-sans text-text-muted uppercase tracking-wider bg-surface">
              <span>{totalItemCount} {totalItemCount === 1 ? 'Piece' : 'Pieces'}</span>
              <span>Singapore Atelier</span>
            </div>

            {/* Cart item list - dedicated scrolling area */}
            <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-6 py-3 divide-y divide-border/60 overscroll-contain">
              {items.map((item) => (
                <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex gap-3.5">
                  {/* Product Thumbnail */}
                  <div className="w-18 sm:w-20 aspect-[3/4] bg-brand-ivory flex-shrink-0 overflow-hidden rounded-xs">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-text-disabled">
                        AK
                      </div>
                    )}
                  </div>

                  {/* Item Metadata */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/products/${item.productSlug}`}
                          onClick={closeCart}
                          className="font-editorial text-sm sm:text-base text-brand-black hover:text-accent transition-colors line-clamp-1 uppercase tracking-tight"
                        >
                          {item.productName}
                        </Link>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="text-text-muted hover:text-brand-black transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <p className="text-xs font-sans text-text-muted mt-0.5 font-light">
                        {[item.variantColor, item.variantSize ? `Size ${item.variantSize}` : null]
                          .filter(Boolean)
                          .join(' · ') || 'Standard'}
                      </p>

                      <p className="text-xs font-sans font-medium text-brand-black mt-1">
                        {formatPrice(item.priceCents)}
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-border h-7 rounded-xs bg-white">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="w-6 h-full flex items-center justify-center text-text-secondary hover:text-brand-black transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-sans font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="w-6 h-full flex items-center justify-center text-text-secondary hover:text-brand-black transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Free shipping progress & summary footer - pinned to bottom */}
            <div className="flex-shrink-0 border-t border-border/80 bg-surface-raised px-5 py-3.5 sm:px-6 sm:py-4 space-y-2.5 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
              {/* Free delivery progress bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] sm:text-xs font-sans">
                  {remainingForFree > 0 ? (
                    <span className="text-text-secondary">
                      Add <strong className="text-brand-black font-semibold">{formatPrice(remainingForFree)}</strong> for complimentary delivery.
                    </span>
                  ) : (
                    <span className="text-emerald-800 font-medium flex items-center gap-1">
                      <span>✓</span> Complimentary Singapore delivery unlocked.
                    </span>
                  )}
                </div>
                <div className="w-full h-1 bg-brand-smoke rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-black transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-1 pt-1.5 border-t border-border/60 text-[11px] sm:text-xs font-sans">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Singapore GST (9%)</span>
                  <span>{formatPrice(gst)}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Estimated Delivery</span>
                  <span>{delivery === 0 ? <span className="text-emerald-800 font-medium uppercase tracking-wider">Free</span> : formatPrice(delivery)}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm font-medium text-brand-black pt-1.5 border-t border-border">
                  <span>Total</span>
                  <span className="font-semibold">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Checkout CTA button */}
              <div className="space-y-1.5 pt-0.5">
                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="w-full py-3 bg-brand-black text-brand-white text-xs uppercase tracking-[0.2em] font-sans font-medium flex items-center justify-center gap-2 hover:bg-brand-charcoal transition-colors rounded-xs shadow-xs"
                >
                  Proceed to Checkout
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                <Link
                  to="/cart"
                  onClick={closeCart}
                  className="w-full py-2 text-center text-xs uppercase tracking-wider font-sans font-medium text-brand-black hover:text-accent transition-colors border border-border/80 rounded-xs block"
                >
                  View Full Bag ({totalItemCount})
                </Link>

                <button
                  onClick={closeCart}
                  className="w-full py-1 text-center text-[11px] uppercase tracking-widest font-sans text-text-muted hover:text-brand-black transition-colors"
                >
                  Continue Shopping
                </button>
              </div>

              <p className="text-[10px] uppercase font-sans text-text-disabled text-center tracking-wider pt-0.5">
                Cash on Delivery Available &middot; 2–4 Days Singapore Delivery
              </p>
            </div>
          </>
        )}
      </div>
    </Drawer>
  )
}
