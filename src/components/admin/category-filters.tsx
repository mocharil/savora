'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search,
  Pencil,
  Package,
  X,
  ToggleRight,
  ToggleLeft,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface Category {
  id: string
  name: string
  description: string | null
  is_active: boolean
  menu_items: { count: number }[] | null
}

interface CategoryFiltersProps {
  categories: Category[]
}

const ITEMS_PER_PAGE = 10

export function CategoryFilters({ categories }: CategoryFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [currentPage, setCurrentPage] = useState(1)

  // Filter categories
  const filteredCategories = useMemo(() => {
    let items = [...categories]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      items = items.filter(cat =>
        cat.name.toLowerCase().includes(query) ||
        cat.description?.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter === 'active') {
      items = items.filter(cat => cat.is_active)
    } else if (statusFilter === 'inactive') {
      items = items.filter(cat => !cat.is_active)
    }

    return items
  }, [categories, searchQuery, statusFilter])

  // Pagination
  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE)
  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredCategories.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredCategories, currentPage])

  // Reset page when filters change
  const handleFilterChange = () => {
    setCurrentPage(1)
  }

  // Check if any filter is active
  const hasActiveFilters = searchQuery || statusFilter !== 'all'

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setCurrentPage(1)
  }

  const statusTabs = [
    { value: 'all', label: 'Semua' },
    { value: 'active', label: 'Aktif' },
    { value: 'inactive', label: 'Tidak Aktif' }
  ]

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-[#F9FAFB] rounded-xl p-4 border border-[#E5E7EB]">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Cari kategori..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              handleFilterChange()
            }}
            className="w-full h-10 pl-10 pr-4 bg-white rounded-lg border border-[#E5E7EB] text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('')
                handleFilterChange()
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-3 h-3 text-gray-400" />
            </button>
          )}
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-white rounded-lg border border-[#E5E7EB] p-1">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setStatusFilter(tab.value as typeof statusFilter)
                handleFilterChange()
              }}
              className={`h-8 px-4 rounded-md text-sm font-medium transition-all ${
                statusFilter === tab.value
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="h-10 px-4 bg-white rounded-lg border border-[#E5E7EB] text-sm font-medium text-[#6B7280] hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Reset
          </button>
        )}

        {/* Results count */}
        <div className="ml-auto text-sm text-[#6B7280]">
          {filteredCategories.length} dari {categories.length} kategori
        </div>
      </div>

      {/* Categories List */}
      {paginatedCategories.length > 0 ? (
        <div data-tour="categories-list" className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <h2 className="font-semibold text-[#111827]">Daftar Kategori</h2>
            <p className="text-sm text-[#6B7280]">Diurutkan berdasarkan abjad (A-Z)</p>
          </div>
          <div className="divide-y divide-[#E5E7EB]">
            {paginatedCategories.map((category) => (
              <div
                key={category.id}
                className="flex items-center gap-4 p-4 hover:bg-[#F9FAFB] transition-colors group"
              >
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-[#E5E7EB] flex items-center justify-between">
              <p className="text-sm text-[#6B7280]">
                Halaman {currentPage} dari {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="h-9 px-3 rounded-lg border border-[#E5E7EB] text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Sebelumnya
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-orange-500 text-white'
                            : 'text-[#374151] hover:bg-[#F9FAFB]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="h-9 px-3 rounded-lg border border-[#E5E7EB] text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                >
                  Berikutnya
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F3F4F6] flex items-center justify-center">
            <Package className="w-8 h-8 text-[#D1D5DB]" />
          </div>
          <p className="text-[#6B7280] font-medium mb-1">
            {hasActiveFilters ? 'Kategori tidak ditemukan' : 'Belum ada kategori'}
          </p>
          <p className="text-sm text-[#9CA3AF] mb-6">
            {hasActiveFilters
              ? 'Coba ubah filter atau kata kunci pencarian'
              : 'Tambahkan kategori untuk mengorganisir menu Anda'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 h-10 px-4 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
              Reset Filter
            </button>
          )}
        </div>
      )}
    </>
  )
}
