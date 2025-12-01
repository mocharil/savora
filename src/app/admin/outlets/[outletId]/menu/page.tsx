// @ts-nocheck
import { createAdminClient } from '@/lib/supabase/server'
import { getUserFromToken } from '@/lib/tenant-context'
import { redirect, notFound } from 'next/navigation'
import { OutletMenuManager } from '@/components/admin/outlet-menu-manager'

export default async function OutletMenuPage({
  params,
}: {
  params: Promise<{ outletId: string }>
}) {
  const user = await getUserFromToken()
  if (!user || !user.storeId) {
    redirect('/login')
  }

  const { outletId } = await params
  const supabase = createAdminClient()

  // Fetch outlet info
  const { data: outlet } = await supabase
    .from('outlets')
    .select('id, name, slug')
    .eq('id', outletId)
    .eq('store_id', user.storeId)
    .single()

  if (!outlet) {
    notFound()
  }

  // Fetch categories for filter
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .eq('store_id', user.storeId)
    .order('name')

  return (
    <OutletMenuManager
      outlet={outlet}
      categories={categories || []}
    />
  )
}
