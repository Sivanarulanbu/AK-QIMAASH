import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import { Drawer } from '@/components/ui/Drawer'
import { Button } from '@/components/ui/Button'
import { formatPrice, calculateOrderTotals } from '@/lib/commerce'
import { cn } from '@/utils'

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotalCents } = useCartStore()
  const subtotal = subtotalCents()
  const { gst, delivery, total } = calculateOrderTotals(subtotal)

  return (
    <Drawer
      isOpen={isOpen}
      onClose={closeCart}
      title={`Bag (${items.length})`}
      width="w-full sm:w-[440px]"
    >
      <div className="flex flex-col h-full">
        {items.length === 0 ? (
          // Empty state
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="w-16 h-16 bg-surface-sunken rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="h-7 w-7 text-text-muted" />
            </div>
            <h3 className="text-base font-medium text-text-primary mb-2">Your bag is empty</h3>
            <p className="text-sm text-text-muted mb-6">
              Add items to your bag to see them here.
            </p>
            <Button
              variant="secondary"
              size="md"
              onClick={closeCart}
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            {/* Cart items */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onRemove={() => removeItem(item.variantId)}
                  onUpdateQuantity={(qty) => updateQuantity(item.variantId, qty)}
                />
              ))}
            </div>

            {/* Summary + CTA */}
            <div className="border-t border-border px-5 py-5 space-y-3 bg-surface">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-text-secondary">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-text-secondary">
                  <span>GST (9%)</span>
                  <span>{formatPrice(gst)}</span>
                </div>
                <div className="flex justify-between text-sm text-text-secondary">
                  <span>Delivery</span>
                  <span>
                    {delivery === 0 ? (
                      <span className="text-success">Free</span>
                    ) : (
                      formatPrice(delivery)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-semibold text-text-primary pt-2 border-t border-border">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {delivery > 0 && (
                <p className="text-xs text-text-muted">
                  Add {formatPrice(10000 - subtotal)} more for free delivery.
                </p>
              )}

              <Link
                to="/checkout"
                onClick={closeCart}
                className="btn-xl btn-primary w-full justify-center"
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>

              <p className="text-xs text-text-muted text-center">
                Cash on Delivery &middot; Safe & Secure
              </p>
            </div>
          </>
        )}
      </div>
    </Drawer>
  )
}

function CartItem({
  item,
  onRemove,
  onUpdateQuantity,
}: {
  item: ReturnType<typeof useCartStore.getState>['items'][0]
  onRemove: () => void
  onUpdateQuantity: (qty: number) => void
}) {
  return (
    <div className="flex gap-3">
      {/* Product image */}
      <div className="w-20 h-24 flex-shrink-0 bg-surface-sunken rounded overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.productName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-surface-sunken" />
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link
          to={`/products/${item.productSlug}`}
          className="text-sm font-medium text-text-primary hover:text-accent transition-colors line-clamp-2 leading-snug"
        >
          {item.productName}
        </Link>
        <div className="flex items-center gap-2 mt-0.5">
          {item.variantSize && (
            <span className="text-xs text-text-muted">{item.variantSize}</span>
          )}
          {item.variantColor && item.variantSize && (
            <span className="text-xs text-text-muted">·</span>
          )}
          {item.variantColor && (
            <span className="text-xs text-text-muted">{item.variantColor}</span>
          )}
        </div>
        <p className="text-sm font-semibold text-text-primary mt-1.5">
          {formatPrice(item.priceCents)}
        </p>

        {/* Quantity + Remove */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center border border-border rounded">
            <button
              onClick={() => onUpdateQuantity(item.quantity - 1)}
              className="w-7 h-7 flex items-center justify-center text-text-secondary
                         hover:text-text-primary transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-7 text-center text-sm font-medium text-text-primary">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.quantity + 1)}
              className="w-7 h-7 flex items-center justify-center text-text-secondary
                         hover:text-text-primary transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <button
            onClick={onRemove}
            className="p-1.5 text-text-muted hover:text-error transition-colors duration-150"
            aria-label="Remove item"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
