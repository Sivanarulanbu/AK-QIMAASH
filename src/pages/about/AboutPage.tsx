import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Compass, Feather, Building2, CheckCircle2 } from 'lucide-react'
import { SEOHead } from '@/components/seo/SEOHead'
import { cn } from '@/utils'

export type AboutPrototypeId = 'architectural' | 'textile' | 'singapore'

interface AboutPrototype {
  id: AboutPrototypeId
  badge: string
  selectorLabel: string
  selectorSubtitle: string
  heroTag: string
  heroTitle: string
  heroSubtitle: string
  pullQuote: string
  manifestoHeading: string
  manifestoP1: string
  manifestoP2: string
  pillarsHeading: string
  pillarsSubheading: string
  pillars: Array<{
    number: string
    title: string
    description: string
    detail: string
  }>
  heroImage: string
  heroImageAlt: string
  atelierImage1: string
  atelierImage2: string
  craftsmanshipHeading: string
  craftsmanshipText: string
  craftsmanshipStats: Array<{
    value: string
    label: string
  }>
  quoteAuthor: string
  quoteRole: string
}

export const ABOUT_PROTOTYPES: Record<AboutPrototypeId, AboutPrototype> = {
  architectural: {
    id: 'architectural',
    badge: 'Prototype 01: Architectural & Modest Form',
    selectorLabel: '01. Architectural Form',
    selectorSubtitle: 'Structural silhouettes & quiet modesty',
    heroTag: 'The Architecture of Restraint',
    heroTitle: 'Quiet Volumes. Uncompromising Poise.',
    heroSubtitle:
      'Modesty is not concealment; it is the deliberate discipline of proportion, sculptural volume, and timeless posture.',
    pullQuote:
      '“When excess ornamentation is stripped away, what remains is unmistakable presence. We design for the woman whose dignity speaks in whispers rather than shouts.”',
    manifestoHeading: 'Sculptural Modesty Designed for Singapore and Beyond',
    manifestoP1:
      'Founded in Singapore, AK QIMAASH was conceived to elevate modest dressing into a contemporary architectural discipline. Rather than following transient trends, we study the interaction between structural drape and graceful movement. Every coat, abaya, and tailored shirt is calibrated to envelop the wearer in an aura of effortless composure.',
    manifestoP2:
      'Our cuts avoid cling without sacrificing silhouette. By engineering generous biases and sharp, uncluttered seams, each garment creates a protective, breathable sanctuary. It is modesty redefined: rigorous, sculptural, and unapologetically modern.',
    pillarsHeading: 'Three Tenets of Form',
    pillarsSubheading: 'How architectural tailoring informs every AK QIMAASH piece',
    pillars: [
      {
        number: '01',
        title: 'Sculptural Bias & Drape',
        description:
          'Cut along calibrated garment grains to achieve a fluid fall that drapes naturally without hugging, allowing complete ease of motion.',
        detail: 'Hand-graded patterns with generous allowances for comfort and poise.',
      },
      {
        number: '02',
        title: 'Tropical Breathability',
        description:
          'Engineered for the humid Singapore climate with aerodynamic paneling, aerated sleeve openings, and lightweight structural interfacing.',
        detail: 'Micro-climate temperature balancing between outdoors and conditioned interiors.',
      },
      {
        number: '03',
        title: 'Unadorned Restraint',
        description:
          'We reject superfluous embellishment. The luxury of our pieces resides in the perfection of the hemline, the crispness of the collar, and the quiet dignity of pure line.',
        detail: 'Concealed French seams and understated horn/matte hardware.',
      },
    ],
    heroImage: '/images/hero-banner.jpg',
    heroImageAlt: 'AK QIMAASH Draped Architectural Abaya',
    atelierImage1: '/images/hero-slide-2.jpg',
    atelierImage2: '/images/hero-slide-4.jpg',
    craftsmanshipHeading: 'Precision in Every Proportion',
    craftsmanshipText:
      'Every pattern in our Singapore studio undergoes up to six muslin fittings. We test how the garment falls while standing, sitting, and walking across the city, ensuring that the silhouette retains its architectural poise in every circumstance.',
    craftsmanshipStats: [
      { value: '6+', label: 'Muslin Fittings Per Style' },
      { value: '100%', label: 'Concealed Clean Finishes' },
      { value: '0', label: 'Compromise on Modesty' },
    ],
    quoteAuthor: 'The Design Atelier',
    quoteRole: 'AK QIMAASH Creative Direction, Singapore',
  },

  textile: {
    id: 'textile',
    badge: 'Prototype 02: Textile Provenance & Materiality',
    selectorLabel: '02. Textile Provenance',
    selectorSubtitle: 'Honest fibers & artisanal craft',
    heroTag: 'Born From The Weave',
    heroTitle: 'Honest Fibers. The Nobility of Qimaash.',
    heroSubtitle:
      'In Arabic, Qimaash (قماش) translates to fabric. For us, the weave is not merely a component — it is the entire soul of the house.',
    pullQuote:
      '“We begin not with sketches, but with the hand of the cloth. True luxury is tactile intimacy — how a pure fiber touches your skin at dawn.”',
    manifestoHeading: 'From Normandy Flax to Obsidian Draped Silk',
    manifestoP1:
      'The name AK QIMAASH honors the noble heritage of textiles. Before a garment takes shape on the cutting table, our materials must pass a rigorous tactile evaluation. We work exclusively with certified heritage mills that practice slow, responsible weaving.',
    manifestoP2:
      'From dew-retted French flax harvested in Normandy to heavyweight 22-momme Mulberry silk and breathable wool crepes, every textile is chosen for its natural breathability, sensory richness, and longevity. We completely reject synthetic microfibers, guaranteeing garments that soften, age gracefully, and endure.',
    pillarsHeading: 'The Fiber Charter',
    pillarsSubheading: 'Our uncompromising standard for natural, skin-honoring materials',
    pillars: [
      {
        number: '01',
        title: 'Normandy French Linen',
        description:
          'Long-staple flax grown in northern France, dew-retted and woven without harsh chemical finishes. Naturally thermo-regulating and antibacterial.',
        detail: 'Becomes softer and more luminous with each laundering.',
      },
      {
        number: '02',
        title: 'Obsidian Mulberry Silk',
        description:
          'Heavyweight 22-momme mulberry silk with a matte satin face, woven for deep opacity and liquid fluid drape under changing lights.',
        detail: 'Ethically spun and dyed with non-toxic botanical and azo-free dyes.',
      },
      {
        number: '03',
        title: 'Sculptural Wool Crepe',
        description:
          'High-twist Australian merino wool spun into an open crepe weave that provides crisp structure while allowing equatorial air circulation.',
        detail: 'Naturally wrinkle-resistant and biodegradable.',
      },
    ],
    heroImage: '/images/hero-slide-3.jpg',
    heroImageAlt: 'AK QIMAASH French Linen Texture and Craftsmanship',
    atelierImage1: '/images/hero-banner.jpg',
    atelierImage2: '/images/hero-slide-3.jpg',
    craftsmanshipHeading: 'Slow Weaving & Honest Sourcing',
    craftsmanshipText:
      'Each roll of textile arriving in Singapore is rested for 48 hours to relieve internal tension before cutting. This traditional process prevents post-tailoring warping and honors the organic memory of natural yarns.',
    craftsmanshipStats: [
      { value: '100%', label: 'Natural Fiber Guarantee' },
      { value: '48h', label: 'Textile Relaxation Period' },
      { value: '0%', label: 'Synthetic Microplastics' },
    ],
    quoteAuthor: 'Master Textile Sourcing',
    quoteRole: 'Fabric Archives, AK QIMAASH',
  },

  singapore: {
    id: 'singapore',
    badge: 'Prototype 03: Singapore Atelier & Modern Heritage',
    selectorLabel: '03. Singapore Modernity',
    selectorSubtitle: 'Cosmopolitan modesty & local trust',
    heroTag: 'Equatorial Modernity',
    heroTitle: 'East Meets Equator. Modern Modesty Defined.',
    heroSubtitle:
      'A Singaporean dialogue between ancestral modesty and metropolitan refinement, crafted for women who lead with quiet grace.',
    pullQuote:
      '“Singapore taught us that tradition does not belong in a museum — it lives dynamically on the streets, boardrooms, and galleries of a vibrant world city.”',
    manifestoHeading: 'Crafted for the Modern Cosmopolitan Woman',
    manifestoP1:
      'Positioned at the vibrant maritime crossroads of Southeast Asia, AK QIMAASH draws inspiration from Singapore’s unique cultural tapestry. Here, heritage and ultra-modernity coexist effortlessly. We design wardrobe staples for women who transition between high-stakes boardrooms in the CBD, gallery vernissages in Tanjong Pagar, and serene family gatherings.',
    manifestoP2:
      'We believe luxury e-commerce should feel as personal and trustworthy as visiting an intimate local salon. That is why every Singapore order is delivered directly with our complimentary Cash on Delivery service — inspect your garments in the sanctuary of your home, with complete peace of mind.',
    pillarsHeading: 'The Singapore Standard',
    pillarsSubheading: 'Thoughtful service and modern metropolitan values',
    pillars: [
      {
        number: '01',
        title: 'Equatorial City Living',
        description:
          'Pieces purposefully engineered for seamless transitions between tropical outdoor heat and air-conditioned Singapore architecture.',
        detail: 'Layerable modular separates that never feel suffocating.',
      },
      {
        number: '02',
        title: 'Cash on Delivery Trust',
        description:
          'We stand behind our craft. Savor the fabric, try on the silhouette at home, and settle payment upon delivery without prepaid stress.',
        detail: 'Complimentary standard delivery across Singapore islandwide.',
      },
      {
        number: '03',
        title: 'Conscious Limited Batches',
        description:
          'We produce in micro-capsules of 50 to 100 units per edition to eliminate deadstock and preserve exclusive craftsmanship for our community.',
        detail: 'Numbered production runs made to be treasured for years.',
      },
    ],
    heroImage: '/images/about-singapore-hero.jpg',
    heroImageAlt: 'AK QIMAASH Singapore Metropolitan Modest Luxury',
    atelierImage1: '/images/hero-slide-4.jpg',
    atelierImage2: '/images/hero-slide-2.jpg',
    craftsmanshipHeading: 'Rooted in Singapore, Worn Globally',
    craftsmanshipText:
      'From our studio in Singapore to your wardrobe, each order is carefully wrapped in unbleached acid-free tissue and presented in our signature embossed keepsake box. Hand-finished care instructions accompany every garment.',
    craftsmanshipStats: [
      { value: '2–4', label: 'Days Islandwide Delivery' },
      { value: '50-100', label: 'Units Per Limited Edition' },
      { value: 'SGD', label: 'Local Pricing With Zero Hidden Fees' },
    ],
    quoteAuthor: 'The Founding Atelier',
    quoteRole: 'AK QIMAASH, Singapore',
  },
}

export function AboutPage() {
  const [activeTab, setActiveTab] = useState<AboutPrototypeId>('architectural')
  const current = ABOUT_PROTOTYPES[activeTab]

  return (
    <>
      <SEOHead
        title="About Us & Philosophy — AK QIMAASH Singapore"
        description="Discover the story behind AK QIMAASH. Modest luxury, architectural tailoring, and natural textiles crafted in Singapore."
        canonical="/pages/about"
      />

      <div className="bg-[#FAF9F7] text-text-primary">
        {/* ── 1. PROTOTYPE CONTROLS BANNER ────────────────────────────────────────── */}
        <section
          className="bg-brand-black text-white border-b border-brand-charcoal sticky top-14 sm:top-16 lg:top-20 z-20 shadow-md backdrop-blur-md"
          aria-label="Editorial Prototype Selector"
        >
          <div className="container-main py-3 sm:py-3.5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-sans uppercase tracking-[0.2em] text-brand-mist font-medium">
                  Select Editorial Direction:
                </span>
              </div>

              {/* 3 Prototype Switcher Tabs */}
              <div
                className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-2 p-1 bg-[#1A1A1A] rounded-xs border border-brand-graphite"
                role="tablist"
              >
                {(Object.keys(ABOUT_PROTOTYPES) as AboutPrototypeId[]).map((tabKey) => {
                  const proto = ABOUT_PROTOTYPES[tabKey]
                  const isActive = activeTab === tabKey
                  return (
                    <button
                      key={tabKey}
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveTab(tabKey)}
                      className={cn(
                        'px-3 sm:px-4 py-2 text-left rounded-xs transition-all duration-200 cursor-pointer flex flex-col',
                        isActive
                          ? 'bg-[#FAF9F7] text-brand-black shadow-sm'
                          : 'text-brand-mist hover:text-white hover:bg-brand-charcoal/50'
                      )}
                    >
                      <span className="text-xs font-sans font-semibold tracking-wider uppercase">
                        {proto.selectorLabel}
                      </span>
                      <span
                        className={cn(
                          'text-[10px] font-sans truncate',
                          isActive ? 'text-brand-stone' : 'text-brand-slate'
                        )}
                      >
                        {proto.selectorSubtitle}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. EDITORIAL HERO BANNER ───────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-border/60">
          <div className="container-main py-16 sm:py-24 lg:py-28">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left Column: Typography */}
              <div className="lg:col-span-7 pr-0 lg:pr-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-charcoal/5 border border-brand-charcoal/10 rounded-full mb-6">
                  <Sparkles className="h-3 w-3 text-accent" />
                  <span className="text-[11px] font-sans font-medium uppercase tracking-[0.25em] text-brand-stone">
                    {current.badge}
                  </span>
                </div>

                <p className="text-xs uppercase tracking-[0.3em] font-sans font-medium text-accent mb-3">
                  {current.heroTag}
                </p>

                <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-brand-black font-light leading-[1.08] uppercase tracking-tight mb-6">
                  {current.heroTitle}
                </h1>

                <p className="font-sans text-base sm:text-lg text-brand-stone font-light leading-relaxed max-w-xl mb-8">
                  {current.heroSubtitle}
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
                <div className="relative aspect-[3/4] max-w-md mx-auto lg:max-w-none overflow-hidden rounded-xs shadow-xl bg-brand-smoke">
                  <img
                    key={current.heroImage}
                    src={current.heroImage}
                    alt={current.heroImageAlt}
                    className="w-full h-full object-cover object-center animate-fade-in transition-transform duration-700 hover:scale-105"
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

        {/* ── 3. PULL QUOTE STRIP ────────────────────────────────────────────────── */}
        <section className="bg-[#F3EFEA] border-b border-border/80 py-12 sm:py-16">
          <div className="container-main max-w-4xl text-center">
            <blockquote className="font-editorial text-2xl sm:text-3xl md:text-4xl text-brand-black italic font-light leading-snug mb-6 text-balance">
              {current.pullQuote}
            </blockquote>
            <div className="flex flex-col items-center justify-center">
              <span className="w-12 h-px bg-brand-stone/40 mb-3" />
              <p className="text-xs font-sans uppercase tracking-[0.25em] text-brand-black font-semibold">
                {current.quoteAuthor}
              </p>
              <p className="text-xs font-sans text-brand-slate tracking-wider mt-0.5">
                {current.quoteRole}
              </p>
            </div>
          </div>
        </section>

        {/* ── 4. MANIFESTO SECTION ──────────────────────────────────────────────── */}
        <section id="manifesto" className="py-20 sm:py-28 border-b border-border/60">
          <div className="container-main">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <p className="text-xs uppercase tracking-[0.3em] font-sans font-medium text-accent mb-2">
                  Our Philosophy
                </p>
                <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl text-brand-black uppercase tracking-tight font-light">
                  {current.manifestoHeading}
                </h2>
                <div className="w-16 h-px bg-brand-stone/30 mx-auto mt-6" />
              </div>

              <div className="space-y-6 text-brand-stone font-sans text-base sm:text-lg font-light leading-[1.85]">
                <p className="first-letter:font-editorial first-letter:text-5xl first-letter:float-left first-letter:mr-3 first-letter:text-brand-black first-letter:font-normal first-letter:leading-none">
                  {current.manifestoP1}
                </p>
                <p>{current.manifestoP2}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. THREE CORE PILLARS ─────────────────────────────────────────────── */}
        <section className="py-20 sm:py-28 bg-[#F5F4F0] border-b border-border/60">
          <div className="container-main">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-xs uppercase tracking-[0.3em] font-sans font-medium text-accent mb-2">
                Core Foundations
              </p>
              <h2 className="font-editorial text-3xl sm:text-4xl text-brand-black uppercase font-light tracking-tight mb-3">
                {current.pillarsHeading}
              </h2>
              <p className="font-sans text-sm text-brand-stone">
                {current.pillarsSubheading}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {current.pillars.map((pillar, idx) => (
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

        {/* ── 6. ATELIER CRAFTSMANSHIP & STATS ──────────────────────────────────── */}
        <section className="py-20 sm:py-28 border-b border-border/60">
          <div className="container-main">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Images Composition */}
              <div className="lg:col-span-6 grid grid-cols-2 gap-4">
                <div className="aspect-[3/4] overflow-hidden rounded-xs shadow-md">
                  <img
                    src={current.atelierImage1}
                    alt="AK QIMAASH Atelier Silhouette"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="aspect-[3/4] overflow-hidden rounded-xs shadow-md mt-8">
                  <img
                    src={current.atelierImage2}
                    alt="AK QIMAASH Garment Drape Detail"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>

              {/* Right Content & Metrics */}
              <div className="lg:col-span-6 lg:pl-6">
                <p className="text-xs uppercase tracking-[0.3em] font-sans font-medium text-accent mb-2">
                  Atelier Standards
                </p>
                <h2 className="font-editorial text-3xl sm:text-4xl text-brand-black uppercase font-light tracking-tight mb-6">
                  {current.craftsmanshipHeading}
                </h2>
                <p className="font-sans text-base text-brand-stone font-light leading-relaxed mb-8">
                  {current.craftsmanshipText}
                </p>

                {/* Stat Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border/70">
                  {current.craftsmanshipStats.map((stat, i) => (
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

        {/* ── 7. PROTOTYPE COMPARISON MATRIX (ACCORDION / OVERVIEW) ──────────────── */}
        <section className="py-16 sm:py-20 bg-white border-b border-border/60">
          <div className="container-main max-w-5xl">
            <div className="text-center mb-12">
              <p className="text-xs uppercase tracking-[0.3em] font-sans font-medium text-accent mb-2">
                Brand Strategy Overview
              </p>
              <h2 className="font-editorial text-3xl sm:text-4xl text-brand-black uppercase font-light">
                Compare All Three Prototypes
              </h2>
              <p className="text-sm font-sans text-brand-stone mt-2">
                Review the conceptual pillars of each prototype to choose the ideal narrative for AK QIMAASH.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(Object.keys(ABOUT_PROTOTYPES) as AboutPrototypeId[]).map((tabKey) => {
                const proto = ABOUT_PROTOTYPES[tabKey]
                const isSelected = activeTab === tabKey
                return (
                  <div
                    key={tabKey}
                    onClick={() => setActiveTab(tabKey)}
                    className={cn(
                      'p-6 rounded-xs border transition-all duration-300 cursor-pointer text-left relative',
                      isSelected
                        ? 'border-brand-black bg-[#FAF9F7] ring-1 ring-brand-black shadow-md'
                        : 'border-border hover:border-brand-stone/40 bg-white'
                    )}
                  >
                    {isSelected && (
                      <span className="absolute top-3 right-3 text-[10px] font-sans font-semibold tracking-widest uppercase bg-brand-black text-white px-2 py-0.5 rounded-xs">
                        Viewing Now
                      </span>
                    )}
                    <p className="text-xs uppercase tracking-widest text-accent font-sans font-semibold mb-2">
                      {proto.selectorLabel}
                    </p>
                    <h3 className="font-editorial text-xl text-brand-black uppercase font-medium mb-3">
                      {proto.heroTitle.split('.')[0]}
                    </h3>
                    <p className="text-xs text-brand-stone font-sans leading-relaxed mb-4">
                      {proto.heroSubtitle}
                    </p>
                    <div className="space-y-1.5 pt-3 border-t border-border/60">
                      {proto.pillars.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[11px] text-brand-slate font-sans">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent/60" />
                          <span>{p.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── 8. CALL TO ACTION ──────────────────────────────────────────────────── */}
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
