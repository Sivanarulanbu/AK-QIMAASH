import { Link } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import { CheckCircle, Circle, ArrowLeft } from 'lucide-react'
import { useMyOrders, useOrder, type OrderWithDetails } from '@/features/orders/useOrders'
import { formatPrice } from '@/lib/commerce'
import { formatDate, formatDateTime } from '@/utils'
import { SEOHead } from '@/components/seo/SEOHead'
import { Skeleton } from '@/components/ui/Skeleton'
import { Breadcrumb } from '@/components/ui/Navigation'
import { cn } from '@/utils'
import type { Database } from '@/types/database'

type OrderStatus = Database['public']['Enums']['order_status']

const STATUS_CONFIG: Record<OrderStatus, { label: string; description: string }> = {
  PLACED: { label: 'Order Placed', description: 'Your order has been received.' },
  CONFIRMED: { label: 'Confirmed', description: 'Your order has been confirmed and is being prepared.' },
  PROCESSING: { label: 'Processing', description: 'Your order is being packed and prepared for shipment.' },
  SHIPPED: { label: 'Shipped', description: 'Your order is on its way.' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', description: 'Your order is out for delivery today.' },
  DELIVERED: { label: 'Delivered', description: 'Your order has been delivered.' },
  CANCELLED: { label: 'Cancelled', description: 'This order has been cancelled.' },
}

const STATUS_ORDER: OrderStatus[] = [
  'PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED',
]

// ─── Orders List Page ─────────────────────────────────────────────────────────

export function OrdersPage() {
  const { data: orders, isLoading } = useMyOrders()

  return (
    <>
      <SEOHead title="My Orders — AK QIMAASH" description="View your order history." canonical="/account/orders" />
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-6">Orders</h2>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-4 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3.5 w-24" />
              </div>
            ))}
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-text-muted text-sm mb-4">No orders yet.</p>
            <Link to="/shop" className="btn-md btn-secondary">
              Browse products
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

function OrderRow({ order }: { order: OrderWithDetails }) {
  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.PLACED
  return (
    <Link
      to={`/account/orders/${order.id}`}
      className="card p-4 flex items-center justify-between gap-4 hover:shadow-card transition-shadow duration-200"
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-text-primary">{order.order_number}</p>
        <p className="text-xs text-text-muted mt-0.5">{formatDate(order.created_at)}</p>
        <p className="text-xs text-text-muted mt-0.5">
          {(order.items || (order as any).order_items || []).length}{' '}
          {(order.items || (order as any).order_items || []).length === 1 ? 'item' : 'items'}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <OrderStatusBadge status={order.status} />
        <p className="text-sm font-semibold text-text-primary">{formatPrice(order.total_cents)}</p>
      </div>
    </Link>
  )
}

// ─── Order Detail Page ────────────────────────────────────────────────────────

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const { data: order, isLoading } = useOrder(orderId!)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-text-muted text-sm">Order not found.</p>
        <Link to="/account/orders" className="btn-md btn-secondary mt-4">
          Back to orders
        </Link>
      </div>
    )
  }

  const address = order.address_snapshot as any

  return (
    <>
      <SEOHead title={`Order ${order.order_number} — AK QIMAASH`} description="View your order details." canonical={`/account/orders/${order.id}`} />
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/account/orders" className="btn-icon btn-ghost" aria-label="Back to orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Order {order.order_number}</h2>
            <p className="text-sm text-text-muted">{formatDate(order.created_at)}</p>
          </div>
        </div>

        {/* Status */}
        <OrderStatusBadge status={order.status} />

        {/* Timeline */}
        <OrderTimeline order={order} />

        {/* Items */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">
            Items ({(order.items || (order as any).order_items || []).length})
          </h3>
          <div className="space-y-4">
            {(order.items || (order as any).order_items || []).map((item: any) => (
              <div key={item.id} className="flex gap-3">
                <div className="w-14 h-14 bg-surface-sunken rounded flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">{item.product_name}</p>
                  <p className="text-xs text-text-muted">
                    {[item.variant_size, item.variant_color].filter(Boolean).join(' · ')}
                    {' '}· Qty {item.quantity}
                  </p>
                  <p className="text-sm font-semibold mt-0.5">{formatPrice(item.total_price_cents)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price breakdown */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Payment summary</h3>
          <div className="space-y-2">
            <Row label="Subtotal" value={formatPrice(order.subtotal_cents)} />
            <Row label="GST (9%)" value={formatPrice(order.gst_cents)} />
            <Row label="Delivery" value={order.delivery_cents === 0 ? 'Free' : formatPrice(order.delivery_cents)} />
            <div className="flex justify-between text-base font-semibold text-text-primary pt-2 border-t border-border">
              <span>Total</span>
              <span>{formatPrice(order.total_cents)}</span>
            </div>
          </div>
          <p className="text-xs text-text-muted mt-3">
            Payment: Cash on Delivery
          </p>
        </div>

        {/* Delivery address */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Delivery address</h3>
          <p className="text-sm text-text-secondary">{address?.recipient_name}</p>
          <p className="text-sm text-text-secondary">{address?.phone}</p>
          <p className="text-sm text-text-secondary">
            {[address?.block_building, address?.street].filter(Boolean).join(', ')}
            {address?.unit_number && `, ${address.unit_number}`}
          </p>
          <p className="text-sm text-text-secondary">Singapore {address?.postal_code}</p>
        </div>

        {/* Courier tracking */}
        {order.tracking_number && (
          <div className="card p-4 bg-accent-subtle border-accent/30">
            <p className="text-sm font-medium text-text-primary mb-1">Tracking</p>
            <p className="text-sm text-text-secondary">
              {order.courier_name && `${order.courier_name} · `}
              {order.tracking_number}
            </p>
          </div>
        )}
      </div>
    </>
  )
}

function OrderTimeline({ order }: { order: OrderWithDetails }) {
  const isCancelled = order.status === 'CANCELLED'
  const currentIndex = STATUS_ORDER.indexOf(order.status as any)

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-text-primary mb-5">Order status</h3>
      <ol className="relative space-y-0">
        {STATUS_ORDER.map((status, index) => {
          const config = STATUS_CONFIG[status]
          const history = order.status_history.find((h) => h.status === status)
          const isCompleted = currentIndex >= index
          const isCurrent = order.status === status

          return (
            <li key={status} className="flex gap-4 pb-6 last:pb-0 relative">
              {/* Connecting line */}
              {index < STATUS_ORDER.length - 1 && (
                <div
                  className={cn(
                    'absolute left-[13px] top-6 bottom-0 w-px',
                    isCompleted && !isCancelled ? 'bg-success' : 'bg-border'
                  )}
                  aria-hidden="true"
                />
              )}

              {/* Icon */}
              <div className="flex-shrink-0 z-10">
                {isCompleted && !isCancelled ? (
                  <CheckCircle className="h-7 w-7 text-success" aria-hidden="true" />
                ) : (
                  <Circle
                    className={cn('h-7 w-7', isCurrent ? 'text-accent' : 'text-border-strong')}
                    aria-hidden="true"
                  />
                )}
              </div>

              {/* Content */}
              <div className="pt-0.5">
                <p
                  className={cn(
                    'text-sm font-medium',
                    isCurrent ? 'text-text-primary' : isCompleted ? 'text-text-primary' : 'text-text-disabled'
                  )}
                >
                  {config.label}
                </p>
                {isCurrent && (
                  <p className="text-xs text-text-muted mt-0.5">{config.description}</p>
                )}
                {history && (
                  <p className="text-xs text-text-muted mt-0.5">
                    {formatDateTime(history.created_at)}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm text-text-secondary">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const statusClass: Record<OrderStatus, string> = {
    PLACED: 'status-placed',
    CONFIRMED: 'status-confirmed',
    PROCESSING: 'status-processing',
    SHIPPED: 'status-shipped',
    OUT_FOR_DELIVERY: 'status-out-delivery',
    DELIVERED: 'status-delivered',
    CANCELLED: 'status-cancelled',
  }
  const config = STATUS_CONFIG[status]

  return (
    <span className={statusClass[status]}>
      {config?.label || status}
    </span>
  )
}
