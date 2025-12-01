'use client'

import { useState, useEffect } from 'react'
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
} from 'lucide-react'
import { OutletSelector } from './OutletSelector'
import { HelpCenter } from './tour'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'
import Link from 'next/link'

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
  const [isSearchFocused, setIsSearchFocused] = useState(false)
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

  const unreadCount = notifications.filter(n => !n.is_read).length

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

      {/* Right Section - Outlet Selector, Search, Notifications */}
      <div className="flex items-center gap-3">
        {/* Outlet Selector */}
        <OutletSelector />

        {/* Search Bar */}
        <div
          className={`hidden md:flex items-center gap-2 h-10 px-4 rounded-lg transition-all duration-200 ${
            isSearchFocused
              ? 'bg-white border-2 border-orange-500 shadow-sm w-80'
              : 'bg-[#F3F4F6] border-2 border-transparent w-64'
          }`}
        >
          <Search className={`w-4 h-4 ${isSearchFocused ? 'text-orange-500' : 'text-[#9CA3AF]'}`} />
          <input
            type="text"
            placeholder="Cari..."
            className="flex-1 bg-transparent text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none"
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          <kbd className="hidden lg:flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-[#9CA3AF] bg-white rounded border border-[#E5E7EB]">
            <span>⌘</span>K
          </kbd>
        </div>

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
                    <button className="text-xs text-orange-500 hover:underline">
                      Tandai semua dibaca
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="max-h-[400px] overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
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
    </header>
  )
}
