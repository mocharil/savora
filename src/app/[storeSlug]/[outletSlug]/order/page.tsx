import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { MenuList } from '@/components/customer/menu-list'
import { CartFloatingButton } from '@/components/customer/cart-floating-button'
import { AIRecommendation } from '@/components/customer/AIRecommendation'
import { MapPin, AlertCircle } from 'lucide-react'

interface Props {
  params: Promise<{
    storeSlug: string
    outletSlug: string
  }>
  searchParams: Promise<{
    table?: string
  }>
}

export default async function OrderPage({ params, searchParams }: Props) {
  const { storeSlug, outletSlug } = await params
  const { table } = await searchParams
  const supabase = createAdminClient()

  // Get store
  const { data: store } = await supabase
    .from('stores')
    .select('id, name, slug')
    .eq('slug', storeSlug)
    .eq('is_active', true)
    .single()

  if (!store) {
    notFound()
  }

  // Get outlet (use any to bypass type checking for new columns)
  const { data: outlet } = await (supabase as any)
    .from('outlets')
    .select('id, name, slug, tax_percentage, service_charge_percentage, theme')
    .eq('store_id', store.id)
    .eq('slug', outletSlug)
    .eq('is_active', true)
    .single()

  if (!outlet) {
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
      .single()

    tableData = data
  }

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, description')
    .eq('store_id', store.id)
    .eq('is_active', true)
    .order('sort_order')

  // Fetch menu items
  const { data: menuItemsRaw } = await supabase
    .from('menu_items')
    .select(`
      id,
      name,
      slug,
      description,
      price,
      discount_price,
      image_url,
      category_id,
      is_available,
      is_featured,
      sort_order
    `)
    .eq('store_id', store.id)
    .eq('is_available', true)
    .order('sort_order')

  // Fetch outlet-specific settings
  const { data: outletSettings } = await (supabase as any)
    .from('outlet_menu_settings')
    .select('menu_item_id, is_available, price_override')
    .eq('outlet_id', outlet.id)

  // Create settings map with proper typing
  interface OutletMenuSetting {
    menu_item_id: string
    is_available: boolean
    price_override: number | null
  }
  const settingsMap = new Map<string, OutletMenuSetting>(
    (outletSettings || []).map((s: OutletMenuSetting) => [s.menu_item_id, s])
  )

  // Apply outlet-specific settings to menu items
  const menuItems = (menuItemsRaw || [])
    .map((item: any) => {
      const settings = settingsMap.get(item.id)
      const isAvailable = settings ? settings.is_available : item.is_available
      const effectivePrice = settings?.price_override ?? item.price

      return {
        ...item,
        price: effectivePrice,
        is_available: isAvailable,
      }
    })
    .filter((item: any) => item.is_available)

  // Group menu items by category
  const categoriesWithItems = categories?.map((cat: any) => ({
    ...cat,
    menu_items: menuItems?.filter((item: any) => item.category_id === cat.id) || []
  })).filter((cat: any) => cat.menu_items.length > 0) || []

  const theme = (outlet.theme || {}) as Record<string, string>

  return (
    <div className="pb-28">
      {/* Table Indicator */}
      {tableData && (
        <div className="px-4 pt-4">
          <div
            className="rounded-full px-4 py-2 inline-flex items-center gap-2"
            style={{ backgroundColor: `${theme.primaryColor || '#10b981'}20` }}
          >
            <MapPin className="w-4 h-4" style={{ color: theme.primaryColor || '#10b981' }} />
            <span className="text-sm font-semibold" style={{ color: theme.primaryColor || '#10b981' }}>
              Meja {tableData.table_number}
              {tableData.table_name && ` - ${tableData.table_name}`}
            </span>
          </div>
        </div>
      )}

      {/* Invalid QR Warning */}
      {!tableData && table && (
        <div className="px-4 pt-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700">
              QR code tidak valid. Anda masih bisa memesan tanpa nomor meja.
            </p>
          </div>
        </div>
      )}

      {/* Menu List */}
      <MenuList
        categories={categoriesWithItems}
        storeId={store.id}
        outletId={outlet.id}
        tableId={tableData?.id}
        storeSlug={storeSlug}
        outletSlug={outletSlug}
      />

      {/* AI Recommendation Assistant */}
      <AIRecommendation
        storeId={store.id}
        outletId={outlet.id}
        storeSlug={storeSlug}
        outletSlug={outletSlug}
        theme={theme}
      />

      {/* Floating Cart Button */}
      <CartFloatingButton
        storeSlug={storeSlug}
        outletSlug={outletSlug}
      />
    </div>
  )
}
