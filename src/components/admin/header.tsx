'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { Profile } from '@/types/database'
import {
  Bell,
  Search,
  Clock,
  Check,
  ChevronRight,
  ShoppingBag,
  Inbox,
  X,
  UtensilsCrossed,
  FolderOpen,
  QrCode,
  Loader2,
  ArrowRight,
} from 'lucide-react'
import { HelpCenter } from './tour'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import BlockLoader from '@/components/ui/block-loader'
import { formatCurrency } from '@/lib/utils'

interface SearchResult {
  menu: Array<{
    id: string
    name: string
    price: number
    image_url: string | null
    is_available: boolean
    category: string
    type: 'menu'
  }>
  orders: Array<{
    id: string
    order_number: string
    customer_name: string | null
    status: string
    total: number
    created_at: string
    type: 'order'
  }>
  categories: Array<{
    id: string
    name: string
    description: string | null
    type: 'category'
  }>
  tables: Array<{
    id: string
    table_number: string
    status: string
    capacity: number
    type: 'table'
  }>
}

interface Order {
  id: string
  order_number: string
  customer_name?: string
  table_number?: string
  status: string
  total: number
  created_at: string
  is_read?: boolean
}

interface AdminHeaderProps {
  user: User
  profile: Profile
  pageTitle?: string
  pageDescription?: string
}

export function AdminHeader({ user, profile, pageTitle, pageDescription }: AdminHeaderProps) {
  const router = useRouter()
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch recent orders for notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/orders?status=pending&limit=10')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.orders || [])
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Poll for new orders every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  // Keyboard shortcut for search (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearchModal(true)
      }
      if (e.key === 'Escape') {
        setShowSearchModal(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus search input when modal opens
  useEffect(() => {
    if (showSearchModal && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [showSearchModal])

  // Search with debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults(null)
      return
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const response = await fetch(`/api/admin/search?q=${encodeURIComponent(searchQuery)}`)
        if (response.ok) {
          const data = await response.json()
          setSearchResults(data)
        }
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setSearchLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSearchSelect = (type: string, id: string) => {
    setShowSearchModal(false)
    setSearchQuery('')
    setSearchResults(null)

    switch (type) {
      case 'menu':
        router.push(`/admin/menu?edit=${id}`)
        break
      case 'order':
        router.push(`/admin/orders?id=${id}`)
        break
      case 'category':
        router.push(`/admin/categories?edit=${id}`)
        break
      case 'table':
        router.push(`/admin/tables?edit=${id}`)
        break
    }
  }

  const totalResults = searchResults
    ? searchResults.menu.length + searchResults.orders.length + searchResults.categories.length + searchResults.tables.length
    : 0

  const unreadCount = notifications.filter(n => !n.is_read).length

  const markAllAsRead = () => {
    // Clear notifications from UI
    setNotifications([])
    setShowNotifications(false)
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pesanan baru'
      case 'confirmed': return 'Dikonfirmasi'
      case 'preparing': return 'Diproses'
      case 'ready': return 'Siap disajikan'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'confirmed': return 'bg-orange-100 text-orange-700'
      case 'preparing': return 'bg-purple-100 text-purple-700'
      case 'ready': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#E5E7EB] bg-white px-6">
      {/* Left Section - Page Title */}
      <div className="flex items-center gap-4">
        {pageTitle && (
          <div>
            <h1 className="text-xl font-bold text-[#111827]">{pageTitle}</h1>
            {pageDescription && (
              <p className="text-sm text-[#6B7280]">{pageDescription}</p>
            )}
          </div>
        )}
      </div>

      {/* Right Section - Search, Notifications */}
      <div className="flex items-center gap-3">
        {/* Search Button */}
        <button
          onClick={() => setShowSearchModal(true)}
          className="hidden md:flex items-center gap-2 h-10 px-4 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] transition-colors w-64"
        >
          <Search className="w-4 h-4 text-[#9CA3AF]" />
          <span className="flex-1 text-sm text-[#9CA3AF] text-left">Cari...</span>
          <kbd className="hidden lg:flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-[#9CA3AF] bg-white rounded border border-[#E5E7EB]">
            <span>⌘</span>K
          </kbd>
        </button>

        {/* Help Center */}
        <HelpCenter triggerVariant="icon" className="text-[#6B7280] hover:bg-[#F3F4F6] h-10 w-10" />

        {/* Notifications */}
        <div className="relative" data-tour="header-notification">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />

              {/* Panel */}
              <div className="absolute right-0 top-12 z-50 w-96 bg-white rounded-xl shadow-xl border border-[#E5E7EB] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB]">
                  <h3 className="font-semibold text-[#111827]">Notifikasi</h3>
                  {notifications.length > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-orange-500 hover:underline"
                    >
                      Tandai semua dibaca
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="max-h-[400px] overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <BlockLoader
                        blockColor="bg-orange-500"
                        borderColor="border-orange-500"
                        size={30}
                        gap={3}
                        speed={1}
                      />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                      <div className="w-16 h-16 bg-[#F3F4F6] rounded-full flex items-center justify-center mb-4">
                        <Inbox className="w-8 h-8 text-[#9CA3AF]" />
                      </div>
                      <p className="text-sm font-medium text-[#111827]">Belum ada pesanan baru</p>
                      <p className="text-xs text-[#6B7280] mt-1 text-center">
                        Pesanan masuk akan muncul di sini
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#E5E7EB]">
                      {notifications.map((order) => (
                        <Link
                          key={order.id}
                          href={`/admin/orders?id=${order.id}`}
                          onClick={() => setShowNotifications(false)}
                          className={`flex items-start gap-3 px-4 py-3 hover:bg-[#F9FAFB] transition-colors ${
                            !order.is_read ? 'bg-[#EFF6FF]' : ''
                          }`}
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10 flex-shrink-0">
                            <ShoppingBag className="w-5 h-5 text-orange-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-[#111827] truncate">
                                {order.customer_name || `Meja ${order.table_number}` || order.order_number}
                              </p>
                              {!order.is_read && (
                                <span className="w-2 h-2 rounded-full bg-orange-500" />
                              )}
                            </div>
                            <p className="text-xs text-[#6B7280] mt-0.5">
                              #{order.order_number}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium ${getStatusColor(order.status)}`}>
                                {getStatusLabel(order.status)}
                              </span>
                              <span className="text-[10px] text-[#9CA3AF] flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(new Date(order.created_at), {
                                  addSuffix: true,
                                  locale: id,
                                })}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#9CA3AF] flex-shrink-0 mt-1" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="border-t border-[#E5E7EB] px-4 py-3">
                    <Link
                      href="/admin/orders"
                      onClick={() => setShowNotifications(false)}
                      className="flex items-center justify-center gap-2 text-sm font-medium text-orange-500 hover:underline"
                    >
                      Lihat semua pesanan
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Search Modal */}
      {showSearchModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowSearchModal(false)}
          />

          {/* Modal */}
          <div className="fixed inset-x-4 top-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[600px] z-50">
            <div className="bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E7EB]">
                <Search className="w-5 h-5 text-[#9CA3AF]" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari menu, pesanan, kategori, atau meja..."
                  className="flex-1 text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none"
                />
                {searchLoading && <Loader2 className="w-4 h-4 animate-spin text-orange-500" />}
                <button
                  onClick={() => setShowSearchModal(false)}
                  className="p-1 hover:bg-[#F3F4F6] rounded"
                >
                  <X className="w-4 h-4 text-[#6B7280]" />
                </button>
              </div>

              {/* Search Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {!searchQuery || searchQuery.length < 2 ? (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm text-[#6B7280]">Ketik minimal 2 karakter untuk mencari</p>
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      <span className="px-3 py-1 bg-[#F3F4F6] rounded-full text-xs text-[#6B7280]">Menu</span>
                      <span className="px-3 py-1 bg-[#F3F4F6] rounded-full text-xs text-[#6B7280]">Pesanan</span>
                      <span className="px-3 py-1 bg-[#F3F4F6] rounded-full text-xs text-[#6B7280]">Kategori</span>
                      <span className="px-3 py-1 bg-[#F3F4F6] rounded-full text-xs text-[#6B7280]">Meja</span>
                    </div>
                  </div>
                ) : searchResults && totalResults === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm text-[#6B7280]">Tidak ada hasil untuk "{searchQuery}"</p>
                  </div>
                ) : searchResults ? (
                  <div className="py-2">
                    {/* Menu Results */}
                    {searchResults.menu.length > 0 && (
                      <div>
                        <div className="px-4 py-2 text-xs font-semibold text-[#6B7280] uppercase tracking-wider bg-[#F9FAFB]">
                          Menu ({searchResults.menu.length})
                        </div>
                        {searchResults.menu.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleSearchSelect('menu', item.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F3F4F6] transition-colors text-left"
                          >
                            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                              <UtensilsCrossed className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[#111827] truncate">{item.name}</p>
                              <p className="text-xs text-[#6B7280]">{item.category} • {formatCurrency(item.price)}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${item.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {item.is_available ? 'Tersedia' : 'Habis'}
                            </span>
                            <ArrowRight className="w-4 h-4 text-[#9CA3AF]" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Order Results */}
                    {searchResults.orders.length > 0 && (
                      <div>
                        <div className="px-4 py-2 text-xs font-semibold text-[#6B7280] uppercase tracking-wider bg-[#F9FAFB]">
                          Pesanan ({searchResults.orders.length})
                        </div>
                        {searchResults.orders.map((order) => (
                          <button
                            key={order.id}
                            onClick={() => handleSearchSelect('order', order.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F3F4F6] transition-colors text-left"
                          >
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <ShoppingBag className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[#111827] truncate">
                                #{order.order_number}
                                {order.customer_name && ` - ${order.customer_name}`}
                              </p>
                              <p className="text-xs text-[#6B7280]">{formatCurrency(order.total)}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getStatusColor(order.status)}`}>
                              {getStatusLabel(order.status)}
                            </span>
                            <ArrowRight className="w-4 h-4 text-[#9CA3AF]" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Category Results */}
                    {searchResults.categories.length > 0 && (
                      <div>
                        <div className="px-4 py-2 text-xs font-semibold text-[#6B7280] uppercase tracking-wider bg-[#F9FAFB]">
                          Kategori ({searchResults.categories.length})
                        </div>
                        {searchResults.categories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => handleSearchSelect('category', cat.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F3F4F6] transition-colors text-left"
                          >
                            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                              <FolderOpen className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[#111827] truncate">{cat.name}</p>
                              {cat.description && (
                                <p className="text-xs text-[#6B7280] truncate">{cat.description}</p>
                              )}
                            </div>
                            <ArrowRight className="w-4 h-4 text-[#9CA3AF]" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Table Results */}
                    {searchResults.tables.length > 0 && (
                      <div>
                        <div className="px-4 py-2 text-xs font-semibold text-[#6B7280] uppercase tracking-wider bg-[#F9FAFB]">
                          Meja ({searchResults.tables.length})
                        </div>
                        {searchResults.tables.map((table) => (
                          <button
                            key={table.id}
                            onClick={() => handleSearchSelect('table', table.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F3F4F6] transition-colors text-left"
                          >
                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                              <QrCode className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[#111827] truncate">Meja {table.table_number}</p>
                              <p className="text-xs text-[#6B7280]">Kapasitas: {table.capacity} orang</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                              table.status === 'available' ? 'bg-green-100 text-green-700' :
                              table.status === 'occupied' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {table.status === 'available' ? 'Kosong' : table.status === 'occupied' ? 'Terisi' : 'Reservasi'}
                            </span>
                            <ArrowRight className="w-4 h-4 text-[#9CA3AF]" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-between text-xs text-[#6B7280]">
                <span>Tekan <kbd className="px-1.5 py-0.5 bg-white rounded border border-[#E5E7EB] font-mono">ESC</kbd> untuk menutup</span>
                <span>Powered by Savora</span>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  )
}
