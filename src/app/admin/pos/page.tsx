// @ts-nocheck
import { createAdminClient } from '@/lib/supabase/server'
import { getUserFromToken } from '@/lib/tenant-context'
import { redirect } from 'next/navigation'
import { POSClient } from './POSClient'

export default async function POSPage() {
  const supabase = createAdminClient()

  // Get user from token
  const user = await getUserFromToken()
  if (!user || !user.storeId) {
    redirect('/login')
  }

  const storeId = user.storeId

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .eq('store_id', storeId)
    .order('sort_order')

  // Fetch menu items with category
  const { data: menuItems } = await supabase
    .from('menu_items')
    .select(`
      id,
      name,
      price,
      image_url,
      is_available,
      category_id,
      category:categories(name)
    `)
    .eq('store_id', storeId)
    .eq('is_available', true)
    .order('sort_order', { ascending: true })

  // Fetch available tables
  const { data: tables } = await supabase
    .from('tables')
    .select('id, table_number, status')
    .eq('store_id', storeId)
    .order('table_number', { ascending: true })

  return (
    <POSClient
      categories={categories || []}
      menuItems={menuItems || []}
      tables={tables || []}
      storeId={storeId}
    />
  )
}
