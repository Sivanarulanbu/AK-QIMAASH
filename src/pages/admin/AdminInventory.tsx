import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/FormFields'
import { Modal } from '@/components/ui/Drawer'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { formatDate } from '@/utils'

export function AdminInventoryPage() {
  const [adjustModalOpen, setAdjustModalOpen] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<any>(null)

  const { data: variants, isLoading } = useQuery({
    queryKey: ['admin-inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_variants')
        .select('*, products(name)')
        .eq('is_active', true)
        .order('stock_quantity')
      if (error) throw error
      return data
    },
  })

  return (
    <div className="space-y-5 max-w-6xl">
      <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Inventory</h1>
      <div className="card overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={8} cols={4} />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Product / SKU</th>
                  <th>Size</th>
                  <th>Stock</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {variants?.map((v: any) => (
                  <tr key={v.id}>
                    <td>
                      <p className="text-sm font-medium text-text-primary">{v.products?.name}</p>
                      <p className="text-xs text-text-muted font-mono">{v.sku}</p>
                    </td>
                    <td className="text-sm">{v.size || '—'}</td>
                    <td>
                      <span className={`text-sm font-semibold ${
                        v.stock_quantity === 0 ? 'text-error' :
                        v.stock_quantity <= 5 ? 'text-warning' : 'text-success'
                      }`}>
                        {v.stock_quantity}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => { setSelectedVariant(v); setAdjustModalOpen(true) }}
                        className="text-xs text-accent hover:underline"
                      >
                        Adjust
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <InventoryAdjustModal
        isOpen={adjustModalOpen}
        variant={selectedVariant}
        onClose={() => { setAdjustModalOpen(false); setSelectedVariant(null) }}
      />
    </div>
  )
}

function InventoryAdjustModal({ isOpen, variant, onClose }: { isOpen: boolean; variant: any; onClose: () => void }) {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const [delta, setDelta] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const d = parseInt(delta, 10)
    if (!d || !reason.trim() || !variant) return
    setError(null)
    setIsLoading(true)
    try {
      const newQty = variant.stock_quantity + d
      if (newQty < 0) { setError('Stock cannot go below 0.'); setIsLoading(false); return }

      const { error: variantError } = await (supabase.from('product_variants') as any)
        .update({ stock_quantity: newQty, updated_at: new Date().toISOString() })
        .eq('id', variant.id)
      if (variantError) throw variantError

      await (supabase.from('inventory_transactions') as any).insert({
        variant_id: variant.id,
        transaction_type: 'STOCK_ADJUSTMENT',
        quantity_delta: d,
        quantity_before: variant.stock_quantity,
        quantity_after: newQty,
        reason,
        created_by: user?.id,
      })

      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] })
      setDelta(''); setReason(''); onClose()
    } catch {
      setError('Failed to adjust stock.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!variant) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adjust Stock">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-text-secondary">
          <span className="font-medium text-text-primary">{variant.products?.name}</span>
          {' '}— SKU: {variant.sku}
        </p>
        <p className="text-sm text-text-secondary">Current stock: <span className="font-semibold text-text-primary">{variant.stock_quantity}</span></p>

        {error && <div role="alert" className="p-3 bg-error-light rounded text-sm text-error-dark">{error}</div>}

        <Input
          label="Quantity change"
          type="number"
          value={delta}
          onChange={(e) => setDelta(e.target.value)}
          placeholder="+10 or -5"
          hint="Use positive numbers to add stock, negative to reduce."
          required
        />
        <Input
          label="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Stock received from supplier"
          required
        />
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" size="md" type="button" onClick={onClose} className="flex-1">Cancel</Button>
          <Button variant="primary" size="md" type="submit" className="flex-1" isLoading={isLoading} disabled={!delta || !reason}>
            Apply Adjustment
          </Button>
        </div>
      </form>
    </Modal>
  )
}
