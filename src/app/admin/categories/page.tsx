// @ts-nocheck
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUserFromToken } from '@/lib/tenant-context'
import { redirect } from 'next/navigation'
import { CategoriesPageClient } from './CategoriesPageClient'
import { CategoryFilters } from '@/components/admin/category-filters'
import {
  Plus,
  Package,
  Layers,
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
    .order('name')

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

      {/* Filters and Categories List */}
      <CategoryFilters categories={categories || []} />
    </div>
  )
}
