'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'
import { MenuAvailabilityToggle } from '@/components/admin/menu-availability-toggle'
import {
  Search,
  Plus,
  Pencil,
  Star,
  UtensilsCrossed,
  ChevronDown,
  Check,
  X,
  SlidersHorizontal
} from 'lucide-react'

interface Category {
  id: string
  name: string
}

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  discount_price: number | null
  image_url: string | null
  is_available: boolean
  is_featured: boolean
  category: { name: string; id: string } | null
}

interface MenuFiltersProps {
  categories: Category[]
  menuItems: MenuItem[]
}

type SortOption = 'newest' | 'name_asc' | 'name_desc' | 'price_low' | 'price_high'

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'name_asc', label: 'Nama A-Z' },
  { value: 'name_desc', label: 'Nama Z-A' },
  { value: 'price_low', label: 'Harga Terendah' },
  { value: 'price_high', label: 'Harga Tertinggi' },
]

// Custom Dropdown Component
function Dropdown({
  value,
  onChange,
  options,
  placeholder,
  className = ''
}: {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder: string
  className?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find(opt => opt.value === value)

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-10 px-4 bg-white rounded-lg border text-sm font-medium outline-none cursor-pointer transition-all flex items-center gap-2 min-w-[140px] justify-between ${
          isOpen ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-[#E5E7EB] hover:border-gray-300'
        }`}
      >
        <span className={selectedOption ? 'text-[#374151]' : 'text-[#9CA3AF]'}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full min-w-[180px] bg-white rounded-lg border border-[#E5E7EB] shadow-lg z-50 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-gray-50 transition-colors ${
                value === option.value ? 'text-orange-600 bg-orange-50 font-medium' : 'text-[#374151]'
              }`}
            >
              {option.label}
              {value === option.value && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function MenuFilters({ categories, menuItems }: MenuFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')

  // Category options
  const categoryOptions = [
    { value: '', label: 'Semua Kategori' },
    ...categories.map(cat => ({ value: cat.id, label: cat.name }))
  ]

  // Status options
  const statusOptions = [
    { value: '', label: 'Semua Status' },
    { value: 'available', label: 'Tersedia' },
    { value: 'unavailable', label: 'Tidak Tersedia' }
  ]

  // Filter and sort menu items
  const filteredItems = useMemo(() => {
    let items = [...menuItems]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      items = items.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      )
    }

    // Category filter
    if (selectedCategory) {
      items = items.filter(item => item.category?.id === selectedCategory)
    }

    // Status filter
    if (selectedStatus) {
      if (selectedStatus === 'available') {
        items = items.filter(item => item.is_available)
      } else if (selectedStatus === 'unavailable') {
        items = items.filter(item => !item.is_available)
      }
    }

    // Sort
    switch (sortBy) {
      case 'name_asc':
        items.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name_desc':
        items.sort((a, b) => b.name.localeCompare(a.name))
        break
      case 'price_low':
        items.sort((a, b) => (a.discount_price || a.price) - (b.discount_price || b.price))
        break
      case 'price_high':
        items.sort((a, b) => (b.discount_price || b.price) - (a.discount_price || a.price))
        break
      default:
        // newest - keep original order
        break
    }

    return items
  }, [menuItems, searchQuery, selectedCategory, selectedStatus, sortBy])

  // Check if any filter is active
  const hasActiveFilters = searchQuery || selectedCategory || selectedStatus || sortBy !== 'newest'

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setSelectedStatus('')
    setSortBy('newest')
  }

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-[#F9FAFB] rounded-xl p-4 border border-[#E5E7EB]" data-tour="menu-category-filter">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm" data-tour="menu-search">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Cari menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-white rounded-lg border border-[#E5E7EB] text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-3 h-3 text-gray-400" />
            </button>
          )}
        </div>

        {/* Category Filter */}
        <Dropdown
          value={selectedCategory}
          onChange={setSelectedCategory}
          options={categoryOptions}
          placeholder="Semua Kategori"
        />

        {/* Status Filter */}
        <Dropdown
          value={selectedStatus}
          onChange={setSelectedStatus}
          options={statusOptions}
          placeholder="Semua Status"
        />

        {/* Sort */}
        <Dropdown
          value={sortBy}
          onChange={(val) => setSortBy(val as SortOption)}
          options={sortOptions}
          placeholder="Urut"
        />

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
          {filteredItems.length} dari {menuItems.length} menu
        </div>
      </div>

      {/* Menu Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-tour="menu-grid">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-xl border overflow-hidden hover:shadow-admin-md transition-all group ${
                item.is_available ? 'border-[#E5E7EB]' : 'border-red-200 bg-red-50/30'
              }`}
            >
              {/* Image */}
              <div className="relative aspect-[4/3] bg-[#F3F4F6]">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className={`object-cover ${!item.is_available ? 'grayscale opacity-60' : ''}`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UtensilsCrossed className="w-12 h-12 text-[#D1D5DB]" />
                  </div>
                )}

                {/* Unavailable Overlay */}
                {!item.is_available && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <span className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg shadow-lg">
                      TIDAK TERSEDIA
                    </span>
                  </div>
                )}

                {/* Category Badge */}
                {item.category?.name && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-white text-[#374151] text-xs font-medium rounded-md shadow-sm">
                    {item.category.name}
                  </span>
                )}

                {/* Availability Toggle */}
                <MenuAvailabilityToggle
                  menuId={item.id}
                  initialAvailability={item.is_available}
                  menuName={item.name}
                />

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
                    <p className="text-lg font-bold text-orange-500">
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
          <p className="text-[#6B7280] font-medium mb-1">
            {hasActiveFilters ? 'Menu tidak ditemukan' : 'Belum ada menu'}
          </p>
          <p className="text-sm text-[#9CA3AF] mb-6">
            {hasActiveFilters
              ? 'Coba ubah filter atau kata kunci pencarian'
              : 'Tambahkan menu pertama Anda'}
          </p>
          {hasActiveFilters ? (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 h-10 px-4 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
              Reset Filter
            </button>
          ) : (
            <Link
              href="/admin/menu/create"
              className="inline-flex items-center gap-2 h-10 px-4 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Tambah Menu
            </Link>
          )}
        </div>
      )}
    </>
  )
}
