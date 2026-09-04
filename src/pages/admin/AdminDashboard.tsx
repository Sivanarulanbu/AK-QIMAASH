import { useState } from 'react'
import { AlertTriangle, Package, ShoppingBag, TrendingUp, Clock } from 'lucide-react'
import { useOrderStats } from '@/features/orders/useOrders'
import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'
import { formatPrice } from '@/lib/commerce'
import { formatDate } from '@/utils'
import { Skeleton } from '@/components/ui/Skeleton'
import { OrderStatusBadge } from '@/pages/order/OrderPages'
import { Link } from 'react-router-dom'
import type { Database } from '@/types/database'

type OrderStatus = Database['public']['Enums']['order_status']

export function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useOrderStats()

  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['admin-recent-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, status, total_cents, created_at')
        .order('created_at', { ascending: false })
        .limit(5)
      if (error) throw error
      return data
    },
  })

  const { data: lowStockVariants, isLoading: stockLoading } = useQuery({
    queryKey: ['admin-low-stock'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_variants')
        .select('id, sku, stock_quantity, products(name)')
        .lte('stock_quantity', 5)
        .eq('is_active', true)
        .limit(5)
      if (error) throw error
      return data
    },
  })

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Overview</h1>
        <p className="text-sm text-text-muted mt-0.5">Order and inventory summary.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-5 space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-10" />
            </div>
          ))
        ) : (
          <>
            <StatCard title="Total Orders" value={stats?.total ?? 0} icon={ShoppingBag} />
            <StatCard title="Pending" value={stats?.pending ?? 0} icon={Clock} highlight />
            <StatCard title="Processing" value={stats?.PROCESSING ?? 0} icon={Package} />
            <StatCard title="Delivered" value={stats?.DELIVERED ?? 0} icon={TrendingUp} />
          </>
        )}
      </div>

      {/* Status breakdown */}
      {!statsLoading && stats && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Status breakdown</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {([
              ['PLACED', stats.PLACED],
              ['CONFIRMED', stats.CONFIRMED],
              ['PROCESSING', stats.PROCESSING],
              ['SHIPPED', stats.SHIPPED],
              ['OUT_FOR_DELIVERY', stats.OUT_FOR_DELIVERY],
              ['DELIVERED', stats.DELIVERED],
              ['CANCELLED', stats.CANCELLED],
            ] as [string, number][]).map(([status, count]) => (
              <Link
                key={status}
                to={`/admin/orders?status=${status}`}
                className="text-center p-3 bg-surface rounded-lg hover:bg-surface-sunken transition-colors"
              >
                <p className="text-xl font-semibold text-text-primary">{count}</p>
                <p className="text-[10px] text-text-muted mt-0.5 uppercase tracking-wide">
                  {status.replace('_', ' ')}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent orders */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-text-primary">Recent orders</h2>
            <Link to="/admin/orders" className="text-xs text-text-muted hover:text-text-primary">
              View all
            </Link>
          </div>
          {ordersLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : recentOrders?.length === 0 ? (
            <p className="p-5 text-sm text-text-muted">No orders yet.</p>
          ) : (
            <table className="table-base">
              <tbody>
                {recentOrders?.map((order: any) => (
                  <tr key={order.id}>
                    <td>
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="text-sm font-medium text-text-primary hover:text-accent"
                      >
                        {order.order_number}
                      </Link>
                      <p className="text-xs text-text-muted">{formatDate(order.created_at)}</p>
                    </td>
                    <td>
                      <OrderStatusBadge status={order.status as OrderStatus} />
                    </td>
                    <td className="text-right text-sm font-medium">
                      {formatPrice(order.total_cents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Low stock alerts */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-text-primary">Low stock</h2>
            </div>
            <Link to="/admin/inventory" className="text-xs text-text-muted hover:text-text-primary">
              Manage
            </Link>
          </div>
          {stockLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : lowStockVariants?.length === 0 ? (
            <p className="p-5 text-sm text-text-muted">All variants are well-stocked.</p>
          ) : (
            <table className="table-base">
              <tbody>
                {lowStockVariants?.map((v: any) => (
                  <tr key={v.id}>
                    <td>
                      <p className="text-sm font-medium text-text-primary">{v.products?.name}</p>
                      <p className="text-xs text-text-muted font-mono">{v.sku}</p>
                    </td>
                    <td className="text-right">
                      <span className={`text-sm font-semibold ${v.stock_quantity === 0 ? 'text-error' : 'text-warning'}`}>
                        {v.stock_quantity} left
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  highlight = false,
}: {
  title: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  highlight?: boolean
}) {
  return (
    <div className={`card p-5 ${highlight && value > 0 ? 'border-warning/40 bg-warning-light/20' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-text-muted uppercase tracking-caps">{title}</p>
        <Icon className={`h-4 w-4 ${highlight && value > 0 ? 'text-warning' : 'text-text-muted'}`} />
      </div>
      <p className="text-3xl font-semibold text-text-primary">{value}</p>
    </div>
  )
}
