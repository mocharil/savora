'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  ChefHat,
  Bell,
  PartyPopper,
  XCircle,
  RefreshCw,
  Package,
  MapPin
} from 'lucide-react'

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'

interface TrackedOrder {
  id: string
  order_number: string
  status: OrderStatus
  total: number
  created_at: string
  table_number?: string
}

const statusConfig: Record<OrderStatus, {
  label: string
  color: string
  bgColor: string
  icon: React.ReactNode
}> = {
  pending: {
    label: 'Menunggu Konfirmasi',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 border-amber-200',
    icon: <Clock className="w-5 h-5" />
  },
  confirmed: {
    label: 'Dikonfirmasi',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    icon: <CheckCircle className="w-5 h-5" />
  },
  preparing: {
    label: 'Sedang Diproses',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
    icon: <ChefHat className="w-5 h-5" />
  },
  ready: {
    label: 'Siap Disajikan',
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    icon: <Bell className="w-5 h-5" />
  },
  completed: {
    label: 'Selesai',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 border-gray-200',
    icon: <PartyPopper className="w-5 h-5" />
  },
  cancelled: {
    label: 'Dibatalkan',
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    icon: <XCircle className="w-5 h-5" />
  },
}

// Store order IDs in localStorage
const TRACKED_ORDERS_KEY = 'savora-tracked-orders'

function getTrackedOrderIds(): string[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(TRACKED_ORDERS_KEY)
  return stored ? JSON.parse(stored) : []
}

export function addTrackedOrder(orderId: string) {
  if (typeof window === 'undefined') return
  const orders = getTrackedOrderIds()
  if (!orders.includes(orderId)) {
    orders.unshift(orderId) // Add to beginning
    // Keep only last 20 orders
    localStorage.setItem(TRACKED_ORDERS_KEY, JSON.stringify(orders.slice(0, 20)))
  }
}

export default function OrderTrackingPage() {
  const params = useParams()
  const storeSlug = params.storeSlug as string

  const [orders, setOrders] = useState<TrackedOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchOrders = useCallback(async (showRefreshing = false) => {
    const orderIds = getTrackedOrderIds()
    if (orderIds.length === 0) {
      setOrders([])
      setLoading(false)
      return
    }

    if (showRefreshing) setRefreshing(true)

    try {
      const response = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds })
      })

      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()

    // Poll every 10 seconds for status updates
    const interval = setInterval(() => fetchOrders(), 10000)
    return () => clearInterval(interval)
  }, [fetchOrders])

  const handleRefresh = () => {
    fetchOrders(true)
  }

  // Group orders by active/completed
  const activeOrders = orders.filter(o =>
    !['completed', 'cancelled'].includes(o.status)
  )
  const pastOrders = orders.filter(o =>
    ['completed', 'cancelled'].includes(o.status)
  )

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-lg border-b border-orange-100/50 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/${storeSlug}/order`}
              className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center transition-all active:scale-95 hover:bg-orange-100"
            >
              <ArrowLeft className="w-5 h-5 text-orange-600" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Lacak Pesanan</h1>
              <p className="text-sm text-gray-500">Pantau status pesanan Anda</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center transition-all active:scale-95 hover:bg-orange-100 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-orange-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Package className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">Belum ada pesanan</p>
            <p className="text-sm text-gray-400 mt-1">Pesanan Anda akan muncul di sini</p>
            <Link
              href={`/${storeSlug}/order`}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl shadow-lg"
            >
              Pesan Sekarang
            </Link>
          </div>
        ) : (
          <>
            {/* Active Orders */}
            {activeOrders.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Pesanan Aktif
                </h2>
                <div className="space-y-3">
                  {activeOrders.map((order) => {
                    const status = statusConfig[order.status]
                    return (
                      <Link
                        key={order.id}
                        href={`/${storeSlug}/order/confirmation/${order.id}`}
                        className={`block bg-white rounded-2xl border-2 ${status.bgColor} p-4 transition-all active:scale-[0.98]`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-bold text-gray-900">#{order.order_number}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {new Date(order.created_at).toLocaleString('id-ID', {
                                dateStyle: 'short',
                                timeStyle: 'short'
                              })}
                            </p>
                          </div>
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${status.bgColor} ${status.color}`}>
                            {status.icon}
                            <span className="text-sm font-medium">{status.label}</span>
                          </div>
                        </div>

                        {order.table_number && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <MapPin className="w-4 h-4" />
                            <span>Meja {order.table_number}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <span className="text-sm text-gray-500">Total</span>
                          <span className="font-bold text-orange-600">{formatCurrency(order.total)}</span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Past Orders */}
            {pastOrders.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Riwayat Pesanan
                </h2>
                <div className="space-y-3">
                  {pastOrders.map((order) => {
                    const status = statusConfig[order.status]
                    return (
                      <Link
                        key={order.id}
                        href={`/${storeSlug}/order/confirmation/${order.id}`}
                        className="block bg-white rounded-2xl border border-gray-100 p-4 transition-all active:scale-[0.98]"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-bold text-gray-900">#{order.order_number}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {new Date(order.created_at).toLocaleString('id-ID', {
                                dateStyle: 'short',
                                timeStyle: 'short'
                              })}
                            </p>
                          </div>
                          <span className={`text-sm font-medium ${status.color}`}>
                            {status.label}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                          <span className="text-sm text-gray-500">Total</span>
                          <span className="font-semibold text-gray-700">{formatCurrency(order.total)}</span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
