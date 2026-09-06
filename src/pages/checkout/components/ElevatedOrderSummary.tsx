import { formatPrice } from '@/lib/commerce'
import { useCartStore } from '@/store/cartStore'

interface ElevatedOrderSummaryProps {
  items: ReturnType<typeof useCartStore.getState>['items']
  subtotal: number
  gst: number
  delivery: number
  total: number
}

export function ElevatedOrderSummary({
  items,
  subtotal,
  gst,
  delivery,
  total,
}: ElevatedOrderSummaryProps) {
  return (
    <div className="bg-surface-raised border border-border rounded-lg p-5 shadow-xs sticky top-24">
      {/* Header */}
      <div className="flex items-baseline justify-between pb-3 mb-4 border-b border-border">
        <h3 className="text-xs uppercase font-sans font-semibold tracking-wider text-text-primary">
          Order Summary
        </h3>
        <span className="text-xs font-sans text-text-muted">
          {items.length} {items.length === 1 ? 'piece' : 'pieces'}
        </span>
      </div>

      {/* Items List */}
      <div className="space-y-3.5 mb-4 max-h-[300px] overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3 items-center">
            <div className="w-14 aspect-[3/4] bg-brand-ivory rounded overflow-hidden shrink-0 border border-border/60">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.productName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[9px] font-sans tracking-widest text-text-disabled">
                  AK
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-editorial text-sm text-text-primary truncate">
                {item.productName}
              </p>
              <p className="text-[11px] font-sans text-text-muted">
                {[item.variantSize ? `Size ${item.variantSize}` : null, item.variantColor]
                  .filter(Boolean)
                  .join(' · ')}
                {' · Qty '}
                {item.quantity}
              </p>
              <p className="text-xs font-sans font-medium text-text-primary mt-0.5">
                {formatPrice(item.priceCents * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing Breakdown */}
      <div className="border-t border-border pt-3.5 space-y-2 text-xs font-sans">
        <div className="flex justify-between text-text-secondary">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-text-secondary">
          <span>Singapore GST (9%)</span>
          <span>{formatPrice(gst)}</span>
        </div>
        <div className="flex justify-between text-text-secondary">
          <span>Delivery</span>
          <span>
            {delivery === 0 ? (
              <span className="text-emerald-800 font-medium uppercase tracking-wider">Free</span>
            ) : (
              formatPrice(delivery)
            )}
          </span>
        </div>

        <div className="flex justify-between text-sm font-semibold text-text-primary pt-3 border-t border-border">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  )
}
