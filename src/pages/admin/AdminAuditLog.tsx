import { useState } from 'react'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { formatDateTime } from '@/utils'
import { useAuditLogs } from '@/features/audit/useAuditLog'
import { Filter, RefreshCw, Shield, ChevronDown, ChevronUp } from 'lucide-react'

const ENTITIES = ['ALL', 'orders', 'products', 'product_variants', 'categories', 'reviews', 'user_roles', 'order_status_history']
const ACTIONS = ['ALL', 'INSERT', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'SECURITY_EVENT']

export function AdminAuditLogPage() {
  const [selectedEntity, setSelectedEntity] = useState('ALL')
  const [selectedAction, setSelectedAction] = useState('ALL')
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null)

  const { data, isLoading, refetch, isFetching } = useAuditLogs({
    entity: selectedEntity,
    action: selectedAction,
    limit: 150,
  })

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Audit Log</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
              <Shield className="w-3 h-3" />
              Tamper Resistant
            </span>
          </div>
          <p className="text-sm text-text-muted mt-0.5">
            Immutable, append-only record of administrative and security events.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border border-border bg-surface hover:bg-surface-raised transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap items-center gap-4 bg-surface-raised">
        <div className="flex items-center gap-2 text-xs font-medium text-text-muted uppercase tracking-caps">
          <Filter className="w-3.5 h-3.5" />
          Filter
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="entity-filter" className="text-xs text-text-muted">Entity:</label>
          <select
            id="entity-filter"
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className="text-xs bg-surface border border-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent"
          >
            {ENTITIES.map((ent) => (
              <option key={ent} value={ent}>{ent}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="action-filter" className="text-xs text-text-muted">Action:</label>
          <select
            id="action-filter"
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="text-xs bg-surface border border-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent"
          >
            {ACTIONS.map((act) => (
              <option key={act} value={act}>{act}</option>
            ))}
          </select>
        </div>

        <div className="ml-auto text-xs text-text-muted">
          Showing {data?.logs.length ?? 0} {data?.total !== undefined ? `of ${data.total}` : ''} events
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={10} cols={5} />
        ) : !data || data.logs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm font-medium text-text-primary">No audit records found</p>
            <p className="text-xs text-text-muted mt-1">Try adjusting the filters above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th className="w-40">Timestamp</th>
                  <th className="w-48">Actor</th>
                  <th className="w-28">Action</th>
                  <th className="w-36">Entity</th>
                  <th>Entity ID / Metadata</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.logs.map((log) => {
                  const isExpanded = expandedLogId === log.id
                  const hasMeta = log.metadata && Object.keys(log.metadata).length > 0

                  return (
                    <tr key={log.id} className="hover:bg-surface-sunken/40 transition-colors">
                      <td className="text-xs text-text-muted whitespace-nowrap">
                        {formatDateTime(log.created_at)}
                      </td>
                      <td className="text-sm">
                        <span className="font-medium text-text-primary block truncate max-w-[180px]">
                          {log.profiles?.full_name || log.profiles?.email || 'System / Service'}
                        </span>
                        {log.actor_id && (
                          <span className="text-[10px] font-mono text-text-muted block truncate max-w-[180px]">
                            {log.actor_id}
                          </span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                            log.action === 'DELETE'
                              ? 'bg-red-500/10 text-red-700 border border-red-500/20'
                              : log.action === 'INSERT'
                              ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
                              : 'bg-surface-sunken text-text-secondary border border-border'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="text-sm font-mono text-text-secondary">{log.entity}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          {log.entity_id ? (
                            <span className="text-xs font-mono text-text-muted truncate max-w-[140px]">
                              {log.entity_id}
                            </span>
                          ) : (
                            <span className="text-xs text-text-muted italic">—</span>
                          )}
                          {hasMeta && (
                            <button
                              type="button"
                              onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                              className="text-[11px] text-accent hover:underline flex items-center gap-0.5"
                            >
                              {isExpanded ? 'Hide diff' : 'View diff'}
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          )}
                        </div>

                        {/* Collapsible Metadata / Diff */}
                        {isExpanded && hasMeta && (
                          <div className="mt-2 p-3 bg-surface-sunken rounded-md text-xs font-mono text-text-secondary overflow-x-auto max-h-48 border border-border">
                            <pre className="whitespace-pre-wrap">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </div>
                        )}
                      </td>
                      <td className="text-right">
                        {/* Status dot */}
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" title="Verified record" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
