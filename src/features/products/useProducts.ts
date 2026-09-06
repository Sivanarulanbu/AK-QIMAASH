import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { SEED_PRODUCTS, SEED_CATEGORIES } from '@/data/seedProducts'
import type { Database } from '@/types/database'

type Product = Database['public']['Tables']['products']['Row']
type ProductVariant = Database['public']['Tables']['product_variants']['Row']
type ProductImage = Database['public']['Tables']['product_images']['Row']
type Category = Database['public']['Tables']['categories']['Row']

export interface ProductWithDetails extends Product {
  category: Category | null
  variants: ProductVariant[]
  images: ProductImage[]
  primary_image: string | null
  min_price_cents: number
  max_price_cents: number
}

export interface ProductFilters {
  category_slug?: string
  sizes?: string[]
  colors?: string[]
  min_price_cents?: number
  max_price_cents?: number
  in_stock?: boolean
  search?: string
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'name_asc'
  page?: number
  per_page?: number
}

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (slug: string) => [...productKeys.details(), slug] as const,
  categories: ['categories'] as const,
  featured: ['products', 'featured'] as const,
  newArrivals: ['products', 'new-arrivals'] as const,
}

// ─── Helper: build a product with details from joined query ──────────────────

function buildProductWithDetails(raw: Product & {
  categories: Category | null
  product_variants: ProductVariant[]
  product_images: ProductImage[]
}): ProductWithDetails {
  const variants = raw.product_variants || []
  const images = (raw.product_images || []).sort((a, b) => a.position - b.position)
  const activePrices = variants.filter((v) => v.is_active).map((v) => v.price_cents)

  return {
    ...raw,
    category: raw.categories,
    variants,
    images,
    primary_image: images.find((i) => i.is_primary)?.url ?? images[0]?.url ?? null,
    min_price_cents: activePrices.length ? Math.min(...activePrices) : 0,
    max_price_cents: activePrices.length ? Math.max(...activePrices) : 0,
  }
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: async () => {
      const {
        category_slug,
        sizes,
        colors,
        min_price_cents,
        max_price_cents,
        in_stock,
        search,
        sort = 'newest',
        page = 1,
        per_page = 24,
      } = filters

      let products: ProductWithDetails[] = []
      let totalCount = 0

      try {
        let query = supabase
          .from('products')
          .select(`
            *,
            categories(*),
            product_variants!inner(*),
            product_images(*)
          `, { count: 'exact' })
          .eq('is_published', true)
          .eq('is_archived', false)

        if (category_slug) {
          query = query.eq('categories.slug', category_slug)
        }

        if (search) {
          query = query.ilike('name', `%${search}%`)
        }

        if (in_stock) {
          query = query.gt('product_variants.stock_quantity', 0)
        }

        if (min_price_cents !== undefined) {
          query = query.gte('product_variants.price_cents', min_price_cents)
        }

        if (max_price_cents !== undefined) {
          query = query.lte('product_variants.price_cents', max_price_cents)
        }

        // Sorting
        switch (sort) {
          case 'newest':
            query = query.order('created_at', { ascending: false })
            break
          case 'price_asc':
            query = query.order('product_variants(price_cents)', { ascending: true })
            break
          case 'price_desc':
            query = query.order('product_variants(price_cents)', { ascending: false })
            break
          case 'name_asc':
            query = query.order('name', { ascending: true })
            break
        }

        // Pagination
        const from = (page - 1) * per_page
        query = query.range(from, from + per_page - 1)

        const { data, error, count } = await query

        if (!error && data && data.length > 0) {
          products = data.map((p: any) => buildProductWithDetails(p))
          totalCount = count ?? products.length
        }
      } catch {
        // Fall through to seed products when offline or database not yet seeded
      }

      // Fallback to seed products if database is empty or offline
      if (products.length === 0) {
        products = [...SEED_PRODUCTS]
      }

      // Filter by category
      if (category_slug) {
        products = products.filter((p) => p.category?.slug === category_slug)
      }

      // Filter by search
      if (search) {
        const s = search.toLowerCase()
        products = products.filter((p) => p.name.toLowerCase().includes(s) || p.description?.toLowerCase().includes(s))
      }

      // Client-side filter for size/color
      const filtered = products.filter((p) => {
        if (sizes && sizes.length > 0) {
          if (!p.variants.some((v) => v.size && sizes.includes(v.size))) return false
        }
        if (colors && colors.length > 0) {
          if (!p.variants.some((v) => v.color && colors.includes(v.color))) return false
        }
        return true
      })

      return { products: filtered, total: totalCount || filtered.length }
    },
    staleTime: 1000 * 60 * 5, // 5 min
  })
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories(*),
            product_variants(*),
            product_images(*)
          `)
          .eq('slug', slug)
          .eq('is_published', true)
          .eq('is_archived', false)
          .single()

        if (data && !error) {
          return buildProductWithDetails(data as any)
        }
      } catch {
        // fall through to seed product
      }

      const seed = SEED_PRODUCTS.find((p) => p.slug === slug)
      if (seed) return seed
      return null
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCategories() {
  return useQuery({
    queryKey: productKeys.categories,
    queryFn: async (): Promise<any[]> => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('position')

        if (data && data.length > 0 && !error) {
          return (data as any[]).map((cat) => ({
            ...cat,
            image_url: cat.image_url || `/images/categories/${cat.slug}.jpg`,
          }))
        }
      } catch {
        // fall through
      }
      return SEED_CATEGORIES
    },
    staleTime: 1000 * 60 * 30,
  })
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: productKeys.featured,
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories(*),
            product_variants(*),
            product_images(*)
          `)
          .eq('is_published', true)
          .eq('is_archived', false)
          .order('created_at', { ascending: false })
          .limit(8)

        if (data && data.length > 0 && !error) {
          return (data || []).map((p: any) => buildProductWithDetails(p))
        }
      } catch {
        // fall through
      }
      return SEED_PRODUCTS.slice(0, 8)
    },
    staleTime: 1000 * 60 * 10,
  })
}

export function useNewArrivals() {
  return useQuery({
    queryKey: productKeys.newArrivals,
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories(*),
            product_variants(*),
            product_images(*)
          `)
          .eq('is_published', true)
          .eq('is_archived', false)
          .order('created_at', { ascending: false })
          .limit(12)

        if (data && data.length > 0 && !error) {
          return (data || []).map((p: any) => buildProductWithDetails(p))
        }
      } catch {
        // fall through
      }
      return SEED_PRODUCTS
    },
    staleTime: 1000 * 60 * 10,
  })
}

// ─── Admin Mutations ─────────────────────────────────────────────────────────

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const { data: product, error } = await (supabase.from('products') as any)
        .insert(data)
        .select()
        .single()
      if (error) throw error
      return product
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: any
    }) => {
      const { data: product, error } = await (supabase.from('products') as any)
        .update(data)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return product
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from('products') as any)
        .update({ is_archived: true })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
  })
}

export function useAdminProducts(page = 1, perPage = 20, search = '') {
  return useQuery({
    queryKey: [...productKeys.all, 'admin', { page, perPage, search }],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`*, categories(*), product_variants(*)`, { count: 'exact' })
        .eq('is_archived', false)
        .order('created_at', { ascending: false })
        .range((page - 1) * perPage, page * perPage - 1)

      if (search) {
        query = query.ilike('name', `%${search}%`)
      }

      const { data, error, count } = await query
      if (error) throw error
      return { products: data || [], total: count ?? 0 }
    },
  })
}
