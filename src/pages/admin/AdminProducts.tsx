import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, Edit, Archive } from 'lucide-react'
import { useAdminProducts, useDeleteProduct, useCreateProduct, useUpdateProduct, useCategories } from '@/features/products/useProducts'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/FormFields'
import { Modal } from '@/components/ui/Drawer'
import { Pagination } from '@/components/ui/Navigation'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { formatPrice } from '@/lib/commerce'
import { formatDate } from '@/utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema, type ProductFormData } from '@/schemas'
import { slugify } from '@/utils'

const PER_PAGE = 20

export function AdminProductsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const { data, isLoading } = useAdminProducts(page, PER_PAGE, search)
  const { mutateAsync: deleteProduct } = useDeleteProduct()
  const totalPages = data ? Math.ceil(data.total / PER_PAGE) : 0

  const handleArchive = async (id: string, name: string) => {
    if (confirm(`Archive "${name}"? It will no longer appear in the storefront.`)) {
      await deleteProduct(id)
    }
  }

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Products</h1>
        <Button variant="primary" size="md" onClick={() => setCreateModalOpen(true)}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" aria-hidden="true" />
        <input
          type="search"
          placeholder="Search products..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="input-base pl-9"
          aria-label="Search products"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={8} cols={5} />
        ) : data?.products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-text-muted mb-3">No products yet.</p>
            <Button variant="secondary" size="sm" onClick={() => setCreateModalOpen(true)}>
              Add your first product
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Variants</th>
                    <th>Status</th>
                    <th>Added</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data?.products.map((product: any) => (
                    <tr key={product.id}>
                      <td>
                        <p className="text-sm font-medium text-text-primary">{product.name}</p>
                        <p className="text-xs text-text-muted font-mono">{product.slug}</p>
                      </td>
                      <td className="text-sm">{product.categories?.name || '—'}</td>
                      <td className="text-sm">{product.product_variants?.length || 0}</td>
                      <td>
                        {product.is_published ? (
                          <span className="badge-success">Published</span>
                        ) : (
                          <span className="badge-default">Draft</span>
                        )}
                      </td>
                      <td className="text-sm text-text-muted">{formatDate(product.created_at)}</td>
                      <td>
                        <div className="flex gap-2 justify-end">
                          <Link
                            to={`/admin/products/${product.id}`}
                            className="btn-icon-sm btn-ghost"
                            aria-label={`Edit ${product.name}`}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            onClick={() => handleArchive(product.id, product.name)}
                            className="btn-icon-sm btn-ghost text-text-muted hover:text-error"
                            aria-label={`Archive ${product.name}`}
                          >
                            <Archive className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-border">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>

      <CreateProductModal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} />
    </div>
  )
}

function CreateProductModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const { mutateAsync: createProduct, isPending } = useCreateProduct()
  const { data: categories } = useCategories()
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: { is_published: false, tags: [] },
  })

  const name = watch('name')

  const onSubmit = async (data: ProductFormData) => {
    setError(null)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const product = await createProduct(data as any) as any
      onClose()
      navigate(`/admin/products/${product.id}`)
    } catch (err: any) {
      if (err.message?.includes('slug')) {
        setError('A product with this slug already exists. Change the product name or slug.')
      } else {
        setError('Failed to create product. Please try again.')
      }
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Product" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div role="alert" className="p-3 bg-error-light rounded text-sm text-error-dark">
            {error}
          </div>
        )}

        <Input
          label="Product name"
          {...register('name', {
            onChange: (e) => setValue('slug', slugify(e.target.value)),
          })}
          error={errors.name?.message}
          required
        />
        <Input
          label="Slug"
          {...register('slug')}
          error={errors.slug?.message}
          hint="Used in the product URL"
        />

        <Select
          label="Category"
          options={[
            { value: '', label: 'No category' },
            ...(categories || []).map((c) => ({ value: c.id, label: c.name })),
          ]}
          {...register('category_id')}
          error={errors.category_id?.message}
        />

        <Textarea
          label="Short description"
          {...register('short_description')}
          error={errors.short_description?.message}
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_published"
            {...register('is_published')}
            className="w-4 h-4 accent-brand-black"
          />
          <label htmlFor="is_published" className="text-sm text-text-secondary">
            Publish immediately
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" size="md" type="button" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button variant="primary" size="md" type="submit" className="flex-1" isLoading={isPending}>
            Create Product
          </Button>
        </div>
      </form>
    </Modal>
  )
}
