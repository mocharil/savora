// @ts-nocheck
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { getUserFromToken } from '@/lib/tenant-context'
import { redirect } from 'next/navigation'
import { MenuPageClient } from './MenuPageClient'
import {
  Plus,
  Pencil,
  Search,
  Filter,
  Star,
  UtensilsCrossed,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'

export default async function MenuPage() {
  const supabase = await createClient()

  // Get user from token
  const user = await getUserFromToken()
  if (!user || !user.storeId) {
    redirect('/login')
  }

  const storeId = user.storeId

  // Fetch categories for filter
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .eq('store_id', storeId)
    .order('sort_order')

  // Fetch menu items with category
  const { data: menuItems } = await supabase
    .from('menu_items')
    .select(`
      *,
      category:categories(name, id)
    `)
    .eq('store_id', storeId)
    .order('sort_order', { ascending: true })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <MenuPageClient />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-[#F9FAFB] rounded-xl p-4 border border-[#E5E7EB]">
        <div className="flex items-center gap-2 h-10 px-4 bg-white rounded-lg border border-[#E5E7EB] flex-1 min-w-[200px] max-w-sm" data-tour="menu-search">
          <Search className="w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Cari menu..."
            className="flex-1 bg-transparent text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none"
          />
        </div>

        <select className="h-10 px-4 bg-white rounded-lg border border-[#E5E7EB] text-sm font-medium text-[#374151] outline-none cursor-pointer" data-tour="menu-category-filter">
          <option value="">Semua Kategori</option>
          {categories?.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <select className="h-10 px-4 bg-white rounded-lg border border-[#E5E7EB] text-sm font-medium text-[#374151] outline-none cursor-pointer">
          <option value="">Semua Status</option>
          <option value="available">Tersedia</option>
          <option value="unavailable">Tidak Tersedia</option>
        </select>

        <select className="h-10 px-4 bg-white rounded-lg border border-[#E5E7EB] text-sm font-medium text-[#374151] outline-none cursor-pointer">
          <option value="sort">Urut: Terbaru</option>
          <option value="name_asc">Nama A-Z</option>
          <option value="name_desc">Nama Z-A</option>
          <option value="price_low">Harga Terendah</option>
          <option value="price_high">Harga Tertinggi</option>
        </select>
      </div>

      {/* Menu Grid */}
      {menuItems && menuItems.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-tour="menu-grid">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden hover:shadow-admin-md transition-all group"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] bg-[#F3F4F6]">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UtensilsCrossed className="w-12 h-12 text-[#D1D5DB]" />
                  </div>
                )}

                {/* Category Badge */}
                {item.category?.name && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-white text-[#374151] text-xs font-medium rounded-md shadow-sm">
                    {item.category.name}
                  </span>
                )}

                {/* Availability Toggle */}
                <button
                  className={`absolute top-3 right-3 p-1.5 rounded-full shadow-md transition-colors ${
                    item.is_available
                      ? 'bg-[#10B981] text-white'
                      : 'bg-[#EF4444] text-white'
                  }`}
                  title={item.is_available ? 'Tersedia' : 'Tidak Tersedia'}
                >
                  {item.is_available ? (
                    <ToggleRight className="w-5 h-5" />
                  ) : (
                    <ToggleLeft className="w-5 h-5" />
                  )}
                </button>

                {/* Featured Badge */}
                {item.is_featured && (
                  <span className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 bg-[#F59E0B] text-white text-xs font-medium rounded-md">
                    <Star className="w-3 h-3 fill-current" />
                    Unggulan
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-[#111827] line-clamp-1">{item.name}</h3>
                {item.description && (
                  <p className="text-sm text-[#6B7280] line-clamp-2 mt-1">
                    {item.description}
                  </p>
                )}

                {/* Price Row */}
                <div className="flex items-end justify-between mt-4">
                  <div>
                    <p className="text-lg font-bold text-[#3B82F6]">
                      {formatCurrency(item.discount_price || item.price)}
                    </p>
                    {item.discount_price && (
                      <p className="text-sm text-[#9CA3AF] line-through">
                        {formatCurrency(item.price)}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/menu/${item.id}/edit`}
                      className="flex items-center gap-1.5 px-3 py-2 bg-[#F3F4F6] text-[#374151] text-sm font-medium rounded-lg hover:bg-[#E5E7EB] transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F3F4F6] flex items-center justify-center">
            <UtensilsCrossed className="w-8 h-8 text-[#D1D5DB]" />
          </div>
          <p className="text-[#6B7280] font-medium mb-1">Belum ada menu</p>
          <p className="text-sm text-[#9CA3AF] mb-6">
            Tambahkan menu pertama Anda
          </p>
          <Link
            href="/admin/menu/create"
            className="inline-flex items-center gap-2 h-10 px-4 bg-[#3B82F6] text-white rounded-lg text-sm font-medium hover:bg-[#2563EB] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah Menu
          </Link>
        </div>
      )}
    </div>
  )
}
