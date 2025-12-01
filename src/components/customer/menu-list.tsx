'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'
import { Plus, Minus, Search, Star, UtensilsCrossed, Sparkles, TrendingUp, Mic } from 'lucide-react'
import { useCartStore } from '@/stores/cart-store'
import { MenuDetailModal } from './menu-detail-modal'
import { VoiceOrderButton } from './VoiceOrderButton'

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  discount_price: number | null
  image_url: string | null
  is_available: boolean
  is_featured: boolean
}

interface Category {
  id: string
  name: string
  description: string | null
  menu_items: MenuItem[]
}

interface MenuListProps {
  categories: Category[]
  storeId: string
  outletId?: string
  tableId: string | null | undefined
  storeSlug?: string
  outletSlug?: string
}

export function MenuList({ categories, storeId, outletId, tableId, storeSlug, outletSlug }: MenuListProps) {
  const { items, addItem, updateQuantity, setContext } = useCartStore()
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(
    categories.length > 0 ? 'all' : null
  )
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showVoiceOrder, setShowVoiceOrder] = useState(false)
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  useEffect(() => {
    setMounted(true)
    if (storeId && storeSlug && outletId && outletSlug) {
      setContext({
        storeId,
        storeSlug,
        outletId,
        outletSlug,
        tableId: tableId ?? null,
      })
    }
  }, [storeId, storeSlug, outletId, outletSlug, tableId, setContext])

  const getItemQuantity = (itemId: string) => {
    const cartItem = items.find((i) => i.menuItemId === itemId)
    return cartItem?.quantity || 0
  }

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.discount_price || item.price,
      image_url: item.image_url || undefined,
    })
  }

  const handleIncrement = (item: MenuItem) => {
    const currentQty = getItemQuantity(item.id)
    if (currentQty === 0) {
      handleAddToCart(item)
    } else {
      const cartItem = items.find((i) => i.menuItemId === item.id)
      if (cartItem) {
        updateQuantity(cartItem.id, currentQty + 1)
      }
    }
  }

  const handleDecrement = (itemId: string) => {
    const currentQty = getItemQuantity(itemId)
    if (currentQty > 0) {
      const cartItem = items.find((i) => i.menuItemId === itemId)
      if (cartItem) {
        updateQuantity(cartItem.id, currentQty - 1)
      }
    }
  }

  const scrollToCategory = (categoryId: string) => {
    setActiveCategory(categoryId)
    if (categoryId === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const element = categoryRefs.current[categoryId]
    if (element) {
      const headerOffset = 180
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
    }
  }

  const openMenuDetail = (item: MenuItem) => {
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  const closeMenuDetail = () => {
    setIsModalOpen(false)
    setSelectedItem(null)
  }

  // Handle voice order confirmation
  const handleVoiceOrderConfirmed = (parsedItems: any[]) => {
    parsedItems.forEach((item) => {
      // Add each parsed item to cart
      for (let i = 0; i < item.quantity; i++) {
        addItem({
          menuItemId: item.menuItemId,
          name: item.name,
          price: item.price,
        })
      }
    })
    setShowVoiceOrder(false)
  }

  // Filter menu items based on search
  const filteredCategories = categories.map(cat => ({
    ...cat,
    menu_items: cat.menu_items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })).filter(cat => cat.menu_items.length > 0)

  // Get featured items
  const featuredItems = categories
    .flatMap(cat => cat.menu_items)
    .filter(item => item.is_featured)
    .slice(0, 5)

  if (!mounted) {
    return (
      <div className="p-4 space-y-4">
        {/* Search skeleton */}
        <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
        {/* Category tabs skeleton */}
        <div className="flex gap-3 overflow-x-auto hide-scrollbar">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-10 w-20 bg-gray-100 rounded-full animate-pulse flex-shrink-0" />
          ))}
        </div>
        {/* Menu cards skeleton */}
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-savora-card overflow-hidden">
              <div className="h-32 bg-gray-100 animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-100 rounded animate-pulse" />
                <div className="h-3 bg-gray-100 rounded w-2/3 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search Bar with Voice Order */}
      <div className="sticky top-16 z-40 bg-[#F8F9FA] px-4 py-3">
        <div className="flex items-center gap-2">
          <div
            className={`flex-1 flex items-center gap-3 h-12 rounded-xl px-4 transition-all duration-300 ${
              isSearchFocused
                ? 'bg-white border-2 border-primary shadow-savora-md'
                : 'bg-[#F1F3F4] border-2 border-transparent'
            }`}
          >
            <Search className={`w-5 h-5 ${isSearchFocused ? 'text-primary' : 'text-[#9AA0A6]'}`} />
            <input
              type="text"
              placeholder="Cari menu favorit kamu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="flex-1 bg-transparent outline-none text-sm text-[#202124] placeholder:text-[#9AA0A6]"
            />
          </div>
          {/* Voice Order Button */}
          <button
            onClick={() => setShowVoiceOrder(true)}
            className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all active:scale-95"
            title="Pesan dengan suara"
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      {!searchQuery && (
        <div className="sticky top-[132px] z-30 bg-[#F8F9FA]">
          <div className="flex gap-3 px-4 py-2 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => scrollToCategory('all')}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === 'all'
                  ? 'bg-primary text-white shadow-savora-md'
                  : 'bg-white text-[#5F6368] border border-[#E8EAED] hover:border-[#DADCE0]'
              }`}
            >
              Semua
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => scrollToCategory(category.id)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === category.id
                    ? 'bg-primary text-white shadow-savora-md'
                    : 'bg-white text-[#5F6368] border border-[#E8EAED] hover:border-[#DADCE0]'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Featured Section */}
      {!searchQuery && featuredItems.length > 0 && (
        <div className="px-4 pt-2">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-[#202124]">Rekomendasi Untuk Kamu</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
            {featuredItems.map((item) => {
              const quantity = getItemQuantity(item.id)
              const displayPrice = item.discount_price || item.price
              const hasDiscount = item.discount_price !== null

              return (
                <div
                  key={item.id}
                  className="flex-shrink-0 w-[200px] bg-white rounded-2xl shadow-savora-card overflow-hidden transition-all duration-300 hover:shadow-savora-card-hover hover:-translate-y-1 cursor-pointer"
                  onClick={() => openMenuDetail(item)}
                >
                  <div className="relative h-32">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#F1F3F4] flex items-center justify-center">
                        <UtensilsCrossed className="w-8 h-8 text-[#BDC1C6]" />
                      </div>
                    )}
                    {hasDiscount && (
                      <span className="absolute top-2 right-2 bg-[#E74C3C] text-white text-xs font-bold px-2 py-1 rounded-md">
                        -{Math.round(((item.price - item.discount_price!) / item.price) * 100)}%
                      </span>
                    )}
                    <span className="absolute top-2 left-2 bg-[#FDCB6E] text-[#202124] text-xs font-semibold px-2 py-1 rounded-md flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      Favorit
                    </span>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm text-[#202124] line-clamp-1">{item.name}</h3>
                    <div className="mt-2 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-primary">{formatCurrency(displayPrice)}</p>
                        {hasDiscount && (
                          <p className="text-xs text-[#9AA0A6] line-through">{formatCurrency(item.price)}</p>
                        )}
                      </div>
                      {quantity === 0 ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAddToCart(item) }}
                          className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shadow-savora-md transition-transform active:scale-95"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleDecrement(item.id)}
                            className="w-8 h-8 rounded-full bg-[#F1F3F4] text-[#5F6368] flex items-center justify-center transition-transform active:scale-95"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-6 text-center font-bold text-sm">{quantity}</span>
                          <button
                            onClick={() => handleIncrement(item)}
                            className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center transition-transform active:scale-95"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Menu by Category */}
      <div className="px-4 space-y-8 pt-2">
        {(searchQuery ? filteredCategories : categories).map((category) => (
          <div
            key={category.id}
            ref={(el) => { categoryRefs.current[category.id] = el }}
          >
            {!searchQuery && (
              <div className="flex items-center gap-2 mb-4 sticky top-[180px] bg-[#F8F9FA] py-2 z-20">
                <TrendingUp className="w-5 h-5 text-[#5F6368]" />
                <h2 className="text-lg font-bold text-[#202124]">{category.name}</h2>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {category.menu_items.map((item) => {
                const quantity = getItemQuantity(item.id)
                const displayPrice = item.discount_price || item.price
                const hasDiscount = item.discount_price !== null

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow-savora-card overflow-hidden transition-all duration-300 hover:shadow-savora-card-hover cursor-pointer"
                    onClick={() => openMenuDetail(item)}
                  >
                    <div className="relative h-28">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#F1F3F4] flex items-center justify-center">
                          <UtensilsCrossed className="w-8 h-8 text-[#BDC1C6]" />
                        </div>
                      )}
                      {hasDiscount && (
                        <span className="absolute top-2 right-2 bg-[#E74C3C] text-white text-xs font-bold px-2 py-1 rounded-md">
                          -{Math.round(((item.price - item.discount_price!) / item.price) * 100)}%
                        </span>
                      )}
                      {item.is_featured && (
                        <span className="absolute top-2 left-2 bg-[#FDCB6E] text-[#202124] text-xs font-semibold px-2 py-1 rounded-md flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                        </span>
                      )}
                      {/* Quick Add Button */}
                      {quantity === 0 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAddToCart(item) }}
                          className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shadow-savora-md transition-transform active:scale-95"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm text-[#202124] line-clamp-2 min-h-[40px]">{item.name}</h3>
                      {item.description && (
                        <p className="text-xs text-[#9AA0A6] line-clamp-1 mt-1">{item.description}</p>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-primary text-sm">{formatCurrency(displayPrice)}</p>
                          {hasDiscount && (
                            <p className="text-xs text-[#9AA0A6] line-through">{formatCurrency(item.price)}</p>
                          )}
                        </div>
                        {quantity > 0 && (
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleDecrement(item.id)}
                              className="w-7 h-7 rounded-full bg-[#F1F3F4] text-[#5F6368] flex items-center justify-center transition-transform active:scale-95"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-5 text-center font-bold text-xs">{quantity}</span>
                            <button
                              onClick={() => handleIncrement(item)}
                              className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center transition-transform active:scale-95"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {((searchQuery && filteredCategories.length === 0) || categories.length === 0) && (
        <div className="px-4 py-12 text-center">
          <div className="w-32 h-32 mx-auto mb-6 bg-[#F1F3F4] rounded-full flex items-center justify-center">
            <UtensilsCrossed className="w-12 h-12 text-[#BDC1C6]" />
          </div>
          <h3 className="text-xl font-semibold text-[#202124] mb-2">
            {searchQuery ? 'Menu Tidak Ditemukan' : 'Belum Ada Menu'}
          </h3>
          <p className="text-[#9AA0A6]">
            {searchQuery
              ? 'Coba kata kunci lain atau lihat semua menu'
              : 'Belum ada menu tersedia saat ini'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-xl font-medium transition-transform active:scale-95"
            >
              Lihat Semua Menu
            </button>
          )}
        </div>
      )}

      {/* Menu Detail Modal */}
      <MenuDetailModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={closeMenuDetail}
      />

      {/* Voice Order Modal */}
      {showVoiceOrder && (
        <VoiceOrderButton
          storeId={storeId}
          outletId={outletId}
          onOrderConfirmed={handleVoiceOrderConfirmed}
          onClose={() => setShowVoiceOrder(false)}
          autoStart={true}
        />
      )}
    </div>
  )
}
