import { Link } from 'react-router-dom'
import { ArrowRight, Truck, ShieldCheck, RefreshCw, Sparkles } from 'lucide-react'
import { useNewArrivals, useCategories } from '@/features/products/useProducts'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductGridSkeleton } from '@/components/ui/Skeleton'
import { SEOHead } from '@/components/seo/SEOHead'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'

export function HomePage() {
  const { data: newArrivals, isLoading: arrivalsLoading } = useNewArrivals()
  const { data: categories } = useCategories()

  return (
    <>
      <SEOHead
        title="AK QIMAASH — Contemporary Fashion, Singapore"
        description="Shop new season fashion at AK QIMAASH. Contemporary pieces designed for everyday wear, delivered across Singapore."
        canonical="/"
      />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[80vh] sm:min-h-[90vh] bg-brand-ivory flex items-end"
        aria-label="Hero"
      >
        {/* Background — editorial tone-on-tone */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-brand-ivory via-brand-ivory to-brand-smoke"
          aria-hidden="true"
        />

        <div className="container-main relative w-full pb-16 pt-24 md:pb-24">
          <div className="max-w-2xl">
            <p className="text-xs tracking-caps uppercase text-text-muted mb-4">
              New Season 2026
            </p>
            <h1 className="font-editorial text-5xl md:text-7xl lg:text-8xl font-light
                           text-brand-black leading-none tracking-tighter mb-6">
              Refined for
              <br />
              <em>everyday life.</em>
            </h1>
            <p className="text-base md:text-lg text-text-secondary max-w-sm leading-relaxed mb-8">
              New season pieces, selected for contemporary Singapore living.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/shop?sort=newest" className="btn-xl btn-primary">
                Shop New Arrivals
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link to="/shop" className="btn-xl btn-secondary">
                Browse All
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px bg-brand-smoke"
          aria-hidden="true"
        />
      </section>

      {/* ── Categories ───────────────────────────────────────────────────────── */}
      {categories && categories.length > 0 && (
        <section className="section-sm" aria-labelledby="categories-heading">
          <div className="container-main">
            <div className="flex items-baseline justify-between mb-8">
              <h2 id="categories-heading" className="text-xl font-semibold text-text-primary tracking-tight">
                Shop by category
              </h2>
              <Link
                to="/shop"
                className="text-sm text-text-muted hover:text-text-primary transition-colors duration-150 flex items-center gap-1"
              >
                All categories
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {categories.slice(0, 5).map((cat) => (
                <Link
                  key={cat.id}
                  to={`/shop?category=${cat.slug}`}
                  className="group relative aspect-square bg-surface-sunken rounded-lg overflow-hidden"
                  aria-label={`Shop ${cat.name}`}
                >
                  {cat.image_url ? (
                    <ImageWithFallback
                      src={cat.image_url}
                      alt={cat.name}
                      className="group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-brand-smoke" />
                  )}
                  <div className="absolute inset-0 bg-brand-black/20 group-hover:bg-brand-black/30 transition-colors duration-200" />
                  <div className="absolute inset-0 flex items-end p-4">
                    <span className="text-white text-sm font-medium">{cat.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── New Arrivals ─────────────────────────────────────────────────────── */}
      <section className="section" aria-labelledby="new-arrivals-heading">
        <div className="container-main">
          <div className="flex items-baseline justify-between mb-8">
            <div>
              <h2
                id="new-arrivals-heading"
                className="text-2xl md:text-3xl font-semibold text-text-primary tracking-tight"
              >
                New Arrivals
              </h2>
              <p className="text-sm text-text-muted mt-1">
                The latest pieces from this season's collection.
              </p>
            </div>
            <Link
              to="/shop?sort=newest"
              className="text-sm text-text-muted hover:text-text-primary transition-colors duration-150 hidden sm:flex items-center gap-1"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          {arrivalsLoading ? (
            <ProductGridSkeleton count={8} />
          ) : newArrivals && newArrivals.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {newArrivals.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <EmptyCollection />
          )}

          <div className="mt-10 text-center sm:hidden">
            <Link to="/shop?sort=newest" className="btn-md btn-secondary">
              View all new arrivals
            </Link>
          </div>
        </div>
      </section>

      {/* ── Editorial band ───────────────────────────────────────────────────── */}
      <section
        className="bg-brand-charcoal text-white py-16 md:py-20"
        aria-label="Brand statement"
      >
        <div className="container-main text-center max-w-3xl mx-auto">
          <p className="text-xs tracking-caps uppercase text-brand-silver mb-5">
            Our approach
          </p>
          <blockquote className="font-editorial text-3xl md:text-5xl font-light leading-tight tracking-tight text-balance">
            "Less, but better. Pieces worth keeping."
          </blockquote>
          <p className="mt-6 text-sm text-brand-silver max-w-md mx-auto leading-relaxed">
            Each piece is chosen for longevity over trend. We carry what works, 
            and nothing that doesn't.
          </p>
        </div>
      </section>

      {/* ── Featured collection ───────────────────────────────────────────────── */}
      {newArrivals && newArrivals.length > 4 && (
        <section className="section" aria-labelledby="featured-heading">
          <div className="container-main">
            <div className="flex items-baseline justify-between mb-8">
              <h2
                id="featured-heading"
                className="text-2xl md:text-3xl font-semibold text-text-primary tracking-tight"
              >
                Selected pieces
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {newArrivals.slice(4, 12).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link to="/shop" className="btn-xl btn-secondary">
                View all products
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Delivery assurance ───────────────────────────────────────────────── */}
      <section className="border-t border-border section-sm" aria-label="Service assurance">
        <div className="container-main">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-10">
            {[
              {
                title: 'Singapore Delivery',
                description: '2–4 business days across Singapore.',
              },
              {
                title: 'Cash on Delivery',
                description: 'Pay when your order arrives. No cards required.',
              },
              {
                title: 'Easy Returns',
                description: 'Straightforward returns within 14 days.',
              },
            ].map((item) => (
              <div key={item.title} className="text-center sm:text-left">
                <h3 className="text-sm font-semibold text-text-primary mb-1.5">
                  {item.title}
                </h3>
                <p className="text-sm text-text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

function EmptyCollection() {
  return (
    <div className="text-center py-16">
      <p className="text-text-muted text-sm">No products available yet. Check back soon.</p>
    </div>
  )
}
