// @ts-nocheck
import Image from 'next/image'
import { createAdminClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { getUserFromToken } from '@/lib/tenant-context'
import { redirect } from 'next/navigation'
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Star,
  BarChart3,
  PieChart,
  Flame,
  Activity,
  Target,
  CreditCard,
  CalendarDays,
  Utensils,
  CircleDollarSign
} from 'lucide-react'
import { AnalyticsPageClient } from './AnalyticsPageClient'
import { AIAnalyticsPanel } from '@/components/admin/ai/AIAnalyticsPanel'

// Helper to get date range
function getDateRange(period: string) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (period) {
    case 'today':
      return { start: today, end: now }
    case 'yesterday':
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      return { start: yesterday, end: today }
    case 'week':
      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 7)
      return { start: weekAgo, end: now }
    case 'month':
      const monthAgo = new Date(today)
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      return { start: monthAgo, end: now }
    default:
      return { start: today, end: now }
  }
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const supabase = createAdminClient()
  const { period = 'week' } = await searchParams

  // Get user from token
  const user = await getUserFromToken()
  if (!user || !user.storeId) {
    redirect('/login')
  }

  const storeId = user.storeId
  const { start, end } = getDateRange(period)

  // Get current period stats
  const { data: currentOrders } = await supabase
    .from('orders')
    .select('*')
    .eq('store_id', storeId)
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())

  // Get previous period for comparison
  const prevStart = new Date(start)
  const prevEnd = new Date(end)
  const periodDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  prevStart.setDate(prevStart.getDate() - periodDays)
  prevEnd.setDate(prevEnd.getDate() - periodDays)

  const { data: previousOrders } = await supabase
    .from('orders')
    .select('*')
    .eq('store_id', storeId)
    .gte('created_at', prevStart.toISOString())
    .lte('created_at', prevEnd.toISOString())

  // Calculate stats
  const completedOrders = currentOrders?.filter(o => o.status === 'completed') || []
  const prevCompletedOrders = previousOrders?.filter(o => o.status === 'completed') || []

  const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0)
  const prevRevenue = prevCompletedOrders.reduce((sum, o) => sum + (o.total || 0), 0)
  const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0

  const totalOrders = currentOrders?.length || 0
  const prevTotalOrders = previousOrders?.length || 0
  const ordersChange = prevTotalOrders > 0 ? ((totalOrders - prevTotalOrders) / prevTotalOrders) * 100 : 0

  const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0
  const prevAvgValue = prevCompletedOrders.length > 0 ? prevRevenue / prevCompletedOrders.length : 0
  const avgChange = prevAvgValue > 0 ? ((avgOrderValue - prevAvgValue) / prevAvgValue) * 100 : 0

  // Get top selling items - only from completed orders for accurate sales data
  const completedOrderIds = completedOrders?.map(o => o.id) || []
  const { data: orderItems } = completedOrderIds.length > 0
    ? await supabase
        .from('order_items')
        .select(`quantity, unit_price, subtotal, menu_item:menu_items(id, name, image_url)`)
        .in('order_id', completedOrderIds)
    : { data: [] }

  // Aggregate top items
  const itemSales: Record<string, { name: string; quantity: number; revenue: number; image_url: string | null }> = {}
  let totalItemsSold = 0
  orderItems?.forEach(item => {
    const menuItem = item.menu_item as any
    if (menuItem) {
      if (!itemSales[menuItem.id]) {
        itemSales[menuItem.id] = { name: menuItem.name, quantity: 0, revenue: 0, image_url: menuItem.image_url }
      }
      itemSales[menuItem.id].quantity += item.quantity
      itemSales[menuItem.id].revenue += item.subtotal || (item.unit_price * item.quantity)
      totalItemsSold += item.quantity
    }
  })

  const topItems = Object.values(itemSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)

  // Get orders by status
  const ordersByStatus = {
    pending: currentOrders?.filter(o => o.status === 'pending').length || 0,
    preparing: currentOrders?.filter(o => o.status === 'preparing').length || 0,
    ready: currentOrders?.filter(o => o.status === 'ready').length || 0,
    completed: currentOrders?.filter(o => o.status === 'completed').length || 0,
    cancelled: currentOrders?.filter(o => o.status === 'cancelled').length || 0,
  }

  // Payment analytics
  const paidOrders = currentOrders?.filter(o => o.payment_status === 'paid') || []
  const unpaidOrders = currentOrders?.filter(o => o.payment_status === 'unpaid') || []
  const paidRevenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0)
  const unpaidRevenue = unpaidOrders.reduce((sum, o) => sum + (o.total || 0), 0)

  // Daily breakdown for the period
  const dailyData: Record<string, { orders: number; revenue: number; date: Date }> = {}
  currentOrders?.forEach(order => {
    const orderDate = new Date(order.created_at)
    const dateKey = orderDate.toISOString().split('T')[0]
    if (!dailyData[dateKey]) {
      dailyData[dateKey] = { orders: 0, revenue: 0, date: orderDate }
    }
    dailyData[dateKey].orders++
    if (order.payment_status === 'paid') {
      dailyData[dateKey].revenue += order.total || 0
    }
  })

  const dailyBreakdown = Object.entries(dailyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, data]) => ({
      date: new Date(data.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
      orders: data.orders,
      revenue: data.revenue
    }))
  const maxDailyOrders = Math.max(...dailyBreakdown.map(d => d.orders), 1)
  const maxDailyRevenue = Math.max(...dailyBreakdown.map(d => d.revenue), 1)

  // Get hourly distribution
  const hourlyOrders: Record<number, number> = {}
  for (let i = 0; i < 24; i++) hourlyOrders[i] = 0
  currentOrders?.forEach(order => {
    const hour = new Date(order.created_at).getHours()
    hourlyOrders[hour]++
  })
  const peakHour = Object.entries(hourlyOrders).reduce((a, b) => a[1] > b[1] ? a : b, ['0', 0])
  const totalHourlyOrders = Object.values(hourlyOrders).reduce((a, b) => a + b, 0)
  const maxHourlyCount = Math.max(...Object.values(hourlyOrders), 1)

  // Period tabs
  const periods = [
    { value: 'today', label: 'Hari Ini' },
    { value: 'yesterday', label: 'Kemarin' },
    { value: 'week', label: '7 Hari' },
    { value: 'month', label: '30 Hari' },
  ]

  const periodLabel = periods.find(p => p.value === period)?.label || '7 Hari'

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <AnalyticsPageClient />

      {/* Hero Section - Main Revenue Focus */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 p-6 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white" />
        </div>

        <div className="relative">
          {/* Period Tabs */}
          <div data-tour="analytics-date-range" className="flex flex-wrap gap-2 mb-6">
            {periods.map((p) => (
              <a
                key={p.value}
                href={`/admin/analytics?period=${p.value}`}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                  period === p.value
                    ? 'bg-white text-orange-600 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {p.label}
              </a>
            ))}
          </div>

          {/* Main Revenue Display */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-orange-100 mb-1">
                <Activity className="w-4 h-4" />
                <span className="text-sm font-medium">Total Pendapatan ({periodLabel})</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl md:text-5xl font-bold tracking-tight">
                  {formatCurrency(totalRevenue)}
                </span>
                {revenueChange !== 0 && (
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
                    revenueChange >= 0 ? 'bg-green-500/20 text-green-100' : 'bg-red-500/20 text-red-100'
                  }`}>
                    {revenueChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(revenueChange).toFixed(1)}%
                  </div>
                )}
              </div>
              <p className="text-orange-100 text-sm mt-1">
                vs periode sebelumnya: {formatCurrency(prevRevenue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards - Unique Metrics Only */}
      <div data-tour="analytics-kpi-cards" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Orders */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
              ordersChange >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
              {ordersChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(ordersChange).toFixed(1)}%
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
          <p className="text-sm text-gray-500">Total Pesanan</p>
        </div>

        {/* Avg Order Value */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
              avgChange >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
              {avgChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(avgChange).toFixed(1)}%
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(avgOrderValue)}</p>
          <p className="text-sm text-gray-500">Rata-rata per Pesanan</p>
        </div>

        {/* Items Sold */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Utensils className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalItemsSold}</p>
          <p className="text-sm text-gray-500">Item Terjual</p>
        </div>

        {/* Peak Hour */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{peakHour[0].toString().padStart(2, '0')}:00</p>
          <p className="text-sm text-gray-500">Jam Tersibuk ({peakHour[1]} pesanan)</p>
        </div>
      </div>

      {/* Payment Analytics */}
      <div data-tour="analytics-payment" className="grid gap-4 md:grid-cols-2">
        {/* Paid */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Sudah Dibayar</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(paidRevenue)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{paidOrders.length}</p>
              <p className="text-xs text-gray-400">transaksi</p>
            </div>
          </div>
        </div>

        {/* Unpaid */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Belum Dibayar</p>
                <p className="text-xl font-bold text-amber-600">{formatCurrency(unpaidRevenue)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{unpaidOrders.length}</p>
              <p className="text-xs text-gray-400">transaksi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Trend Chart - Combined */}
      {dailyBreakdown.length > 1 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <CalendarDays className="w-4 h-4 text-white" />
              </div>
              Tren Harian
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {dailyBreakdown.map((data, index) => {
                const orderWidth = (data.orders / maxDailyOrders) * 100
                return (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-14 flex-shrink-0">{data.date}</span>
                    <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        style={{ width: `${Math.max(orderWidth, 8)}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-gray-600 font-medium w-8">{data.orders} <span className="text-gray-400">psn</span></span>
                      <span className="text-green-600 font-medium w-20 text-right">{formatCurrency(data.revenue)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Hourly Distribution */}
      <div data-tour="analytics-charts" className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            Distribusi Pesanan per Jam
          </h2>
        </div>
        <div className="p-6">
          {totalHourlyOrders === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-gray-500 text-sm">Belum ada data pesanan</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-end gap-1 h-32">
                {Object.entries(hourlyOrders).map(([hour, count]) => {
                  const heightPercent = (count / maxHourlyCount) * 100
                  const isActive = Number(hour) >= 9 && Number(hour) <= 21
                  const hasOrders = count > 0
                  const isPeak = Number(hour) === Number(peakHour[0]) && count > 0

                  return (
                    <div key={hour} className="flex-1 flex flex-col items-center justify-end h-full group">
                      <div className="w-full flex flex-col items-center justify-end flex-1">
                        {hasOrders && (
                          <span className="text-[10px] font-medium text-gray-500 mb-1">{count}</span>
                        )}
                        <div
                          className={`w-full rounded-t transition-all ${
                            isPeak
                              ? 'bg-gradient-to-t from-orange-600 to-amber-400'
                              : hasOrders
                              ? 'bg-gradient-to-t from-blue-500 to-cyan-400'
                              : isActive
                              ? 'bg-blue-100'
                              : 'bg-gray-100'
                          }`}
                          style={{
                            height: hasOrders ? `${Math.max(heightPercent, 15)}%` : '4px',
                            minHeight: hasOrders ? '16px' : '4px'
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
              {/* X-axis labels - fixed alignment */}
              <div className="flex gap-1">
                {Object.keys(hourlyOrders).map((hour) => (
                  <div key={`label-${hour}`} className="flex-1 text-center">
                    {Number(hour) % 4 === 0 && (
                      <span className="text-[10px] text-gray-400">{hour.toString().padStart(2, '0')}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Orders by Status - Pie Chart */}
        <div data-tour="analytics-status-chart" className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <PieChart className="w-4 h-4 text-white" />
              </div>
              Status Pesanan
            </h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-44 h-44">
                <svg className="w-44 h-44 transform -rotate-90" viewBox="0 0 180 180">
                  {(() => {
                    const statuses = [
                      { key: 'completed', color: '#10B981', count: ordersByStatus.completed },
                      { key: 'preparing', color: '#8B5CF6', count: ordersByStatus.preparing },
                      { key: 'ready', color: '#F97316', count: ordersByStatus.ready },
                      { key: 'pending', color: '#F59E0B', count: ordersByStatus.pending },
                      { key: 'cancelled', color: '#EF4444', count: ordersByStatus.cancelled },
                    ]
                    let offset = 0
                    const radius = 70
                    const circumference = 2 * Math.PI * radius

                    return statuses.map((status) => {
                      const percentage = totalOrders > 0 ? (status.count / totalOrders) * 100 : 0
                      const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`
                      const strokeDashoffset = -offset
                      offset += (percentage / 100) * circumference

                      if (status.count === 0) return null

                      return (
                        <circle
                          key={status.key}
                          cx="90" cy="90" r={radius}
                          stroke={status.color}
                          strokeWidth="20"
                          fill="none"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-500"
                        />
                      )
                    })
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900">{totalOrders}</span>
                  <span className="text-sm text-gray-500">Total Pesanan</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Selesai', color: 'bg-green-500', count: ordersByStatus.completed },
                { label: 'Diproses', color: 'bg-purple-500', count: ordersByStatus.preparing },
                { label: 'Siap', color: 'bg-orange-500', count: ordersByStatus.ready },
                { label: 'Pending', color: 'bg-amber-500', count: ordersByStatus.pending },
                { label: 'Batal', color: 'bg-red-500', count: ordersByStatus.cancelled },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm text-gray-600 flex-1">{item.label}</span>
                  <span className="text-sm font-bold text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Selling Items */}
        <div data-tour="analytics-top-items" className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <Star className="w-4 h-4 text-white" />
              </div>
              Menu Terlaris
            </h2>
          </div>
          <div className="p-6">
            {topItems.length > 0 ? (
              <div className="space-y-3">
                {topItems.map((item, index) => {
                  const maxQty = topItems[0]?.quantity || 1
                  const barWidth = (item.quantity / maxQty) * 100

                  return (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      {/* Rank Badge */}
                      <div className={`relative flex-shrink-0 ${index < 3 ? 'w-14 h-14' : 'w-12 h-12'}`}>
                        {item.image_url ? (
                          <div className="relative w-full h-full rounded-xl overflow-hidden shadow-md">
                            <Image
                              src={item.image_url}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                            {/* Rank overlay */}
                            <div className={`absolute -top-1 -left-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md ${
                              index === 0 ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white' :
                              index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                              index === 2 ? 'bg-gradient-to-br from-orange-400 to-amber-600 text-white' :
                              'bg-white text-gray-600 border border-gray-200'
                            }`}>
                              {index + 1}
                            </div>
                          </div>
                        ) : (
                          <div className={`w-full h-full rounded-xl flex items-center justify-center text-sm font-bold ${
                            index === 0 ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white' :
                            index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                            index === 2 ? 'bg-gradient-to-br from-orange-400 to-amber-600 text-white' :
                            'bg-gray-200 text-gray-500'
                          }`}>
                            {index < 3 ? <Flame className="w-5 h-5" /> : index + 1}
                          </div>
                        )}
                      </div>

                      {/* Item Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-gray-900 truncate">{item.name}</span>
                          <div className="flex-shrink-0 text-right">
                            <span className="text-lg font-bold text-gray-900">{item.quantity}</span>
                            <span className="text-xs text-gray-400 ml-1">terjual</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                index === 0 ? 'bg-gradient-to-r from-amber-400 to-yellow-500' :
                                index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                                index === 2 ? 'bg-gradient-to-r from-orange-400 to-amber-500' :
                                'bg-gray-400'
                              }`}
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                          <span className="text-xs text-green-600 font-medium flex-shrink-0">
                            {formatCurrency(item.revenue)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-gray-500 text-sm">Belum ada data penjualan</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Analytics Section */}
      <div data-tour="analytics-ai-panel" className="mt-8">
        <AIAnalyticsPanel />
      </div>
    </div>
  )
}
