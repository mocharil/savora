// @ts-nocheck
import { getUserFromToken } from '@/lib/tenant-context'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { TableForm } from '@/components/admin/table-form'

export default async function CreateTablePage() {
  // Get user from token
  const user = await getUserFromToken()
  if (!user || !user.storeId) {
    redirect('/login')
  }

  const storeId = user.storeId
  const supabase = createAdminClient()

  // Fetch outlets for this store
  const { data: outlets } = await supabase
    .from('outlets')
    .select('id, name, slug')
    .eq('store_id', storeId)
    .eq('is_active', true)
    .order('name')

  return <TableForm storeId={storeId} outlets={outlets || []} />
}
