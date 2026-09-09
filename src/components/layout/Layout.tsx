import { type ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { MobileBottomNav } from './MobileNav'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { SearchOverlay } from './SearchOverlay'

export function StorefrontLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
      <CartDrawer />
      <SearchOverlay />
    </div>
  )
}

interface AdminLayoutProps {
  children?: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Outlet />
    </div>
  )
}
