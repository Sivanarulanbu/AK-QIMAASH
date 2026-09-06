import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useAdminOrders, useAdminOrder, useUpdateOrderStatus } from '@/features/orders/useOrders'
import { OrderStatusBadge } from '@/pages/order/OrderPages'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/FormFields'
import { Modal } from '@/components/ui/Drawer'
import { Pagination } from '@/components/ui/Navigation'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { formatPrice, COMMERCE_CONFIG } from '@/lib/commerce'
import { formatDate, formatDateTime } from '@/utils'
import { Can } from '@/features/auth/PermissionGate'
import type { Database } from '@/types/database'

type OrderStatus = Database['public']['Enums']['order_status']

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All statuses' },
  ...COMMERCE_CONFIG.ORDER_STATUSES.map((s) => ({
    value: s,
    label: s.replace(/_/g, ' '),
  })),
  { value: 'CANCELLED', label: 'CANCELLED' },
]

const PER_PAGE = 20

export function AdminOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [statusModal, setStatusModal] = useState(false)

  const status = searchParams.get('status') || 'ALL'
  const page = parseInt(searchParams.get('page') || '1', 10)

  const { data, isLoading } = useAdminOrders({
    status: status === 'ALL' ? undefined : status,
    search,
    page,
    per_page: PER_PAGE,
  })

  const totalPages = data ? Math.ceil(data.total / PER_PAGE) : 0

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Orders</h1>
        <span className="text-sm text-text-muted">{data?.total ?? 0} total</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" aria-hidden="true" />
          <input
            type="search"
            placeholder="Order number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-9"
            aria-label="Search orders"
          />
        </div>
        <Select
          options={STATUS_OPTIONS}
          value={status}
          onChange={(e) => {
            const next = new URLSearchParams(searchParams)
            next.set('status', e.target.value)
            next.delete('page')
            setSearchParams(next)
          }}
          className="w-auto min-w-[180px]"
          aria-label="Filter by status"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={8} cols={5} />
        ) : data?.orders.length === 0 ? (
          <p className="text-center py-12 text-sm text-text-muted">No orders found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.orders.map((order: any) => (
                    <tr key={order.id}>
                      <td>
                        <p className="text-sm font-medium text-text-primary">{order.order_number}</p>
                        <p className="text-xs text-text-muted">{(order.profiles as any)?.email}</p>
                      </td>
                      <td className="text-sm">{formatDate(order.created_at)}</td>
                      <td>
                        <OrderStatusBadge status={order.status as OrderStatus} />
                      </td>
                      <td className="text-sm font-medium">{formatPrice(order.total_cents)}</td>
                      <td>
                        <div className="flex gap-2">
                          <Link to={`/admin/orders/${order.id}`} className="text-xs text-accent hover:underline">
                            View
                          </Link>
                          <Can resource="orders" action="update_status">
                            <button
                              onClick={() => {
                                setSelectedOrderId(order.id)
                                setStatusModal(true)
                              }}
                              className="text-xs text-text-muted hover:text-text-primary"
                            >
                              Update
                            </button>
                          </Can>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-border">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={(p) => {
                    const next = new URLSearchParams(searchParams)
                    next.set('page', String(p))
                    setSearchParams(next)
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Status update modal */}
      <StatusUpdateModal
        orderId={selectedOrderId}
        isOpen={statusModal}
        onClose={() => {
          setStatusModal(false)
          setSelectedOrderId(null)
        }}
      />
    </div>
  )
}

function StatusUpdateModal({
  orderId,
  isOpen,
  onClose,
}: {
  orderId: string | null
  isOpen: boolean
  onClose: () => void
}) {
  const { data: order } = useAdminOrder(orderId!)
  const { mutateAsync: updateStatus, isPending } = useUpdateOrderStatus()
  const [newStatus, setNewStatus] = useState('')
  const [note, setNote] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [courierName, setCourierName] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!orderId) return null

  const allowedTransitions = order
    ? (COMMERCE_CONFIG.STATUS_TRANSITIONS as any)[order.status] || []
    : []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStatus || !orderId) return
    setError(null)
    try {
      await updateStatus({
        orderId,
        status: newStatus,
        note: note || undefined,
        tracking_number: trackingNumber || undefined,
        courier_name: courierName || undefined,
      })
      onClose()
    } catch (err: any) {
      setError('Failed to update order status. Please try again.')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Order Status">
      {order && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-text-secondary">
            Order <span className="font-semibold text-text-primary">{order.order_number}</span>
            {' '}— current status: <OrderStatusBadge status={order.status as OrderStatus} />
          </p>

          {error && (
            <div role="alert" className="p-3 bg-error-light rounded text-sm text-error-dark">
              {error}
            </div>
          )}

          <div>
            <label className="label">New status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="select-base"
              required
              aria-label="Select new status"
            >
              <option value="">Select status...</option>
              {allowedTransitions.map((s: string) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          {(newStatus === 'SHIPPED' || newStatus === 'OUT_FOR_DELIVERY') && (
            <>
              <Input
                label="Courier name"
                placeholder="e.g. Ninja Van"
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
              />
              <Input
                label="Tracking number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
            </>
          )}

          <div>
            <label className="label">Note (optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="textarea-base"
              placeholder="Internal note for this status change"
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="ghost" size="md" type="button" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              className="flex-1"
              isLoading={isPending}
              disabled={!newStatus}
            >
              Update Status
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
