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

  // Fetch store info
  const { data: store } = await supabase
    .from('stores')
    .select('slug, name')
    .eq('id', storeId)
    .single()

  return (
    <TableForm
      storeId={storeId}
      storeSlug={store?.slug || ''}
      storeName={store?.name || ''}
    />
  )
}
