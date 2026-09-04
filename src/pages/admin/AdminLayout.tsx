import { useState, useMemo } from 'react'
import { Link, NavLink, Outlet, Navigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, ShoppingBag, Package, Users, Star,
  ClipboardList, Settings, LogOut, Menu, X, ChevronRight,
  BarChart2, ShieldCheck, ShieldAlert, Shield
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useAuth } from '@/features/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { cn } from '@/utils'
import type { UserRole } from '@/types/database'

interface AdminNavItem {
  to: string
  label: string
  icon: any
  end?: boolean
  allowedRoles: UserRole[]
}

const ALL_NAV_ITEMS: AdminNavItem[] = [
  {
    to: '/admin',
    label: 'Overview',
    icon: LayoutDashboard,
    end: true,
    allowedRoles: ['ADMIN', 'ORDER_MANAGER', 'CONTENT_MANAGER'],
  },
  {
    to: '/admin/orders',
    label: 'Orders',
    icon: ShoppingBag,
    allowedRoles: ['ADMIN', 'ORDER_MANAGER'],
  },
  {
    to: '/admin/products',
    label: 'Products',
    icon: Package,
    allowedRoles: ['ADMIN', 'CONTENT_MANAGER'],
  },
  {
    to: '/admin/inventory',
    label: 'Inventory',
    icon: BarChart2,
    allowedRoles: ['ADMIN', 'ORDER_MANAGER'],
  },
  {
    to: '/admin/customers',
    label: 'Customers',
    icon: Users,
    allowedRoles: ['ADMIN', 'ORDER_MANAGER'],
  },
  {
    to: '/admin/reviews',
    label: 'Reviews',
    icon: Star,
    allowedRoles: ['ADMIN', 'CONTENT_MANAGER'],
  },
  {
    to: '/admin/audit',
    label: 'Audit Log',
    icon: ClipboardList,
    allowedRoles: ['ADMIN'],
  },
  {
    to: '/admin/settings',
    label: 'Settings',
    icon: Settings,
    allowedRoles: ['ADMIN'],
  },
]

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  ADMIN: { label: 'Administrator', color: 'bg-purple-500/10 text-purple-700 border-purple-500/20' },
  ORDER_MANAGER: { label: 'Order Manager', color: 'bg-blue-500/10 text-blue-700 border-blue-500/20' },
  CONTENT_MANAGER: { label: 'Content Manager', color: 'bg-amber-500/10 text-amber-700 border-amber-500/20' },
  CUSTOMER: { label: 'Customer', color: 'bg-gray-500/10 text-gray-700 border-gray-500/20' },
}

export function AdminLayout() {
  const { isAdmin, isOrderManager, isContentManager, mfaEnrolled, mfaVerified } = useAuth()
  const user = useAuthStore((s) => s.user)
  const role = useAuthStore((s) => s.role)
  const isLoading = useAuthStore((s) => s.isLoading)
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Filter navigation items by active user role
  const visibleNavItems = useMemo(() => {
    if (!role) return []
    if (role === 'ADMIN') return ALL_NAV_ITEMS
    return ALL_NAV_ITEMS.filter((item) => item.allowedRoles.includes(role))
  }, [role])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin h-6 w-6 border-2 border-brand-black border-t-transparent rounded-full" />
      </div>
    )
  }

  // Coarse admin portal access check: must be logged in and hold an admin/manager role
  if (!user || (!isAdmin && !isOrderManager && !isContentManager)) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const roleMeta = ROLE_LABELS[role || 'CUSTOMER'] || ROLE_LABELS.CUSTOMER

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-brand-black/40 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:relative inset-y-0 left-0 z-30 flex flex-col',
          'w-64 bg-brand-charcoal text-white transition-transform duration-300 md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-brand-graphite">
          <div>
            <Link to="/admin" className="font-editorial text-lg font-medium tracking-tighter text-white block">
              AK QIMAASH
            </Link>
            <span className="text-[10px] font-semibold uppercase tracking-caps text-brand-stone block -mt-0.5">
              Admin Portal
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-brand-silver hover:text-white"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* User Role Card & MFA Status */}
        <div className="p-4 border-b border-brand-graphite bg-brand-black/30">
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-white/10 text-brand-silver border border-white/10">
              {roleMeta.label}
            </span>
            {mfaVerified ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium" title="MFA Verified (AAL2)">
                <ShieldCheck className="w-3.5 h-3.5" />
                MFA
              </span>
            ) : mfaEnrolled ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-blue-400 font-medium" title="MFA Enrolled">
                <Shield className="w-3.5 h-3.5" />
                2FA Set
              </span>
            ) : (
              <Link
                to="/auth/mfa-setup"
                className="inline-flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 transition-colors bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20"
                title="Enable Two-Factor Authentication"
              >
                <ShieldAlert className="w-3 h-3" />
                Enable 2FA
              </Link>
            )}
          </div>
          <p className="text-xs text-brand-silver truncate" title={user?.email || ''}>
            {user?.email}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1" aria-label="Admin navigation">
          {visibleNavItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors duration-150',
                  isActive
                    ? 'bg-white/10 text-white font-medium shadow-sm'
                    : 'text-brand-silver hover:bg-white/5 hover:text-white'
                )
              }
              onClick={() => setSidebarOpen(false)}
            >
              <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-brand-graphite space-y-1">
          <Link
            to="/auth/mfa-setup"
            className="flex items-center gap-2 px-3 py-2 text-xs text-brand-silver hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Security & 2FA Settings
          </Link>
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs text-brand-silver hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <span className="flex items-center gap-2">
              View Live Store
            </span>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-2 text-xs text-red-300 hover:text-red-200 rounded-lg hover:bg-red-500/10 transition-colors w-full text-left"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center h-16 bg-surface-raised border-b border-border px-6 gap-4 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden btn-icon btn-ghost"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 ml-auto">
            <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium border', roleMeta.color)}>
              {roleMeta.label}
            </span>
            {mfaVerified ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                MFA Verified
              </span>
            ) : (
              <Link
                to="/auth/mfa-setup"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs text-amber-700 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full font-medium hover:bg-amber-500/15 transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                MFA Recommended
              </Link>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
