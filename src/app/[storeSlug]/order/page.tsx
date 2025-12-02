import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { MenuList } from '@/components/customer/menu-list'
import { CartFloatingButton } from '@/components/customer/cart-floating-button'
import { StoreHeader } from '@/components/customer/store-header'
import { AIRecommendation } from '@/components/customer/AIRecommendation'
import { MapPin, AlertCircle } from 'lucide-react'

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
    .select('id, name, slug, description, address, phone, logo_url, banner_url, operational_hours')
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

  return (
    <div className="pb-28">
      {/* Store Header with Banner, Logo, and Info */}
      <StoreHeader
        store={{
          name: store.name,
          description: store.description,
          address: store.address,
          phone: store.phone,
          logo_url: store.logo_url,
          banner_url: store.banner_url,
          operational_hours: store.operational_hours as Record<string, { open: string; close: string; isOpen: boolean }>,
        }}
      />

      {/* Table Indicator */}
      {tableData && (
        <div className="px-4 pt-4">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl px-4 py-3 inline-flex items-center gap-2 shadow-lg shadow-orange-200">
            <MapPin className="w-4 h-4 text-white" />
            <span className="text-sm font-semibold text-white">
              Meja {tableData.table_number}
            </span>
          </div>
        </div>
      )}

      {/* Invalid QR Warning */}
      {!tableData && table && (
        <div className="px-4 pt-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
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
        storeSlug={storeSlug}
        tableId={tableData?.id}
      />

      {/* AI Recommendation Assistant */}
      <AIRecommendation
        storeId={store.id}
        storeSlug={storeSlug}
      />

      {/* Floating Cart Button */}
      <CartFloatingButton storeSlug={storeSlug} />
    </div>
  )
}
