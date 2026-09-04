import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthProvider'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/types/database'

interface RequireRoleProps {
  /** Roles that are allowed to access children. ADMIN always has implicit access. */
  roles: UserRole[]
  /** If true, MFA must be verified to proceed (future enforcement). */
  requireMfa?: boolean
  /** Custom fallback element instead of the default AccessDenied page. */
  fallback?: React.ReactNode
  children?: React.ReactNode
}

/**
 * Route guard component that enforces RBAC.
 *
 * Usage in route config:
 * ```tsx
 * { element: <RequireRole roles={['ADMIN', 'ORDER_MANAGER']} />, children: [...] }
 * ```
 *
 * Or wrapping children directly:
 * ```tsx
 * <RequireRole roles={['ADMIN']}>
 *   <SensitiveComponent />
 * </RequireRole>
 * ```
 */
export function RequireRole({ roles, requireMfa = false, fallback, children }: RequireRoleProps) {
  const { isAuthenticated, isLoading, mfaVerified } = useAuth()
  const role = useAuthStore((s) => s.role)
  const location = useLocation()

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface" aria-label="Verifying access">
        <div className="flex flex-col items-center gap-3">
          <div className="h-5 w-5 border-2 border-brand-black border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-text-muted tracking-wide">Verifying access…</p>
        </div>
      </div>
    )
  }

  // ── Not authenticated → redirect to login ──
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  // ── Role check: ADMIN has implicit access to everything ──
  const hasRequiredRole = role === 'ADMIN' || (role !== null && roles.includes(role))

  if (!hasRequiredRole) {
    if (fallback) return <>{fallback}</>
    return <AccessDenied requiredRoles={roles} currentRole={role} />
  }

  // ── MFA check (opt-in enforcement) ──
  if (requireMfa && !mfaVerified) {
    return <Navigate to="/auth/mfa-challenge" state={{ from: location }} replace />
  }

  // ── Authorized ──
  return children ? <>{children}</> : <Outlet />
}

// ─── Inline Access Denied Component ─────────────────────────────
// This is used as the default fallback. A separate page exists for
// more prominent display at the route level.

function AccessDenied({
  requiredRoles,
  currentRole,
}: {
  requiredRoles: UserRole[]
  currentRole: UserRole | null
}) {
  const roleLabels: Record<string, string> = {
    ADMIN: 'Administrator',
    ORDER_MANAGER: 'Order Manager',
    CONTENT_MANAGER: 'Content Manager',
    CUSTOMER: 'Customer',
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="max-w-md w-full text-center">
        {/* Shield icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-error-light flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold text-text-primary tracking-tight mb-2">
          Access Denied
        </h1>
        <p className="text-sm text-text-muted mb-6 leading-relaxed">
          Your current role ({roleLabels[currentRole || 'CUSTOMER']}) does not have permission
          to access this section.
        </p>

        {/* Required roles */}
        <div className="bg-surface-sunken rounded-lg p-4 mb-6">
          <p className="text-xs text-text-muted uppercase tracking-caps mb-2">Required Role</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {requiredRoles.map((r) => (
              <span
                key={r}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-charcoal text-white"
              >
                {roleLabels[r] || r}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <a
            href="/admin"
            className="btn-md btn-secondary w-full justify-center"
          >
            Back to Dashboard
          </a>
          <a
            href="/"
            className="text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            Return to Store →
          </a>
        </div>
      </div>
    </div>
  )
}
