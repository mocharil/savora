import { createClient } from '@/lib/supabase/server'
import { getUserFromToken } from '@/lib/tenant-context'
import { redirect } from 'next/navigation'
import { MenuForm } from '@/components/admin/menu-form'

export default async function CreateMenuPage() {
  const supabase = await createClient()

  // Get user from token
  const user = await getUserFromToken()
  if (!user || !user.storeId) {
    redirect('/login')
  }

  const storeId = user.storeId

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('store_id', storeId)
    .eq('is_active', true)
    .order('sort_order')

  return <MenuForm storeId={storeId} categories={categories || []} />
}
