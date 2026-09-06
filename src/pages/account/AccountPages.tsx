import { useState, useEffect } from 'react'
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom'
import { User, MapPin, ShoppingBag, Heart, LogOut, ShieldCheck, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useAuth } from '@/features/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { SEOHead } from '@/components/seo/SEOHead'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/utils'

const navItems = [
  { to: '/account/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/account/addresses', label: 'Addresses', icon: MapPin },
  { to: '/account/wishlist', label: 'Wishlist', icon: Heart },
  { to: '/account', label: 'Profile', icon: User, end: true },
]

export function AccountLayout() {
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)
  const { isStaff, role } = useAuth()
  const location = useLocation()

  if (isLoading) return null
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Client'

  return (
    <>
      <SEOHead title="My Account — AK QIMAASH" description="Manage your account, orders and addresses." canonical="/account" />
      <div className="container-main py-8 md:py-16">
        {/* Mobile Header & Sub-Navigation Tabs */}
        <div className="md:hidden mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="editorial-subheading">My Account</p>
              <h1 className="font-editorial text-2xl uppercase tracking-tight font-medium text-brand-black">
                Hello, {displayName}
              </h1>
            </div>
            {isStaff && (
              <Link
                to="/admin"
                className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-brand-charcoal text-white flex items-center gap-1"
              >
                <ShieldCheck className="h-3 w-3 text-amber-400" />
                Admin
              </Link>
            )}
          </div>

          {/* Horizontal Scrollable Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 border-b border-border/80">
            {navItems.map(({ to, label, end }) => {
              const isActive = end ? location.pathname === to : location.pathname.startsWith(to)
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'px-4 py-2 text-xs uppercase font-sans tracking-wider rounded-xs whitespace-nowrap transition-colors',
                    isActive
                      ? 'bg-brand-black text-white font-medium'
                      : 'bg-surface-raised border border-border text-text-secondary hover:border-brand-black'
                  )}
                >
                  {label}
                </Link>
              )
            })}
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-xs uppercase font-sans tracking-wider rounded-xs whitespace-nowrap text-rose-700 hover:bg-rose-50 border border-transparent"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="flex gap-12 lg:gap-16">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-52 flex-shrink-0">
            <div className="sticky top-28 space-y-6">
              <div>
                <p className="editorial-subheading mb-1">Account</p>
                <h2 className="font-editorial text-2xl text-brand-black uppercase tracking-tight font-medium truncate">
                  {displayName}
                </h2>
                <p className="text-xs font-sans text-text-muted mt-0.5 truncate">{user.email}</p>
              </div>

              {isStaff && (
                <div>
                  <Link
                    to="/admin"
                    className="flex items-center justify-between px-3 py-2 text-xs rounded-xs bg-brand-charcoal text-white font-medium hover:bg-brand-black transition-all shadow-xs group"
                  >
                    <span className="flex items-center gap-1.5 font-semibold">
                      <ShieldCheck className="h-3.5 w-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                      Admin Suite
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-xs bg-white/20">
                      {role === 'ADMIN' ? 'Admin' : 'Staff'}
                    </span>
                  </Link>
                </div>
              )}

              <nav className="space-y-1" aria-label="Account navigation">
                {navItems.map(({ to, label, icon: Icon, end }) => {
                  const isActive = end ? location.pathname === to : location.pathname.startsWith(to)
                  return (
                    <Link
                      key={to}
                      to={to}
                      className={cn(
                        'flex items-center justify-between px-3.5 py-2.5 text-xs uppercase font-sans tracking-wider transition-colors rounded-xs',
                        isActive
                          ? 'bg-brand-black text-white font-medium'
                          : 'text-text-secondary hover:bg-brand-smoke hover:text-brand-black'
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="h-4 w-4 stroke-[1.5]" />
                        {label}
                      </span>
                      <ChevronRight className="h-3 w-3 opacity-60" />
                    </Link>
                  )
                })}
              </nav>

              <div className="border-t border-border/80 pt-4">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-xs uppercase font-sans tracking-wider text-rose-700 hover:bg-rose-50 rounded-xs transition-colors w-full text-left"
                >
                  <LogOut className="h-4 w-4 stroke-[1.5]" />
                  Sign Out
                </button>
              </div>
            </div>
          </aside>

          {/* Main Account Content */}
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
  const { toast } = useToast()

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || '')
      setPhone(user.user_metadata?.phone || '')

      // Also try fetching from profiles table
      supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            const profile = data as any
            if (profile.full_name) setFullName(profile.full_name)
            if (profile.phone) setPhone(profile.phone)
          }
        })
    }
  }, [user])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsSaving(true)

    try {
      // Update Supabase Auth user metadata
      await supabase.auth.updateUser({
        data: { full_name: fullName.trim(), phone: phone.trim() },
      })

      // Update profiles database table
      await (supabase.from('profiles') as any).upsert({
        id: user.id,
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: user.email,
        updated_at: new Date().toISOString(),
      })

      toast({
        title: 'Profile Updated',
        description: 'Your personal details have been saved successfully.',
        variant: 'success',
      })
    } catch {
      toast({
        title: 'Update Failed',
        description: 'Unable to save profile details. Please try again.',
        variant: 'error',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <p className="editorial-subheading mb-1">Personal Details</p>
        <h2 className="font-editorial text-3xl uppercase tracking-tight font-medium text-brand-black">
          Profile
        </h2>
      </div>

      <div className="bg-surface-raised border border-border/80 p-6 sm:p-8 rounded-xs">
        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div>
            <label className="block text-xs uppercase font-sans font-medium text-text-muted tracking-wider mb-2">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Sivan Arulanbu"
              className="input-base"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-sans font-medium text-text-muted tracking-wider mb-2">
              Email Address (Login)
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="input-base bg-surface-sunken text-text-muted cursor-not-allowed"
            />
            <p className="text-[11px] font-sans text-text-muted mt-1 font-light">
              Email changes can be managed via authentication security settings.
            </p>
          </div>

          <div>
            <label className="block text-xs uppercase font-sans font-medium text-text-muted tracking-wider mb-2">
              Singapore Contact Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+65 9123 4567"
              className="input-base"
            />
          </div>

          <div className="pt-4 border-t border-border/60 flex items-center justify-between">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-brand-black text-white text-xs uppercase tracking-widest font-medium hover:bg-brand-charcoal transition-colors rounded-xs disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
