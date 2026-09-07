import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Smartphone,
  Tablet,
  Monitor,
  Maximize2,
  Columns,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  User,
  ShieldCheck,
  Heart,
  Search,
  Filter,
  ArrowRight,
  CheckCircle2,
  Package,
  Layers,
  Palette,
  Code,
  Sliders,
  Eye,
  ChevronRight,
  Menu,
  X,
  Plus,
  Minus
} from 'lucide-react'
import { SEOHead } from '@/components/seo/SEOHead'
import { cn } from '@/utils'
import { SEED_PRODUCTS, SEED_CATEGORIES } from '@/data/seedProducts'

type DevicePreset = 'mobile' | 'mobile-max' | 'tablet' | 'desktop' | 'fluid'
type ShowcaseView = 'storefront' | 'pdp' | 'account' | 'admin' | 'mirror'

interface DeviceConfig {
  id: DevicePreset
  label: string
  icon: typeof Smartphone
  width: number | string
  height: number
  description: string
}

const DEVICE_CONFIGS: Record<DevicePreset, DeviceConfig> = {
  mobile: {
    id: 'mobile',
    label: 'iPhone (375px)',
    icon: Smartphone,
    width: 375,
    height: 720,
    description: 'Compact mobile viewport with bottom navigation dock and 2-column grid',
  },
  'mobile-max': {
    id: 'mobile-max',
    label: 'iPhone Pro Max (414px)',
    icon: Smartphone,
    width: 414,
    height: 780,
    description: 'Modern large mobile device with increased vertical real estate',
  },
  tablet: {
    id: 'tablet',
    label: 'iPad Tablet (768px)',
    icon: Tablet,
    width: 768,
    height: 820,
    description: '3-column responsive layout with visible filter toggles and top navigation',
  },
  desktop: {
    id: 'desktop',
    label: 'Desktop (1024px)',
    icon: Monitor,
    width: 1024,
    height: 800,
    description: 'Full luxury editorial experience with persistent sidebars and 4-column catalog',
  },
  fluid: {
    id: 'fluid',
    label: 'Fluid 100%',
    icon: Maximize2,
    width: '100%',
    height: 800,
    description: 'Full-width responsive container scaling dynamically to your actual screen',
  },
}

export function ShowcasePage() {
  const [device, setDevice] = useState<DevicePreset>('mobile')
  const [view, setView] = useState<ShowcaseView>('storefront')
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [zoomScale, setZoomScale] = useState<number>(100)
  const [showChassis, setShowChassis] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState<'preview' | 'strategy' | 'code'>('preview')

  // Simulation states
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [wishlist, setWishlist] = useState<string[]>([])
  const [cartCount, setCartCount] = useState<number>(2)
  const [cartOpen, setCartOpen] = useState<boolean>(false)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState<boolean>(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false)
  const [pdpSelectedSize, setPdpSelectedSize] = useState<string>('M')
  const [pdpSelectedColor, setPdpSelectedColor] = useState<string>('Charcoal Black')
  const [accountTab, setAccountTab] = useState<'orders' | 'addresses' | 'profile'>('orders')
  const [adminNavOpen, setAdminNavOpen] = useState<boolean>(false)

  const activeDeviceConfig = DEVICE_CONFIGS[device]

  // Calculate actual dimensions based on orientation
  const viewportWidth = useMemo(() => {
    if (activeDeviceConfig.width === '100%') return '100%'
    const baseW = activeDeviceConfig.width as number
    const baseH = activeDeviceConfig.height
    return orientation === 'landscape' ? Math.min(baseH, 1100) : baseW
  }, [activeDeviceConfig, orientation])

  const viewportHeight = useMemo(() => {
    const baseH = activeDeviceConfig.height
    const baseW = typeof activeDeviceConfig.width === 'number' ? activeDeviceConfig.width : 800
    return orientation === 'landscape' ? Math.min(baseW, 600) : baseH
  }, [activeDeviceConfig, orientation])

  // Active Breakpoint classification
  const currentBreakpoint = useMemo(() => {
    if (typeof viewportWidth === 'string') return 'Desktop (lg/xl — Fluid)'
    if (viewportWidth < 640) return 'Mobile (< 640px)'
    if (viewportWidth < 1024) return 'Tablet (640px – 1023px)'
    return 'Desktop (≥ 1024px)'
  }, [viewportWidth])

  const toggleWishlist = (id: string) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const sampleProduct = SEED_PRODUCTS[0]

  return (
    <div className="min-h-screen bg-brand-ivory text-brand-black flex flex-col font-sans">
      <SEOHead
        title="Interactive Responsive Design Showcase — AK QIMAASH"
        description="Explore how AK QIMAASH seamlessly adapts across mobile, tablet, and desktop viewports while preserving a unified luxury modest fashion aesthetic."
        canonical="/showcase"
      />

      {/* Top Banner / Breadcrumb */}
      <header className="bg-brand-charcoal text-white border-b border-brand-graphite py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-brand-silver mb-1">
              <Link to="/" className="hover:text-white transition-colors">AK QIMAASH</Link>
              <ChevronRight className="w-3 h-3 text-brand-mist" />
              <span className="text-amber-400 font-medium">Responsive Design Showcase</span>
            </div>
            <h1 className="font-editorial text-2xl sm:text-3xl font-medium tracking-tight">
              Adaptive Luxury Layout Showcase
            </h1>
            <p className="text-xs sm:text-sm text-brand-silver">
              Demonstrating unified data, parity between mobile and web views, and smart breakpoint techniques.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/shop"
              className="px-3.5 py-1.5 rounded-sm bg-white/10 hover:bg-white/15 text-white text-xs font-medium tracking-wide transition-colors"
            >
              Back to Store
            </Link>
            <Link
              to="/admin"
              className="px-3.5 py-1.5 rounded-sm bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 text-xs font-medium tracking-wide transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Suite
            </Link>
          </div>
        </div>
      </header>

      {/* Interactive Control Console */}
      <section className="bg-surface-raised border-b border-border shadow-xs sticky top-0 z-30 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Device Presets */}
          <div className="flex items-center gap-1.5 bg-brand-smoke p-1 rounded-sm overflow-x-auto">
            {(Object.keys(DEVICE_CONFIGS) as DevicePreset[]).map((key) => {
              const cfg = DEVICE_CONFIGS[key]
              const Icon = cfg.icon
              const isSelected = device === key
              return (
                <button
                  key={key}
                  onClick={() => {
                    setDevice(key)
                    if (view === 'mirror') setView('storefront')
                  }}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xs transition-all whitespace-nowrap',
                    isSelected
                      ? 'bg-brand-black text-white shadow-xs'
                      : 'text-text-secondary hover:text-brand-black hover:bg-white/50'
                  )}
                  title={cfg.description}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cfg.label}</span>
                </button>
              )
            })}

            {/* Mirror Side-by-Side Mode */}
            <button
              onClick={() => setView('mirror')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xs transition-all whitespace-nowrap border-l border-border/70 pl-2.5',
                view === 'mirror'
                  ? 'bg-accent text-white shadow-xs'
                  : 'text-accent-dark hover:bg-accent/10'
              )}
              title="Compare Mobile and Desktop side-by-side"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Mirror Dual View</span>
            </button>
          </div>

          {/* View Shell Selector (Storefront, PDP, Account, Admin) */}
          {view !== 'mirror' && (
            <div className="flex items-center gap-1 bg-brand-smoke p-1 rounded-sm">
              <button
                onClick={() => setView('storefront')}
                className={cn(
                  'px-2.5 py-1 text-xs font-medium rounded-xs transition-all',
                  view === 'storefront' ? 'bg-brand-black text-white' : 'text-text-secondary hover:text-brand-black'
                )}
              >
                Storefront
              </button>
              <button
                onClick={() => setView('pdp')}
                className={cn(
                  'px-2.5 py-1 text-xs font-medium rounded-xs transition-all',
                  view === 'pdp' ? 'bg-brand-black text-white' : 'text-text-secondary hover:text-brand-black'
                )}
              >
                Product Detail (PDP)
              </button>
              <button
                onClick={() => setView('account')}
                className={cn(
                  'px-2.5 py-1 text-xs font-medium rounded-xs transition-all',
                  view === 'account' ? 'bg-brand-black text-white' : 'text-text-secondary hover:text-brand-black'
                )}
              >
                Account Portal
              </button>
              <button
                onClick={() => setView('admin')}
                className={cn(
                  'px-2.5 py-1 text-xs font-medium rounded-xs transition-all',
                  view === 'admin' ? 'bg-brand-black text-white' : 'text-text-secondary hover:text-brand-black'
                )}
              >
                Admin Suite
              </button>
            </div>
          )}

          {/* Viewport Attributes & Secondary Toggles */}
          <div className="flex items-center gap-3 text-xs">
            {/* Orientation */}
            {device !== 'fluid' && view !== 'mirror' && (
              <button
                onClick={() => setOrientation((o) => (o === 'portrait' ? 'landscape' : 'portrait'))}
                className="flex items-center gap-1 text-text-secondary hover:text-brand-black bg-brand-smoke px-2.5 py-1 rounded-sm"
                title="Toggle Portrait / Landscape"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="capitalize">{orientation}</span>
              </button>
            )}

            {/* Chassis Bezel toggle */}
            {device !== 'fluid' && view !== 'mirror' && (
              <label className="hidden sm:flex items-center gap-1.5 cursor-pointer text-text-secondary hover:text-brand-black select-none">
                <input
                  type="checkbox"
                  checked={showChassis}
                  onChange={(e) => setShowChassis(e.target.checked)}
                  className="rounded text-brand-black focus:ring-0"
                />
                <span>Device Bezel</span>
              </label>
            )}

            {/* Zoom Controls */}
            {device !== 'fluid' && view !== 'mirror' && (
              <div className="flex items-center gap-1 bg-brand-smoke px-1.5 py-0.5 rounded-sm">
                <button
                  onClick={() => setZoomScale((z) => Math.max(50, z - 10))}
                  className="p-1 text-text-secondary hover:text-brand-black"
                  title="Zoom Out"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-[11px] font-mono px-1 min-w-[2.5rem] text-center font-medium">
                  {zoomScale}%
                </span>
                <button
                  onClick={() => setZoomScale((z) => Math.min(150, z + 10))}
                  className="p-1 text-text-secondary hover:text-brand-black"
                  title="Zoom In"
                >
                  <Plus className="w-3 h-3" />
                </button>
                {zoomScale !== 100 && (
                  <button
                    onClick={() => setZoomScale(100)}
                    className="text-[10px] text-accent px-1 hover:underline font-medium"
                    title="Reset to 100%"
                  >
                    Reset
                  </button>
                )}
              </div>
            )}

            {/* Active Breakpoint Pill */}
            <div className="inline-flex items-center gap-1.5 bg-brand-ivory border border-border px-2.5 py-1 rounded-full font-mono text-[11px] text-brand-charcoal">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{currentBreakpoint}</span>
              <span className="text-text-muted">
                ({typeof viewportWidth === 'number' ? `${viewportWidth}×${viewportHeight}px` : 'Fluid'})
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Showcase Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 flex flex-col gap-8">
        {/* Navigation Tabs between Interactive Preview, Responsive Strategy & CSS Code */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('preview')}
            className={cn(
              'flex items-center gap-2 pb-3 px-4 text-xs sm:text-sm font-medium border-b-2 tracking-wide uppercase transition-colors',
              activeTab === 'preview'
                ? 'border-brand-black text-brand-black font-semibold'
                : 'border-transparent text-text-secondary hover:text-brand-black'
            )}
          >
            <Eye className="w-4 h-4" />
            Interactive Viewport Simulation
          </button>
          <button
            onClick={() => setActiveTab('strategy')}
            className={cn(
              'flex items-center gap-2 pb-3 px-4 text-xs sm:text-sm font-medium border-b-2 tracking-wide uppercase transition-colors',
              activeTab === 'strategy'
                ? 'border-brand-black text-brand-black font-semibold'
                : 'border-transparent text-text-secondary hover:text-brand-black'
            )}
          >
            <Layers className="w-4 h-4" />
            Responsive Architecture Strategy
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={cn(
              'flex items-center gap-2 pb-3 px-4 text-xs sm:text-sm font-medium border-b-2 tracking-wide uppercase transition-colors',
              activeTab === 'code'
                ? 'border-brand-black text-brand-black font-semibold'
                : 'border-transparent text-text-secondary hover:text-brand-black'
            )}
          >
            <Code className="w-4 h-4" />
            Mobile-First Code & Breakpoints
          </button>
        </div>

        {/* ─── TAB 1: INTERACTIVE VIEWPORT SIMULATION ─── */}
        {activeTab === 'preview' && (
          <div className="flex flex-col items-center">
            {/* Live Breakpoint HUD Notice */}
            <div className="w-full bg-surface-raised border border-border rounded-sm p-4 mb-6 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-accent/10 text-accent flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-brand-black">
                    Live Parity Engine: {view === 'mirror' ? 'Dual Mirror Mode' : view.toUpperCase()}
                  </h4>
                  <p className="text-xs text-text-secondary">
                    Notice how the layout reconfigures dynamically: single codebase, zero layout surprises, unified luxury modest branding.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono bg-brand-ivory px-3 py-1.5 rounded border border-border/80">
                <span className="text-text-muted">Active Rule:</span>
                <span className="font-semibold text-brand-black">
                  {device === 'mobile' || device === 'mobile-max'
                    ? '2-Col Grid • Hidden Sidebar → Slide Drawer • Bottom Dock'
                    : device === 'tablet'
                    ? '3-Col Grid • Top Nav • Slide-Over Filters'
                    : '4-Col Grid • Persistent Sidebar • Full Editorial Bar'}
                </span>
              </div>
            </div>

            {/* Viewport Frame Renderer */}
            {view === 'mirror' ? (
              /* DUAL MIRROR MODE: Mobile (375px) alongside Desktop (1024px) */
              <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                {/* Mobile Viewport (Left) */}
                <div className="xl:col-span-4 flex flex-col items-center">
                  <div className="mb-2 text-center">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-black bg-brand-smoke px-3 py-1 rounded-full">
                      <Smartphone className="w-3.5 h-3.5 text-accent" />
                      Mobile View (375px)
                    </span>
                  </div>
                  <div className="w-[375px] h-[700px] bg-white rounded-3xl border-8 border-brand-charcoal shadow-xl overflow-hidden flex flex-col relative">
                    {/* Simulated Mobile Status Notch */}
                    <div className="h-5 bg-brand-charcoal w-full flex items-center justify-center">
                      <div className="w-20 h-3 bg-brand-black rounded-b-md" />
                    </div>

                    {/* Mobile App Container */}
                    <div className="flex-1 overflow-y-auto relative flex flex-col">
                      <SimulatedStorefrontContent
                        isMobile={true}
                        category={selectedCategory}
                        setCategory={setSelectedCategory}
                        wishlist={wishlist}
                        toggleWishlist={toggleWishlist}
                        cartCount={cartCount}
                        setCartCount={setCartCount}
                        setCartOpen={setCartOpen}
                        mobileMenuOpen={mobileMenuOpen}
                        setMobileMenuOpen={setMobileMenuOpen}
                        filterDrawerOpen={filterDrawerOpen}
                        setFilterDrawerOpen={setFilterDrawerOpen}
                      />
                    </div>

                    {/* Mobile Bottom Dock Nav */}
                    <SimulatedMobileBottomNav cartCount={cartCount} onOpenCart={() => setCartOpen(true)} />
                  </div>
                </div>

                {/* Desktop Viewport (Right) */}
                <div className="xl:col-span-8 flex flex-col items-center w-full">
                  <div className="mb-2 text-center">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-black bg-brand-smoke px-3 py-1 rounded-full">
                      <Monitor className="w-3.5 h-3.5 text-accent" />
                      Desktop Web View (Expanded)
                    </span>
                  </div>
                  <div className="w-full h-[700px] bg-white rounded-xl border-4 border-brand-charcoal shadow-xl overflow-hidden flex flex-col">
                    {/* Desktop Browser Toolbar */}
                    <div className="h-7 bg-brand-charcoal/90 text-brand-silver px-4 flex items-center gap-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      </div>
                      <div className="mx-auto bg-brand-black/40 px-6 py-0.5 rounded text-[11px] font-mono text-brand-mist">
                        https://akqimaash.sg/shop
                      </div>
                    </div>

                    {/* Desktop App Container */}
                    <div className="flex-1 overflow-y-auto">
                      <SimulatedStorefrontContent
                        isMobile={false}
                        category={selectedCategory}
                        setCategory={setSelectedCategory}
                        wishlist={wishlist}
                        toggleWishlist={toggleWishlist}
                        cartCount={cartCount}
                        setCartCount={setCartCount}
                        setCartOpen={setCartOpen}
                        mobileMenuOpen={false}
                        setMobileMenuOpen={() => {}}
                        filterDrawerOpen={false}
                        setFilterDrawerOpen={() => {}}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* SINGLE DEVICE VIEWPORT WITH INTERACTIVE SHELL */
              <div
                className={cn(
                  'transition-all duration-300 relative flex flex-col bg-white overflow-hidden',
                  showChassis && device !== 'fluid'
                    ? 'border-[10px] border-brand-charcoal rounded-3xl shadow-2xl'
                    : 'border border-border rounded-sm shadow-md w-full'
                )}
                style={{
                  width: typeof viewportWidth === 'number' ? `${viewportWidth}px` : viewportWidth,
                  height: `${viewportHeight}px`,
                  maxWidth: '100%',
                  transform: zoomScale !== 100 ? `scale(${zoomScale / 100})` : undefined,
                  transformOrigin: 'top center',
                }}
              >
                {/* Device Speaker / Notch on Mobile chassis */}
                {showChassis && (device === 'mobile' || device === 'mobile-max') && orientation === 'portrait' && (
                  <div className="h-5 bg-brand-charcoal w-full flex items-center justify-center flex-shrink-0">
                    <div className="w-24 h-3.5 bg-brand-black rounded-b-lg flex items-center justify-center">
                      <div className="w-8 h-1 bg-brand-graphite rounded-full" />
                    </div>
                  </div>
                )}

                {/* Simulated Content Area by Selected Shell */}
                <div className="flex-1 overflow-y-auto flex flex-col relative">
                  {view === 'storefront' && (
                    <SimulatedStorefrontContent
                      isMobile={typeof viewportWidth === 'number' ? viewportWidth < 768 : false}
                      category={selectedCategory}
                      setCategory={setSelectedCategory}
                      wishlist={wishlist}
                      toggleWishlist={toggleWishlist}
                      cartCount={cartCount}
                      setCartCount={setCartCount}
                      setCartOpen={setCartOpen}
                      mobileMenuOpen={mobileMenuOpen}
                      setMobileMenuOpen={setMobileMenuOpen}
                      filterDrawerOpen={filterDrawerOpen}
                      setFilterDrawerOpen={setFilterDrawerOpen}
                    />
                  )}

                  {view === 'pdp' && (
                    <SimulatedPdpContent
                      isMobile={typeof viewportWidth === 'number' ? viewportWidth < 768 : false}
                      product={sampleProduct}
                      selectedSize={pdpSelectedSize}
                      setSelectedSize={setPdpSelectedSize}
                      selectedColor={pdpSelectedColor}
                      setSelectedColor={setPdpSelectedColor}
                      onAddToCart={() => setCartCount((c) => c + 1)}
                    />
                  )}

                  {view === 'account' && (
                    <SimulatedAccountContent
                      isMobile={typeof viewportWidth === 'number' ? viewportWidth < 768 : false}
                      activeTab={accountTab}
                      setActiveTab={setAccountTab}
                    />
                  )}

                  {view === 'admin' && (
                    <SimulatedAdminContent
                      isMobile={typeof viewportWidth === 'number' ? viewportWidth < 768 : false}
                      sidebarOpen={adminNavOpen}
                      setSidebarOpen={setAdminNavOpen}
                    />
                  )}
                </div>

                {/* Conditional Mobile Bottom Dock on Storefront/PDP */}
                {(view === 'storefront' || view === 'pdp') &&
                  (typeof viewportWidth === 'number' ? viewportWidth < 768 : false) && (
                    <SimulatedMobileBottomNav cartCount={cartCount} onOpenCart={() => setCartOpen(true)} />
                  )}

                {/* Interactive Simulated Slide-Over Cart Drawer */}
                {cartOpen && (
                  <div className="absolute inset-0 z-50 bg-brand-black/40 flex justify-end">
                    <div className="w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
                      <div className="p-4 border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-brand-black" />
                          <h3 className="font-editorial text-lg font-medium">Shopping Bag ({cartCount})</h3>
                        </div>
                        <button
                          onClick={() => setCartOpen(false)}
                          className="p-1 hover:bg-brand-smoke rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Free shipping progress indicator */}
                      <div className="p-3 bg-brand-ivory border-b border-border text-xs">
                        <div className="flex justify-between font-medium mb-1">
                          <span>Singapore Delivery</span>
                          <span className="text-emerald-700 font-semibold">Free above $100</span>
                        </div>
                        <div className="w-full bg-brand-smoke rounded-full h-1.5 overflow-hidden">
                          <div className="bg-accent h-full rounded-full" style={{ width: '85%' }} />
                        </div>
                        <p className="text-[11px] text-text-muted mt-1">Add $11.00 more for Free Next-Day Courier.</p>
                      </div>

                      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                        <div className="flex gap-3 border-b border-border/60 pb-3">
                          <div className="w-14 h-18 bg-brand-smoke rounded-xs overflow-hidden flex-shrink-0 flex items-center justify-center">
                            <span className="text-[10px] text-text-muted uppercase">Linen</span>
                          </div>
                          <div className="flex-1 text-xs">
                            <h4 className="font-medium text-brand-black">Relaxed French Linen Shirt</h4>
                            <p className="text-text-muted">Size: M • Charcoal Black</p>
                            <p className="font-semibold mt-1">SGD $89.00</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 border-t border-border bg-surface-raised">
                        <div className="flex justify-between text-xs mb-2">
                          <span className="text-text-secondary">Subtotal (incl. 9% GST)</span>
                          <span className="font-semibold text-brand-black">SGD $89.00</span>
                        </div>
                        <button
                          onClick={() => alert('Proceeding to Singapore checkout validation...')}
                          className="w-full py-2.5 bg-brand-black hover:bg-brand-charcoal text-white text-xs font-medium uppercase tracking-wider rounded-xs transition-colors"
                        >
                          Checkout (Cash on Delivery)
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 2: RESPONSIVE ARCHITECTURE STRATEGY ─── */}
        {activeTab === 'strategy' && (
          <div className="space-y-8">
            {/* 1. Unified Data & Logic */}
            <div className="bg-white border border-border p-6 rounded-sm shadow-2xs">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-brand-black text-white text-xs flex items-center justify-center font-bold">1</span>
                <h3 className="font-editorial text-xl font-medium">Unified Data & Logic</h3>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed mb-4">
                AK QIMAASH does not operate a siloed or stripped-down mobile site. The exact same database schema,
                Zustand stores (<code className="text-xs bg-brand-smoke px-1 py-0.5 rounded">cartStore</code>, <code className="text-xs bg-brand-smoke px-1 py-0.5 rounded">wishlistStore</code>, <code className="text-xs bg-brand-smoke px-1 py-0.5 rounded">authStore</code>),
                and TanStack React Query hooks feed mobile phones, iPads, and ultra-wide desktop screens alike.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-brand-ivory p-3 rounded-xs border border-border/80">
                  <h4 className="font-semibold text-brand-black mb-1">State Parity</h4>
                  <p className="text-text-muted">Cart items added on mobile persist seamlessly if the window is resized or accessed across sessions.</p>
                </div>
                <div className="bg-brand-ivory p-3 rounded-xs border border-border/80">
                  <h4 className="font-semibold text-brand-black mb-1">Single Codebase</h4>
                  <p className="text-text-muted">One unified Vite + React 19 app avoids duplicated API calls and divergent checkout logic.</p>
                </div>
                <div className="bg-brand-ivory p-3 rounded-xs border border-border/80">
                  <h4 className="font-semibold text-brand-black mb-1">Transactional Continuity</h4>
                  <p className="text-text-muted">Email confirmation triggers & Brevo delivery engine operate identically across all viewports.</p>
                </div>
              </div>
            </div>

            {/* 2. Smart Breakpoint Strategy Table */}
            <div className="bg-white border border-border p-6 rounded-sm shadow-2xs">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-brand-black text-white text-xs flex items-center justify-center font-bold">2</span>
                <h3 className="font-editorial text-xl font-medium">Smart Breakpoint Strategy</h3>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed mb-4">
                Tailwind CSS breakpoints map directly to targeted ergonomic device zones:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-brand-charcoal text-white">
                      <th className="p-3 font-medium">Breakpoint</th>
                      <th className="p-3 font-medium">Screen Range</th>
                      <th className="p-3 font-medium">Catalog Grid Cols</th>
                      <th className="p-3 font-medium">Filter & Sidebar Behavior</th>
                      <th className="p-3 font-medium">Navigation Ergonomics</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr className="hover:bg-brand-ivory/50">
                      <td className="p-3 font-semibold text-brand-black">Mobile</td>
                      <td className="p-3 font-mono text-text-muted">&lt; 640px</td>
                      <td className="p-3 font-medium text-accent">2 Columns (Stacked)</td>
                      <td className="p-3">Hidden → Slide-over Drawer Sheet</td>
                      <td className="p-3">Fixed 5-icon Bottom Dock (`MobileNav`)</td>
                    </tr>
                    <tr className="hover:bg-brand-ivory/50">
                      <td className="p-3 font-semibold text-brand-black">Tablet (sm / md)</td>
                      <td className="p-3 font-mono text-text-muted">640px – 1023px</td>
                      <td className="p-3 font-medium text-accent">3 Columns</td>
                      <td className="p-3">Collapsible Narrow Drawer (160px)</td>
                      <td className="p-3">Top Navigation Bar with responsive icons</td>
                    </tr>
                    <tr className="hover:bg-brand-ivory/50">
                      <td className="p-3 font-semibold text-brand-black">Desktop (lg / xl)</td>
                      <td className="p-3 font-mono text-text-muted">≥ 1024px</td>
                      <td className="p-3 font-medium text-accent">4 Columns</td>
                      <td className="p-3">Persistent Sticky Sidebar (200px)</td>
                      <td className="p-3">Full Editorial Navigation + Hover Collections</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Continuous Design Language & Spacing */}
            <div className="bg-white border border-border p-6 rounded-sm shadow-2xs">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-brand-black text-white text-xs flex items-center justify-center font-bold">3</span>
                <h3 className="font-editorial text-xl font-medium">Continuous Luxury Design Language</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <h4 className="text-xs uppercase font-semibold tracking-wider text-text-secondary mb-2">
                    Typography Scaling
                  </h4>
                  <div className="space-y-3 bg-brand-ivory p-4 rounded-xs border border-border/80">
                    <div>
                      <span className="text-[10px] uppercase text-text-muted font-mono">Headlines (Cormorant Garamond)</span>
                      <p className="font-editorial text-2xl sm:text-3xl text-brand-black font-medium">
                        Contemporary Modest Tailoring
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-text-muted font-mono">Interface & Body (Inter)</span>
                      <p className="font-sans text-xs sm:text-sm text-text-secondary leading-relaxed">
                        Precision cut French Normandy linen adapted for Singapore tropical humidity.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs uppercase font-semibold tracking-wider text-text-secondary mb-2 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-accent" />
                    Curated Palette Parity
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="p-3 rounded bg-brand-black text-white text-center text-[10px] font-mono">
                      #0E0E0E<br /><span className="text-[9px] text-brand-silver">Charcoal</span>
                    </div>
                    <div className="p-3 rounded bg-accent text-white text-center text-[10px] font-mono">
                      #B05C3A<br /><span className="text-[9px] text-accent-light">Terracotta</span>
                    </div>
                    <div className="p-3 rounded bg-brand-ivory text-brand-black border border-border text-center text-[10px] font-mono">
                      #F5F4F0<br /><span className="text-[9px] text-text-muted">Ivory</span>
                    </div>
                    <div className="p-3 rounded bg-brand-smoke text-brand-black border border-border text-center text-[10px] font-mono">
                      #EBEBEB<br /><span className="text-[9px] text-text-muted">Smoke</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 3: MOBILE-FIRST CODE PATTERNS ─── */}
        {activeTab === 'code' && (
          <div className="space-y-6">
            <div className="bg-brand-charcoal text-white p-6 rounded-sm shadow-md font-mono text-xs">
              <div className="flex items-center justify-between border-b border-brand-graphite pb-3 mb-4">
                <span className="text-accent font-medium">Responsive Tailwind CSS Architecture</span>
                <span className="text-brand-silver text-[11px]">Mobile-First Progression</span>
              </div>
              <pre className="text-brand-ivory overflow-x-auto leading-relaxed">
{`/* 1. Base Mobile (< 640px) */
.product-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}
.header {
  height: 3.5rem; /* 56px */
  padding: 0 1rem;
}
.sidebar-filters {
  display: none; /* Swapped for fixed slide-over drawer */
}
.mobile-bottom-dock {
  display: flex;
  position: fixed;
  bottom: 0;
  width: 100%;
}

/* 2. Tablet (640px - 1023px) */
@media (min-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.5rem;
  }
  .header {
    height: 4rem; /* 64px */
    padding: 0 1.5rem;
  }
  .mobile-bottom-dock {
    display: none;
  }
}

/* 3. Desktop Luxury (>= 1024px) */
@media (min-width: 1024px) {
  .product-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 2rem;
  }
  .sidebar-filters {
    display: block;
    width: 200px;
    position: sticky;
    top: 5rem;
  }
  .account-layout {
    display: grid;
    grid-template-columns: 16rem 1fr;
    gap: 2rem;
  }
}`}
              </pre>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATION SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

interface StorefrontProps {
  isMobile: boolean
  category: string
  setCategory: (c: string) => void
  wishlist: string[]
  toggleWishlist: (id: string) => void
  cartCount: number
  setCartCount: React.Dispatch<React.SetStateAction<number>>
  setCartOpen: (open: boolean) => void
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
  filterDrawerOpen: boolean
  setFilterDrawerOpen: (open: boolean) => void
}

function SimulatedStorefrontContent({
  isMobile,
  category,
  setCategory,
  wishlist,
  toggleWishlist,
  cartCount,
  setCartCount,
  setCartOpen,
  mobileMenuOpen,
  setMobileMenuOpen,
  filterDrawerOpen,
  setFilterDrawerOpen,
}: StorefrontProps) {
  return (
    <div className="flex-1 flex flex-col bg-white relative">
      {/* Mobile Menu Drawer Modal */}
      {isMobile && mobileMenuOpen && (
        <div className="absolute inset-0 z-40 bg-brand-black/40 flex justify-start">
          <div className="w-60 bg-white h-full shadow-2xl flex flex-col p-4 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="font-editorial font-medium text-base text-brand-black">AK QIMAASH</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 hover:bg-brand-smoke rounded"
                title="Close Menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-4 space-y-1 text-xs font-medium uppercase tracking-wider flex-1">
              <button
                onClick={() => { setCategory('all'); setMobileMenuOpen(false) }}
                className={cn('block w-full text-left py-2 px-2 hover:bg-brand-smoke rounded', category === 'all' ? 'text-brand-black font-semibold bg-brand-smoke/60' : 'text-text-secondary')}
              >
                All Collections
              </button>
              <button
                onClick={() => { setCategory('linen'); setMobileMenuOpen(false) }}
                className={cn('block w-full text-left py-2 px-2 hover:bg-brand-smoke rounded', category === 'linen' ? 'text-brand-black font-semibold bg-brand-smoke/60' : 'text-text-secondary')}
              >
                Normandy Linen
              </button>
              <button
                onClick={() => { setCategory('abayas'); setMobileMenuOpen(false) }}
                className={cn('block w-full text-left py-2 px-2 hover:bg-brand-smoke rounded', category === 'abayas' ? 'text-brand-black font-semibold bg-brand-smoke/60' : 'text-text-secondary')}
              >
                Atelier Abayas
              </button>
              <button
                onClick={() => { setCategory('silk'); setMobileMenuOpen(false) }}
                className={cn('block w-full text-left py-2 px-2 hover:bg-brand-smoke rounded', category === 'silk' ? 'text-brand-black font-semibold bg-brand-smoke/60' : 'text-text-secondary')}
              >
                Mulberry Silk
              </button>
            </div>
            <div className="pt-3 border-t border-border text-[11px] text-text-muted flex items-center justify-between">
              <span>SGD Storefront</span>
              <span className="text-emerald-700 font-medium">9% GST Incl.</span>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Filter Drawer Sheet */}
      {isMobile && filterDrawerOpen && (
        <div className="absolute inset-0 z-40 bg-brand-black/40 flex justify-end">
          <div className="w-64 bg-white h-full shadow-2xl flex flex-col p-4 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-brand-black" />
                <span className="font-medium text-xs uppercase tracking-wider">Refine Catalog</span>
              </div>
              <button
                onClick={() => setFilterDrawerOpen(false)}
                className="p-1 hover:bg-brand-smoke rounded"
                title="Close Filters"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-4 space-y-4 flex-1 text-xs">
              <div>
                <span className="font-semibold block mb-2 text-text-muted uppercase text-[10px]">Filter by Category</span>
                <div className="space-y-1">
                  <button
                    onClick={() => { setCategory('all'); setFilterDrawerOpen(false) }}
                    className={cn('w-full text-left py-1.5 px-2 rounded-xs', category === 'all' ? 'bg-brand-black text-white font-medium' : 'hover:bg-brand-smoke text-text-secondary')}
                  >
                    All Items
                  </button>
                  {SEED_CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { setCategory(c.slug); setFilterDrawerOpen(false) }}
                      className={cn('w-full text-left py-1.5 px-2 rounded-xs', category === c.slug ? 'bg-brand-black text-white font-medium' : 'hover:bg-brand-smoke text-text-secondary')}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => setFilterDrawerOpen(false)}
              className="w-full py-2 bg-brand-black text-white text-xs font-medium uppercase tracking-wider rounded-xs"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={cn('border-b border-border/80 flex items-center justify-between px-4 sticky top-0 bg-white/95 backdrop-blur-xs z-10', isMobile ? 'h-14' : 'h-18 px-8')}>
        <div className="flex items-center gap-3">
          {isMobile && (
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1 hover:bg-brand-smoke rounded"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5 text-brand-black" />
            </button>
          )}
          <span className={cn('font-editorial font-medium tracking-tight uppercase text-brand-black', isMobile ? 'text-lg' : 'text-2xl')}>
            AK QIMAASH
          </span>
        </div>

        {!isMobile && (
          <nav className="flex items-center gap-6 text-xs font-medium uppercase tracking-wider text-text-secondary">
            <span className="text-brand-black font-semibold">Shop</span>
            <span>New In</span>
            <span>Collections</span>
            <span>About</span>
          </nav>
        )}

        <div className="flex items-center gap-3">
          <button className="p-1 text-text-secondary hover:text-brand-black">
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCartOpen(true)}
            className="p-1 text-text-secondary hover:text-brand-black relative"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-black text-white text-[9px] flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className={cn('bg-brand-ivory border-b border-border text-center flex flex-col items-center justify-center', isMobile ? 'py-8 px-4' : 'py-14 px-8')}>
        <span className="text-[10px] uppercase tracking-caps text-accent font-semibold mb-1">
          Singapore Curated
        </span>
        <h2 className={cn('font-editorial font-medium text-brand-black tracking-tight', isMobile ? 'text-2xl' : 'text-4xl')}>
          Contemporary Modest Luxury
        </h2>
        <p className="text-xs text-text-secondary max-w-md mt-2">
          Breathable silhouettes and tailored essentials engineered for effortless tropical elegance.
        </p>
      </div>

      {/* Catalog Split Layout */}
      <div className={cn('flex-1 p-4 flex gap-6', !isMobile && 'p-8')}>
        {/* Desktop Sticky Sidebar */}
        {!isMobile && (
          <aside className="w-48 flex-shrink-0 space-y-6">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-black mb-3">Categories</h3>
              <div className="space-y-1.5 text-xs text-text-secondary">
                <button
                  onClick={() => setCategory('all')}
                  className={cn('block w-full text-left py-1 hover:text-brand-black', category === 'all' && 'font-bold text-brand-black')}
                >
                  All Items (8)
                </button>
                {SEED_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.slug)}
                    className={cn('block w-full text-left py-1 hover:text-brand-black', category === cat.slug && 'font-bold text-brand-black')}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-border">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-black mb-2">Fulfillment</h3>
              <p className="text-[11px] text-text-muted leading-relaxed">
                🇸🇬 Ships from Singapore. 9% GST included in all prices.
              </p>
            </div>
          </aside>
        )}

        {/* Product Grid (Responsive columns: 2 on Mobile, 3 on Tablet, 4 on Desktop) */}
        <div className="flex-1">
          {/* Mobile Category Pill Scroller & Filter Button */}
          {isMobile && (
            <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-border/60">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-1">
                <button
                  onClick={() => setCategory('all')}
                  className={cn('px-3 py-1 rounded-full text-[11px] uppercase font-medium whitespace-nowrap', category === 'all' ? 'bg-brand-black text-white' : 'bg-brand-smoke text-text-secondary')}
                >
                  All
                </button>
                {SEED_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.slug)}
                    className={cn('px-3 py-1 rounded-full text-[11px] uppercase font-medium whitespace-nowrap', category === cat.slug ? 'bg-brand-black text-white' : 'bg-brand-smoke text-text-secondary')}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setFilterDrawerOpen(true)}
                className="flex items-center gap-1 text-[11px] font-medium bg-brand-smoke hover:bg-brand-mist px-2.5 py-1 rounded-xs flex-shrink-0"
                title="Filter & Refine"
              >
                <Sliders className="w-3 h-3 text-brand-black" />
                <span>Filter</span>
              </button>
            </div>
          )}

          <div
            className={cn(
              'grid gap-4',
              isMobile
                ? 'grid-cols-2'
                : 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6'
            )}
          >
            {SEED_PRODUCTS.slice(0, isMobile ? 4 : 8).map((prod) => {
              const isFav = wishlist.includes(prod.id)
              return (
                <div key={prod.id} className="group flex flex-col">
                  <div className="relative aspect-[3/4] bg-brand-smoke rounded-xs overflow-hidden mb-2">
                    <div className="w-full h-full flex items-center justify-center text-xs text-text-muted font-editorial italic bg-gradient-to-b from-brand-ivory to-brand-smoke">
                      {prod.name.split(' ')[0]}
                    </div>
                    <button
                      onClick={() => toggleWishlist(prod.id)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center hover:bg-white text-brand-black transition-colors"
                      aria-label="Wishlist"
                    >
                      <Heart className={cn('w-3.5 h-3.5', isFav && 'fill-rose-500 text-rose-500')} />
                    </button>
                  </div>
                  <h4 className="text-xs font-medium text-brand-black truncate">{prod.name}</h4>
                  <p className="text-[11px] text-text-muted">{prod.category?.name || 'Essential'}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs font-semibold text-brand-black">
                      SGD ${(prod.min_price_cents / 100).toFixed(2)}
                    </span>
                    <button
                      onClick={() => setCartCount((c) => c + 1)}
                      className="text-[10px] text-accent uppercase font-semibold hover:underline"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function SimulatedMobileBottomNav({
  cartCount,
  onOpenCart,
}: {
  cartCount: number
  onOpenCart: () => void
}) {
  return (
    <div className="h-14 bg-white/95 backdrop-blur-md border-t border-border flex items-center justify-around px-2 z-20 flex-shrink-0">
      <button className="flex flex-col items-center gap-0.5 text-brand-black">
        <Package className="w-4 h-4" />
        <span className="text-[9px] font-medium uppercase tracking-wider">Shop</span>
      </button>
      <button className="flex flex-col items-center gap-0.5 text-text-muted hover:text-brand-black">
        <Search className="w-4 h-4" />
        <span className="text-[9px] font-medium uppercase tracking-wider">Search</span>
      </button>
      <button
        onClick={onOpenCart}
        className="flex flex-col items-center gap-0.5 text-text-muted hover:text-brand-black relative"
      >
        <ShoppingBag className="w-4 h-4" />
        {cartCount > 0 && (
          <span className="absolute -top-1 right-2 w-3.5 h-3.5 rounded-full bg-accent text-white text-[8px] flex items-center justify-center font-bold">
            {cartCount}
          </span>
        )}
        <span className="text-[9px] font-medium uppercase tracking-wider">Bag</span>
      </button>
      <button className="flex flex-col items-center gap-0.5 text-text-muted hover:text-brand-black">
        <Heart className="w-4 h-4" />
        <span className="text-[9px] font-medium uppercase tracking-wider">Saved</span>
      </button>
      <button className="flex flex-col items-center gap-0.5 text-text-muted hover:text-brand-black">
        <User className="w-4 h-4" />
        <span className="text-[9px] font-medium uppercase tracking-wider">Account</span>
      </button>
    </div>
  )
}

function SimulatedPdpContent({
  isMobile,
  product,
  selectedSize,
  setSelectedSize,
  selectedColor,
  setSelectedColor,
  onAddToCart,
}: {
  isMobile: boolean
  product: typeof SEED_PRODUCTS[0]
  selectedSize: string
  setSelectedSize: (s: string) => void
  selectedColor: string
  setSelectedColor: (c: string) => void
  onAddToCart: () => void
}) {
  return (
    <div className="flex-1 flex flex-col bg-white p-4 sm:p-8">
      <div className={cn('grid gap-8', isMobile ? 'grid-cols-1' : 'grid-cols-12')}>
        {/* Left Gallery */}
        <div className={cn(isMobile ? 'col-span-1' : 'col-span-7')}>
          <div className="aspect-[3/4] bg-brand-ivory rounded-xs border border-border flex items-center justify-center text-text-muted font-editorial italic text-lg">
            {product.name} (Gallery View)
          </div>
        </div>

        {/* Right Purchase Box */}
        <div className={cn('flex flex-col justify-between space-y-4', isMobile ? 'col-span-1' : 'col-span-5')}>
          <div>
            <span className="text-[10px] uppercase tracking-caps text-accent font-semibold">
              Ready Stock (Singapore)
            </span>
            <h2 className="font-editorial text-2xl font-medium text-brand-black mt-1">
              {product.name}
            </h2>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-lg font-semibold text-brand-black">SGD $89.00</span>
              <span className="text-[11px] text-text-muted">incl. 9% GST</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed mt-3">
              {product.description}
            </p>

            {/* Color Swatches */}
            <div className="mt-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-black block mb-2">
                Color: {selectedColor}
              </span>
              <div className="flex gap-2">
                {['Charcoal Black', 'Optic White'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={cn(
                      'px-3 py-1 text-xs border rounded-xs transition-colors',
                      selectedColor === c
                        ? 'border-brand-black bg-brand-black text-white'
                        : 'border-border text-brand-black hover:border-brand-stone'
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div className="mt-4">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="font-semibold uppercase tracking-wider text-brand-black">Select Size</span>
                <span className="text-accent underline cursor-pointer text-[11px]">Size Guide</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {['S', 'M', 'L', 'XL'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={cn(
                      'py-2 text-xs font-medium border rounded-xs text-center transition-all',
                      selectedSize === s
                        ? 'border-brand-black bg-brand-black text-white shadow-xs'
                        : 'border-border text-brand-black hover:border-brand-stone'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Call to action */}
          <div className="pt-4 border-t border-border">
            <button
              onClick={onAddToCart}
              className="w-full py-3 bg-brand-black hover:bg-brand-charcoal text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors shadow-sm"
            >
              Add to Bag — SGD $89.00
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SimulatedAccountContent({
  isMobile,
  activeTab,
  setActiveTab,
}: {
  isMobile: boolean
  activeTab: 'orders' | 'addresses' | 'profile'
  setActiveTab: (tab: 'orders' | 'addresses' | 'profile') => void
}) {
  return (
    <div className="flex-1 flex flex-col bg-brand-ivory/40 p-4 sm:p-8">
      {/* Account Header */}
      <div className="mb-6 flex justify-between items-end border-b border-border pb-4">
        <div>
          <span className="text-[10px] uppercase font-semibold tracking-caps text-accent">Client Portal</span>
          <h2 className="font-editorial text-2xl font-medium text-brand-black">Fatima Al-Zahra</h2>
          <p className="text-xs text-text-muted">fatima@example.sg</p>
        </div>
        <div className="text-right">
          <span className="text-[11px] bg-emerald-500/10 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-medium">
            Active Member
          </span>
        </div>
      </div>

      {/* Responsive Shell: Mobile horizontal tabs vs Desktop vertical sidebar */}
      <div className={cn('flex gap-6', isMobile ? 'flex-col' : 'flex-row')}>
        {isMobile ? (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border scrollbar-none">
            {(['orders', 'addresses', 'profile'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={cn(
                  'px-3.5 py-1.5 text-xs uppercase font-medium rounded-xs whitespace-nowrap transition-colors',
                  activeTab === t
                    ? 'bg-brand-black text-white'
                    : 'bg-white border border-border text-text-secondary'
                )}
              >
                {t}
              </button>
            ))}
          </div>
        ) : (
          <aside className="w-48 flex-shrink-0 space-y-1">
            {(['orders', 'addresses', 'profile'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={cn(
                  'w-full text-left px-3 py-2 text-xs font-medium uppercase tracking-wider rounded-xs transition-colors flex items-center justify-between',
                  activeTab === t
                    ? 'bg-brand-black text-white'
                    : 'text-text-secondary hover:bg-brand-smoke hover:text-brand-black'
                )}
              >
                <span className="capitalize">{t}</span>
                {t === 'orders' && <span className="text-[10px] opacity-70">2</span>}
              </button>
            ))}
          </aside>
        )}

        {/* Tab Body */}
        <div className="flex-1 bg-white p-4 sm:p-6 rounded-sm border border-border">
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-black mb-3">Recent Orders</h3>
              <div className="p-3 border border-border rounded-xs bg-surface-raised space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono font-medium">AK-20260907-8821</span>
                  <span className="text-[10px] bg-amber-500/10 text-amber-800 px-2 py-0.5 rounded font-semibold">
                    PROCESSING
                  </span>
                </div>
                <div className="text-xs text-text-secondary">
                  Relaxed French Linen Shirt (M, Black) • 1 item
                </div>
                <div className="flex justify-between items-center text-xs font-medium pt-2 border-t border-border/60">
                  <span>Total: SGD $89.00 (COD)</span>
                  <span className="text-accent cursor-pointer hover:underline flex items-center gap-1">
                    Track Delivery <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-black mb-3">Saved Addresses</h3>
              <div className="p-3 border border-border rounded-xs bg-surface-raised text-xs text-text-secondary">
                <p className="font-semibold text-brand-black">Home (Default)</p>
                <p>12 Marina View, #18-04</p>
                <p>Singapore 018961</p>
                <p className="mt-2 text-emerald-700 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified Singapore Postal Code
                </p>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-3 text-xs">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-black mb-3">Profile Information</h3>
              <div>
                <label className="text-text-muted block text-[11px]">Full Name</label>
                <p className="font-medium text-brand-black">Fatima Al-Zahra</p>
              </div>
              <div>
                <label className="text-text-muted block text-[11px]">Contact Phone</label>
                <p className="font-medium text-brand-black">+65 9123 4567</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SimulatedAdminContent({
  isMobile,
  sidebarOpen,
  setSidebarOpen,
}: {
  isMobile: boolean
  sidebarOpen: boolean
  setSidebarOpen: (o: boolean) => void
}) {
  return (
    <div className="flex-1 flex bg-surface relative h-full">
      {/* Mobile Drawer Backdrop */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="absolute inset-0 bg-brand-black/40 z-30"
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={cn(
          'bg-brand-charcoal text-white flex flex-col z-40 transition-all duration-200',
          isMobile
            ? 'absolute inset-y-0 left-0 w-52 transform shadow-2xl'
            : 'w-48 relative',
          isMobile && !sidebarOpen && '-translate-x-full'
        )}
      >
        <div className="h-12 border-b border-brand-graphite px-4 flex items-center justify-between">
          <span className="font-editorial text-sm font-semibold tracking-tight text-white uppercase">
            AK ADMIN
          </span>
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)}>
              <X className="w-4 h-4 text-brand-silver" />
            </button>
          )}
        </div>
        <nav className="p-2 space-y-1 text-xs">
          <div className="px-3 py-1.5 rounded bg-white/10 text-white font-medium flex items-center gap-2">
            <Package className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </div>
          <div className="px-3 py-1.5 rounded text-brand-silver hover:text-white flex items-center gap-2">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Orders (12)</span>
          </div>
          <div className="px-3 py-1.5 rounded text-brand-silver hover:text-white flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Staff RBAC</span>
          </div>
        </nav>
      </aside>

      {/* Admin Main Canvas */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-12 border-b border-border bg-white px-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            {isMobile && (
              <button onClick={() => setSidebarOpen(true)} className="p-1 hover:bg-brand-smoke rounded">
                <Menu className="w-4 h-4 text-brand-black" />
              </button>
            )}
            <span className="text-xs font-semibold text-brand-black">Operations Dashboard</span>
          </div>
          <span className="text-[10px] bg-purple-500/10 text-purple-700 border border-purple-500/20 px-2 py-0.5 rounded-full font-semibold">
            Administrator
          </span>
        </header>

        <div className="p-4 space-y-4">
          {/* Responsive KPI Metrics: 1 col on mobile, 3 cols on desktop */}
          <div className={cn('grid gap-3', isMobile ? 'grid-cols-1' : 'grid-cols-3')}>
            <div className="bg-white p-3 border border-border rounded-xs">
              <span className="text-[10px] text-text-muted uppercase">Today's Revenue</span>
              <p className="text-lg font-semibold text-brand-black">SGD $1,420</p>
            </div>
            <div className="bg-white p-3 border border-border rounded-xs">
              <span className="text-[10px] text-text-muted uppercase">Pending Fulfillment</span>
              <p className="text-lg font-semibold text-accent">5 Orders</p>
            </div>
            <div className="bg-white p-3 border border-border rounded-xs">
              <span className="text-[10px] text-text-muted uppercase">Low Stock SKUs</span>
              <p className="text-lg font-semibold text-rose-700">2 Items</p>
            </div>
          </div>

          {/* Responsive Recent Orders Section */}
          <div className="bg-white border border-border rounded-xs p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-black">
                Recent Orders
              </h3>
              <span className="text-[11px] text-text-muted">Storefront Realtime Feed</span>
            </div>

            {isMobile ? (
              /* Mobile Card Stack Layout */
              <div className="space-y-2.5">
                {[
                  { id: 'AK-8821', customer: 'Fatima Al-Zahra', total: 'SGD $89.00', status: 'PROCESSING', badge: 'bg-amber-500/10 text-amber-800' },
                  { id: 'AK-8820', customer: 'Nurul Huda', total: 'SGD $168.00', status: 'FULFILLED', badge: 'bg-emerald-500/10 text-emerald-800' },
                  { id: 'AK-8819', customer: 'Zainab Binte Ali', total: 'SGD $125.00', status: 'PAYMENT_PENDING', badge: 'bg-rose-500/10 text-rose-800' },
                ].map((ord) => (
                  <div key={ord.id} className="p-2.5 bg-brand-ivory/60 border border-border rounded-xs text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-medium text-brand-black">{ord.id}</span>
                      <span className={cn('text-[9px] px-1.5 py-0.5 rounded font-semibold', ord.badge)}>
                        {ord.status}
                      </span>
                    </div>
                    <div className="text-text-secondary">{ord.customer}</div>
                    <div className="flex justify-between items-center pt-1 border-t border-border/60">
                      <span className="font-semibold text-brand-black">{ord.total}</span>
                      <button className="text-[10px] text-accent uppercase font-medium hover:underline">
                        Manage &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Desktop Dense Table Layout */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-brand-smoke/50 text-text-muted uppercase text-[10px]">
                      <th className="py-2 px-3 font-medium">Order ID</th>
                      <th className="py-2 px-3 font-medium">Customer</th>
                      <th className="py-2 px-3 font-medium">Destination</th>
                      <th className="py-2 px-3 font-medium">Total</th>
                      <th className="py-2 px-3 font-medium">Status</th>
                      <th className="py-2 px-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[
                      { id: 'AK-8821', customer: 'Fatima Al-Zahra', dest: 'Marina View, SG', total: 'SGD $89.00', status: 'PROCESSING', badge: 'bg-amber-500/10 text-amber-800' },
                      { id: 'AK-8820', customer: 'Nurul Huda', dest: 'Tampines St 21, SG', total: 'SGD $168.00', status: 'FULFILLED', badge: 'bg-emerald-500/10 text-emerald-800' },
                      { id: 'AK-8819', customer: 'Zainab Binte Ali', dest: 'Bukit Timah, SG', total: 'SGD $125.00', status: 'PAYMENT_PENDING', badge: 'bg-rose-500/10 text-rose-800' },
                    ].map((ord) => (
                      <tr key={ord.id} className="hover:bg-brand-ivory/30">
                        <td className="py-2.5 px-3 font-mono font-medium text-brand-black">{ord.id}</td>
                        <td className="py-2.5 px-3 text-text-secondary">{ord.customer}</td>
                        <td className="py-2.5 px-3 text-text-muted">{ord.dest}</td>
                        <td className="py-2.5 px-3 font-semibold text-brand-black">{ord.total}</td>
                        <td className="py-2.5 px-3">
                          <span className={cn('text-[10px] px-2 py-0.5 rounded font-medium', ord.badge)}>
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button className="text-xs text-accent hover:underline font-medium">
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Staff Access & Audit Card */}
          <div className="bg-brand-ivory/50 border border-border rounded-xs p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="text-text-secondary">
                RBAC Security active • Session authenticated via Supabase JWT
              </span>
            </div>
            <span className="text-[10px] font-mono text-text-muted">Edge Latency: 18ms</span>
          </div>
        </div>
      </div>
    </div>
  )
}
