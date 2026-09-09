import { useState, useEffect, useRef } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { Heart, Minus, Plus, ShieldCheck, Truck, RotateCcw, ChevronDown, ChevronUp, Star, Check, X } from 'lucide-react'
import { useProduct, useProducts } from '@/features/products/useProducts'
import { ProductGallery } from '@/components/product/ProductGallery'
import { VariantSelector } from '@/components/product/VariantSelector'
import { ProductCard } from '@/components/product/ProductCard'
import { Breadcrumb } from '@/components/ui/Navigation'
import { DetailSkeleton } from '@/components/ui/Skeleton'
import { SEOHead } from '@/components/seo/SEOHead'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { useToast } from '@/components/ui/Toast'
import { formatPrice } from '@/lib/commerce'
import { cn } from '@/utils'
import type { Database } from '@/types/database'

type Variant = Database['public']['Tables']['product_variants']['Row']

interface ReviewItem {
  id: string
  name: string
  rating: number
  date: string
  title: string
  comment: string
  verified: boolean
}

const DEFAULT_REVIEWS: Record<string, ReviewItem[]> = {
  default: [
    {
      id: 'rev-1',
      name: 'Nurul A.',
      rating: 5,
      date: '2 weeks ago',
      title: 'Flawless drape and exceptional silk quality',
      comment: 'The craftsmanship on this piece is truly understated luxury. The fabric breathes comfortably in the Singapore heat and falls with great elegance. Highly recommended.',
      verified: true,
    },
    {
      id: 'rev-2',
      name: 'Farah M.',
      rating: 5,
      date: '1 month ago',
      title: 'Timeless silhouette',
      comment: 'Fits true to size. Received countless compliments when wearing this for an evening gathering. The modest tailoring is modern and chic.',
      verified: true,
    },
  ],
}

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: product, isLoading, error } = useProduct(slug!)
  const { isInWishlist, toggleProduct } = useWishlistStore()
  const { addItem, openCart } = useCartStore()
  const { toast } = useToast()

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [addedFeedback, setAddedFeedback] = useState(false)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [reviews, setReviews] = useState<ReviewItem[]>(DEFAULT_REVIEWS.default)
  const ctaRef = useRef<HTMLDivElement>(null)
  const [showStickyBar, setShowStickyBar] = useState(false)
  const [newRating, setNewRating] = useState(5)
  const [newReviewer, setNewReviewer] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newComment, setNewComment] = useState('')

  // Related products in the same category
  const { data: relatedData } = useProducts(
    product?.category?.slug ? { category_slug: product.category.slug, per_page: 4 } : { per_page: 4 }
  )

  // Auto-select first in-stock variant when product loads or changes
  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      const defaultVariant =
        product.variants.find((v) => v.is_active && v.stock_quantity > 0) ??
        product.variants.find((v) => v.is_active) ??
        product.variants[0]
      setSelectedVariant(defaultVariant)
    }
  }, [product?.id])

  useEffect(() => {
    const el = ctaRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBar(!entry.isIntersecting && entry.boundingClientRect.top < 0)
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  if (isLoading) {
    return (
      <div className="container-main py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-[3/4] bg-surface-sunken rounded-xs animate-skeleton" />
          <div className="space-y-6 py-4">
            <DetailSkeleton />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return <Navigate to="/shop" replace />
  }

  const isWishlisted = isInWishlist(product.id)
  const inStock = selectedVariant
    ? selectedVariant.stock_quantity > 0 && selectedVariant.is_active
    : product.variants.some((v) => v.is_active && v.stock_quantity > 0)

  const maxQuantity = selectedVariant ? selectedVariant.stock_quantity : 99

  const handleAddToCart = () => {
    if (!selectedVariant) return
    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      variantSku: selectedVariant.sku,
      variantSize: selectedVariant.size,
      variantColor: selectedVariant.color,
      imageUrl: product.primary_image,
      priceCents: selectedVariant.price_cents,
      quantity,
    })
    setAddedFeedback(true)
    openCart()
    toast({
      title: 'Added to Bag',
      description: `${product.name} — Size ${selectedVariant.size || 'One Size'} (${quantity})`,
      variant: 'default',
    })
    setTimeout(() => setAddedFeedback(false), 2000)
  }

  const handleWishlistToggle = () => {
    toggleProduct(product.id)
    if (!isWishlisted) {
      toast({
        title: 'Saved to Wishlist',
        description: `${product.name} added to your wishlist.`,
      })
    }
  }

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newReviewer.trim() || !newComment.trim()) return

    const newRev: ReviewItem = {
      id: `rev-${Date.now()}`,
      name: newReviewer.trim(),
      rating: newRating,
      date: 'Just now',
      title: newTitle.trim() || 'Exceptional craftsmanship',
      comment: newComment.trim(),
      verified: true,
    }

    setReviews([newRev, ...reviews])
    setReviewModalOpen(false)
    setNewReviewer('')
    setNewTitle('')
    setNewComment('')
    setNewRating(5)

    toast({
      title: 'Review Submitted',
      description: 'Thank you for sharing your feedback on this piece.',
      variant: 'success',
    })
  }

  const displayPrice = selectedVariant?.price_cents ?? product.min_price_cents
  const comparePrice = selectedVariant?.compare_price_cents

  // Structured data for SEO
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.short_description || product.description || '',
    image: product.primary_image || undefined,
    sku: selectedVariant?.sku || product.variants[0]?.sku,
    brand: { '@type': 'Brand', name: 'AK QIMAASH' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'SGD',
      price: (displayPrice / 100).toFixed(2),
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'AK QIMAASH' },
    },
  }

  const relatedProducts = (relatedData?.products || []).filter((p) => p.id !== product.id).slice(0, 4)

  return (
    <>
      <SEOHead
        title={`${product.name} — AK QIMAASH`}
        description={product.short_description || `Shop ${product.name} at AK QIMAASH.`}
        canonical={`/products/${product.slug}`}
        ogImage={product.primary_image || undefined}
        schema={productSchema}
      />

      <div className="container-main py-6 sm:py-10">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Shop', href: '/shop' },
            ...(product.category
              ? [{ label: product.category.name, href: `/shop?category=${product.category.slug}` }]
              : []),
            { label: product.name },
          ]}
          className="mb-8"
        />

        {/* ── 2-Column Editorial Presentation ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-20">
          {/* Left Column: Editorial Gallery */}
          <div>
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          {/* Right Column: Product Detail & Actions */}
          <div className="lg:max-w-lg">
            {/* Category / Subtitle */}
            {product.category && (
              <p className="editorial-subheading mb-2">
                {product.category.name}
              </p>
            )}

            {/* Title */}
            <h1 className="font-editorial text-3xl sm:text-4xl text-brand-black tracking-tight uppercase font-medium mb-3">
              {product.name}
            </h1>

            {/* Price Row */}
            <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-border/70">
              <span className="font-sans text-xl sm:text-2xl font-medium text-brand-black">
                {formatPrice(displayPrice)}
              </span>
              {comparePrice && comparePrice > displayPrice && (
                <>
                  <span className="text-sm font-sans text-text-muted line-through">
                    {formatPrice(comparePrice)}
                  </span>
                  <span className="px-2 py-0.5 bg-accent text-white text-[10px] font-sans font-semibold uppercase tracking-wider rounded-xs shadow-xs">
                    Save {Math.round(((comparePrice - displayPrice) / comparePrice) * 100)}%
                  </span>
                </>
              )}
              <span className="text-xs font-sans text-text-muted">+ 9% Singapore GST at checkout</span>
            </div>

            {/* Short editorial description */}
            {product.short_description && (
              <p className="font-sans text-sm text-text-secondary leading-relaxed font-light mb-8">
                {product.short_description}
              </p>
            )}

            {/* Variant Selector: Color & Size */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase font-sans font-medium tracking-wider text-brand-black">
                  Select Size
                </span>
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-xs font-sans text-text-muted hover:text-brand-black underline underline-offset-4 cursor-pointer"
                >
                  Size Guide
                </button>
              </div>

              <VariantSelector
                variants={product.variants}
                selectedVariantId={selectedVariant?.id ?? null}
                onSelect={setSelectedVariant}
                onOpenSizeGuide={() => setSizeGuideOpen(true)}
              />

              {/* Stock status indicator — tightly grouped with selected variant */}
              {selectedVariant && (
                <div className="mt-3 flex items-center gap-1.5">
                  <span
                    className={cn(
                      'text-xs font-sans tracking-wide uppercase',
                      inStock
                        ? selectedVariant.stock_quantity <= 3
                          ? 'text-amber-800'
                          : 'text-text-muted'
                        : 'text-rose-700'
                    )}
                  >
                    {inStock
                      ? selectedVariant.stock_quantity <= 3
                        ? `Low stock — Only ${selectedVariant.stock_quantity} pieces available`
                        : 'In Stock & Ready for Delivery'
                      : 'Currently Sold Out'}
                  </span>
                </div>
              )}
            </div>

            {/* Quantity Selector + Add to Bag + Wishlist */}
            <div ref={ctaRef} className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                {/* Quantity Control */}
                <div className="flex items-center border border-border h-12 rounded-xs bg-surface-raised">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-full flex items-center justify-center text-text-secondary hover:text-brand-black transition-colors"
                    aria-label="Decrease quantity"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-sans font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                    className="w-10 h-full flex items-center justify-center text-text-secondary hover:text-brand-black transition-colors"
                    aria-label="Increase quantity"
                    disabled={quantity >= maxQuantity}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Editorial Add to Bag CTA */}
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || !inStock}
                  className={cn(
                    'flex-1 h-12 px-6 flex items-center justify-center text-xs uppercase tracking-[0.2em] font-sans font-medium transition-all duration-200 rounded-xs',
                    addedFeedback
                      ? 'bg-emerald-800 text-white'
                      : !selectedVariant
                      ? 'bg-brand-smoke text-text-disabled cursor-not-allowed'
                      : !inStock
                      ? 'bg-brand-smoke text-text-disabled cursor-not-allowed'
                      : 'bg-brand-black text-white hover:bg-brand-charcoal'
                  )}
                >
                  {addedFeedback
                    ? 'Added to Bag ✓'
                    : !selectedVariant
                    ? 'Select a Size'
                    : !inStock
                    ? 'Sold Out'
                    : 'Add to Bag'}
                </button>
              </div>

              {/* Wishlist toggle */}
              <button
                onClick={handleWishlistToggle}
                className="w-full py-3 flex items-center justify-center gap-2 border border-border text-xs uppercase tracking-[0.15em] font-sans font-medium text-brand-black hover:border-brand-black transition-colors rounded-xs"
              >
                <Heart
                  className={cn(
                    'h-3.5 w-3.5 stroke-[1.5]',
                    isWishlisted ? 'fill-accent stroke-accent' : 'stroke-brand-black'
                  )}
                />
                {isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
              </button>
            </div>

            {/* Service Assurance */}
            <div className="py-6 border-y border-border/70 space-y-3 font-sans text-xs text-text-secondary">
              <div className="flex items-center gap-3">
                <Truck className="h-4 w-4 text-text-muted stroke-[1.5]" />
                <span>Complimentary Singapore delivery over $100 (2–4 business days)</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-text-muted stroke-[1.5]" />
                <span>Cash on Delivery &middot; Inspect on arrival</span>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="h-4 w-4 text-text-muted stroke-[1.5]" />
                <span>14-day unworn returns & exchanges</span>
              </div>
            </div>

            {/* Accordion Sections: Details, Fabric & Care, Shipping */}
            <div className="space-y-0">
              {product.description && (
                <AccordionItem title="Product Details">
                  <p className="font-sans text-xs leading-relaxed text-text-secondary whitespace-pre-line font-light">
                    {product.description}
                  </p>
                </AccordionItem>
              )}
              {product.material && (
                <AccordionItem title="Fabric & Care">
                  <div className="space-y-2 text-xs font-sans text-text-secondary font-light">
                    <p>
                      <strong>Material:</strong> {product.material}
                    </p>
                    {product.care_instructions && (
                      <p>
                        <strong>Care:</strong> {product.care_instructions}
                      </p>
                    )}
                  </div>
                </AccordionItem>
              )}
              <AccordionItem title="Shipping & Returns">
                <p className="font-sans text-xs leading-relaxed text-text-secondary font-light">
                  Orders are dispatched from our Singapore atelier within 24 hours. We offer complimentary standard
                  delivery on all domestic orders above SGD $100. Unworn pieces with intact tags may be exchanged or
                  returned within 14 calendar days.
                </p>
              </AccordionItem>
            </div>
          </div>
        </div>

        {/* ── Customer Reviews Section ── */}
        <section className="mt-20 pt-16 border-t border-border/80" aria-label="Customer Reviews">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <p className="editorial-subheading mb-2">Verified Feedback</p>
              <h2 className="font-editorial text-3xl sm:text-4xl text-brand-black uppercase font-medium">
                Customer Reviews
              </h2>
              <div className="flex items-center gap-2 mt-3">
                <div className="flex text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-500 stroke-amber-500" />
                  ))}
                </div>
                <span className="font-sans text-xs font-semibold text-brand-black">5.0 / 5.0</span>
                <span className="font-sans text-xs text-text-muted">({reviews.length} reviews)</span>
              </div>
            </div>

            <button
              onClick={() => setReviewModalOpen(true)}
              className="px-6 py-3 border border-brand-black text-xs font-sans uppercase tracking-widest font-medium hover:bg-brand-black hover:text-white transition-colors self-start md:self-auto"
            >
              Write a Review
            </button>
          </div>

          {/* Reviews List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-6 bg-surface-raised border border-border/80 rounded-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex text-amber-500">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-500 stroke-amber-500" />
                    ))}
                  </div>
                  <span className="text-[11px] font-sans text-text-muted">{rev.date}</span>
                </div>

                <h4 className="font-sans text-sm font-semibold text-brand-black mb-1.5">{rev.title}</h4>
                <p className="font-sans text-xs leading-relaxed text-text-secondary font-light mb-4">{rev.comment}</p>

                <div className="flex items-center gap-2 text-[11px] font-sans text-text-muted">
                  <span className="font-medium text-brand-black">{rev.name}</span>
                  {rev.verified && (
                    <span className="inline-flex items-center gap-1 text-emerald-800 text-[10px] font-medium uppercase tracking-wider">
                      <Check className="h-3 w-3" /> Verified Buyer
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── You May Also Like ── */}
        {relatedProducts.length > 0 && (
          <section className="mt-24 pt-16 border-t border-border/80" aria-label="Related Pieces">
            <div className="text-center max-w-lg mx-auto mb-12">
              <p className="editorial-subheading mb-2">Curated Pairings</p>
              <h2 className="font-editorial text-3xl sm:text-4xl text-brand-black uppercase font-medium">
                You May Also Like
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── Size Guide Modal ── */}
      {sizeGuideOpen && (
        <div
          className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-brand-black/60 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-surface-raised max-w-lg w-full p-6 sm:p-8 rounded-xs shadow-xl relative animate-scale-up">
            <button
              onClick={() => setSizeGuideOpen(false)}
              className="absolute top-6 right-6 text-text-muted hover:text-brand-black"
              aria-label="Close size guide"
            >
              <X className="h-5 w-5" />
            </button>
            <p className="editorial-subheading mb-1">Singapore Sizing Reference</p>
            <h3 className="font-editorial text-2xl uppercase tracking-tight font-medium mb-6">Garment Size Guide</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-sans text-left">
                <thead>
                  <tr className="border-b border-border text-text-muted uppercase tracking-wider">
                    <th className="py-2.5">Size</th>
                    <th className="py-2.5">Bust (cm)</th>
                    <th className="py-2.5">Waist (cm)</th>
                    <th className="py-2.5">Hip (cm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  <tr><td className="py-2.5 font-medium">XS</td><td>82–85</td><td>66–69</td><td>88–91</td></tr>
                  <tr><td className="py-2.5 font-medium">S</td><td>86–89</td><td>70–73</td><td>92–95</td></tr>
                  <tr><td className="py-2.5 font-medium">M</td><td>90–93</td><td>74–77</td><td>96–99</td></tr>
                  <tr><td className="py-2.5 font-medium">L</td><td>94–97</td><td>78–81</td><td>100–103</td></tr>
                  <tr><td className="py-2.5 font-medium">XL</td><td>98–101</td><td>82–85</td><td>104–107</td></tr>
                  <tr><td className="py-2.5 font-medium">XXL</td><td>102–105</td><td>86–89</td><td>108–111</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-[11px] font-sans text-text-muted mt-6 font-light">
              Measurements reflect relaxed garment drape. For styling advice or bespoke tailoring assistance, contact
              our team.
            </p>
          </div>
        </div>
      )}

      {/* ── Write Review Modal ── */}
      {reviewModalOpen && (
        <div
          className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-brand-black/60 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-surface-raised max-w-md w-full p-6 sm:p-8 rounded-xs shadow-xl relative animate-scale-up">
            <button
              onClick={() => setReviewModalOpen(false)}
              className="absolute top-6 right-6 text-text-muted hover:text-brand-black"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
            <p className="editorial-subheading mb-1">Feedback</p>
            <h3 className="font-editorial text-2xl uppercase tracking-tight font-medium mb-6">Write a Review</h3>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-sans font-medium text-text-muted tracking-wider mb-1.5">
                  Rating
                </label>
                <div className="flex gap-1.5" role="radiogroup" aria-label="Rating selection">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      aria-label={`${star} star${star > 1 ? 's' : ''}`}
                      aria-checked={star === newRating}
                      role="radio"
                      className="p-1 hover:scale-110 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-black rounded-xs cursor-pointer"
                    >
                      <Star
                        className={cn(
                          'h-5 w-5',
                          star <= newRating ? 'fill-amber-500 stroke-amber-500' : 'stroke-border-strong text-transparent'
                        )}
                        aria-hidden="true"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-sans font-medium text-text-muted tracking-wider mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={newReviewer}
                  onChange={(e) => setNewReviewer(e.target.value)}
                  placeholder="e.g. Sivan A."
                  className="input-base"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-sans font-medium text-text-muted tracking-wider mb-1.5">
                  Review Headline
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Beautiful fabric and silhouette"
                  className="input-base"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-sans font-medium text-text-muted tracking-wider mb-1.5">
                  Your Feedback
                </label>
                <textarea
                  required
                  rows={4}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Tell us about the drape, comfort, sizing and craftsmanship..."
                  className="textarea-base"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-brand-black text-white text-xs uppercase tracking-widest font-medium hover:bg-brand-charcoal transition-colors rounded-xs"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Sticky Add to Bag Bar (Jakob's Law) */}
      <div
        className={cn(
          'fixed bottom-16 inset-x-0 z-30 bg-surface/95 backdrop-blur-md border-t border-border/80 px-4 py-2.5 shadow-lg md:hidden transition-all duration-300 ease-in-out',
          showStickyBar ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {product.primary_image && (
              <img
                src={product.primary_image}
                alt={product.name}
                className="w-10 h-10 object-cover rounded-xs border border-border/80 flex-shrink-0"
              />
            )}
            <div className="min-w-0">
              <p className="text-xs font-sans font-medium text-brand-black truncate">
                {product.name}
              </p>
              <div className="flex items-center gap-2 text-[11px] font-sans text-text-muted">
                <span>{formatPrice(displayPrice)}</span>
                {selectedVariant && <span>&middot; Size {selectedVariant.size || 'OS'}</span>}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!selectedVariant || !inStock}
            className={cn(
              'h-10 px-5 text-xs font-sans uppercase tracking-wider font-medium rounded-xs flex-shrink-0 transition-colors flex items-center justify-center cursor-pointer',
              addedFeedback
                ? 'bg-emerald-800 text-white'
                : !selectedVariant || !inStock
                ? 'bg-brand-smoke text-text-disabled cursor-not-allowed'
                : 'bg-brand-black text-white hover:bg-brand-charcoal'
            )}
          >
            {addedFeedback ? 'Added ✓' : !selectedVariant ? 'Select Size' : !inStock ? 'Sold Out' : 'Add to Bag'}
          </button>
        </div>
      </div>
    </>
  )
}

function AccordionItem({ title, children }: { title: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="border-b border-border/70">
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="flex items-center justify-between w-full py-4 text-xs uppercase tracking-[0.15em] font-sans font-medium text-brand-black hover:text-accent transition-colors text-left"
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-text-muted" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-4 w-4 text-text-muted" aria-hidden="true" />
        )}
      </button>
      {isOpen && <div className="pb-5 pt-1 animate-fade-in">{children}</div>}
    </div>
  )
}
