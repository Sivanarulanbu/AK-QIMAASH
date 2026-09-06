import { type ReactNode } from 'react'
import { useAuth } from '@/features/auth/AuthProvider'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/types/database'

export interface CanProps {
  /** The resource domain (e.g. 'products', 'orders', 'inventory', 'roles') */
  resource?: string
  /** The action to perform (e.g. 'delete', 'create', 'update_status', 'assign') */
  action?: string
  /** Alternative or supplemental check: user must possess one of these roles */
  role?: UserRole | UserRole[]
  /** If true, user must have MFA verified (AAL2) */
  requireMfa?: boolean
  /** Rendered if permission check fails (e.g. a disabled button or tooltip) */
  fallback?: ReactNode
  children: ReactNode
}

/**
 * Declarative component for in-page action authorization.
 * Renders `children` only when the active user has the necessary privileges.
 *
 * Example:
 * ```tsx
 * <Can resource="products" action="delete">
 *   <button onClick={handleDelete}>Delete</button>
 * </Can>
 * ```
 */
export function Can({
  resource,
  action,
  role,
  requireMfa = false,
  fallback = null,
  children,
}: CanProps) {
  const { checkPermission, hasRole, mfaVerified, isAdmin } = useAuth()
  const currentRole = useAuthStore((s) => s.role)

  // 1. MFA check if requested
  if (requireMfa && !mfaVerified) {
    return <>{fallback}</>
  }

  // 2. Super Admin always bypasses specific action limits
  if (isAdmin) {
    return <>{children}</>
  }

  // 3. Check explicit role requirements if specified
  if (role) {
    const requiredRoles = Array.isArray(role) ? role : [role]
    const hasRequiredRole = currentRole !== null && requiredRoles.includes(currentRole)
    if (!hasRequiredRole) {
      return <>{fallback}</>
    }
  }

  // 4. Check resource.action permission matrix if specified
  if (resource && action) {
    const isAllowed = checkPermission(resource, action)
    if (!isAllowed) {
      return <>{fallback}</>
    }
  }

  return <>{children}</>
}

/** Alias for `<Can>` with more descriptive name */
export const PermissionGate = Can
