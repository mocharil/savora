'use client'

import { useState } from 'react'
import { MenuList } from '@/components/customer/menu-list'
import { CartFloatingButton } from '@/components/customer/cart-floating-button'
import { StoreHeader } from '@/components/customer/store-header'
import { AIRecommendation } from '@/components/customer/AIRecommendation'
import { PoweredBySavora } from '@/components/ui/powered-by-savora'
import { MapPin, AlertCircle } from 'lucide-react'

interface Store {
  id: string
  name: string
  slug: string
  description: string | null
  address: string | null
  phone: string | null
  logo_url: string | null
  banner_url: string | null
  operational_hours: Record<string, { open: string; close: string; isOpen: boolean }> | null
}

interface Category {
  id: string
  name: string
  description: string | null
  menu_items: Array<{
    id: string
    name: string
    description: string | null
    price: number
    discount_price: number | null
    image_url: string | null
    is_available: boolean
    is_featured: boolean
  }>
}

interface TableData {
  id: string
  table_number: number
}

interface ThemeSettings {
  primary_color: string
  secondary_color: string
  accent_color: string
  text_color: string
  background_color: string
}

interface OrderPageClientProps {
  store: Store
  storeSlug: string
  tableData: TableData | null
  tableQr: string | undefined
  categories: Category[]
  themeSettings: ThemeSettings
}

export function OrderPageClient({
  store,
  storeSlug,
  tableData,
  tableQr,
  categories,
  themeSettings,
}: OrderPageClientProps) {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false)

  return (
    <div
      className="pb-28 min-h-screen"
      style={{ backgroundColor: themeSettings.background_color }}
    >
      {/* Store Header with Banner, Logo, and Info */}
      <StoreHeader
        store={{
          name: store.name,
          description: store.description,
          address: store.address,
          phone: store.phone,
          logo_url: store.logo_url,
          banner_url: store.banner_url,
          operational_hours: store.operational_hours ?? undefined,
        }}
      />

      {/* Table Indicator */}
      {tableData && (
        <div className="px-4 pt-4">
          <div
            className="rounded-2xl px-4 py-3 inline-flex items-center gap-2 shadow-lg"
            style={{
              background: `linear-gradient(to right, ${themeSettings.primary_color}, ${themeSettings.secondary_color})`,
            }}
          >
            <MapPin className="w-4 h-4 text-white" />
            <span className="text-sm font-semibold text-white">
              Meja {tableData.table_number}
            </span>
          </div>
        </div>
      )}

      {/* Invalid QR Warning */}
      {!tableData && tableQr && (
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
        categories={categories}
        storeId={store.id}
        storeSlug={storeSlug}
        tableId={tableData?.id}
        theme={themeSettings}
      />

      {/* Powered by Savora */}
      <PoweredBySavora className="py-6" variant="dark" size="md" />

      {/* AI Recommendation Assistant */}
      <AIRecommendation
        storeId={store.id}
        storeSlug={storeSlug}
        tableId={tableData?.id}
        theme={{ primaryColor: themeSettings.primary_color }}
        onOpenChange={setIsAIChatOpen}
      />

      {/* Floating Cart Button - hidden when AI chat is open */}
      <CartFloatingButton
        storeSlug={storeSlug}
        theme={themeSettings}
        hidden={isAIChatOpen}
      />
    </div>
  )
}
