import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { OrderPageClient } from '@/components/customer/OrderPageClient'

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ storeSlug: string }>
  searchParams: Promise<{ table?: string }>
}) {
  const supabase = createAdminClient()
  const { storeSlug } = await params
  const { table } = await searchParams

  const { data: store } = await supabase
    .from('stores')
    .select('id, name, slug, description, address, phone, logo_url, banner_url, operational_hours, theme_settings')
    .eq('slug', storeSlug)
    .single()

  if (!store) {
    notFound()
  }

  // Validate table if provided
  let tableData: any = null
  if (table) {
    const { data } = await supabase
      .from('tables')
      .select('id, table_number')
      .eq('qr_code', table)
      .eq('store_id', store.id)
      .eq('is_active', true)
      .single()

    tableData = data
  }

  // Fetch categories with menu items
  const { data: categories } = await (supabase as any)
    .from('categories')
    .select(`
      id,
      name,
      description,
      menu_items(
        id,
        name,
        description,
        price,
        discount_price,
        image_url,
        is_available,
        is_featured
      )
    `)
    .eq('store_id', store.id)
    .eq('is_active', true)
    .order('name')

  // Filter to only show categories with available items
  const categoriesWithItems = categories?.map((cat: any) => ({
    ...cat,
    menu_items: cat.menu_items?.filter((item: any) => item.is_available) || []
  })).filter((cat: any) => cat.menu_items.length > 0) || []

  // Parse theme settings
  const themeSettings = (store.theme_settings as any) || {
    primary_color: '#f97316',
    secondary_color: '#ef4444',
    accent_color: '#10b981',
    text_color: '#1f2937',
    background_color: '#ffffff',
  }

  return (
    <OrderPageClient
      store={{
        id: store.id,
        name: store.name,
        slug: store.slug,
        description: store.description,
        address: store.address,
        phone: store.phone,
        logo_url: store.logo_url,
        banner_url: store.banner_url,
        operational_hours: store.operational_hours as Record<string, { open: string; close: string; isOpen: boolean }> | null,
      }}
      storeSlug={storeSlug}
      tableData={tableData}
      tableQr={table}
      categories={categoriesWithItems}
      themeSettings={themeSettings}
    />
  )
}
