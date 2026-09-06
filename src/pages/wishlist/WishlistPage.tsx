import { Link } from 'react-router-dom'
import { useWishlistStore } from '@/store/wishlistStore'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductGridSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { SEOHead } from '@/components/seo/SEOHead'
import { SEED_PRODUCTS } from '@/data/seedProducts'
import type { ProductWithDetails } from '@/features/products/useProducts'

export function WishlistPage() {
  const { productIds } = useWishlistStore()

  const { data: products, isLoading } = useQuery({
    queryKey: ['wishlist-products', productIds],
    queryFn: async () => {
      if (productIds.length === 0) return []

      // Fallback matching in SEED_PRODUCTS first if offline / preview mode
      const seedMatches = SEED_PRODUCTS.filter((p) => productIds.includes(p.id))

      try {
        const { data, error } = await supabase
          .from('products')
          .select(`*, categories(*), product_variants(*), product_images(*)`)
          .in('id', productIds)
          .eq('is_published', true)

        if (!error && data && data.length > 0) {
          return data.map((p: any) => {
            const variants = p.product_variants || []
            const images = (p.product_images || []).sort((a: any, b: any) => a.position - b.position)
            const activePrices = variants.filter((v: any) => v.is_active).map((v: any) => v.price_cents)
            return {
              ...p,
              category: p.categories,
              variants,
              images,
              primary_image: images.find((i: any) => i.is_primary)?.url ?? images[0]?.url ?? null,
              min_price_cents: activePrices.length ? Math.min(...activePrices) : 0,
              max_price_cents: activePrices.length ? Math.max(...activePrices) : 0,
            } as ProductWithDetails
          })
        }
      } catch {
        // use seed matches
      }

      return seedMatches
    },
    enabled: productIds.length > 0,
  })

  return (
    <>
      <SEOHead title="Your Wishlist — AK QIMAASH" description="Your saved pieces." canonical="/wishlist" />
      <div className="container-main py-10 sm:py-16">
        <div className="text-center max-w-lg mx-auto mb-10">
          <p className="editorial-subheading mb-1">Curated Selection</p>
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-brand-black uppercase tracking-tight font-medium">
            Your Wishlist
            {productIds.length > 0 && (
              <span className="text-text-muted font-sans text-sm font-normal ml-3">
                ({productIds.length} {productIds.length === 1 ? 'piece' : 'pieces'})
              </span>
            )}
          </h1>
        </div>

        {productIds.length === 0 ? (
          <EmptyState
            type="wishlist"
            actionLabel="EXPLORE COLLECTION"
            actionTo="/shop"
          />
        ) : isLoading ? (
          <ProductGridSkeleton count={productIds.length} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12">
            {products?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
