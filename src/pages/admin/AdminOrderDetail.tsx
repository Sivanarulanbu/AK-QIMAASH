import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAdminOrder, useUpdateOrderStatus } from '@/features/orders/useOrders'
import { OrderStatusBadge } from '@/pages/order/OrderPages'
import { formatPrice, COMMERCE_CONFIG } from '@/lib/commerce'
import { formatDate, formatDateTime } from '@/utils'
import { Skeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'
import { Input } from '@/components/ui/FormFields'
import type { Database } from '@/types/database'

type OrderStatus = Database['public']['Enums']['order_status']

export function AdminOrderDetail() {
  const { orderId } = useParams<{ orderId: string }>()
  const { data: order, isLoading } = useAdminOrder(orderId!)
  const { mutateAsync: updateStatus, isPending } = useUpdateOrderStatus()
  const [newStatus, setNewStatus] = useState('')
  const [note, setNote] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [courierName, setCourierName] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (isLoading) return <div className="space-y-3"><Skeleton className="h-6 w-48" /><Skeleton className="h-60 w-full" /></div>
  if (!order) return <p className="text-text-muted text-sm">Order not found.</p>

  const allowedTransitions = (COMMERCE_CONFIG.STATUS_TRANSITIONS as any)[order.status] || []
  const address = order.address_snapshot as any
  const profile = (order as any).profiles

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStatus) return
    setError(null)
    try {
      await updateStatus({ orderId: orderId!, status: newStatus, note, tracking_number: trackingNumber, courier_name: courierName })
      setNewStatus(''); setNote(''); setTrackingNumber(''); setCourierName('')
    } catch {
      setError('Failed to update status.')
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link to="/admin/orders" className="btn-icon btn-ghost"><ArrowLeft className="h-4 w-4" /></Link>
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Order {order.order_number}</h1>
          <p className="text-sm text-text-muted">{formatDate(order.created_at)}</p>
        </div>
        <OrderStatusBadge status={order.status as OrderStatus} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Items */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold mb-4">Items ({order.items.length})</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium text-text-primary">{item.product_name}</p>
                    <p className="text-text-muted text-xs">
                      SKU: {item.variant_sku} · {[item.variant_size, item.variant_color].filter(Boolean).join(' / ')} · Qty {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">{formatPrice(item.total_price_cents)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-4 pt-3 space-y-1.5">
              <Row label="Subtotal" value={formatPrice(order.subtotal_cents)} />
              <Row label="GST" value={formatPrice(order.gst_cents)} />
              <Row label="Delivery" value={order.delivery_cents === 0 ? 'Free' : formatPrice(order.delivery_cents)} />
              <div className="flex justify-between font-semibold text-sm pt-1 border-t border-border">
                <span>Total</span><span>{formatPrice(order.total_cents)}</span>
              </div>
            </div>
          </div>

          {/* Status update */}
          {allowedTransitions.length > 0 && (
            <div className="card p-5">
              <h2 className="text-sm font-semibold mb-4">Update status</h2>
              <form onSubmit={handleUpdateStatus} className="space-y-3">
                {error && <div role="alert" className="p-3 bg-error-light rounded text-sm text-error-dark">{error}</div>}
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="select-base"
                  aria-label="Select new status"
                >
                  <option value="">Select new status...</option>
                  {allowedTransitions.map((s: string) => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                  ))}
                </select>
                {(newStatus === 'SHIPPED' || newStatus === 'OUT_FOR_DELIVERY') && (
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Courier" value={courierName} onChange={(e) => setCourierName(e.target.value)} placeholder="Ninja Van" />
                    <Input label="Tracking number" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
                  </div>
                )}
                <textarea value={note} onChange={(e) => setNote(e.target.value)} className="textarea-base" placeholder="Internal note (optional)" rows={2} />
                <Button type="submit" variant="primary" size="md" isLoading={isPending} disabled={!newStatus}>
                  Update Status
                </Button>
              </form>
            </div>
          )}

          {/* Status history */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold mb-4">Status history</h2>
            <div className="space-y-2">
              {[...(order.status_history || [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((h) => (
                <div key={h.id} className="flex items-start justify-between text-sm py-1.5 border-b border-border-subtle last:border-0">
                  <div>
                    <OrderStatusBadge status={h.status as OrderStatus} />
                    {h.note && <p className="text-xs text-text-muted mt-0.5">{h.note}</p>}
                  </div>
                  <p className="text-xs text-text-muted">{formatDateTime(h.created_at)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {profile && (
            <div className="card p-4">
              <h2 className="text-xs font-semibold uppercase tracking-caps text-text-muted mb-3">Customer</h2>
              <p className="text-sm font-medium">{profile.full_name}</p>
              <p className="text-sm text-text-secondary">{profile.email}</p>
              {profile.phone && <p className="text-sm text-text-secondary">{profile.phone}</p>}
            </div>
          )}
          <div className="card p-4">
            <h2 className="text-xs font-semibold uppercase tracking-caps text-text-muted mb-3">Delivery address</h2>
            <p className="text-sm">{address?.recipient_name}</p>
            <p className="text-sm text-text-secondary">{address?.phone}</p>
            <p className="text-sm text-text-secondary">
              {[address?.block_building, address?.street].filter(Boolean).join(', ')}
              {address?.unit_number && `, ${address.unit_number}`}
            </p>
            <p className="text-sm text-text-secondary">Singapore {address?.postal_code}</p>
          </div>
          <div className="card p-4">
            <h2 className="text-xs font-semibold uppercase tracking-caps text-text-muted mb-2">Payment</h2>
            <p className="text-sm">Cash on Delivery</p>
            <p className="text-sm text-text-secondary capitalize">{order.payment_status.toLowerCase()}</p>
          </div>
          {order.tracking_number && (
            <div className="card p-4">
              <h2 className="text-xs font-semibold uppercase tracking-caps text-text-muted mb-2">Tracking</h2>
              {order.courier_name && <p className="text-sm">{order.courier_name}</p>}
              <p className="text-sm font-mono text-text-secondary">{order.tracking_number}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm text-text-secondary">
      <span>{label}</span><span>{value}</span>
    </div>
  )
}
