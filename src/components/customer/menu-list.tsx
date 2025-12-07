'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'
import { Plus, Minus, Search, Star, UtensilsCrossed, Sparkles, TrendingUp, Mic, Flame } from 'lucide-react'
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

interface ThemeSettings {
  primary_color: string
  secondary_color: string
  accent_color: string
  text_color: string
  background_color: string
}

interface MenuListProps {
  categories: Category[]
  storeId: string
  outletId?: string
  tableId: string | null | undefined
  storeSlug?: string
  outletSlug?: string
  theme?: ThemeSettings
}

const defaultTheme: ThemeSettings = {
  primary_color: '#f97316',
  secondary_color: '#ef4444',
  accent_color: '#10b981',
  text_color: '#1f2937',
  background_color: '#ffffff',
}

export function MenuList({ categories, storeId, outletId, tableId, storeSlug, outletSlug, theme = defaultTheme }: MenuListProps) {
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
    // Set context if we have at least storeId and storeSlug
    if (storeId && storeSlug) {
      setContext({
        storeId,
        storeSlug,
        outletId: outletId || null,
        outletSlug: outletSlug || null,
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
        <div className="h-12 bg-gradient-to-r from-orange-100 to-orange-50 rounded-2xl animate-pulse" />
        {/* Category tabs skeleton */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-10 w-20 bg-gradient-to-r from-orange-100 to-orange-50 rounded-full animate-pulse flex-shrink-0" />
          ))}
        </div>
        {/* Menu cards skeleton */}
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl shadow-md shadow-orange-100/30 overflow-hidden border border-orange-50">
              <div className="h-28 bg-gradient-to-br from-orange-50 to-orange-100 animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-orange-100 rounded-lg animate-pulse" />
                <div className="h-3 bg-orange-50 rounded-lg w-2/3 animate-pulse" />
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
      <div className="sticky top-16 z-40 bg-gradient-to-b from-orange-50/80 to-transparent backdrop-blur-sm px-4 py-3">
        <div className="flex items-center gap-2">
          <div
            className={`flex-1 flex items-center gap-3 h-12 rounded-2xl px-4 transition-all duration-300 ${
              isSearchFocused
                ? 'bg-white border-2 border-orange-400 shadow-lg shadow-orange-100'
                : 'bg-white/80 border-2 border-orange-100'
            }`}
          >
            <Search className={`w-5 h-5 ${isSearchFocused ? 'text-orange-500' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Cari menu favorit kamu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400"
            />
          </div>
          {/* Voice Order Button */}
          <button
            onClick={() => setShowVoiceOrder(true)}
            className="flex-shrink-0 w-12 h-12 rounded-2xl text-white flex items-center justify-center shadow-lg transition-all active:scale-95"
            style={{ background: `linear-gradient(to bottom right, ${theme.primary_color}, ${theme.secondary_color})` }}
            title="Pesan dengan suara"
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      {!searchQuery && (
        <div className="sticky top-[132px] z-30 bg-gradient-to-b from-white/80 to-transparent backdrop-blur-sm">
          <div className="flex gap-2 px-4 py-2 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => scrollToCategory('all')}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeCategory === 'all'
                  ? 'text-white shadow-lg'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
              style={activeCategory === 'all' ? { background: `linear-gradient(to right, ${theme.primary_color}, ${theme.secondary_color})` } : {}}
            >
              Semua
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => scrollToCategory(category.id)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeCategory === category.id
                    ? 'text-white shadow-lg'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}
                style={activeCategory === category.id ? { background: `linear-gradient(to right, ${theme.primary_color}, ${theme.secondary_color})` } : {}}
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
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `linear-gradient(to bottom right, ${theme.primary_color}, ${theme.secondary_color})` }}
            >
              <Flame className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-bold" style={{ color: theme.text_color }}>Favorit Pelanggan</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
            {featuredItems.map((item) => {
              const quantity = getItemQuantity(item.id)
              const displayPrice = item.discount_price || item.price
              const hasDiscount = item.discount_price !== null

              return (
                <div
                  key={item.id}
                  className="flex-shrink-0 w-[200px] bg-white rounded-2xl shadow-lg shadow-orange-100/50 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-orange-200/50 hover:-translate-y-1 cursor-pointer border border-orange-50"
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
                      <div className="w-full h-full bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                        <UtensilsCrossed className="w-8 h-8 text-orange-300" />
                      </div>
                    )}
                    {hasDiscount && (
                      <span className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-md">
                        -{Math.round(((item.price - item.discount_price!) / item.price) * 100)}%
                      </span>
                    )}
                    <span className="absolute top-2 left-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-semibold px-2 py-1 rounded-lg flex items-center gap-1 shadow-md">
                      <Star className="w-3 h-3 fill-current" />
                      Favorit
                    </span>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">{item.name}</h3>
                    <div className="mt-2 flex items-center justify-between">
                      <div>
                        <p className="font-bold" style={{ color: theme.primary_color }}>{formatCurrency(displayPrice)}</p>
                        {hasDiscount && (
                          <p className="text-xs text-gray-400 line-through">{formatCurrency(item.price)}</p>
                        )}
                      </div>
                      {quantity === 0 ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAddToCart(item) }}
                          className="w-9 h-9 rounded-xl text-white flex items-center justify-center shadow-lg transition-all active:scale-95 hover:shadow-xl"
                          style={{ background: `linear-gradient(to bottom right, ${theme.primary_color}, ${theme.secondary_color})` }}
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleDecrement(item.id)}
                            className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform active:scale-95"
                            style={{ backgroundColor: `${theme.primary_color}20`, color: theme.primary_color }}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-6 text-center font-bold text-sm text-gray-900">{quantity}</span>
                          <button
                            onClick={() => handleIncrement(item)}
                            className="w-8 h-8 rounded-xl text-white flex items-center justify-center transition-transform active:scale-95"
                            style={{ background: `linear-gradient(to bottom right, ${theme.primary_color}, ${theme.secondary_color})` }}
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
              <div className="flex items-center gap-2 mb-4 sticky top-[180px] bg-white/90 backdrop-blur-sm py-2 px-3 -mx-3 z-20 rounded-xl">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${theme.primary_color}20` }}
                >
                  <TrendingUp className="w-4 h-4" style={{ color: theme.primary_color }} />
                </div>
                <h2 className="text-lg font-bold" style={{ color: theme.text_color }}>{category.name}</h2>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {category.menu_items.map((item) => {
                const quantity = getItemQuantity(item.id)
                const displayPrice = item.discount_price || item.price
                const hasDiscount = item.discount_price !== null

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl shadow-md shadow-orange-100/30 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-orange-200/40 cursor-pointer border border-orange-50"
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
                        <div className="w-full h-full bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                          <UtensilsCrossed className="w-8 h-8 text-orange-300" />
                        </div>
                      )}
                      {hasDiscount && (
                        <span className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
                          -{Math.round(((item.price - item.discount_price!) / item.price) * 100)}%
                        </span>
                      )}
                      {item.is_featured && (
                        <span className="absolute top-2 left-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-semibold p-1.5 rounded-lg flex items-center gap-1 shadow-sm">
                          <Star className="w-3 h-3 fill-current" />
                        </span>
                      )}
                      {/* Quick Add Button */}
                      {quantity === 0 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAddToCart(item) }}
                          className="absolute bottom-2 right-2 w-9 h-9 rounded-xl text-white flex items-center justify-center shadow-lg transition-all active:scale-95"
                          style={{ background: `linear-gradient(to bottom right, ${theme.primary_color}, ${theme.secondary_color})` }}
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 min-h-[40px]">{item.name}</h3>
                      {item.description && (
                        <p className="text-xs text-gray-500 line-clamp-1 mt-1">{item.description}</p>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-sm" style={{ color: theme.primary_color }}>{formatCurrency(displayPrice)}</p>
                          {hasDiscount && (
                            <p className="text-xs text-gray-400 line-through">{formatCurrency(item.price)}</p>
                          )}
                        </div>
                        {quantity > 0 && (
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleDecrement(item.id)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform active:scale-95"
                              style={{ backgroundColor: `${theme.primary_color}20`, color: theme.primary_color }}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-5 text-center font-bold text-xs text-gray-900">{quantity}</span>
                            <button
                              onClick={() => handleIncrement(item)}
                              className="w-7 h-7 rounded-lg text-white flex items-center justify-center transition-transform active:scale-95"
                              style={{ background: `linear-gradient(to bottom right, ${theme.primary_color}, ${theme.secondary_color})` }}
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
          <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center">
            <UtensilsCrossed className="w-12 h-12 text-orange-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchQuery ? 'Menu Tidak Ditemukan' : 'Belum Ada Menu'}
          </h3>
          <p className="text-gray-500">
            {searchQuery
              ? 'Coba kata kunci lain atau lihat semua menu'
              : 'Belum ada menu tersedia saat ini'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold shadow-lg shadow-orange-200 transition-all active:scale-95 hover:shadow-xl"
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
        />
      )}
    </div>
  )
}
