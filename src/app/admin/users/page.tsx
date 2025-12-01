// @ts-nocheck
import { createAdminClient } from '@/lib/supabase/server'
import { getUserFromToken } from '@/lib/tenant-context'
import { redirect } from 'next/navigation'
import { UserManagement } from '@/components/admin/user-management'

export default async function UsersPage() {
  const user = await getUserFromToken()
  if (!user || !user.storeId) {
    redirect('/login')
  }

  // Only tenant_admin can access this page
  if (user.role !== 'tenant_admin') {
    redirect('/admin/dashboard')
  }

  const supabase = createAdminClient()

  // Fetch outlets for assignment dropdown
  const { data: outlets } = await supabase
    .from('outlets')
    .select('id, name, slug')
    .eq('store_id', user.storeId)
    .eq('is_active', true)
    .order('name')

  return <UserManagement outlets={outlets || []} currentUserId={user.userId} />
}
