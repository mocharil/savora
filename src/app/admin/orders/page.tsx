// @ts-nocheck
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { getUserFromToken } from '@/lib/tenant-context'
import { redirect } from 'next/navigation'
import { OrdersPageClient } from './OrdersPageClient'
import {
  Clock,
  CheckCircle,
  ChefHat,
  Bell,
  CheckCheck,
  X,
  MapPin,
  Eye,
  Search,
  Calendar,
  Filter,
  Package
} from 'lucide-react'

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'

const statusConfig: Record<OrderStatus, {
  label: string
  bgColor: string
  textColor: string
  icon: React.ReactNode
}> = {
  pending: {
    label: 'Baru',
    bgColor: 'bg-[#F59E0B]/10',
    textColor: 'text-[#F59E0B]',
    icon: <Clock className="w-3.5 h-3.5" />
  },
  confirmed: {
    label: 'Dikonfirmasi',
    bgColor: 'bg-orange-500/10',
    textColor: 'text-orange-500',
    icon: <CheckCircle className="w-3.5 h-3.5" />
  },
  preparing: {
    label: 'Diproses',
    bgColor: 'bg-[#8B5CF6]/10',
    textColor: 'text-[#8B5CF6]',
    icon: <ChefHat className="w-3.5 h-3.5" />
  },
  ready: {
    label: 'Siap',
    bgColor: 'bg-[#10B981]/10',
    textColor: 'text-[#10B981]',
    icon: <Bell className="w-3.5 h-3.5" />
  },
  completed: {
    label: 'Selesai',
    bgColor: 'bg-[#6B7280]/10',
    textColor: 'text-[#6B7280]',
    icon: <CheckCheck className="w-3.5 h-3.5" />
  },
  cancelled: {
    label: 'Batal',
    bgColor: 'bg-[#EF4444]/10',
    textColor: 'text-[#EF4444]',
    icon: <X className="w-3.5 h-3.5" />
  },
}

const tabConfig = [
  { value: 'all', label: 'Semua' },
  { value: 'pending', label: 'Baru', highlight: true },
  { value: 'confirmed', label: 'Dikonfirmasi' },
  { value: 'preparing', label: 'Diproses' },
  { value: 'ready', label: 'Siap' },
  { value: 'completed', label: 'Selesai' },
]

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const supabase = createAdminClient()
  const { status: statusFilter } = await searchParams

  // Get user from token
  const user = await getUserFromToken()
  if (!user || !user.storeId) {
    redirect('/login')
  }

  const storeId = user.storeId

  // Get counts for each status
  const statusCounts: Record<string, number> = {}
  for (const status of ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']) {
    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', storeId)
      .eq('status', status)
    statusCounts[status] = count || 0
  }

  const totalCount = Object.values(statusCounts).reduce((a, b) => a + b, 0)

  let query = supabase
    .from('orders')
    .select(`
      *,
      table:tables(table_number, location),
      order_items(
        id,
        quantity,
        unit_price,
        menu_item:menu_items(name)
      )
    `)
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }

  const { data: orders } = await query

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <OrdersPageClient />

      {/* Tabs */}
      <div className="border-b-2 border-[#E5E7EB]" data-tour="orders-tabs">
        <div className="flex gap-0 overflow-x-auto hide-scrollbar">
          {tabConfig.map((tab) => {
            const isActive = (!statusFilter && tab.value === 'all') || statusFilter === tab.value
            const count = tab.value === 'all' ? totalCount : statusCounts[tab.value] || 0

            return (
              <Link
                key={tab.value}
                href={tab.value === 'all' ? '/admin/orders' : `/admin/orders?status=${tab.value}`}
                className={`relative flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'text-orange-500'
                    : 'text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    tab.highlight && !isActive && count > 0
                      ? 'bg-[#EF4444] text-white'
                      : isActive
                      ? 'bg-orange-500/10 text-orange-500'
                      : 'bg-[#F3F4F6] text-[#6B7280]'
                  }`}>
                    {count}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
                )}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-[#F9FAFB] rounded-xl p-4 border border-[#E5E7EB]">
        <div className="flex items-center gap-2 h-10 px-4 bg-white rounded-lg border border-[#E5E7EB] flex-1 min-w-[200px] max-w-sm" data-tour="orders-search">
          <Search className="w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Cari nomor pesanan..."
            className="flex-1 bg-transparent text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none"
          />
        </div>

        <button className="flex items-center gap-2 h-10 px-4 bg-white rounded-lg border border-[#E5E7EB] text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] transition-colors" data-tour="orders-date-filter">
          <Calendar className="w-4 h-4" />
          Hari Ini
        </button>

        <button className="flex items-center gap-2 h-10 px-4 bg-white rounded-lg border border-[#E5E7EB] text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Order List */}
      {orders && orders.length > 0 ? (
        <div className="space-y-4" data-tour="orders-list">
          {orders.map((order) => {
            const status = order.status as OrderStatus
            const statusInfo = statusConfig[status]
            const isPending = status === 'pending'
            const itemSummary = order.order_items
              ?.slice(0, 3)
              .map((item: any) => `${item.quantity}x ${item.menu_item?.name}`)
              .join(', ')

            return (
              <div
                key={order.id}
                className={`bg-white rounded-xl border ${
                  isPending ? 'border-[#10B981] border-2' : 'border-[#E5E7EB]'
                } overflow-hidden hover:shadow-admin-md transition-all cursor-pointer`}
              >
                <Link href={`/admin/orders/${order.id}`} className="block p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg font-bold text-[#111827]">
                          #{order.order_number}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                          {statusInfo.icon}
                          {statusInfo.label}
                        </span>
                        {isPending && (
                          <span className="px-2 py-1 rounded bg-[#10B981]/10 text-[#10B981] text-xs font-bold">
                            BARU!
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#6B7280]">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          Meja {order.table?.table_number || '-'}
                          {order.table?.location && ` (${order.table.location})`}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(order.created_at).toLocaleString('id-ID', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-orange-500">
                        {formatCurrency(order.total)}
                      </p>
                      <p className="text-xs text-[#9CA3AF]">
                        {order.order_items?.length || 0} item
                      </p>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="pt-4 border-t border-[#F3F4F6]">
                    <p className="text-sm text-[#6B7280] line-clamp-1">
                      {itemSummary}
                      {order.order_items?.length > 3 && (
                        <span className="text-[#9CA3AF]"> +{order.order_items.length - 3} lainnya</span>
                      )}
                    </p>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#F3F4F6]">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        order.payment_status === 'paid'
                          ? 'bg-[#10B981]/10 text-[#10B981]'
                          : 'bg-[#F59E0B]/10 text-[#F59E0B]'
                      }`}>
                        {order.payment_status === 'paid' ? 'Lunas' : 'Belum Bayar'}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-sm font-medium text-orange-500">
                      <Eye className="w-4 h-4" />
                      Lihat Detail
                    </span>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F3F4F6] flex items-center justify-center">
            <Package className="w-8 h-8 text-[#D1D5DB]" />
          </div>
          <p className="text-[#6B7280] font-medium">
            {statusFilter
              ? `Tidak ada pesanan dengan status ${statusConfig[statusFilter as OrderStatus]?.label.toLowerCase()}`
              : 'Belum ada pesanan'}
          </p>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Pesanan akan muncul di sini
          </p>
        </div>
      )}
    </div>
  )
}
