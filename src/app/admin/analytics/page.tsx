// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { getUserFromToken } from '@/lib/tenant-context'
import { redirect } from 'next/navigation'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  UtensilsCrossed,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Star,
  BarChart3,
  PieChart
} from 'lucide-react'
import { AnalyticsPageClient } from './AnalyticsPageClient'

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
  const supabase = await createClient()
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

  const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
  const prevRevenue = prevCompletedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
  const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0

  const totalOrders = currentOrders?.length || 0
  const prevTotalOrders = previousOrders?.length || 0
  const ordersChange = prevTotalOrders > 0 ? ((totalOrders - prevTotalOrders) / prevTotalOrders) * 100 : 0

  const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0
  const prevAvgValue = prevCompletedOrders.length > 0
    ? prevRevenue / prevCompletedOrders.length
    : 0
  const avgChange = prevAvgValue > 0 ? ((avgOrderValue - prevAvgValue) / prevAvgValue) * 100 : 0

  // Get top selling items
  const { data: orderItems } = await supabase
    .from('order_items')
    .select(`
      quantity,
      price,
      menu_item:menu_items(id, name, price)
    `)
    .in('order_id', completedOrders.map(o => o.id))

  // Aggregate top items
  const itemSales: Record<string, { name: string; quantity: number; revenue: number }> = {}
  orderItems?.forEach(item => {
    const menuItem = item.menu_item as any
    if (menuItem) {
      if (!itemSales[menuItem.id]) {
        itemSales[menuItem.id] = { name: menuItem.name, quantity: 0, revenue: 0 }
      }
      itemSales[menuItem.id].quantity += item.quantity
      itemSales[menuItem.id].revenue += item.price * item.quantity
    }
  })

  const topItems = Object.values(itemSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)

  // Get orders by status
  const ordersByStatus = {
    pending: currentOrders?.filter(o => o.status === 'pending').length || 0,
    confirmed: currentOrders?.filter(o => o.status === 'confirmed').length || 0,
    preparing: currentOrders?.filter(o => o.status === 'preparing').length || 0,
    ready: currentOrders?.filter(o => o.status === 'ready').length || 0,
    completed: currentOrders?.filter(o => o.status === 'completed').length || 0,
    cancelled: currentOrders?.filter(o => o.status === 'cancelled').length || 0,
  }

  // Get hourly distribution
  const hourlyOrders: Record<number, number> = {}
  for (let i = 0; i < 24; i++) hourlyOrders[i] = 0
  currentOrders?.forEach(order => {
    const hour = new Date(order.created_at).getHours()
    hourlyOrders[hour]++
  })
  const peakHour = Object.entries(hourlyOrders).reduce((a, b) => a[1] > b[1] ? a : b, ['0', 0])

  // Period tabs
  const periods = [
    { value: 'today', label: 'Hari Ini' },
    { value: 'yesterday', label: 'Kemarin' },
    { value: 'week', label: '7 Hari' },
    { value: 'month', label: '30 Hari' },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <AnalyticsPageClient />

      {/* Period Tabs */}
      <div data-tour="analytics-date-range" className="flex gap-2 p-1 bg-[#F3F4F6] rounded-lg w-fit">
        {periods.map((p) => (
          <a
            key={p.value}
            href={`/admin/analytics?period=${p.value}`}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              period === p.value
                ? 'bg-white text-[#111827] shadow-sm'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            {p.label}
          </a>
        ))}
      </div>

      {/* Stats Cards */}
      <div data-tour="analytics-charts" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Revenue */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[#10B981]" />
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${
              revenueChange >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
            }`}>
              {revenueChange >= 0 ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {Math.abs(revenueChange).toFixed(1)}%
            </div>
          </div>
          <p className="text-2xl font-bold text-[#111827]">{formatCurrency(totalRevenue)}</p>
          <p className="text-sm text-[#6B7280]">Total Pendapatan</p>
        </div>

        {/* Orders */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-orange-500" />
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${
              ordersChange >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
            }`}>
              {ordersChange >= 0 ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {Math.abs(ordersChange).toFixed(1)}%
            </div>
          </div>
          <p className="text-2xl font-bold text-[#111827]">{totalOrders}</p>
          <p className="text-sm text-[#6B7280]">Total Pesanan</p>
        </div>

        {/* Avg Order Value */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-[#8B5CF6]" />
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${
              avgChange >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
            }`}>
              {avgChange >= 0 ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {Math.abs(avgChange).toFixed(1)}%
            </div>
          </div>
          <p className="text-2xl font-bold text-[#111827]">{formatCurrency(avgOrderValue)}</p>
          <p className="text-sm text-[#6B7280]">Rata-rata Pesanan</p>
        </div>

        {/* Peak Hour */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#F59E0B]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#111827]">
            {peakHour[0].toString().padStart(2, '0')}:00
          </p>
          <p className="text-sm text-[#6B7280]">Jam Tersibuk ({peakHour[1]} pesanan)</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Orders by Status */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <h2 className="font-semibold text-[#111827] flex items-center gap-2">
              <PieChart className="w-4 h-4 text-orange-500" />
              Status Pesanan
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { status: 'completed', label: 'Selesai', color: '#10B981', count: ordersByStatus.completed },
                { status: 'preparing', label: 'Diproses', color: '#8B5CF6', count: ordersByStatus.preparing },
                { status: 'ready', label: 'Siap', color: 'orange-500', count: ordersByStatus.ready },
                { status: 'pending', label: 'Menunggu', color: '#F59E0B', count: ordersByStatus.pending },
                { status: 'cancelled', label: 'Dibatalkan', color: '#EF4444', count: ordersByStatus.cancelled },
              ].map((item) => {
                const percentage = totalOrders > 0 ? (item.count / totalOrders) * 100 : 0
                return (
                  <div key={item.status} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#374151]">{item.label}</span>
                      <span className="font-medium text-[#111827]">{item.count}</span>
                    </div>
                    <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: item.color
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Top Selling Items */}
        <div data-tour="analytics-top-items" className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <h2 className="font-semibold text-[#111827] flex items-center gap-2">
              <Star className="w-4 h-4 text-orange-500" />
              Menu Terlaris
            </h2>
          </div>
          <div className="p-6">
            {topItems.length > 0 ? (
              <div className="space-y-4">
                {topItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                      index === 0
                        ? 'bg-[#F59E0B]/10 text-[#F59E0B]'
                        : index === 1
                        ? 'bg-[#9CA3AF]/10 text-[#6B7280]'
                        : index === 2
                        ? 'bg-[#CD7F32]/10 text-[#CD7F32]'
                        : 'bg-[#F3F4F6] text-[#9CA3AF]'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#111827] truncate">{item.name}</p>
                      <p className="text-sm text-[#6B7280]">{item.quantity} terjual</p>
                    </div>
                    <p className="font-semibold text-[#111827]">{formatCurrency(item.revenue)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <UtensilsCrossed className="w-12 h-12 text-[#D1D5DB] mx-auto mb-3" />
                <p className="text-[#6B7280]">Belum ada data penjualan</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hourly Distribution */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="font-semibold text-[#111827] flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-orange-500" />
            Distribusi Pesanan per Jam
          </h2>
        </div>
        <div className="p-6">
          <div className="flex items-end gap-1 h-40">
            {Object.entries(hourlyOrders).map(([hour, count]) => {
              const maxCount = Math.max(...Object.values(hourlyOrders))
              const height = maxCount > 0 ? (count / maxCount) * 100 : 0
              const isActive = Number(hour) >= 10 && Number(hour) <= 21

              return (
                <div key={hour} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-t transition-all ${
                      isActive ? 'bg-orange-500' : 'bg-[#E5E7EB]'
                    }`}
                    style={{ height: `${Math.max(height, 4)}%` }}
                    title={`${hour}:00 - ${count} pesanan`}
                  />
                  {Number(hour) % 3 === 0 && (
                    <span className="text-[10px] text-[#9CA3AF]">{hour}</span>
                  )}
                </div>
              )
            })}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-orange-500" />
              <span className="text-sm text-[#6B7280]">Jam Operasional</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#E5E7EB]" />
              <span className="text-sm text-[#6B7280]">Di Luar Jam</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
