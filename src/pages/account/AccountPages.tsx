import { lazy, Suspense } from 'react'
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom'
import { User, MapPin, ShoppingBag, Heart, Settings, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { SEOHead } from '@/components/seo/SEOHead'
import { cn } from '@/utils'

const navItems = [
  { to: '/account', label: 'Profile', icon: User, end: true },
  { to: '/account/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/account/addresses', label: 'Addresses', icon: MapPin },
  { to: '/account/wishlist', label: 'Wishlist', icon: Heart },
]

export function AccountLayout() {
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)
  const location = useLocation()

  if (isLoading) return null
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <>
      <SEOHead title="My Account — AK QIMAASH" description="Manage your account." canonical="/account" />
      <div className="container-main py-8 md:py-12">
        <div className="flex gap-8 lg:gap-12">
          {/* Sidebar */}
          <aside className="hidden md:block w-48 flex-shrink-0">
            <div className="sticky top-24">
              <p className="text-xs text-text-muted uppercase tracking-caps mb-4">
                My Account
              </p>
              <nav className="space-y-0.5" aria-label="Account navigation">
                {navItems.map(({ to, label, icon: Icon, end }) => {
                  const isActive = end
                    ? location.pathname === to
                    : location.pathname.startsWith(to)
                  return (
                    <Link
                      key={to}
                      to={to}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2 text-sm rounded transition-colors duration-150',
                        isActive
                          ? 'bg-brand-smoke text-text-primary font-medium'
                          : 'text-text-secondary hover:bg-brand-smoke hover:text-text-primary'
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                      {label}
                    </Link>
                  )
                })}
              </nav>

              <div className="mt-6 border-t border-border pt-4">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-error
                             hover:bg-error-light rounded transition-colors duration-150 w-full"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Sign Out
                </button>
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  )
}

export function AccountProfilePage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div>
      <h2 className="text-xl font-semibold text-text-primary mb-6">Profile</h2>
      <div className="card p-5 max-w-md">
        <div className="space-y-3">
          <div>
            <p className="text-xs text-text-muted uppercase tracking-caps">Name</p>
            <p className="text-sm text-text-primary mt-0.5">
              {user?.user_metadata?.full_name || 'Not set'}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase tracking-caps">Email</p>
            <p className="text-sm text-text-primary mt-0.5">{user?.email}</p>
          </div>
        </div>
        <div className="mt-5 pt-4 border-t border-border">
          <p className="text-xs text-text-muted">
            To update your profile, contact us at orders@akqimaash.sg
          </p>
        </div>
      </div>
    </div>
  )
}
