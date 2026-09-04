import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { Database } from '@/types/database'
import { sendOrderEmail } from '@/services/emailService'

type Order = Database['public']['Tables']['orders']['Row']
type OrderItem = Database['public']['Tables']['order_items']['Row']
type OrderStatusHistory = Database['public']['Tables']['order_status_history']['Row']

export interface OrderWithDetails extends Order {
  items: OrderItem[]
  status_history: OrderStatusHistory[]
}

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  myOrders: () => [...orderKeys.all, 'mine'] as const,
  detail: (id: string) => [...orderKeys.all, 'detail', id] as const,
  admin: (filters?: object) => [...orderKeys.all, 'admin', filters] as const,
}

// ─── Customer Hooks ───────────────────────────────────────────────────────────

export function useMyOrders() {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: orderKeys.myOrders(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*),
          order_status_history(*)
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []).map((o: any) => ({
        ...o,
        items: o.order_items || [],
        status_history: o.order_status_history || [],
      })) as OrderWithDetails[]
    },
    enabled: !!user,
  })
}

export function useOrder(orderId: string) {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*),
          order_status_history(*)
        `)
        .eq('id', orderId)
        .single()

      if (error || !data) throw error || new Error('Order not found')
      return {
        ...(data as any),
        items: (data as any).order_items || [],
        status_history: (data as any).order_status_history || [],
      } as OrderWithDetails
    },
    enabled: !!orderId && !!user,
  })
}

// ─── Admin Hooks ──────────────────────────────────────────────────────────────

export function useAdminOrders(filters: {
  status?: string
  search?: string
  page?: number
  per_page?: number
} = {}) {
  const { status, search, page = 1, per_page = 20 } = filters
  return useQuery({
    queryKey: orderKeys.admin(filters),
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select(`
          *,
          profiles!orders_user_id_fkey(full_name, email),
          order_items(*)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * per_page, page * per_page - 1)

      if (status && status !== 'ALL') {
        query = query.eq('status', status)
      }

      if (search) {
        query = query.or(`order_number.ilike.%${search}%`)
      }

      const { data, error, count } = await query
      if (error) throw error
      return {
        orders: (data || []).map((o: any) => ({
          ...o,
          items: o.order_items || [],
        })),
        total: count ?? 0,
      }
    },
  })
}

export function useAdminOrder(orderId: string) {
  return useQuery({
    queryKey: [...orderKeys.detail(orderId), 'admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles!orders_user_id_fkey(full_name, email, phone),
          order_items(*),
          order_status_history(*)
        `)
        .eq('id', orderId)
        .single()

      if (error || !data) throw error || new Error('Order not found')
      return {
        ...(data as any),
        items: (data as any).order_items || [],
        status_history: (data as any).order_status_history || [],
      } as OrderWithDetails & { profiles: { full_name: string; email: string; phone: string } | null }
    },
    enabled: !!orderId,
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  return useMutation({
    mutationFn: async ({
      orderId,
      status,
      note,
      tracking_number,
      courier_name,
    }: {
      orderId: string
      status: string
      note?: string
      tracking_number?: string
      courier_name?: string
    }) => {
      // Update order status
      const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() }
      if (tracking_number) updates.tracking_number = tracking_number
      if (courier_name) updates.courier_name = courier_name

      const { error: orderError } = await (supabase.from('orders') as any)
        .update(updates)
        .eq('id', orderId)
      if (orderError) throw orderError

      // Append status history
      const { error: historyError } = await (supabase.from('order_status_history') as any)
        .insert({
          order_id: orderId,
          status: status as any,
          note: note || null,
          created_by: user?.id ?? null,
        })
      if (historyError) throw historyError

      // Trigger status update email (via Edge Function or Brevo direct fallback)
      sendOrderEmail({
        orderId,
        status,
        tracking_number,
        courier_name,
        cancellation_reason: note,
      }).catch((err) => {
        console.warn('Order status email dispatch warning:', err)
      })
    },
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) })
      queryClient.invalidateQueries({ queryKey: orderKeys.admin() })
    },
  })
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export interface OrderStats {
  PLACED: number
  CONFIRMED: number
  PROCESSING: number
  SHIPPED: number
  OUT_FOR_DELIVERY: number
  DELIVERED: number
  CANCELLED: number
  total: number
  pending: number
}

export function useOrderStats() {
  return useQuery<OrderStats>({
    queryKey: ['order-stats'],
    queryFn: async (): Promise<OrderStats> => {
      const { data, error } = await supabase
        .from('orders')
        .select('status')

      if (error) throw error

      const counts: Record<string, number> = {
        PLACED: 0,
        CONFIRMED: 0,
        PROCESSING: 0,
        SHIPPED: 0,
        OUT_FOR_DELIVERY: 0,
        DELIVERED: 0,
        CANCELLED: 0,
      }

      for (const order of (data as any) || []) {
        if (order.status && counts[order.status] !== undefined) {
          counts[order.status]++
        }
      }

      return {
        PLACED: counts.PLACED || 0,
        CONFIRMED: counts.CONFIRMED || 0,
        PROCESSING: counts.PROCESSING || 0,
        SHIPPED: counts.SHIPPED || 0,
        OUT_FOR_DELIVERY: counts.OUT_FOR_DELIVERY || 0,
        DELIVERED: counts.DELIVERED || 0,
        CANCELLED: counts.CANCELLED || 0,
        total: data?.length ?? 0,
        pending: (counts.PLACED || 0) + (counts.CONFIRMED || 0),
      }
    },
    staleTime: 1000 * 60 * 2,
  })
}
