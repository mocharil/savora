// @ts-nocheck
import { createAdminClient } from '@/lib/supabase/server'
import { getUserFromToken } from '@/lib/tenant-context'
import { notFound, redirect } from 'next/navigation'
import { QRPageContent } from '@/components/admin/qr-page-content'

export default async function TableQRPage({
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

  const [tableResult, storeResult] = await Promise.all([
    supabase
      .from('tables')
      .select('*')
      .eq('id', tableId)
      .eq('store_id', storeId)
      .single(),
    supabase
      .from('stores')
      .select('name, slug')
      .eq('id', storeId)
      .single()
  ])

  if (!tableResult.data || !storeResult.data) {
    notFound()
  }

  const table = tableResult.data
  const store = storeResult.data

  // Pass path only, base URL will be determined client-side
  const orderPath = `/${store.slug}/order?table=${table.qr_code}`

  return <QRPageContent table={table} store={store} orderPath={orderPath} />
}
