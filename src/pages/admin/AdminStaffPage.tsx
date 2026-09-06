import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  ShieldCheck, ShieldAlert, UserPlus, UserX, AlertTriangle, 
  Info, Check, Shield, Search, Lock, RefreshCw, KeyRound
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useAuth } from '@/features/auth/AuthProvider'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Drawer'
import { formatDate } from '@/utils'
import type { UserRole } from '@/types/database'

interface StaffMember {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: UserRole
  created_at: string
  mfa_enrolled: boolean
}

const ROLE_CONFIG: Record<UserRole, { label: string; badgeClass: string; desc: string }> = {
  ADMIN: {
    label: 'Super Admin',
    badgeClass: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
    desc: 'Full access to all operations, staff roles, settings, and audit logs.',
  },
  ORDER_MANAGER: {
    label: 'Order Manager',
    badgeClass: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
    desc: 'Manages orders, fulfillment, customer deliveries, and inventory counts.',
  },
  CONTENT_MANAGER: {
    label: 'Content Manager',
    badgeClass: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
    desc: 'Manages product catalog, categories, pricing, and customer reviews.',
  },
  CUSTOMER: {
    label: 'Customer',
    badgeClass: 'bg-gray-500/10 text-gray-700 border-gray-500/20',
    desc: 'Standard storefront access only.',
  },
}

export function AdminStaffPage() {
  const currentUserId = useAuthStore((s) => s.user?.id)
  const { refreshRole } = useAuth()
  const queryClient = useQueryClient()
  
  const [search, setSearch] = useState('')
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)
  const [newTargetEmail, setNewTargetEmail] = useState('')
  const [newSelectedRole, setNewSelectedRole] = useState<UserRole>('ORDER_MANAGER')
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  // ── 1. Fetch staff members ──
  const { data: staffList = [], isLoading, refetch } = useQuery<StaffMember[]>({
    queryKey: ['admin-staff-members'],
    queryFn: async () => {
      // First try calling the RPC
      const { data: rpcData, error: rpcError } = await (supabase.rpc as any)('get_staff_members')
      if (!rpcError && rpcData) {
        return rpcData as StaffMember[]
      }

      // Fallback: join profiles with user_roles
      const { data: profiles, error: pError } = await (supabase
        .from('profiles') as any)
        .select(`
          id,
          email,
          full_name,
          phone,
          created_at,
          mfa_enrolled
        `)

      if (pError) throw pError

      const { data: roles, error: rError } = await (supabase
        .from('user_roles') as any)
        .select('user_id, role')
        .in('role', ['ADMIN', 'ORDER_MANAGER', 'CONTENT_MANAGER'])

      if (rError) throw rError

      const roleMap = new Map<string, UserRole>()
      ;(roles as any[])?.forEach((r: any) => roleMap.set(r.user_id, r.role as UserRole))

      return ((profiles as any[]) || [])
        .filter((p: any) => roleMap.has(p.id))
        .map((p: any) => ({
          id: p.id,
          email: p.email,
          full_name: p.full_name,
          phone: p.phone,
          role: roleMap.get(p.id) || 'CUSTOMER',
          created_at: p.created_at,
          mfa_enrolled: p.mfa_enrolled || false,
        }))
        .sort((a, b) => (a.role === 'ADMIN' ? -1 : 1))
    },
  })

  // ── 2. Assign / Modify Role Mutation ──
  const assignRoleMutation = useMutation({
    mutationFn: async ({ targetUserId, newRole }: { targetUserId: string; newRole: UserRole }) => {
      setActionError(null)
      setActionSuccess(null)

      // Guard: self-demotion
      if (targetUserId === currentUserId && newRole !== 'ADMIN') {
        throw new Error('Self-demotion is prevented. Another administrator must change your role.')
      }

      // Guard: last admin demotion
      const adminCount = staffList.filter((s) => s.role === 'ADMIN').length
      const targetUser = staffList.find((s) => s.id === targetUserId)
      if (targetUser?.role === 'ADMIN' && newRole !== 'ADMIN' && adminCount <= 1) {
        throw new Error('Cannot demote or revoke the last remaining administrator in the system.')
      }

      // Try RPC first
      const { data, error } = await (supabase.rpc as any)('assign_user_role', {
        target_user_id: targetUserId,
        new_role: newRole,
      })

      if (error) {
        // Fallback to direct user_roles upsert
        const { error: upsertError } = await (supabase
          .from('user_roles') as any)
          .upsert({ user_id: targetUserId, role: newRole }, { onConflict: 'user_id' })

        if (upsertError) throw upsertError
      }

      return data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-staff-members'] })
      await refreshRole()
      setActionSuccess('Role updated successfully.')
      setEditingStaff(null)
      setAssignModalOpen(false)
      setNewTargetEmail('')
      setTimeout(() => setActionSuccess(null), 4000)
    },
    onError: (err: any) => {
      setActionError(err.message || 'Failed to update role.')
    },
  })

  // ── 3. Promote User by Email ──
  const handlePromoteByEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionError(null)

    if (!newTargetEmail.trim()) {
      setActionError('Please enter a valid user email.')
      return
    }

    try {
      // Find profile by email
      const { data: profile, error } = await (supabase
        .from('profiles') as any)
        .select('id, email')
        .eq('email', newTargetEmail.trim().toLowerCase())
        .single()

      if (error || !profile) {
        setActionError(`No registered user found with email "${newTargetEmail}". User must have an account first.`)
        return
      }

      await assignRoleMutation.mutateAsync({
        targetUserId: (profile as any).id,
        newRole: newSelectedRole,
      })
    } catch (err: any) {
      setActionError(err.message || 'Failed to promote user.')
    }
  }

  // Filtered staff list
  const filteredStaff = staffList.filter(
    (s) =>
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.full_name && s.full_name.toLowerCase().includes(search.toLowerCase())) ||
      s.role.toLowerCase().includes(search.toLowerCase())
  )

  const adminCount = staffList.filter((s) => s.role === 'ADMIN').length
  const orderMgrCount = staffList.filter((s) => s.role === 'ORDER_MANAGER').length
  const contentMgrCount = staffList.filter((s) => s.role === 'CONTENT_MANAGER').length

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Team & Role Delegation</h1>
          <p className="text-sm text-text-muted mt-0.5">
            Manage administrative team members and enforce Role-Based Access Control (RBAC).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="md" onClick={() => refetch()} aria-label="Refresh team list">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="primary" size="md" onClick={() => setAssignModalOpen(true)}>
            <UserPlus className="h-4 w-4 mr-1.5" />
            Add Staff Member
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 rounded-lg bg-error-light border border-error/20 text-error text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <span className="text-xs text-text-muted uppercase tracking-wider block">Total Staff</span>
          <span className="text-2xl font-semibold text-text-primary mt-1 block">{staffList.length}</span>
        </div>
        <div className="card p-4 border-l-4 border-l-purple-500">
          <span className="text-xs text-text-muted uppercase tracking-wider block">Super Admins</span>
          <span className="text-2xl font-semibold text-purple-700 mt-1 block">{adminCount}</span>
        </div>
        <div className="card p-4 border-l-4 border-l-blue-500">
          <span className="text-xs text-text-muted uppercase tracking-wider block">Order Managers</span>
          <span className="text-2xl font-semibold text-blue-700 mt-1 block">{orderMgrCount}</span>
        </div>
        <div className="card p-4 border-l-4 border-l-amber-500">
          <span className="text-xs text-text-muted uppercase tracking-wider block">Content Managers</span>
          <span className="text-2xl font-semibold text-amber-700 mt-1 block">{contentMgrCount}</span>
        </div>
      </div>

      {/* Search & Staff Table */}
      <div className="card overflow-hidden space-y-4 p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="search"
              placeholder="Search by name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-base pl-9 text-sm"
              aria-label="Search staff members"
            />
          </div>
          <span className="text-xs text-text-muted">{filteredStaff.length} members shown</span>
        </div>

        {isLoading ? (
          <TableSkeleton rows={4} cols={5} />
        ) : filteredStaff.length === 0 ? (
          <div className="text-center py-10">
            <Shield className="h-10 w-10 mx-auto text-text-muted/40 mb-2" />
            <p className="text-sm font-medium text-text-primary">No staff members found</p>
            <p className="text-xs text-text-muted mt-1">Assign an existing customer account to a staff role.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base w-full">
              <thead>
                <tr>
                  <th>Team Member</th>
                  <th>Current Role</th>
                  <th>Security (MFA)</th>
                  <th>Member Since</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((member) => {
                  const isSelf = member.id === currentUserId
                  const isOnlyAdmin = member.role === 'ADMIN' && adminCount <= 1
                  const config = ROLE_CONFIG[member.role]

                  return (
                    <tr key={member.id} className="hover:bg-surface-sunken/40 transition-colors">
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-brand-charcoal text-white flex items-center justify-center text-xs font-semibold">
                            {(member.full_name || member.email)[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text-primary flex items-center gap-1.5">
                              {member.full_name || '—'}
                              {isSelf && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-sunken text-text-muted font-normal">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-text-muted">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.badgeClass}`}>
                          {config.label}
                        </span>
                      </td>
                      <td>
                        {member.mfa_enrolled ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            MFA Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-text-muted">
                            <Lock className="w-3.5 h-3.5" />
                            Standard (AAL1)
                          </span>
                        )}
                      </td>
                      <td className="text-xs text-text-muted">{formatDate(member.created_at)}</td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={isSelf || isOnlyAdmin}
                            title={
                              isSelf
                                ? 'Self-demotion is prevented'
                                : isOnlyAdmin
                                ? 'Cannot modify last remaining administrator'
                                : 'Change role'
                            }
                            onClick={() => setEditingStaff(member)}
                          >
                            Change Role
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-error hover:bg-error-light"
                            disabled={isSelf || isOnlyAdmin}
                            title={
                              isSelf
                                ? 'Cannot revoke own access'
                                : isOnlyAdmin
                                ? 'Cannot revoke last administrator'
                                : 'Revoke staff access'
                            }
                            onClick={() => {
                              if (confirm(`Revoke staff privileges for ${member.email}? They will become a standard customer.`)) {
                                assignRoleMutation.mutate({
                                  targetUserId: member.id,
                                  newRole: 'CUSTOMER',
                                })
                              }
                            }}
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Permissions Reference Card */}
      <div className="card p-5 bg-surface-raised space-y-3">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-semibold text-text-primary">Role Permissions Matrix Summary</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="p-3.5 rounded-lg bg-surface border border-border space-y-1.5">
            <span className="text-xs font-semibold text-purple-700">Super Admin (ADMIN)</span>
            <p className="text-xs text-text-muted leading-relaxed">
              Unrestricted control. Role delegation, staff revocation, financial metrics, system email configs, hard deletions, and audit logs.
            </p>
          </div>
          <div className="p-3.5 rounded-lg bg-surface border border-border space-y-1.5">
            <span className="text-xs font-semibold text-blue-700">Order Manager (ORDER_MANAGER)</span>
            <p className="text-xs text-text-muted leading-relaxed">
              Fulfillment operations. View customer orders, update delivery tracking, adjust warehouse inventory levels. Restricted from product edits, role changes, and system settings.
            </p>
          </div>
          <div className="p-3.5 rounded-lg bg-surface border border-border space-y-1.5">
            <span className="text-xs font-semibold text-amber-700">Content Manager (CONTENT_MANAGER)</span>
            <p className="text-xs text-text-muted leading-relaxed">
              Catalog operations. Create and edit products, variants, categories, and moderate customer reviews. Absolutely zero access to customer PII or orders.
            </p>
          </div>
        </div>
      </div>

      {/* Modal 1: Add New Staff Member */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => {
          setAssignModalOpen(false)
          setActionError(null)
        }}
        title="Add Staff Member"
      >
        <form onSubmit={handlePromoteByEmail} className="space-y-4 pt-2">
          <p className="text-xs text-text-muted">
            Enter the registered email of an existing customer account to elevate their privileges to a staff role.
          </p>

          <div>
            <label className="block text-xs font-medium text-text-primary mb-1">User Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. staff@akqimaash.sg"
              value={newTargetEmail}
              onChange={(e) => setNewTargetEmail(e.target.value)}
              className="input-base text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-primary mb-1">Select Role</label>
            <select
              value={newSelectedRole}
              onChange={(e) => setNewSelectedRole(e.target.value as UserRole)}
              className="input-base text-sm"
            >
              <option value="ORDER_MANAGER">Order Manager (Fulfillment & Inventory)</option>
              <option value="CONTENT_MANAGER">Content Manager (Catalog & Reviews)</option>
              <option value="ADMIN">Super Administrator (Full Access)</option>
            </select>
          </div>

          <div className="p-3 rounded bg-surface-sunken border border-border text-xs text-text-secondary">
            <strong>Selected Role:</strong> {ROLE_CONFIG[newSelectedRole].desc}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setAssignModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={assignRoleMutation.isPending}
            >
              Assign Role
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Edit Role for Existing Member */}
      <Modal
        isOpen={!!editingStaff}
        onClose={() => {
          setEditingStaff(null)
          setActionError(null)
        }}
        title={`Change Role: ${editingStaff?.email || ''}`}
      >
        {editingStaff && (
          <div className="space-y-4 pt-2">
            <p className="text-xs text-text-muted">
              Select the new role for {editingStaff.full_name || editingStaff.email}.
            </p>

            <div className="space-y-2">
              {(['ADMIN', 'ORDER_MANAGER', 'CONTENT_MANAGER'] as UserRole[]).map((r) => {
                const isCurrent = editingStaff.role === r
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      assignRoleMutation.mutate({
                        targetUserId: editingStaff.id,
                        newRole: r,
                      })
                    }}
                    disabled={isCurrent || assignRoleMutation.isPending}
                    className={`w-full p-3 text-left rounded-lg border transition-all flex items-start justify-between ${
                      isCurrent
                        ? 'border-brand-black bg-surface-sunken'
                        : 'border-border hover:border-text-muted bg-surface'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
                        {ROLE_CONFIG[r].label}
                        {isCurrent && <span className="text-xs text-text-muted font-normal">(Current)</span>}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">{ROLE_CONFIG[r].desc}</p>
                    </div>
                    {isCurrent && <Check className="h-4 w-4 text-brand-black shrink-0 mt-0.5" />}
                  </button>
                )
              })}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setEditingStaff(null)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
