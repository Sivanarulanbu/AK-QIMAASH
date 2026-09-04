import { Link, useLocation } from 'react-router-dom'
import { Home, ShoppingBag, Heart, User } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils'

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/shop', label: 'Shop', icon: ShoppingBag },
  { to: '/wishlist', label: 'Wishlist', icon: Heart },
  { to: '/account', label: 'Account', icon: User },
]

export function MobileBottomNav() {
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const totalItems = useCartStore((s) => s.totalItems())

  return (
    <nav
      className="mobile-nav"
      aria-label="Mobile navigation"
    >
      <div className="grid grid-cols-4">
        {navItems.map(({ to, label, icon: Icon }) => {
          const resolvedTo = to === '/account' && !user ? '/auth/login' : to
          const isActive =
            to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(to)

          return (
            <Link
              key={to}
              to={resolvedTo}
              className={cn(
                'flex flex-col items-center justify-center py-3 gap-1 text-[10px] font-medium',
                'transition-colors duration-150',
                isActive ? 'text-brand-black' : 'text-text-muted hover:text-text-secondary'
              )}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon className="h-5 w-5" aria-hidden="true" />
                {label === 'Shop' && totalItems > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 bg-brand-black text-white
                               text-[9px] font-semibold w-3.5 h-3.5 rounded-full
                               flex items-center justify-center"
                    aria-hidden="true"
                  >
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </div>
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
