import { useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Upload } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useUpdateProduct, useCategories } from '@/features/products/useProducts'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/FormFields'
import { Modal } from '@/components/ui/Drawer'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatPrice } from '@/lib/commerce'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { variantSchema, type VariantFormData } from '@/schemas'
import { cn } from '@/utils'

export function AdminProductDetail() {
  const { productId } = useParams<{ productId: string }>()
  const queryClient = useQueryClient()
  const [variantModalOpen, setVariantModalOpen] = useState(false)
  const { data: categories } = useCategories()
  const { mutateAsync: updateProduct } = useUpdateProduct()

  const { data: product, isLoading } = useQuery({
    queryKey: ['admin-product', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`*, categories(*), product_variants(*), product_images(*)`)
        .eq('id', productId!)
        .single()
      if (error) throw error
      return data as any
    },
    enabled: !!productId,
  })

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [material, setMaterial] = useState('')
  const [care, setCare] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Sync state when product loads
  const [initialized, setInitialized] = useState(false)
  if (product && !initialized) {
    setName(product.name || '')
    setDescription(product.description || '')
    setMaterial(product.material || '')
    setCare(product.care_instructions || '')
    setCategoryId(product.category_id || '')
    setIsPublished(product.is_published || false)
    setInitialized(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    await updateProduct({
      id: productId!,
      data: {
        name,
        description,
        material,
        care_instructions: care,
        category_id: categoryId || null,
        is_published: isPublished,
        updated_at: new Date().toISOString(),
      },
    })
    queryClient.invalidateQueries({ queryKey: ['admin-product', productId] })
    setIsSaving(false)
  }

  const { mutateAsync: deleteVariant } = useMutation({
    mutationFn: async (variantId: string) => {
      const { error } = await supabase.from('product_variants').delete().eq('id', variantId)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-product', productId] }),
  })

  if (isLoading) return <div className="space-y-3"><Skeleton className="h-6 w-48" /><Skeleton className="h-60" /></div>
  if (!product) return <Navigate to="/admin/products" replace />

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link to="/admin/products" className="btn-icon btn-ghost"><ArrowLeft className="h-4 w-4" /></Link>
        <h1 className="text-xl font-semibold text-text-primary flex-1 truncate">{product.name}</h1>
        <div className="flex items-center gap-2">
          <span className={product.is_published ? 'badge-success' : 'badge-default'}>
            {product.is_published ? 'Published' : 'Draft'}
          </span>
          <Link to={`/products/${product.slug}`} target="_blank" className="text-xs text-text-muted hover:text-text-primary">
            View
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        <div className="space-y-5">
          {/* Main details */}
          <div className="card p-5 space-y-4">
            <h2 className="text-sm font-semibold">Product details</h2>
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <Input label="Material" value={material} onChange={(e) => setMaterial(e.target.value)} />
            <Textarea label="Care instructions" value={care} onChange={(e) => setCare(e.target.value)} />
            <Button variant="primary" size="md" onClick={handleSave} isLoading={isSaving}>
              Save changes
            </Button>
          </div>

          {/* Variants */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold">Variants ({product.product_variants?.length || 0})</h2>
              <Button variant="secondary" size="sm" onClick={() => setVariantModalOpen(true)}>
                <Plus className="h-3.5 w-3.5" />
                Add variant
              </Button>
            </div>
            {product.product_variants?.length === 0 ? (
              <p className="text-sm text-text-muted">No variants yet. Add at least one to make this product purchasable.</p>
            ) : (
              <table className="table-base">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Size</th>
                    <th>Color</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {product.product_variants?.map((v: any) => (
                    <tr key={v.id}>
                      <td className="text-xs font-mono">{v.sku}</td>
                      <td className="text-sm">{v.size || '—'}</td>
                      <td className="text-sm">{v.color || '—'}</td>
                      <td className="text-sm">{formatPrice(v.price_cents)}</td>
                      <td className={cn('text-sm font-medium', v.stock_quantity === 0 ? 'text-error' : v.stock_quantity <= 5 ? 'text-warning' : 'text-success')}>
                        {v.stock_quantity}
                      </td>
                      <td>
                        <button
                          onClick={() => deleteVariant(v.id)}
                          className="btn-icon-sm btn-ghost text-text-muted hover:text-error"
                          aria-label="Delete variant"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          <div className="card p-4 space-y-4">
            <h2 className="text-sm font-semibold">Organization</h2>
            <Select
              label="Category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              options={[
                { value: '', label: 'No category' },
                ...(categories || []).map((c) => ({ value: c.id, label: c.name })),
              ]}
            />
          </div>
          <div className="card p-4">
            <h2 className="text-sm font-semibold mb-3">Visibility</h2>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="admin_is_published"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 accent-brand-black"
              />
              <label htmlFor="admin_is_published" className="text-sm text-text-secondary">
                Published
              </label>
            </div>
          </div>
        </div>
      </div>

      <AddVariantModal
        isOpen={variantModalOpen}
        onClose={() => setVariantModalOpen(false)}
        productId={productId!}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['admin-product', productId] })}
      />
    </div>
  )
}

function AddVariantModal({
  isOpen,
  onClose,
  productId,
  onSuccess,
}: {
  isOpen: boolean
  onClose: () => void
  productId: string
  onSuccess: () => void
}) {
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<VariantFormData>({
    resolver: zodResolver(variantSchema) as any,
    defaultValues: { stock_quantity: 0, is_active: true },
  })

  const onSubmit = async (data: VariantFormData) => {
    setError(null)
    try {
      const { error: e } = await (supabase.from('product_variants') as any).insert({
        ...data,
        product_id: productId,
        color_hex: data.color_hex || null,
        compare_price_cents: data.compare_price_cents || null,
      })
      if (e) {
        if (e.message?.includes('sku')) setError('This SKU already exists. Use a unique SKU.')
        else throw e
        return
      }
      reset()
      onSuccess()
      onClose()
    } catch {
      setError('Failed to add variant.')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Variant">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <div role="alert" className="p-3 bg-error-light rounded text-sm text-error-dark">{error}</div>}
        <Input label="SKU" {...register('sku')} error={errors.sku?.message} hint="Unique identifier, uppercase" required />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Size" placeholder="S, M, L..." {...register('size')} />
          <Input label="Color" placeholder="Black" {...register('color')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Price (cents)" type="number" {...register('price_cents', { valueAsNumber: true })} error={errors.price_cents?.message} hint="e.g. 4900 = $49.00" required />
          <Input label="Stock quantity" type="number" min={0} {...register('stock_quantity', { valueAsNumber: true })} error={errors.stock_quantity?.message} />
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" size="md" type="button" onClick={onClose} className="flex-1">Cancel</Button>
          <Button variant="primary" size="md" type="submit" className="flex-1" isLoading={isSubmitting}>Add Variant</Button>
        </div>
      </form>
    </Modal>
  )
}
