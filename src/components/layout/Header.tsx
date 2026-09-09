import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, ShoppingBag, Heart, User, Menu, X, ShieldCheck } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { useSearchOverlayStore } from '@/store/searchOverlayStore'
import { useAuth } from '@/features/auth/AuthProvider'
import { useCategories } from '@/features/products/useProducts'
import { cn } from '@/utils'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const totalItems = useCartStore((s) => s.totalItems())
  const openCart = useCartStore((s) => s.openCart)
  const openSearch = useSearchOverlayStore((s) => s.openSearch)
  const user = useAuthStore((s) => s.user)
  const { isStaff, role } = useAuth()
  const { data: categories } = useCategories()

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 15)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-sticky transition-all duration-300',
          isScrolled
            ? 'bg-white/95 backdrop-blur-md border-b border-border/80 shadow-xs'
            : 'bg-white border-b border-border/40'
        )}
      >
        {/* Main Navigation Bar */}
        <div className="container-main">
          <div
            className={cn(
              'flex items-center justify-between transition-all duration-300',
              isScrolled ? 'h-14 sm:h-16' : 'h-16 sm:h-20'
            )}
          >
            {/* Left: Brand Monogram Logo & Mobile Hamburger */}
            <div className="flex items-center gap-3 sm:gap-5">
              <button
                className="btn-icon btn-ghost md:hidden -ml-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              <Link
                to="/"
                className="flex items-center focus-visible:outline-none transition-all duration-300 hover:opacity-90 group"
                aria-label="AK Home"
              >
                <img
                  src="/images/logo-monogram.png"
                  alt="AK"
                  className={cn(
                    'w-auto object-contain transition-all duration-300 drop-shadow-xs group-hover:scale-[1.04]',
                    isScrolled
                      ? 'h-8 sm:h-9 md:h-10'
                      : 'h-10 sm:h-12 md:h-13'
                  )}
                />
              </Link>
            </div>

            {/* Center: Desktop Navigation Links (Serial Position Effect: Primacy on New In & Collections) */}
            <nav className="hidden md:flex items-center justify-center gap-7 lg:gap-8 flex-1" aria-label="Main navigation">
              <NavLink to="/shop?sort=newest">NEW IN</NavLink>
              {categories && categories.length > 0 && (
                <div className="relative group">
                  <NavLink to="/shop">COLLECTIONS</NavLink>
                  {/* Subtle dropdown on hover */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200">
                    <div className="bg-surface-raised border border-border shadow-md py-2 px-3 rounded-sm min-w-[160px]">
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          to={`/shop?category=${cat.slug}`}
                          className="block px-3 py-1.5 text-xs text-text-secondary hover:text-brand-black hover:bg-brand-smoke transition-colors font-sans uppercase tracking-wider"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <NavLink to="/shop">SHOP ALL</NavLink>
              <NavLink to="/pages/about">ABOUT</NavLink>
            </nav>

            {/* Right Column: Action Icons (Search, Wishlist, Account, Bag) */}
            <div className="flex-1 flex items-center justify-end gap-1.5 sm:gap-3 lg:gap-4">
              {/* Search */}
              <button
                onClick={openSearch}
                className="flex items-center gap-1.5 p-2 text-text-primary hover:text-accent transition-colors"
                aria-label="Search catalog"
              >
                <Search className="h-4 w-4 stroke-[1.5]" />
                <span className="hidden lg:inline text-xs font-sans tracking-widest uppercase text-text-secondary hover:text-text-primary font-medium">
                  SEARCH
                </span>
              </button>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="hidden sm:flex items-center p-2 text-text-primary hover:text-accent transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="h-4 w-4 stroke-[1.5]" />
              </Link>

              {/* Staff / Admin Badge */}
              {isStaff && (
                <Link
                  to="/admin"
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-brand-charcoal text-white hover:bg-brand-black transition-all shadow-xs border border-brand-charcoal"
                  aria-label="Admin Dashboard"
                  title="Open Admin Suite"
                >
                  <ShieldCheck className="h-3 w-3 text-amber-400" />
                  <span className="uppercase tracking-wider">{role === 'ADMIN' ? 'Admin' : 'Staff'}</span>
                </Link>
              )}

              {/* Account */}
              <Link
                to={user ? '/account' : '/auth/login'}
                className="hidden sm:flex items-center gap-1.5 p-2 text-text-primary hover:text-accent transition-colors"
                aria-label={user ? 'My Account' : 'Sign In'}
              >
                <User className="h-4 w-4 stroke-[1.5]" />
                <span className="hidden lg:inline text-xs font-sans tracking-widest uppercase text-text-secondary hover:text-text-primary font-medium">
                  {user ? 'ACCOUNT' : 'SIGN IN'}
                </span>
              </Link>

              {/* Shopping Bag */}
              <button
                onClick={openCart}
                className="flex items-center gap-1.5 p-2 text-text-primary hover:text-accent transition-colors relative"
                aria-label={`Shopping bag with ${totalItems} items`}
              >
                <ShoppingBag className="h-4 w-4 stroke-[1.5]" />
                <span className="hidden lg:inline text-xs font-sans tracking-widest uppercase text-text-secondary hover:text-text-primary font-medium">
                  BAG
                </span>
                {totalItems > 0 && (
                  <span className="bg-brand-black text-white text-[10px] font-medium w-4 h-4 rounded-full flex items-center justify-center -ml-0.5">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-surface-raised animate-fade-in shadow-xl">
            <div className="pt-6 pb-4 flex flex-col items-center justify-center border-b border-border/40 bg-brand-sand/15">
              <img
                src="/images/logo-monogram.png"
                alt="AK"
                className="h-16 w-auto object-contain mb-1.5"
              />
              <span className="text-[9px] tracking-[0.25em] uppercase font-sans text-text-muted font-medium">
                Elegance in Every Thread
              </span>
            </div>
            <nav className="container-main py-5 space-y-1" aria-label="Mobile navigation">
              {isStaff && (
                <div className="pb-3 mb-3 border-b border-border">
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-purple-700 font-semibold flex items-center gap-2 bg-purple-500/10 rounded-md p-3 text-xs uppercase tracking-wider"
                  >
                    <ShieldCheck className="h-4 w-4 text-purple-600" />
                    Admin Portal ({role})
                  </Link>
                </div>
              )}
              <MobileNavLink to="/shop" onClick={() => setMobileMenuOpen(false)}>Shop All</MobileNavLink>
              <MobileNavLink to="/shop?sort=newest" onClick={() => setMobileMenuOpen(false)}>New In</MobileNavLink>
              {categories?.map((cat) => (
                <MobileNavLink
                  key={cat.id}
                  to={`/shop?category=${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {cat.name}
                </MobileNavLink>
              ))}
              <MobileNavLink to="/pages/about" onClick={() => setMobileMenuOpen(false)}>About AK QIMAASH</MobileNavLink>
              <div className="divider my-3" />
              <MobileNavLink to="/wishlist" onClick={() => setMobileMenuOpen(false)}>Wishlist</MobileNavLink>
              <MobileNavLink to={user ? '/account' : '/auth/login'} onClick={() => setMobileMenuOpen(false)}>
                {user ? 'My Account' : 'Sign In'}
              </MobileNavLink>
            </nav>
          </div>
        )}
      </header>
    </>
  )
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation()
  const isActive = location.pathname === to || (to.includes('?') && location.search.includes(to.split('?')[1]))

  return (
    <Link
      to={to}
      className={cn(
        'text-xs tracking-[0.15em] font-sans font-medium transition-colors duration-200 uppercase py-1 relative',
        isActive
          ? 'text-brand-black after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-brand-black'
          : 'text-text-secondary hover:text-brand-black'
      )}
    >
      {children}
    </Link>
  )
}

function MobileNavLink({
  to,
  children,
  onClick,
}: {
  to: string
  children: React.ReactNode
  onClick?: () => void
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block py-2.5 px-2 text-sm font-sans text-text-primary hover:bg-brand-smoke transition-colors uppercase tracking-wider"
    >
      {children}
    </Link>
  )
}
