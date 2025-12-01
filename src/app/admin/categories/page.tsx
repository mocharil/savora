// @ts-nocheck
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUserFromToken } from '@/lib/tenant-context'
import { redirect } from 'next/navigation'
import { CategoriesPageClient } from './CategoriesPageClient'
import {
  Plus,
  Pencil,
  Package,
  Layers,
  GripVertical,
  ToggleRight,
  ToggleLeft
} from 'lucide-react'

export default async function CategoriesPage() {
  const supabase = await createClient()

  // Get user from token
  const user = await getUserFromToken()
  if (!user || !user.storeId) {
    redirect('/login')
  }

  const storeId = user.storeId

  const { data: categories } = await supabase
    .from('categories')
    .select(`
      *,
      menu_items(count)
    `)
    .eq('store_id', storeId)
    .order('sort_order')

  const totalCategories = categories?.length || 0
  const activeCategories = categories?.filter(c => c.is_active).length || 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <CategoriesPageClient />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Layers className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#111827]">{totalCategories}</p>
              <p className="text-sm text-[#6B7280]">Total Kategori</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
              <ToggleRight className="w-5 h-5 text-[#10B981]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#111827]">{activeCategories}</p>
              <p className="text-sm text-[#6B7280]">Kategori Aktif</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center">
              <ToggleLeft className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#111827]">{totalCategories - activeCategories}</p>
              <p className="text-sm text-[#6B7280]">Tidak Aktif</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-[#8B5CF6]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#111827]">
                {categories?.reduce((sum, c) => sum + (c.menu_items?.[0]?.count || 0), 0) || 0}
              </p>
              <p className="text-sm text-[#6B7280]">Total Menu</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories List */}
      {categories && categories.length > 0 ? (
        <div data-tour="categories-list" className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <h2 className="font-semibold text-[#111827]">Daftar Kategori</h2>
            <p className="text-sm text-[#6B7280]">Urutkan dengan menarik dan melepas (drag & drop)</p>
          </div>
          <div className="divide-y divide-[#E5E7EB]">
            {categories.map((category, index) => (
              <div
                key={category.id}
                className="flex items-center gap-4 p-4 hover:bg-[#F9FAFB] transition-colors group"
              >
                {/* Drag Handle */}
                <div className="cursor-grab active:cursor-grabbing text-[#D1D5DB] group-hover:text-[#9CA3AF]">
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Order Number */}
                <div className="w-8 h-8 rounded-lg bg-[#F3F4F6] flex items-center justify-center">
                  <span className="text-sm font-medium text-[#6B7280]">{index + 1}</span>
                </div>

                {/* Category Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-[#111827]">{category.name}</h3>
                    {!category.is_active && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-[#F59E0B]/10 text-[#F59E0B] rounded">
                        Nonaktif
                      </span>
                    )}
                  </div>
                  {category.description && (
                    <p className="text-sm text-[#6B7280] line-clamp-1 mt-0.5">
                      {category.description}
                    </p>
                  )}
                </div>

                {/* Menu Count */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F3F4F6]">
                  <Package className="w-4 h-4 text-[#6B7280]" />
                  <span className="text-sm font-medium text-[#374151]">
                    {category.menu_items?.[0]?.count || 0} menu
                  </span>
                </div>

                {/* Status Indicator */}
                <div className={`w-3 h-3 rounded-full ${
                  category.is_active ? 'bg-[#10B981]' : 'bg-[#D1D5DB]'
                }`} />

                {/* Edit Button */}
                <Link
                  href={`/admin/categories/${category.id}/edit`}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#374151] bg-[#F3F4F6] rounded-lg hover:bg-[#E5E7EB] transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </Link>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F3F4F6] flex items-center justify-center">
            <Layers className="w-8 h-8 text-[#D1D5DB]" />
          </div>
          <p className="text-[#6B7280] font-medium mb-1">Belum ada kategori</p>
          <p className="text-sm text-[#9CA3AF] mb-6">
            Tambahkan kategori untuk mengorganisir menu Anda
          </p>
          <Link
            href="/admin/categories/create"
            className="inline-flex items-center gap-2 h-10 px-4 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah Kategori
          </Link>
        </div>
      )}
    </div>
  )
}
