import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { useCategories } from '@/features/products/useProducts'
import { cn } from '@/utils'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const location = useLocation()

  const totalItems = useCartStore((s) => s.totalItems())
  const openCart = useCartStore((s) => s.openCart)
  const user = useAuthStore((s) => s.user)
  const { data: categories } = useCategories()

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 4)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
    setSearchOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100)
    }
  }, [searchOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-sticky bg-surface-raised transition-shadow duration-200',
          isScrolled && 'shadow-sm'
        )}
      >
        {/* Top announcement bar */}
        <div className="bg-brand-black text-text-inverse text-center py-2 text-xs tracking-wide hidden sm:block">
          Free delivery on orders above $100 &middot; Cash on Delivery available
        </div>

        {/* Main navigation */}
        <div className="container-main">
          <div className="flex items-center h-16 gap-4">
            {/* Mobile menu button */}
            <button
              className="btn-icon btn-ghost md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Logo */}
            <Link
              to="/"
              className="flex-shrink-0 mr-auto md:mr-0"
              aria-label="AK QIMAASH Home"
            >
              <span className="font-editorial font-medium text-xl tracking-tighter text-brand-black">
                AK QIMAASH
              </span>
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center gap-1 mx-8 flex-1 justify-center" aria-label="Main navigation">
              <NavLink to="/shop">Shop</NavLink>
              <NavLink to="/shop?sort=newest">New Arrivals</NavLink>
              {categories?.slice(0, 4).map((cat) => (
                <NavLink key={cat.id} to={`/shop?category=${cat.slug}`}>
                  {cat.name}
                </NavLink>
              ))}
            </nav>

            {/* Desktop actions */}
            <div className="flex items-center gap-1">
              <button
                className="btn-icon btn-ghost"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
              >
                <Search className="h-[18px] w-[18px]" />
              </button>

              <Link
                to="/wishlist"
                className="btn-icon btn-ghost hidden sm:inline-flex"
                aria-label="Wishlist"
              >
                <Heart className="h-[18px] w-[18px]" />
              </Link>

              <Link
                to={user ? '/account' : '/auth/login'}
                className="btn-icon btn-ghost hidden sm:inline-flex"
                aria-label={user ? 'My Account' : 'Sign In'}
              >
                <User className="h-[18px] w-[18px]" />
              </Link>

              <button
                className="btn-icon btn-ghost relative"
                onClick={openCart}
                aria-label={`Shopping bag, ${totalItems} items`}
              >
                <ShoppingBag className="h-[18px] w-[18px]" />
                {totalItems > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 bg-brand-black text-white
                               text-[10px] font-semibold w-4 h-4 rounded-full
                               flex items-center justify-center"
                    aria-hidden="true"
                  >
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-surface-raised animate-fade-in">
            <nav className="container-main py-4 space-y-0.5" aria-label="Mobile navigation">
              <MobileNavLink to="/shop">Shop All</MobileNavLink>
              <MobileNavLink to="/shop?sort=newest">New Arrivals</MobileNavLink>
              {categories?.map((cat) => (
                <MobileNavLink key={cat.id} to={`/shop?category=${cat.slug}`}>
                  {cat.name}
                </MobileNavLink>
              ))}
              <div className="divider my-2" />
              <MobileNavLink to="/wishlist">Wishlist</MobileNavLink>
              <MobileNavLink to={user ? '/account' : '/auth/login'}>
                {user ? 'My Account' : 'Sign In'}
              </MobileNavLink>
            </nav>
          </div>
        )}
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div
          className="fixed inset-0 bg-brand-black/60 backdrop-blur-sm z-overlay flex items-start pt-20 px-4"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-2xl mx-auto bg-surface-raised rounded-xl shadow-xl overflow-hidden animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSearch} className="flex items-center px-4 py-3 gap-3">
              <Search className="h-5 w-5 text-text-muted flex-shrink-0" aria-hidden="true" />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="flex-1 text-base text-text-primary bg-transparent outline-none placeholder:text-text-disabled"
                aria-label="Search products"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="btn-icon btn-ghost"
                aria-label="Close search"
              >
                <X className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation()
  const isActive = location.pathname === to || location.search.includes(to.split('?')[1] || '___')

  return (
    <Link
      to={to}
      className={cn(
        'px-3 py-2 text-sm font-medium transition-colors duration-150 rounded',
        'hover:text-text-primary hover:bg-brand-smoke',
        isActive ? 'text-text-primary' : 'text-text-secondary'
      )}
    >
      {children}
    </Link>
  )
}

function MobileNavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="block py-2.5 px-2 text-base text-text-secondary hover:text-text-primary
                 hover:bg-brand-smoke rounded transition-colors duration-150"
    >
      {children}
    </Link>
  )
}
