import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useNewArrivals, useCategories } from '@/features/products/useProducts'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductGridSkeleton } from '@/components/ui/Skeleton'
import { SEOHead } from '@/components/seo/SEOHead'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/utils'

interface HeroSlide {
  id: number
  tag: string
  title: string
  description: string
  primaryBtnText: string
  primaryBtnLink: string
  secondaryBtnText: string
  secondaryBtnLink: string
  image: string
  imageAlt: string
  objectPosition: string
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    tag: 'New Season 2026',
    title: 'Quietly Distinct',
    description: 'Modest luxury silhouetted pieces crafted with quiet elegance and timeless restraint.',
    primaryBtnText: 'Shop Collection',
    primaryBtnLink: '/shop',
    secondaryBtnText: 'Our Philosophy',
    secondaryBtnLink: '/pages/about',
    image: '/images/hero-banner.jpg',
    imageAlt: 'AK QIMAASH Draped Abaya Edition',
    objectPosition: 'object-[75%_center] md:object-[center_35%]',
  },
  {
    id: 2,
    tag: 'Autumn / Winter Couture',
    title: 'Architectural Tailoring',
    description: 'Sculptural wool crepe coats and tailored silhouettes engineered for poise and presence.',
    primaryBtnText: 'Explore Tailoring',
    primaryBtnLink: '/shop?category=outerwear',
    secondaryBtnText: 'The Lookbook',
    secondaryBtnLink: '/shop',
    image: '/images/hero-slide-2.jpg',
    imageAlt: 'AK QIMAASH Tailored Coat Abaya',
    objectPosition: 'object-[75%_center] md:object-[center_28%]',
  },
  {
    id: 3,
    tag: 'Tactile Foundations',
    title: 'Organic French Linen',
    description: 'Bespoke Normandy flax shirts and fluid wide trousers designed for Singapore tropical ease.',
    primaryBtnText: 'Shop The Linen Edit',
    primaryBtnLink: '/shop?category=tops',
    secondaryBtnText: 'Material Story',
    secondaryBtnLink: '/pages/about',
    image: '/images/hero-slide-3.jpg',
    imageAlt: 'AK QIMAASH Relaxed French Linen Shirt and Trousers',
    objectPosition: 'object-[70%_center] md:object-[center_35%]',
  },
  {
    id: 4,
    tag: 'Evening Capsule',
    title: 'Obsidian Draped Silk',
    description: 'Lustrous silk abayas and evening slips cut on the bias for fluid, understated twilight allure.',
    primaryBtnText: 'Discover Evening',
    primaryBtnLink: '/shop?category=dresses',
    secondaryBtnText: 'View Archive',
    secondaryBtnLink: '/shop',
    image: '/images/hero-slide-4.jpg',
    imageAlt: 'AK QIMAASH Obsidian Evening Silk Abaya',
    objectPosition: 'object-[75%_center] md:object-[center_25%]',
  },
]

const AUTOPLAY_INTERVAL = 5000

export function HomePage() {
  const { data: newArrivals, isLoading: arrivalsLoading } = useNewArrivals()
  const { data: categories } = useCategories()
  const { toast } = useToast()

  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [progressKey, setProgressKey] = useState(0)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false)

  // Direct slide selection with timer reset
  const goToSlide = (idx: number) => {
    setCurrentSlide(idx)
    setProgressKey((k) => k + 1)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
    setProgressKey((k) => k + 1)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
    setProgressKey((k) => k + 1)
  }

  // Automatic carousel timer that advances every 5 seconds
  useEffect(() => {
    if (isPaused) return

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
      setProgressKey((k) => k + 1)
    }, AUTOPLAY_INTERVAL)

    return () => clearInterval(timer)
  }, [currentSlide, isPaused])

  // Pause auto-rotation when user switches away from the browser tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPaused(true)
      } else {
        setIsPaused(false)
        setProgressKey((k) => k + 1)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return
    const touchEndX = e.changedTouches[0].clientX
    const diff = touchStartX - touchEndX
    if (diff > 50) {
      nextSlide()
    } else if (diff < -50) {
      prevSlide()
    }
    setTouchStartX(null)
  }

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail.trim()) return
    setNewsletterSubmitted(true)
    toast({
      title: 'Private Access Granted',
      description: 'Thank you for subscribing to AK QIMAASH preview editions.',
      variant: 'success',
    })
    setNewsletterEmail('')
  }

  return (
    <>
      <SEOHead
        title="AK QIMAASH — Modest Luxury, Singapore"
        description="Thoughtfully designed pieces crafted with quiet elegance. Discover the new season modest luxury collection in Singapore."
        canonical="/"
      />

      {/* ── 1. ASYMMETRICAL EDITORIAL HERO CAROUSEL ───────────────────────────── */}
      <section
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative min-h-[480px] sm:min-h-[520px] h-[calc(100vh-5rem)] max-h-[700px] bg-[#faf9f7] flex items-center overflow-hidden select-none"
        aria-label="Editorial Hero Showcase"
        aria-roledescription="carousel"
      >
        {/* Full-bleed Editorial Photos Layer with smooth cross-fade & subtle Ken-Burns zoom */}
        {HERO_SLIDES.map((slide, idx) => {
          const isActive = idx === currentSlide
          return (
            <div
              key={slide.id}
              className={cn(
                'absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out',
                isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
              )}
              aria-hidden={!isActive}
            >
              <img
                src={slide.image}
                alt={slide.imageAlt}
                className={cn(
                  'w-full h-full object-cover transition-transform duration-[6000ms] ease-out',
                  isActive ? 'scale-105' : 'scale-100',
                  slide.objectPosition
                )}
                loading={idx === 0 ? 'eager' : 'lazy'}
              />
            </div>
          )
        })}

        {/* Light Warm Beige Gradient Overlay:
            Left side: pure warm beige for crystal clear dark text
            Right side: 100% transparent to showcase each campaign photograph */}
        <div
          className="absolute inset-0 hidden md:block pointer-events-none z-[1]"
          style={{
            background:
              'linear-gradient(90deg, rgba(250,249,247,0.98) 0%, rgba(250,249,247,0.75) 35%, rgba(250,249,247,0.15) 55%, rgba(250,249,247,0) 100%)',
          }}
          aria-hidden="true"
        />
        {/* Mobile responsive overlay */}
        <div
          className="absolute inset-0 md:hidden pointer-events-none z-[1]"
          style={{
            background:
              'linear-gradient(180deg, rgba(250,249,247,0.98) 0%, rgba(250,249,247,0.88) 45%, rgba(250,249,247,0.2) 100%)',
          }}
          aria-hidden="true"
        />

        {/* Hero Content - Left-aligned with dynamic story text and luxury button */}
        <div className="container-main relative z-10 w-full py-4 sm:py-6 lg:py-8">
          <div className="max-w-xl text-left">
            <div key={currentSlide} className="animate-fade-in">
              <p className="text-xs uppercase tracking-[0.3em] font-sans font-medium text-[#555555] mb-2 sm:mb-2.5">
                {HERO_SLIDES[currentSlide].tag}
              </p>
              <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.05] uppercase font-light mb-3 sm:mb-3.5 text-[#1a1a1a]">
                {HERO_SLIDES[currentSlide].title}
              </h1>
              <p className="font-sans text-sm sm:text-base text-[#2d2d2d] font-light leading-[1.75] max-w-lg mb-5 sm:mb-6">
                {HERO_SLIDES[currentSlide].description}
              </p>
              <div
                className="flex flex-wrap items-center gap-3 sm:gap-4"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                <Link
                  to={HERO_SLIDES[currentSlide].primaryBtnLink}
                  className="group inline-flex items-center justify-center gap-3 px-7 py-3 sm:py-3.5 bg-[#1a1a1a] text-white text-xs uppercase tracking-[0.2em] font-sans font-semibold shadow-md hover:shadow-xl hover:-translate-y-0.5 hover:bg-black transition-all duration-300 rounded-xs"
                >
                  <span>{HERO_SLIDES[currentSlide].primaryBtnText}</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1.5 transition-transform duration-300" />
                </Link>
                <Link
                  to={HERO_SLIDES[currentSlide].secondaryBtnLink}
                  className="inline-flex items-center justify-center px-6 py-3 sm:py-3.5 border border-[#1a1a1a]/40 text-[#1a1a1a] text-xs uppercase tracking-[0.2em] font-sans font-medium hover:bg-[#1a1a1a] hover:text-white hover:-translate-y-0.5 transition-all duration-300 rounded-xs"
                >
                  {HERO_SLIDES[currentSlide].secondaryBtnText}
                </Link>
              </div>
            </div>

            {/* Minimal Editorial Carousel Progress & Controls */}
            <div className="flex items-center gap-4 mt-6 sm:mt-8">
              {/* Slide Progress Lines with animated auto-advance indicator */}
              <div className="flex items-center gap-2">
                {HERO_SLIDES.map((slide, idx) => {
                  const isActive = idx === currentSlide
                  return (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => goToSlide(idx)}
                      className={cn(
                        'relative h-1.5 rounded-full overflow-hidden transition-all duration-300 cursor-pointer',
                        isActive
                          ? 'w-10 sm:w-12 bg-[#1a1a1a]/20'
                          : 'w-2.5 sm:w-3 bg-brand-stone/30 hover:bg-brand-stone/60'
                      )}
                      aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
                      aria-current={isActive ? 'true' : undefined}
                    >
                      {isActive && (
                        <span
                          key={`progress-${currentSlide}-${progressKey}`}
                          className="absolute inset-0 bg-[#1a1a1a] rounded-full origin-left animate-hero-progress"
                          style={{
                            animationPlayState: isPaused ? 'paused' : 'running',
                          }}
                        />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Numbering and Subtle Arrow Navigation */}
              <div className="flex items-center gap-1.5 ml-2">
                <button
                  type="button"
                  onClick={prevSlide}
                  className="p-1 text-[#1a1a1a]/60 hover:text-[#1a1a1a] transition-colors cursor-pointer"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-[11px] font-sans text-brand-stone/80 tabular-nums tracking-widest">
                  0{currentSlide + 1} / 0{HERO_SLIDES.length}
                </span>
                <button
                  type="button"
                  onClick={nextSlide}
                  className="p-1 text-[#1a1a1a]/60 hover:text-[#1a1a1a] transition-colors cursor-pointer"
                  aria-label="Next slide"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ── 2. NEW ARRIVALS (4-COLUMN EDITORIAL GRID) ─────────────────────────── */}
      <section className="py-20 sm:py-28 bg-surface" aria-labelledby="new-arrivals-heading">
        <div className="container-main">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 sm:mb-16 gap-4">
            <div>
              <p className="editorial-subheading mb-2">Curated Edit</p>
              <h2
                id="new-arrivals-heading"
                className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-brand-black uppercase font-medium tracking-tight"
              >
                New Arrivals
              </h2>
              <p className="font-sans text-xs sm:text-sm text-text-muted mt-2 font-light">
                A carefully selected edit for everyday elegance and season transitions.
              </p>
            </div>
            <Link
              to="/shop?sort=newest"
              className="inline-flex items-center gap-1.5 text-xs font-sans uppercase tracking-[0.15em] font-medium text-brand-black hover:text-accent transition-colors self-start sm:self-auto"
            >
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Grid */}
          {arrivalsLoading ? (
            <ProductGridSkeleton count={4} />
          ) : newArrivals && newArrivals.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12">
              {newArrivals.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-text-muted py-12 font-sans font-light">
              No products found. Explore our main shop catalog.
            </p>
          )}
        </div>
      </section>

      {/* ── 3. SHOP BY CATEGORY (CLEAN TILES) ─────────────────────────────────── */}
      {categories && categories.length > 0 && (
        <section className="py-16 sm:py-24 border-t border-border/80 bg-surface" aria-labelledby="categories-heading">
          <div className="container-main">
            <div className="text-center max-w-lg mx-auto mb-12">
              <p className="editorial-subheading mb-2">Wardrobe Foundations</p>
              <h2
                id="categories-heading"
                className="font-editorial text-3xl sm:text-4xl text-brand-black uppercase font-medium tracking-tight"
              >
                Shop by Category
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {categories.slice(0, 4).map((cat) => {
                const categoryImg = cat.image_url || `/images/categories/${cat.slug}.jpg`
                return (
                  <Link
                    key={cat.id}
                    to={`/shop?category=${cat.slug}`}
                    className="group relative aspect-[3/4] bg-brand-ivory overflow-hidden rounded-xs block"
                    aria-label={`Shop ${cat.name}`}
                  >
                    <img
                      src={categoryImg}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                    {/* Minimal dark overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-black/75 via-transparent to-transparent group-hover:from-brand-black/85 transition-colors duration-300" />
                    <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end text-center">
                      <span className="font-editorial text-xl sm:text-2xl text-white uppercase tracking-tight font-medium">
                        {cat.name}
                      </span>
                      <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-brand-silver mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Explore &rarr;
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── 4. THE AK QIMAASH EDIT ("THE ART OF MODESTY") ──────────────────────── */}
      <section className="py-20 sm:py-28 bg-brand-ivory/70 border-t border-border/80" aria-label="Brand Story">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Editorial Image */}
            <div className="aspect-[4/5] bg-surface-sunken overflow-hidden rounded-xs relative">
              <img
                src="/images/categories/outerwear.jpg"
                alt="The Art of Modesty — AK QIMAASH"
                className="w-full h-full object-cover object-center"
                loading="lazy"
              />
            </div>

            {/* Right: Thoughtful Brand Narrative */}
            <div className="lg:max-w-lg space-y-6">
              <p className="editorial-subheading">The AK QIMAASH Edit</p>
              <h2 className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-brand-black leading-tight uppercase font-light tracking-tight">
                The Art of Modesty
              </h2>
              <div className="space-y-4 font-sans text-sm sm:text-base text-text-secondary leading-relaxed font-light">
                <p>
                  Thoughtfully designed pieces for women who value quiet confidence, timeless form, and considered detail.
                </p>
                <p>
                  Rooted in Singapore, we combine architectural draping, breathable natural fibres, and meticulous tailored silhouettes created for contemporary everyday living.
                </p>
              </div>
              <div className="pt-4">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 text-xs font-sans uppercase tracking-[0.2em] font-medium text-brand-black border-b border-brand-black pb-1.5 hover:text-accent hover:border-accent transition-colors"
                >
                  Discover AK QIMAASH
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. NEWSLETTER (MINIMAL PRIVATE ACCESS) ────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-surface border-t border-border/80" aria-labelledby="newsletter-heading">
        <div className="container-main max-w-xl mx-auto text-center px-4">
          <p className="editorial-subheading mb-3">Privilege</p>
          <h2
            id="newsletter-heading"
            className="font-editorial text-3xl sm:text-4xl text-brand-black uppercase font-medium tracking-tight mb-3"
          >
            Newsletter
          </h2>
          <p className="font-sans text-xs sm:text-sm text-text-muted font-light leading-relaxed mb-8 max-w-md mx-auto">
            Private access to new collections, seasonal lookbooks, and atelier previews.
          </p>

          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address..."
              className="flex-1 px-4 py-3.5 bg-surface-raised border border-border text-xs font-sans placeholder:text-text-disabled focus:border-brand-black focus:outline-none rounded-xs"
              aria-label="Email for newsletter"
            />
            <button
              type="submit"
              className="px-8 py-3.5 bg-brand-black text-white text-xs font-sans uppercase tracking-widest font-medium hover:bg-brand-charcoal transition-colors rounded-xs flex-shrink-0"
            >
              Join
            </button>
          </form>

          {newsletterSubmitted && (
            <p className="mt-4 text-xs font-sans text-emerald-800 font-medium animate-fade-in">
              Thank you for subscribing. You now have private preview access.
            </p>
          )}
        </div>
      </section>
    </>
  )
}
