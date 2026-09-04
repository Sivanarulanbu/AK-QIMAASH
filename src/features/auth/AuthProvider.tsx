import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/types/database'

// ─── Permission Matrix (mirrors server-side) ────────────────────
const PERMISSIONS: Record<string, UserRole[]> = {
  'orders.read':          ['ADMIN', 'ORDER_MANAGER'],
  'orders.update_status': ['ADMIN', 'ORDER_MANAGER'],
  'orders.delete':        ['ADMIN'],
  'products.read':        ['ADMIN', 'CONTENT_MANAGER'],
  'products.create':      ['ADMIN', 'CONTENT_MANAGER'],
  'products.update':      ['ADMIN', 'CONTENT_MANAGER'],
  'products.delete':      ['ADMIN'],
  'inventory.read':       ['ADMIN', 'ORDER_MANAGER'],
  'inventory.adjust':     ['ADMIN', 'ORDER_MANAGER'],
  'reviews.read':         ['ADMIN', 'CONTENT_MANAGER'],
  'reviews.moderate':     ['ADMIN', 'CONTENT_MANAGER'],
  'reviews.delete':       ['ADMIN'],
  'customers.read':       ['ADMIN', 'ORDER_MANAGER'],
  'roles.read':           ['ADMIN'],
  'roles.assign':         ['ADMIN'],
  'roles.revoke':         ['ADMIN'],
  'audit.read':           ['ADMIN'],
  'settings.read':        ['ADMIN'],
  'settings.update':      ['ADMIN'],
  'dashboard.read':       ['ADMIN', 'ORDER_MANAGER', 'CONTENT_MANAGER'],
}

interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  hasRole: (role: UserRole) => boolean
  isAdmin: boolean
  isOrderManager: boolean
  isContentManager: boolean
  /** Check if the current user can perform resource.action */
  checkPermission: (resource: string, action: string) => boolean
  /** Whether MFA (TOTP) is enrolled for this account */
  mfaEnrolled: boolean
  /** Whether the current session is MFA-verified (AAL2) */
  mfaVerified: boolean
  /** Whether MFA is required for the current role (admin roles) */
  mfaRequired: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, role, setAuth, setRole, setLoading, clearAuth, setMfaEnrolled } = useAuthStore()
  const [mfaVerified, setMfaVerified] = useState(false)
  const mfaEnrolled = useAuthStore((s) => s.mfaEnrolled)

  useEffect(() => {
    // Initialize auth state from existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuth(session?.user ?? null, session)
      if (session?.user) {
        fetchUserRole(session.user.id)
        checkMfaStatus()
      } else {
        setLoading(false)
      }
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setAuth(session?.user ?? null, session)
        if (session?.user) {
          await fetchUserRole(session.user.id)
          await checkMfaStatus()
        } else {
          setRole(null)
          setMfaEnrolled(false)
          setMfaVerified(false)
          clearAuth()
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function fetchUserRole(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single()

      if (error || !data) {
        setRole('CUSTOMER')
      } else {
        setRole((data as any).role as UserRole)
      }
    } catch {
      setRole('CUSTOMER')
    } finally {
      setLoading(false)
    }
  }

  async function checkMfaStatus() {
    try {
      const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      if (error) {
        setMfaVerified(false)
        setMfaEnrolled(false)
        return
      }

      // currentLevel: 'aal1' (password only) or 'aal2' (MFA verified)
      setMfaVerified(data.currentLevel === 'aal2')

      // nextLevel tells us if MFA factors are enrolled
      // If nextLevel === 'aal2', the user has enrolled factors
      setMfaEnrolled(data.nextLevel === 'aal2')
    } catch {
      setMfaVerified(false)
      setMfaEnrolled(false)
    }
  }

  const hasRole = useCallback((requiredRole: UserRole): boolean => {
    if (!role) return false
    if (role === 'ADMIN') return true
    return role === requiredRole
  }, [role])

  const checkPermission = useCallback((resource: string, action: string): boolean => {
    if (!role) return false
    if (role === 'ADMIN') return true
    const key = `${resource}.${action}`
    const allowedRoles = PERMISSIONS[key]
    if (!allowedRoles) return false
    return allowedRoles.includes(role)
  }, [role])

  // MFA is required for admin roles (can be toggled via env var on server)
  const isAdminRole = role === 'ADMIN' || role === 'ORDER_MANAGER' || role === 'CONTENT_MANAGER'
  const mfaRequired = isAdminRole && !!import.meta.env.VITE_MFA_REQUIRED

  const value: AuthContextValue = {
    isAuthenticated: !!user,
    isLoading: useAuthStore.getState().isLoading,
    hasRole,
    isAdmin: role === 'ADMIN',
    isOrderManager: hasRole('ORDER_MANAGER'),
    isContentManager: hasRole('CONTENT_MANAGER'),
    checkPermission,
    mfaEnrolled,
    mfaVerified,
    mfaRequired,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
