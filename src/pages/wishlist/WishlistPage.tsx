import { Heart, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useWishlistStore } from '@/store/wishlistStore'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductGridSkeleton } from '@/components/ui/Skeleton'
import { SEOHead } from '@/components/seo/SEOHead'
import type { ProductWithDetails } from '@/features/products/useProducts'

export function WishlistPage() {
  const { productIds } = useWishlistStore()

  const { data: products, isLoading } = useQuery({
    queryKey: ['wishlist-products', productIds],
    queryFn: async () => {
      if (productIds.length === 0) return []
      const { data, error } = await supabase
        .from('products')
        .select(`*, categories(*), product_variants(*), product_images(*)`)
        .in('id', productIds)
        .eq('is_published', true)
      if (error) throw error

      return (data || []).map((p: any) => {
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
    },
    enabled: productIds.length > 0,
  })

  return (
    <>
      <SEOHead title="Wishlist — AK QIMAASH" description="Your saved items." canonical="/wishlist" />
      <div className="container-main py-8 md:py-12">
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight mb-8">
          Wishlist
          {productIds.length > 0 && (
            <span className="text-text-muted text-lg font-normal ml-2">({productIds.length})</span>
          )}
        </h1>

        {productIds.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 bg-surface-sunken rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-6 w-6 text-text-muted" />
            </div>
            <p className="text-text-muted text-sm mb-4">No saved items yet.</p>
            <Link to="/shop" className="btn-md btn-secondary">
              Browse products
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : isLoading ? (
          <ProductGridSkeleton count={productIds.length} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
