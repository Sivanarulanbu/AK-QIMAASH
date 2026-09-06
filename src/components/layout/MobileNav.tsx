import { Link, useLocation } from 'react-router-dom'
import { Home, ShoppingBag, Heart, Search } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { cn } from '@/utils'

export function MobileBottomNav() {
  const location = useLocation()
  const totalItems = useCartStore((s) => s.totalItems())
  const openCart = useCartStore((s) => s.openCart)
  const wishlistCount = useWishlistStore((s) => s.productIds.length)

  const isHome = location.pathname === '/'
  const isShop = location.pathname.startsWith('/shop')
  const isSearch = location.pathname.startsWith('/search')
  const isWishlist = location.pathname.startsWith('/wishlist')

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-sticky bg-surface-raised/95 backdrop-blur-md border-t border-border/80 md:hidden shadow-lg"
      aria-label="Mobile navigation"
    >
      <div className="grid grid-cols-5 h-16">
        {/* Home */}
        <Link
          to="/"
          className={cn(
            'flex flex-col items-center justify-center gap-1 text-[10px] font-sans uppercase tracking-wider font-medium transition-colors',
            isHome ? 'text-brand-black' : 'text-text-muted hover:text-text-secondary'
          )}
          aria-label="Home"
          aria-current={isHome ? 'page' : undefined}
        >
          <Home className="h-4 w-4 stroke-[1.5]" />
          <span>Home</span>
        </Link>

        {/* Shop */}
        <Link
          to="/shop"
          className={cn(
            'flex flex-col items-center justify-center gap-1 text-[10px] font-sans uppercase tracking-wider font-medium transition-colors',
            isShop ? 'text-brand-black' : 'text-text-muted hover:text-text-secondary'
          )}
          aria-label="Shop"
          aria-current={isShop ? 'page' : undefined}
        >
          <ShoppingBag className="h-4 w-4 stroke-[1.5]" />
          <span>Shop</span>
        </Link>

        {/* Search */}
        <Link
          to="/search"
          className={cn(
            'flex flex-col items-center justify-center gap-1 text-[10px] font-sans uppercase tracking-wider font-medium transition-colors',
            isSearch ? 'text-brand-black' : 'text-text-muted hover:text-text-secondary'
          )}
          aria-label="Search"
          aria-current={isSearch ? 'page' : undefined}
        >
          <Search className="h-4 w-4 stroke-[1.5]" />
          <span>Search</span>
        </Link>

        {/* Wishlist */}
        <Link
          to="/wishlist"
          className={cn(
            'flex flex-col items-center justify-center gap-1 text-[10px] font-sans uppercase tracking-wider font-medium transition-colors relative',
            isWishlist ? 'text-brand-black' : 'text-text-muted hover:text-text-secondary'
          )}
          aria-label="Wishlist"
          aria-current={isWishlist ? 'page' : undefined}
        >
          <div className="relative">
            <Heart className="h-4 w-4 stroke-[1.5]" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-brand-black text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                {wishlistCount}
              </span>
            )}
          </div>
          <span>Saved</span>
        </Link>

        {/* Bag */}
        <button
          onClick={openCart}
          className="flex flex-col items-center justify-center gap-1 text-[10px] font-sans uppercase tracking-wider font-medium text-text-muted hover:text-brand-black transition-colors relative"
          aria-label={`Open shopping bag with ${totalItems} items`}
        >
          <div className="relative">
            <ShoppingBag className="h-4 w-4 stroke-[1.5]" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-brand-black text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </div>
          <span>Bag</span>
        </button>
      </div>
    </nav>
  )
}
