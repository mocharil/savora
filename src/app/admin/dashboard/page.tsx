// @ts-nocheck
import { createAdminClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { getUserFromToken } from '@/lib/tenant-context'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ShoppingBag,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  MapPin,
  ChevronRight,
  UtensilsCrossed,
  Flame,
  Receipt,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Zap
} from 'lucide-react'
import { FTUEProgressCard } from '@/components/admin/ftue'
import { DashboardPageClient } from './DashboardPageClient'
import { DailySummaryCard } from '@/components/admin/DailySummaryCard'

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'

const statusConfig: Record<OrderStatus, { label: string; bgColor: string; textColor: string }> = {
  pending: { label: 'Baru', bgColor: 'bg-amber-100', textColor: 'text-amber-700' },
  confirmed: { label: 'Dikonfirmasi', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
  preparing: { label: 'Diproses', bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
  ready: { label: 'Siap', bgColor: 'bg-green-100', textColor: 'text-green-700' },
  completed: { label: 'Selesai', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
  cancelled: { label: 'Batal', bgColor: 'bg-red-100', textColor: 'text-red-700' },
}

export default async function DashboardPage() {
  const supabase = createAdminClient()

  // Get user from token
  const user = await getUserFromToken()
  if (!user || !user.storeId) {
    redirect('/login')
  }

  const storeId = user.storeId

  // Get today's date range
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Get yesterday for comparison
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  // Fetch today's orders
  const { data: todayOrders } = await supabase
    .from('orders')
    .select('*')
    .eq('store_id', storeId)
    .gte('created_at', today.toISOString())
    .lt('created_at', tomorrow.toISOString())

  // Fetch yesterday's orders for comparison
  const { data: yesterdayOrders } = await supabase
    .from('orders')
    .select('*')
    .eq('store_id', storeId)
    .gte('created_at', yesterday.toISOString())
    .lt('created_at', today.toISOString())

  // Calculate stats
  const todayRevenue = todayOrders
    ?.filter(o => o.payment_status === 'paid')
    .reduce((sum, o) => sum + (o.total || 0), 0) || 0

  const yesterdayRevenue = yesterdayOrders
    ?.filter(o => o.payment_status === 'paid')
    .reduce((sum, o) => sum + (o.total || 0), 0) || 0

  const todayOrderCount = todayOrders?.length || 0
  const yesterdayOrderCount = yesterdayOrders?.length || 0

  const revenueChange = yesterdayRevenue > 0
    ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100)
    : 0

  const orderChange = yesterdayOrderCount > 0
    ? ((todayOrderCount - yesterdayOrderCount) / yesterdayOrderCount * 100)
    : 0

  // Calculate order status breakdown
  const pendingOrders = todayOrders?.filter(o => o.status === 'pending').length || 0
  const preparingOrders = todayOrders?.filter(o => ['confirmed', 'preparing'].includes(o.status)).length || 0
  const readyOrders = todayOrders?.filter(o => o.status === 'ready').length || 0
  const completedOrders = todayOrders?.filter(o => o.status === 'completed').length || 0

  // Payment stats
  const paidOrders = todayOrders?.filter(o => o.payment_status === 'paid').length || 0
  const unpaidOrders = todayOrders?.filter(o => o.payment_status === 'unpaid').length || 0

  // Fetch recent orders (only active ones for dashboard)
  const { data: activeOrders } = await supabase
    .from('orders')
    .select(`
      *,
      table:tables(table_number),
      order_items(
        quantity,
        menu_item:menu_items(name)
      )
    `)
    .eq('store_id', storeId)
    .in('status', ['pending', 'confirmed', 'preparing', 'ready'])
    .order('created_at', { ascending: false })
    .limit(5)

  // Get current time greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Selamat Pagi' : hour < 18 ? 'Selamat Siang' : 'Selamat Malam'

  // Check if there's any historical data (yesterday's orders)
  const hasHistoricalData = yesterdayOrderCount > 0 || yesterdayRevenue > 0

  return (
    <div className="space-y-6">
      {/* FTUE Progress Card */}
      <FTUEProgressCard />

      {/* Page Header */}
      <DashboardPageClient />

      {/* AI Daily Summary - only show if there's yesterday's data */}
      <DailySummaryCard hasData={hasHistoricalData} />

      {/* Executive Summary Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 p-6 md:p-8" data-tour="dashboard-stats">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative">
          {/* Greeting */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-orange-100 text-sm font-medium">{greeting}!</p>
              <p className="text-white/80 text-xs">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <Link
              href="/admin/analytics"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              Lihat Analytics
            </Link>
          </div>

          {/* Main Revenue Display */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="text-white">
              <p className="text-orange-100 text-sm font-medium mb-1 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Pendapatan Hari Ini
              </p>
              <h2 className="text-4xl md:text-5xl font-bold mb-2">
                {formatCurrency(todayRevenue)}
              </h2>
              {yesterdayRevenue > 0 && (
                <div className="flex items-center gap-2">
                  {revenueChange >= 0 ? (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-100 text-sm font-medium">
                      <ArrowUpRight className="w-4 h-4" />
                      +{Math.abs(revenueChange).toFixed(0)}%
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 text-red-100 text-sm font-medium">
                      <ArrowDownRight className="w-4 h-4" />
                      -{Math.abs(revenueChange).toFixed(0)}%
                    </span>
                  )}
                  <span className="text-orange-100 text-sm">vs kemarin ({formatCurrency(yesterdayRevenue)})</span>
                </div>
              )}
            </div>

            {/* Quick Action Stats */}
            <div className="grid grid-cols-2 md:flex gap-3">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center min-w-[100px]">
                <p className="text-3xl font-bold text-white">{todayOrderCount}</p>
                <p className="text-orange-100 text-xs mt-1">Total Pesanan</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center min-w-[100px]">
                <p className="text-3xl font-bold text-white">{completedOrders}</p>
                <p className="text-orange-100 text-xs mt-1">Selesai</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center min-w-[100px]">
                <p className="text-3xl font-bold text-white">{paidOrders}</p>
                <p className="text-orange-100 text-xs mt-1">Lunas</p>
              </div>
              <div className="bg-amber-500/30 backdrop-blur-sm rounded-xl p-4 text-center min-w-[100px]">
                <p className="text-3xl font-bold text-white">{unpaidOrders}</p>
                <p className="text-orange-100 text-xs mt-1">Belum Bayar</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Status Overview */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4" data-tour="dashboard-status-cards">
        {/* Pending */}
        <div className={`rounded-xl p-4 border-2 transition-all ${pendingOrders > 0 ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-100'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${pendingOrders > 0 ? 'bg-amber-500' : 'bg-gray-300'}`}>
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            {pendingOrders > 0 && (
              <span className="animate-pulse w-3 h-3 rounded-full bg-amber-500" />
            )}
          </div>
          <p className={`text-2xl font-bold ${pendingOrders > 0 ? 'text-amber-700' : 'text-gray-400'}`}>{pendingOrders}</p>
          <p className={`text-sm ${pendingOrders > 0 ? 'text-amber-600' : 'text-gray-400'}`}>Perlu Dikonfirmasi</p>
        </div>

        {/* Preparing */}
        <div className={`rounded-xl p-4 border-2 transition-all ${preparingOrders > 0 ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-100'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${preparingOrders > 0 ? 'bg-purple-500' : 'bg-gray-300'}`}>
              <Clock className="w-5 h-5 text-white" />
            </div>
            {preparingOrders > 0 && (
              <span className="animate-pulse w-3 h-3 rounded-full bg-purple-500" />
            )}
          </div>
          <p className={`text-2xl font-bold ${preparingOrders > 0 ? 'text-purple-700' : 'text-gray-400'}`}>{preparingOrders}</p>
          <p className={`text-sm ${preparingOrders > 0 ? 'text-purple-600' : 'text-gray-400'}`}>Sedang Diproses</p>
        </div>

        {/* Ready */}
        <div className={`rounded-xl p-4 border-2 transition-all ${readyOrders > 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${readyOrders > 0 ? 'bg-green-500' : 'bg-gray-300'}`}>
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            {readyOrders > 0 && (
              <span className="animate-pulse w-3 h-3 rounded-full bg-green-500" />
            )}
          </div>
          <p className={`text-2xl font-bold ${readyOrders > 0 ? 'text-green-700' : 'text-gray-400'}`}>{readyOrders}</p>
          <p className={`text-sm ${readyOrders > 0 ? 'text-green-600' : 'text-gray-400'}`}>Siap Diantar</p>
        </div>

        {/* Completed Today */}
        <div className="rounded-xl p-4 border-2 bg-gray-50 border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-400">
              <Receipt className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-700">{completedOrders}</p>
          <p className="text-sm text-gray-500">Selesai Hari Ini</p>
        </div>
      </div>

      {/* Active Orders - Main Focus */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden" data-tour="dashboard-recent-orders">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-200">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Pesanan Aktif</h3>
              <p className="text-xs text-gray-500">Pesanan yang perlu diproses</p>
            </div>
          </div>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors"
          >
            Kelola Pesanan
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {activeOrders && activeOrders.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {activeOrders.map((order) => {
              const status = order.status as OrderStatus
              const statusInfo = statusConfig[status]
              const itemCount = order.order_items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0
              const firstItems = order.order_items?.slice(0, 2).map((i: any) => i.menu_item?.name).filter(Boolean).join(', ')

              return (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-orange-50/50 transition-colors group"
                >
                  {/* Status Indicator */}
                  <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center ${statusInfo.bgColor}`}>
                    <span className={`text-lg font-bold ${statusInfo.textColor}`}>#{order.order_number?.slice(-3)}</span>
                  </div>

                  {/* Order Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                        {statusInfo.label}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Meja {order.table?.table_number || order.table_number || '-'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {firstItems || `${itemCount} item`}
                      {order.order_items?.length > 2 && ` +${order.order_items.length - 2} lainnya`}
                    </p>
                  </div>

                  {/* Price & Payment */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(order.total || 0)}
                    </p>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                      order.payment_status === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {order.payment_status === 'paid' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          Lunas
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-3 h-3" />
                          Belum Bayar
                        </>
                      )}
                    </span>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-orange-500 transition-colors" />
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-emerald-50 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
            <p className="text-gray-700 font-semibold mb-1">Semua Pesanan Selesai!</p>
            <p className="text-sm text-gray-400">Tidak ada pesanan yang perlu diproses saat ini</p>
          </div>
        )}
      </div>

      {/* Quick Link to Analytics */}
      <Link
        href="/admin/analytics"
        className="block p-6 rounded-xl border-2 border-dashed border-gray-200 hover:border-orange-300 hover:bg-orange-50/50 transition-all group"
        data-tour="dashboard-analytics-link"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                Lihat Analisis Lengkap
              </h3>
              <p className="text-sm text-gray-500">
                Grafik penjualan, menu terlaris, distribusi jam sibuk, dan lainnya
              </p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-orange-500 transition-colors" />
        </div>
      </Link>
    </div>
  )
}
