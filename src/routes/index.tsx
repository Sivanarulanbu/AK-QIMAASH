import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { StorefrontLayout } from '@/components/layout/Layout'
import { AdminLayout } from '@/pages/admin/AdminLayout'
import { RequireRole } from '@/features/auth/RequireRole'
import { LoginPage, RegisterPage, ForgotPasswordPage } from '@/pages/auth/AuthPages'
import { AccountLayout, AccountProfilePage } from '@/pages/account/AccountPages'
import { OrdersPage, OrderDetailPage } from '@/pages/order/OrderPages'

// ─── Lazy-loaded pages ─────────────────────────────────────────────────────────────

const HomePage = lazy(() => import('@/pages/home/HomePage').then((m) => ({ default: m.HomePage })))
const ShopPage = lazy(() => import('@/pages/shop/ShopPage').then((m) => ({ default: m.ShopPage })))
const ProductDetailPage = lazy(() =>
  import('@/pages/product/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage }))
)
const CheckoutPage = lazy(() =>
  import('@/pages/checkout/CheckoutPage').then((m) => ({ default: m.CheckoutPage }))
)
const WishlistPage = lazy(() =>
  import('@/pages/wishlist/WishlistPage').then((m) => ({ default: m.WishlistPage }))
)
const SearchPage = lazy(() =>
  import('@/pages/shop/SearchPage').then((m) => ({ default: m.SearchPage }))
)
const AddressesPage = lazy(() =>
  import('@/pages/account/AddressesPage').then((m) => ({ default: m.AddressesPage }))
)
const StaticPage = lazy(() =>
  import('@/pages/static/StaticPage').then((m) => ({ default: m.StaticPage }))
)
const AboutPage = lazy(() =>
  import('@/pages/about/AboutPage').then((m) => ({ default: m.AboutPage }))
)
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
)

// MFA Auth
const MfaSetupPage = lazy(() =>
  import('@/pages/auth/MfaSetupPage').then((m) => ({ default: m.MfaSetupPage }))
)
const MfaChallengePage = lazy(() =>
  import('@/pages/auth/MfaChallengePage').then((m) => ({ default: m.MfaChallengePage }))
)

// Admin
const AdminDashboard = lazy(() =>
  import('@/pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
)
const AdminOrdersPage = lazy(() =>
  import('@/pages/admin/AdminOrders').then((m) => ({ default: m.AdminOrdersPage }))
)
const AdminOrderDetail = lazy(() =>
  import('@/pages/admin/AdminOrderDetail').then((m) => ({ default: m.AdminOrderDetail }))
)
const AdminProductsPage = lazy(() =>
  import('@/pages/admin/AdminProducts').then((m) => ({ default: m.AdminProductsPage }))
)
const AdminProductDetail = lazy(() =>
  import('@/pages/admin/AdminProductDetail').then((m) => ({ default: m.AdminProductDetail }))
)
const AdminInventoryPage = lazy(() =>
  import('@/pages/admin/AdminInventory').then((m) => ({ default: m.AdminInventoryPage }))
)
const AdminCustomersPage = lazy(() =>
  import('@/pages/admin/AdminCustomers').then((m) => ({ default: m.AdminCustomersPage }))
)
const AdminStaffPage = lazy(() =>
  import('@/pages/admin/AdminStaffPage').then((m) => ({ default: m.AdminStaffPage }))
)
const AdminReviewsPage = lazy(() =>
  import('@/pages/admin/AdminReviews').then((m) => ({ default: m.AdminReviewsPage }))
)
const AdminAuditLogPage = lazy(() =>
  import('@/pages/admin/AdminAuditLog').then((m) => ({ default: m.AdminAuditLogPage }))
)
const AdminSettingsPage = lazy(() =>
  import('@/pages/admin/AdminSettings').then((m) => ({ default: m.AdminSettingsPage }))
)

// ─── Loader ────────────────────────────────────────────────────────────────────────

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center" aria-label="Loading page">
      <div className="h-5 w-5 border-2 border-brand-black border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function S({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

// ─── Router ────────────────────────────────────────────────────────────────────────

export const router = createBrowserRouter([
  // ── Storefront ──
  {
    element: <StorefrontLayout />,
    children: [
      { index: true, element: <S><HomePage /></S> },
      { path: 'shop', element: <S><ShopPage /></S> },
      { path: 'products/:slug', element: <S><ProductDetailPage /></S> },
      { path: 'search', element: <S><SearchPage /></S> },
      { path: 'wishlist', element: <S><WishlistPage /></S> },
      { path: 'cart', element: <Navigate to="/shop" replace /> },
      { path: 'checkout', element: <S><CheckoutPage /></S> },

      // Auth
      { path: 'auth/login', element: <LoginPage /> },
      { path: 'auth/register', element: <RegisterPage /> },
      { path: 'auth/forgot-password', element: <ForgotPasswordPage /> },
      { path: 'auth/mfa-setup', element: <S><MfaSetupPage /></S> },
      { path: 'auth/mfa-challenge', element: <S><MfaChallengePage /></S> },

      // Account (auth guard inside AccountLayout)
      {
        path: 'account',
        element: <AccountLayout />,
        children: [
          { index: true, element: <AccountProfilePage /> },
          { path: 'orders', element: <OrdersPage /> },
          { path: 'orders/:orderId', element: <OrderDetailPage /> },
          { path: 'addresses', element: <S><AddressesPage /></S> },
          { path: 'wishlist', element: <S><WishlistPage /></S> },
        ],
      },

      // Static pages & About
      { path: 'about', element: <S><AboutPage /></S> },
      { path: 'pages/about', element: <S><AboutPage /></S> },
      { path: 'pages/:slug', element: <S><StaticPage /></S> },

      // 404
      { path: '*', element: <S><NotFoundPage /></S> },
    ],
  },

  // ── Admin (Role-Based Protected Routes) ──
  {
    path: 'admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: (
          <RequireRole roles={['ADMIN', 'ORDER_MANAGER', 'CONTENT_MANAGER']}>
            <S><AdminDashboard /></S>
          </RequireRole>
        ),
      },
      {
        path: 'orders',
        element: (
          <RequireRole roles={['ADMIN', 'ORDER_MANAGER']}>
            <S><AdminOrdersPage /></S>
          </RequireRole>
        ),
      },
      {
        path: 'orders/:orderId',
        element: (
          <RequireRole roles={['ADMIN', 'ORDER_MANAGER']}>
            <S><AdminOrderDetail /></S>
          </RequireRole>
        ),
      },
      {
        path: 'products',
        element: (
          <RequireRole roles={['ADMIN', 'CONTENT_MANAGER']}>
            <S><AdminProductsPage /></S>
          </RequireRole>
        ),
      },
      {
        path: 'products/:productId',
        element: (
          <RequireRole roles={['ADMIN', 'CONTENT_MANAGER']}>
            <S><AdminProductDetail /></S>
          </RequireRole>
        ),
      },
      {
        path: 'inventory',
        element: (
          <RequireRole roles={['ADMIN', 'ORDER_MANAGER']}>
            <S><AdminInventoryPage /></S>
          </RequireRole>
        ),
      },
      {
        path: 'customers',
        element: (
          <RequireRole roles={['ADMIN', 'ORDER_MANAGER']}>
            <S><AdminCustomersPage /></S>
          </RequireRole>
        ),
      },
      {
        path: 'staff',
        element: (
          <RequireRole roles={['ADMIN']}>
            <S><AdminStaffPage /></S>
          </RequireRole>
        ),
      },
      {
        path: 'reviews',
        element: (
          <RequireRole roles={['ADMIN', 'CONTENT_MANAGER']}>
            <S><AdminReviewsPage /></S>
          </RequireRole>
        ),
      },
      {
        path: 'audit',
        element: (
          <RequireRole roles={['ADMIN']}>
            <S><AdminAuditLogPage /></S>
          </RequireRole>
        ),
      },
      {
        path: 'settings',
        element: (
          <RequireRole roles={['ADMIN']}>
            <S><AdminSettingsPage /></S>
          </RequireRole>
        ),
      },
    ],
  },
])
