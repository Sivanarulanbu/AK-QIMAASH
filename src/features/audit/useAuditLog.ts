import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { Database } from '@/types/database'

export type AuditLogEntry = Database['public']['Tables']['audit_logs']['Row'] & {
  profiles?: {
    full_name: string | null
    email: string | null
  } | null
}

export interface AuditLogFilters {
  entity?: string
  action?: string
  actorId?: string
  limit?: number
  offset?: number
}

export const auditKeys = {
  all: ['audit-logs'] as const,
  list: (filters?: AuditLogFilters) => [...auditKeys.all, 'list', filters] as const,
}

/**
 * Hook to fetch audit logs with optional filtering.
 */
export function useAuditLogs(filters: AuditLogFilters = {}) {
  const { entity, action, actorId, limit = 100, offset = 0 } = filters

  return useQuery({
    queryKey: auditKeys.list(filters),
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select('*, profiles(full_name, email)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (entity && entity !== 'ALL') {
        query = query.eq('entity', entity)
      }
      if (action && action !== 'ALL') {
        query = query.eq('action', action)
      }
      if (actorId) {
        query = query.eq('actor_id', actorId)
      }

      const { data, error, count } = await query
      if (error) throw error

      return {
        logs: (data || []) as AuditLogEntry[],
        total: count ?? 0,
      }
    },
    refetchInterval: 30000,
  })
}

/**
 * Manual logging hook for explicit admin / security operations
 * that may not be covered by database table triggers (e.g. export, MFA change, access denial).
 */
export function useLogAdminEvent() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: async ({
      action,
      entity,
      entityId,
      metadata = {},
    }: {
      action: string
      entity: string
      entityId?: string | null
      metadata?: Record<string, unknown>
    }) => {
      const { error } = await (supabase.from('audit_logs') as any).insert({
        actor_id: user?.id ?? null,
        action,
        entity,
        entity_id: entityId ?? null,
        metadata: metadata as any,
      })

      if (error) {
        console.warn('Failed to record audit log:', error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: auditKeys.all })
    },
  })
}
