// @ts-nocheck
import { createAdminClient } from '@/lib/supabase/server'
import { getUserFromToken } from '@/lib/tenant-context'
import { redirect } from 'next/navigation'
import { MenuPageClient } from './MenuPageClient'
import { MenuFilters } from '@/components/admin/menu-filters'

export default async function MenuPage() {
  const supabase = createAdminClient()

  // Get user from token
  const user = await getUserFromToken()
  if (!user || !user.storeId) {
    redirect('/login')
  }

  const storeId = user.storeId

  // Fetch categories for filter - alphabetical order
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .eq('store_id', storeId)
    .order('name')

  // Fetch menu items with category
  const { data: menuItems } = await supabase
    .from('menu_items')
    .select(`
      *,
      category:categories(name, id)
    `)
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <MenuPageClient />

      {/* Filters and Menu Grid */}
      <MenuFilters
        categories={categories || []}
        menuItems={menuItems || []}
      />
    </div>
  )
}
