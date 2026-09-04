import { useState } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { sgAddressSchema, type SGAddressFormData } from '@/schemas'
import { Input, Textarea } from '@/components/ui/FormFields'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Drawer'
import { Skeleton } from '@/components/ui/Skeleton'

export function AddressesPage() {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const { data: addresses, isLoading } = useQuery<any[]>({
    queryKey: ['addresses', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user!.id)
        .order('is_default', { ascending: false })
      if (error) throw error
      return (data || []) as any[]
    },
    enabled: !!user,
  })

  const { mutateAsync: deleteAddress } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('addresses').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-primary">Addresses</h2>
        <Button variant="secondary" size="sm" onClick={() => { setEditingId(null); setModalOpen(true) }}>
          <Plus className="h-3.5 w-3.5" />
          Add address
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : addresses?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-muted text-sm mb-4">No saved addresses.</p>
          <Button variant="secondary" size="sm" onClick={() => setModalOpen(true)}>
            Add your first address
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses?.map((addr) => (
            <div key={addr.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  {addr.is_default && (
                    <span className="badge-black text-[10px] mb-2">Default</span>
                  )}
                  <p className="text-sm font-medium text-text-primary">{addr.recipient_name}</p>
                  <p className="text-sm text-text-secondary">{addr.phone}</p>
                  <p className="text-sm text-text-secondary">
                    {[addr.block_building, addr.street].filter(Boolean).join(', ')}
                    {addr.unit_number && `, ${addr.unit_number}`}
                  </p>
                  <p className="text-sm text-text-secondary">Singapore {addr.postal_code}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => { setEditingId(addr.id); setModalOpen(true) }}
                    className="btn-icon-sm btn-ghost"
                    aria-label="Edit address"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => deleteAddress(addr.id)}
                    className="btn-icon-sm btn-ghost text-text-muted hover:text-error"
                    aria-label="Delete address"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddressModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editingId={editingId}
        existingAddress={addresses?.find((a) => a.id === editingId) || null}
      />
    </div>
  )
}

function AddressModal({
  isOpen,
  onClose,
  editingId,
  existingAddress,
}: {
  isOpen: boolean
  onClose: () => void
  editingId: string | null
  existingAddress: any
}) {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SGAddressFormData>({
    resolver: zodResolver(sgAddressSchema) as any,
    defaultValues: existingAddress || { is_default: false },
  })

  const onSubmit = async (data: SGAddressFormData) => {
    setError(null)
    try {
      if (editingId) {
        const { error: e } = await (supabase.from('addresses') as any)
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', editingId)
        if (e) throw e
      } else {
        const { error: e } = await (supabase.from('addresses') as any)
          .insert({ ...data, user_id: user!.id })
        if (e) throw e
      }
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      reset()
      onClose()
    } catch {
      setError('Failed to save address. Please check your details and try again.')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingId ? 'Edit address' : 'New address'} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {error && (
          <div role="alert" className="p-3 bg-error-light rounded text-sm text-error-dark">{error}</div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <Input label="Recipient name" {...register('recipient_name')} error={errors.recipient_name?.message} required />
          <Input label="Phone" type="tel" {...register('phone')} error={errors.phone?.message} required />
        </div>
        <Input label="Block / Building" {...register('block_building')} />
        <Input label="Street address" {...register('street')} error={errors.street?.message} required />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Unit number" placeholder="#01-01" {...register('unit_number')} />
          <Input label="Postal code" maxLength={6} {...register('postal_code')} error={errors.postal_code?.message} required />
        </div>
        <Textarea label="Delivery notes" {...register('additional_info')} />
        <div className="flex items-center gap-2">
          <input type="checkbox" id="is_default_addr" {...register('is_default')} className="w-4 h-4 accent-brand-black" />
          <label htmlFor="is_default_addr" className="text-sm text-text-secondary">Set as default address</label>
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" size="md" type="button" onClick={onClose} className="flex-1">Cancel</Button>
          <Button variant="primary" size="md" type="submit" className="flex-1" isLoading={isSubmitting}>
            {editingId ? 'Save changes' : 'Add address'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
