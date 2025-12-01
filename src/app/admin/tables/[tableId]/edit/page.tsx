// @ts-nocheck
import { createAdminClient } from '@/lib/supabase/server'
import { getUserFromToken } from '@/lib/tenant-context'
import { TableForm } from '@/components/admin/table-form'
import { notFound, redirect } from 'next/navigation'

export default async function EditTablePage({
  params,
}: {
  params: Promise<{ tableId: string }>
}) {
  const supabase = createAdminClient()
  const { tableId } = await params

  // Get user from token
  const user = await getUserFromToken()
  if (!user || !user.storeId) {
    redirect('/login')
  }

  const storeId = user.storeId

  const [tableResult, outletsResult] = await Promise.all([
    supabase
      .from('tables')
      .select('*')
      .eq('id', tableId)
      .eq('store_id', storeId)
      .single(),
    supabase
      .from('outlets')
      .select('id, name, slug')
      .eq('store_id', storeId)
      .eq('is_active', true)
      .order('name')
  ])

  if (!tableResult.data) {
    notFound()
  }

  return <TableForm storeId={storeId} outlets={outletsResult.data || []} initialData={tableResult.data} />
}
