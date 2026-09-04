import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { formatDate } from '@/utils'

export function AdminCustomersPage() {
  const { data, isLoading } = useQuery<any[]>({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      if (error) throw error
      return (data || []) as any[]
    },
  })

  return (
    <div className="space-y-5 max-w-5xl">
      <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Customers</h1>
      <div className="card overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={8} cols={4} />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((profile) => (
                  <tr key={profile.id}>
                    <td className="text-sm font-medium text-text-primary">{profile.full_name || '—'}</td>
                    <td className="text-sm text-text-secondary">{profile.email}</td>
                    <td className="text-sm text-text-secondary">{profile.phone || '—'}</td>
                    <td className="text-sm text-text-muted">{formatDate(profile.created_at)}</td>
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
