import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Truck, Clock } from 'lucide-react'
import { SEOHead } from '@/components/seo/SEOHead'

export function AboutPage() {
  const pillars = [
    {
      number: '01',
      title: 'Equatorial City Living',
      description:
        'Pieces purposefully engineered for seamless transitions between tropical outdoor heat and air-conditioned Singapore architecture.',
      detail: 'Layerable modular separates that never feel suffocating or restrictive.',
    },
    {
      number: '02',
      title: 'Cash on Delivery Trust',
      description:
        'We stand behind our craft. Savor the fabric, try on the silhouette in the sanctuary of your home, and settle payment upon delivery without prepaid stress.',
      detail: 'Complimentary standard delivery across Singapore islandwide.',
    },
    {
      number: '03',
      title: 'Conscious Limited Batches',
      description:
        'We produce in micro-capsules of 50 to 100 units per edition to eliminate deadstock and preserve exclusive craftsmanship for our community.',
      detail: 'Numbered production runs made to be treasured for years.',
    },
  ]

  const craftsmanshipStats = [
    { value: '2–4', label: 'Days Islandwide Delivery' },
    { value: '50–100', label: 'Units Per Limited Edition' },
    { value: 'SGD', label: 'Transparent Local Pricing' },
  ]

  return (
    <>
      <SEOHead
        title="About Us & Philosophy — AK QIMAASH Singapore"
        description="Discover AK QIMAASH. A Singaporean dialogue between ancestral modesty and metropolitan refinement, crafted for women who lead with quiet grace."
        canonical="/pages/about"
      />

      <div className="bg-[#FAF9F7] text-text-primary">
        {/* ── 1. EDITORIAL HERO BANNER ───────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-border/60">
          <div className="container-main py-16 sm:py-24 lg:py-28">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left Column: Typography */}
              <div className="lg:col-span-7 pr-0 lg:pr-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-charcoal/5 border border-brand-charcoal/10 rounded-full mb-6">
                  <Sparkles className="h-3 w-3 text-accent" />
                  <span className="text-[11px] font-sans font-medium uppercase tracking-[0.25em] text-brand-stone">
                    Singapore Atelier &amp; Modern Heritage
                  </span>
                </div>

                <p className="text-xs uppercase tracking-[0.3em] font-sans font-medium text-accent mb-3">
                  Equatorial Modernity
                </p>

                <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-brand-black font-light leading-[1.08] uppercase tracking-tight mb-6">
                  East Meets Equator. Modern Modesty Defined.
                </h1>

                <p className="font-sans text-base sm:text-lg text-brand-stone font-light leading-relaxed max-w-xl mb-8">
                  A Singaporean dialogue between ancestral modesty and metropolitan refinement, crafted for women who lead with quiet grace.
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-3 px-7 py-3.5 bg-brand-black text-white text-xs uppercase tracking-[0.2em] font-sans font-semibold shadow-md hover:bg-black hover:-translate-y-0.5 transition-all duration-300 rounded-xs"
                  >
                    <span>Explore Current Edition</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                  <a
                    href="#manifesto"
                    className="inline-flex items-center px-6 py-3.5 border border-brand-black/30 text-brand-black text-xs uppercase tracking-[0.2em] font-sans font-medium hover:bg-brand-black hover:text-white transition-all duration-300 rounded-xs"
                  >
                    Read Manifesto
                  </a>
                </div>
              </div>

              {/* Right Column: High-Fashion Editorial Imagery */}
              <div className="lg:col-span-5 relative">
                <div className="relative aspect-[3/4] max-w-md mx-auto lg:max-w-none overflow-hidden rounded-xs shadow-xl bg-brand-smoke group">
                  <img
                    src="/images/about-singapore-hero.jpg"
                    alt="AK QIMAASH Singapore Metropolitan Modest Luxury — Architectural draped coat in tropical courtyard"
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-[10px] uppercase font-sans tracking-[0.25em] text-white/80">
                      AK QIMAASH Atelier Edition
                    </p>
                    <p className="font-editorial text-lg italic text-white/95">
                      Singapore Studio
                    </p>
                  </div>
                </div>

                {/* Subtle Decorative Frame Accent */}
                <div className="absolute -bottom-4 -left-4 w-32 h-32 border-b border-l border-accent/40 pointer-events-none hidden sm:block" />
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. PULL QUOTE STRIP ────────────────────────────────────────────────── */}
        <section className="bg-[#F3EFEA] border-b border-border/80 py-12 sm:py-16">
          <div className="container-main max-w-4xl text-center">
            <blockquote className="font-editorial text-2xl sm:text-3xl md:text-4xl text-brand-black italic font-light leading-snug mb-6 text-balance">
              &ldquo;Singapore taught us that tradition does not belong in a museum &mdash; it lives dynamically on the streets, boardrooms, and galleries of a vibrant world city.&rdquo;
            </blockquote>
            <div className="flex flex-col items-center justify-center">
              <span className="w-12 h-px bg-brand-stone/40 mb-3" />
              <p className="text-xs font-sans uppercase tracking-[0.25em] text-brand-black font-semibold">
                The Founding Atelier
              </p>
              <p className="text-xs font-sans text-brand-slate tracking-wider mt-0.5">
                AK QIMAASH, Singapore
              </p>
            </div>
          </div>
        </section>

        {/* ── 3. MANIFESTO SECTION ──────────────────────────────────────────────── */}
        <section id="manifesto" className="py-20 sm:py-28 border-b border-border/60">
          <div className="container-main">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <p className="text-xs uppercase tracking-[0.3em] font-sans font-medium text-accent mb-2">
                  Our Philosophy
                </p>
                <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl text-brand-black uppercase tracking-tight font-light">
                  Crafted for the Modern Cosmopolitan Woman
                </h2>
                <div className="w-16 h-px bg-brand-stone/30 mx-auto mt-6" />
              </div>

              <div className="space-y-6 text-brand-stone font-sans text-base sm:text-lg font-light leading-[1.85]">
                <p className="first-letter:font-editorial first-letter:text-5xl first-letter:float-left first-letter:mr-3 first-letter:text-brand-black first-letter:font-normal first-letter:leading-none">
                  Positioned at the vibrant maritime crossroads of Southeast Asia, AK QIMAASH draws inspiration from Singapore’s unique cultural tapestry. Here, heritage and ultra-modernity coexist effortlessly. We design wardrobe staples for women who transition between high-stakes boardrooms in the CBD, gallery vernissages in Tanjong Pagar, and serene family gatherings.
                </p>
                <p>
                  We believe luxury e-commerce should feel as personal and trustworthy as visiting an intimate local salon. That is why every Singapore order is delivered directly with our complimentary Cash on Delivery service &mdash; inspect your garments in the sanctuary of your home, with complete peace of mind.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. THREE CORE PILLARS ─────────────────────────────────────────────── */}
        <section className="py-20 sm:py-28 bg-[#F5F4F0] border-b border-border/60">
          <div className="container-main">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-xs uppercase tracking-[0.3em] font-sans font-medium text-accent mb-2">
                Core Foundations
              </p>
              <h2 className="font-editorial text-3xl sm:text-4xl text-brand-black uppercase font-light tracking-tight mb-3">
                The Singapore Standard
              </h2>
              <p className="font-sans text-sm text-brand-stone">
                Thoughtful service and modern metropolitan values
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pillars.map((pillar, idx) => (
                <div
                  key={idx}
                  className="bg-[#FAF9F7] p-8 sm:p-10 border border-border/80 rounded-xs shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <span className="font-editorial text-4xl text-brand-black/25 font-light block mb-4">
                      {pillar.number}
                    </span>
                    <h3 className="font-editorial text-2xl text-brand-black uppercase font-normal mb-3">
                      {pillar.title}
                    </h3>
                    <p className="font-sans text-sm text-brand-stone leading-relaxed mb-6 font-light">
                      {pillar.description}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-border/50 flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                    <span className="text-xs font-sans text-brand-slate leading-normal">
                      {pillar.detail}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. ATELIER CRAFTSMANSHIP & STATS ──────────────────────────────────── */}
        <section className="py-20 sm:py-28 border-b border-border/60">
          <div className="container-main">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Images Composition */}
              <div className="lg:col-span-6 grid grid-cols-2 gap-4">
                <div className="aspect-[3/4] overflow-hidden rounded-xs shadow-md group">
                  <img
                    src="/images/about-singapore-atelier.jpg"
                    alt="AK QIMAASH Singapore Atelier Studio — Cutting table and natural textiles"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
                <div className="aspect-[3/4] overflow-hidden rounded-xs shadow-md mt-8 group">
                  <img
                    src="/images/about-singapore-packaging.jpg"
                    alt="AK QIMAASH Luxury Keepsake Presentation Box &amp; Unboxing"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Right Content & Metrics */}
              <div className="lg:col-span-6 lg:pl-6">
                <p className="text-xs uppercase tracking-[0.3em] font-sans font-medium text-accent mb-2">
                  Atelier Standards
                </p>
                <h2 className="font-editorial text-3xl sm:text-4xl text-brand-black uppercase font-light tracking-tight mb-6">
                  Rooted in Singapore, Worn Globally
                </h2>
                <p className="font-sans text-base text-brand-stone font-light leading-relaxed mb-8">
                  From our studio in Singapore to your wardrobe, each order is carefully wrapped in unbleached acid-free tissue and presented in our signature embossed keepsake box. Hand-finished care instructions accompany every garment.
                </p>

                {/* Stat Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border/70">
                  {craftsmanshipStats.map((stat, i) => (
                    <div key={i} className="p-4 bg-white border border-border/60 rounded-xs">
                      <p className="font-editorial text-3xl sm:text-4xl text-brand-black font-light mb-1">
                        {stat.value}
                      </p>
                      <p className="text-xs font-sans text-brand-slate uppercase tracking-wider">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. CONCIERGE ASSURANCES STRIP ─────────────────────────────────────── */}
        <section className="py-12 bg-surface border-b border-border/60">
          <div className="container-main">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center p-4">
                <Truck className="h-6 w-6 text-brand-black mb-3" />
                <h4 className="font-editorial text-lg text-brand-black uppercase mb-1">Complimentary Islandwide Delivery</h4>
                <p className="text-xs font-sans text-brand-stone font-light">Dispatched discreetly within 2–4 business days across Singapore.</p>
              </div>
              <div className="flex flex-col items-center p-4">
                <ShieldCheck className="h-6 w-6 text-brand-black mb-3" />
                <h4 className="font-editorial text-lg text-brand-black uppercase mb-1">Cash on Delivery Available</h4>
                <p className="text-xs font-sans text-brand-stone font-light">Try on your garments at home and pay seamlessly upon receipt.</p>
              </div>
              <div className="flex flex-col items-center p-4">
                <Clock className="h-6 w-6 text-brand-black mb-3" />
                <h4 className="font-editorial text-lg text-brand-black uppercase mb-1">Limited Batch Exclusivity</h4>
                <p className="text-xs font-sans text-brand-stone font-light">Crafted in micro-runs of 50–100 pieces to ensure ethical luxury.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 7. CALL TO ACTION ──────────────────────────────────────────────────── */}
        <section className="py-20 sm:py-24 bg-brand-black text-white text-center">
          <div className="container-main max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] font-sans font-medium text-brand-mist mb-3">
              Experience AK QIMAASH
            </p>
            <h2 className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-white uppercase font-light tracking-tight mb-6">
              Discover Quiet Luxury in Motion
            </h2>
            <p className="font-sans text-base text-brand-silver font-light max-w-xl mx-auto mb-8 leading-relaxed">
              Explore our current edit of architectural abayas, tailored coats, and organic French linen separates.
              Delivered across Singapore with complimentary Cash on Delivery.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-brand-black text-xs uppercase tracking-[0.2em] font-sans font-semibold hover:bg-brand-smoke transition-colors rounded-xs shadow-md"
              >
                <span>Shop All Collections</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/shop?sort=newest"
                className="inline-flex items-center px-7 py-4 border border-white/30 text-white text-xs uppercase tracking-[0.2em] font-sans font-medium hover:bg-white hover:text-brand-black transition-colors rounded-xs"
              >
                View New Arrivals
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
