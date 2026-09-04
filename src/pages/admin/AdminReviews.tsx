import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { formatDate } from '@/utils'
import { Star } from 'lucide-react'
import { cn } from '@/utils'

export function AdminReviewsPage() {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, products(name), profiles(full_name, email)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })

  const { mutateAsync: moderate } = useMutation({
    mutationFn: async ({ id, is_approved, moderation_note }: { id: string; is_approved: boolean; moderation_note?: string }) => {
      const { error } = await (supabase.from('reviews') as any)
        .update({
          is_approved,
          moderated_by: user?.id,
          moderated_at: new Date().toISOString(),
          moderation_note: moderation_note || null,
        })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }),
  })

  return (
    <div className="space-y-5 max-w-5xl">
      <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Reviews</h1>
      <div className="card overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={8} cols={5} />
        ) : data?.length === 0 ? (
          <p className="text-center py-12 text-sm text-text-muted">No reviews yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Customer</th>
                  <th>Rating</th>
                  <th>Review</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((review: any) => (
                  <tr key={review.id}>
                    <td className="text-sm">{review.products?.name}</td>
                    <td className="text-sm">{review.profiles?.full_name || review.profiles?.email}</td>
                    <td>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={cn('h-3 w-3', s <= review.rating ? 'fill-accent stroke-accent' : 'stroke-border')}
                          />
                        ))}
                      </div>
                    </td>
                    <td>
                      <p className="text-sm text-text-secondary line-clamp-2 max-w-xs">{review.body}</p>
                    </td>
                    <td>
                      {review.is_approved ? (
                        <span className="badge-success">Approved</span>
                      ) : review.is_flagged ? (
                        <span className="badge-error">Flagged</span>
                      ) : (
                        <span className="badge-default">Pending</span>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        {!review.is_approved && (
                          <button
                            onClick={() => moderate({ id: review.id, is_approved: true })}
                            className="text-xs text-success hover:underline"
                          >
                            Approve
                          </button>
                        )}
                        {review.is_approved && (
                          <button
                            onClick={() => moderate({ id: review.id, is_approved: false })}
                            className="text-xs text-error hover:underline"
                          >
                            Unapprove
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
