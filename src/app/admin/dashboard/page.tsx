// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { getUserFromToken } from '@/lib/tenant-context'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Clock,
  MapPin,
  ChevronRight,
  UtensilsCrossed,
  Sparkles
} from 'lucide-react'
import { FTUEProgressCard } from '@/components/admin/ftue'
import { DashboardPageClient } from './DashboardPageClient'
import { DashboardAIInsights } from './DashboardAIInsights'

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'

const statusConfig: Record<OrderStatus, { label: string; bgColor: string; textColor: string }> = {
  pending: { label: 'Baru', bgColor: 'bg-[#F59E0B]/10', textColor: 'text-[#F59E0B]' },
  confirmed: { label: 'Dikonfirmasi', bgColor: 'bg-orange-500/10', textColor: 'text-orange-500' },
  preparing: { label: 'Diproses', bgColor: 'bg-[#8B5CF6]/10', textColor: 'text-[#8B5CF6]' },
  ready: { label: 'Siap', bgColor: 'bg-[#10B981]/10', textColor: 'text-[#10B981]' },
  completed: { label: 'Selesai', bgColor: 'bg-[#6B7280]/10', textColor: 'text-[#6B7280]' },
  cancelled: { label: 'Batal', bgColor: 'bg-[#EF4444]/10', textColor: 'text-[#EF4444]' },
}

export default async function DashboardPage() {
  const supabase = await createClient()

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

  // Fetch all orders count
  const { count: totalOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', storeId)

  // Calculate stats
  const todayRevenue = todayOrders
    ?.filter(o => o.payment_status === 'paid')
    .reduce((sum, o) => sum + o.total_amount, 0) || 0

  const yesterdayRevenue = yesterdayOrders
    ?.filter(o => o.payment_status === 'paid')
    .reduce((sum, o) => sum + o.total_amount, 0) || 0

  const todayOrderCount = todayOrders?.length || 0
  const yesterdayOrderCount = yesterdayOrders?.length || 0

  const revenueChange = yesterdayRevenue > 0
    ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100)
    : 0

  const orderChange = yesterdayOrderCount > 0
    ? ((todayOrderCount - yesterdayOrderCount) / yesterdayOrderCount * 100)
    : 0

  const avgOrderValue = todayOrderCount > 0 ? todayRevenue / todayOrderCount : 0
  const yesterdayAvgOrder = yesterdayOrderCount > 0 ? yesterdayRevenue / yesterdayOrderCount : 0
  const avgOrderChange = yesterdayAvgOrder > 0
    ? ((avgOrderValue - yesterdayAvgOrder) / yesterdayAvgOrder * 100)
    : 0

  // Fetch recent orders
  const { data: recentOrders } = await supabase
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
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch top menu items
  const { data: topMenuItems } = await supabase
    .from('order_items')
    .select(`
      menu_item_id,
      quantity,
      menu_item:menu_items(name, image_url)
    `)
    .eq('menu_items.store_id', storeId)
    .limit(100)

  // Aggregate top items
  const itemCounts = new Map<string, { name: string; count: number; imageUrl: string | null }>()
  topMenuItems?.forEach(item => {
    if (item.menu_item) {
      const current = itemCounts.get(item.menu_item_id) || {
        name: (item.menu_item as any).name,
        count: 0,
        imageUrl: (item.menu_item as any).image_url
      }
      current.count += item.quantity
      itemCounts.set(item.menu_item_id, current)
    }
  })
  const topItems = Array.from(itemCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* FTUE Progress Card */}
      <FTUEProgressCard />

      {/* Page Header */}
      <DashboardPageClient />

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4" data-tour="dashboard-stats">
        {/* Revenue Card */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-admin-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#6B7280]">Pendapatan Hari Ini</span>
            <div className="w-10 h-10 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[#10B981]" />
            </div>
          </div>
          <div className="text-3xl font-bold text-[#111827] mb-2">
            {formatCurrency(todayRevenue)}
          </div>
          <div className="flex items-center gap-1">
            {revenueChange >= 0 ? (
              <ArrowUpRight className="w-4 h-4 text-[#10B981]" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-[#EF4444]" />
            )}
            <span className={`text-sm font-medium ${revenueChange >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
              {Math.abs(revenueChange).toFixed(1)}%
            </span>
            <span className="text-xs text-[#9CA3AF]">dari kemarin</span>
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-admin-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#6B7280]">Pesanan Hari Ini</span>
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-orange-500" />
            </div>
          </div>
          <div className="text-3xl font-bold text-[#111827] mb-2">
            {todayOrderCount}
          </div>
          <div className="flex items-center gap-1">
            {orderChange >= 0 ? (
              <ArrowUpRight className="w-4 h-4 text-[#10B981]" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-[#EF4444]" />
            )}
            <span className={`text-sm font-medium ${orderChange >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
              {Math.abs(orderChange).toFixed(1)}%
            </span>
            <span className="text-xs text-[#9CA3AF]">dari kemarin</span>
          </div>
        </div>

        {/* Customers Card */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-admin-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#6B7280]">Total Pesanan</span>
            <div className="w-10 h-10 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#8B5CF6]" />
            </div>
          </div>
          <div className="text-3xl font-bold text-[#111827] mb-2">
            {totalOrders || 0}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-[#9CA3AF]">Semua waktu</span>
          </div>
        </div>

        {/* Avg Order Card */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-admin-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#6B7280]">Rata-rata Pesanan</span>
            <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#F59E0B]" />
            </div>
          </div>
          <div className="text-3xl font-bold text-[#111827] mb-2">
            {formatCurrency(avgOrderValue)}
          </div>
          <div className="flex items-center gap-1">
            {avgOrderChange >= 0 ? (
              <ArrowUpRight className="w-4 h-4 text-[#10B981]" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-[#EF4444]" />
            )}
            <span className={`text-sm font-medium ${avgOrderChange >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
              {Math.abs(avgOrderChange).toFixed(1)}%
            </span>
            <span className="text-xs text-[#9CA3AF]">dari kemarin</span>
          </div>
        </div>
      </div>

      {/* AI Insights Quick Preview */}
      <DashboardAIInsights />

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-admin-xs overflow-hidden" data-tour="dashboard-recent-orders">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
            <h3 className="text-lg font-semibold text-[#111827]">Pesanan Terbaru</h3>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1 text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors"
            >
              Lihat Semua
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {recentOrders && recentOrders.length > 0 ? (
            <div className="divide-y divide-[#F3F4F6]">
              {recentOrders.map((order) => {
                const status = order.status as OrderStatus
                const statusInfo = statusConfig[status]
                const itemSummary = order.order_items
                  .slice(0, 2)
                  .map((item: any) => `${item.quantity}x ${item.menu_item?.name}`)
                  .join(', ')

                return (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-[#F9FAFB] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="text-base font-semibold text-[#111827]">
                          #{order.order_number}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1 text-sm text-[#6B7280]">
                          <MapPin className="w-3 h-3" />
                          Meja {order.table?.table_number || '-'}
                        </span>
                        <span className="text-sm text-[#9CA3AF] truncate">
                          {itemSummary}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-base font-semibold text-[#111827]">
                        {formatCurrency(order.total_amount)}
                      </p>
                      <p className="flex items-center justify-end gap-1 text-xs text-[#9CA3AF]">
                        <Clock className="w-3 h-3" />
                        {new Date(order.created_at).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-[#D1D5DB]" />
              </div>
              <p className="text-[#6B7280] font-medium">Belum ada pesanan</p>
              <p className="text-sm text-[#9CA3AF]">Pesanan akan muncul di sini</p>
            </div>
          )}
        </div>

        {/* Popular Menu Items */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-admin-xs overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
            <h3 className="text-lg font-semibold text-[#111827]">Menu Populer</h3>
            <Link
              href="/admin/menu"
              className="flex items-center gap-1 text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors"
            >
              Kelola Menu
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {topItems.length > 0 ? (
            <div className="divide-y divide-[#F3F4F6]">
              {topItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 px-6 py-4"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#F3F4F6] text-sm font-bold text-[#6B7280]">
                    {index + 1}
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-[#F3F4F6] overflow-hidden flex-shrink-0">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UtensilsCrossed className="w-5 h-5 text-[#D1D5DB]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#111827] truncate">{item.name}</p>
                    <p className="text-sm text-[#6B7280]">{item.count} terjual</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-4">
                <UtensilsCrossed className="w-8 h-8 text-[#D1D5DB]" />
              </div>
              <p className="text-[#6B7280] font-medium">Belum ada data</p>
              <p className="text-sm text-[#9CA3AF]">Data penjualan akan muncul di sini</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
