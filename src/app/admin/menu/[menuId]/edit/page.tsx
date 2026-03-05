import { createClient } from '@/lib/supabase/server'
import { getUserFromToken } from '@/lib/tenant-context'
import { MenuForm } from '@/components/admin/menu-form'
import { notFound, redirect } from 'next/navigation'

export default async function EditMenuPage({
  params,
}: {
  params: Promise<{ menuId: string }>
}) {
  const supabase = await createClient()
  const { menuId } = await params

  // Get user from token
  const user = await getUserFromToken()
  if (!user || !user.storeId) {
    redirect('/login')
  }

  const storeId = user.storeId

  const [categoriesResult, menuItemResult] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .eq('store_id', storeId)
      .eq('is_active', true)
      .order('sort_order'),
    supabase
      .from('menu_items')
      .select('*')
      .eq('id', menuId)
      .eq('store_id', storeId)
      .single()
  ])

  if (!menuItemResult.data) {
    notFound()
  }

  return (
    <MenuForm
      storeId={storeId}
      categories={categoriesResult.data || []}
      initialData={menuItemResult.data}
    />
  )
}
