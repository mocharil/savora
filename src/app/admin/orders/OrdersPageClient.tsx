'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
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
  Package,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  SortAsc,
  SortDesc
} from 'lucide-react'

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'
type SortField = 'created_at' | 'total' | 'order_number'
type SortOrder = 'asc' | 'desc'

const statusConfig: Record<OrderStatus, {
  label: string
  bgColor: string
  textColor: string
  icon: React.ReactNode
}> = {
  pending: {
    label: 'Baru',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    icon: <Clock className="w-3 h-3" />
  },
  confirmed: {
    label: 'Dikonfirmasi',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    icon: <CheckCircle className="w-3 h-3" />
  },
  preparing: {
    label: 'Diproses',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    icon: <ChefHat className="w-3 h-3" />
  },
  ready: {
    label: 'Siap',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
    icon: <Bell className="w-3 h-3" />
  },
  completed: {
    label: 'Selesai',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    icon: <CheckCheck className="w-3 h-3" />
  },
  cancelled: {
    label: 'Batal',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    icon: <X className="w-3 h-3" />
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

interface Order {
  id: string
  order_number: string
  status: OrderStatus
  total: number
  payment_status: string
  created_at: string
  customer_name?: string
  table?: {
    table_number: number
    location?: string
  }
  order_items?: Array<{
    id: string
    quantity: number
    unit_price: number
    menu_item?: { name: string }
  }>
}

interface OrdersPageClientProps {
  orders: Order[]
  statusCounts: Record<string, number>
}

const ITEMS_PER_PAGE = 10

export function OrdersPageClient({ orders, statusCounts }: OrdersPageClientProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week'>('all')

  // Calculate total count
  const totalCount = Object.values(statusCounts).reduce((a, b) => a + b, 0)

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    let result = [...orders]

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(order =>
        order.order_number.toLowerCase().includes(query) ||
        order.customer_name?.toLowerCase().includes(query) ||
        order.table?.table_number.toString().includes(query)
      )
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

      result = result.filter(order => {
        const orderDate = new Date(order.created_at)
        if (dateFilter === 'today') {
          return orderDate >= today
        } else if (dateFilter === 'week') {
          return orderDate >= weekAgo
        }
        return true
      })
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0
      if (sortField === 'created_at') {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      } else if (sortField === 'total') {
        comparison = a.total - b.total
      } else if (sortField === 'order_number') {
        comparison = a.order_number.localeCompare(b.order_number)
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return result
  }, [orders, statusFilter, searchQuery, sortField, sortOrder, dateFilter])

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE)
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Reset page when filter changes
  const handleStatusChange = (status: string) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
    setCurrentPage(1)
  }

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pesanan</h1>
          <p className="text-sm text-gray-500">Kelola pesanan dari pelanggan</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-0 overflow-x-auto hide-scrollbar">
          {tabConfig.map((tab) => {
            const isActive = statusFilter === tab.value
            const count = tab.value === 'all' ? totalCount : statusCounts[tab.value] || 0

            return (
              <button
                key={tab.value}
                onClick={() => handleStatusChange(tab.value)}
                className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'text-orange-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                    tab.highlight && !isActive && count > 0
                      ? 'bg-red-500 text-white'
                      : isActive
                      ? 'bg-orange-100 text-orange-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {count}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Search */}
        <div className="flex items-center gap-2 h-9 px-3 bg-white rounded-lg border border-gray-200 flex-1 min-w-[180px] max-w-xs">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari pesanan..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
          />
        </div>

        {/* Date Filter */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {[
            { value: 'all', label: 'Semua' },
            { value: 'today', label: 'Hari Ini' },
            { value: 'week', label: '7 Hari' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => { setDateFilter(option.value as any); setCurrentPage(1) }}
              className={`px-3 py-2 text-xs font-medium transition-colors ${
                dateFilter === option.value
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleSort('created_at')}
            className={`flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
              sortField === 'created_at'
                ? 'bg-orange-50 border-orange-200 text-orange-600'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Waktu
            {sortField === 'created_at' && (
              sortOrder === 'desc' ? <SortDesc className="w-3 h-3" /> : <SortAsc className="w-3 h-3" />
            )}
          </button>
          <button
            onClick={() => toggleSort('total')}
            className={`flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
              sortField === 'total'
                ? 'bg-orange-50 border-orange-200 text-orange-600'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Total
            {sortField === 'total' && (
              sortOrder === 'desc' ? <SortDesc className="w-3 h-3" /> : <SortAsc className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          Menampilkan {paginatedOrders.length} dari {filteredOrders.length} pesanan
        </span>
        {totalPages > 1 && (
          <span>Halaman {currentPage} dari {totalPages}</span>
        )}
      </div>

      {/* Order List - Compact Table Style */}
      {paginatedOrders.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">Pesanan</th>
                <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">Meja</th>
                <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">Item</th>
                <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">Total</th>
                <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">Pembayaran</th>
                <th className="text-right text-xs font-semibold text-gray-600 px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedOrders.map((order) => {
                const status = order.status as OrderStatus
                const statusInfo = statusConfig[status]
                const isPending = status === 'pending'
                const itemCount = order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0

                return (
                  <tr
                    key={order.id}
                    className={`hover:bg-gray-50 transition-colors ${isPending ? 'bg-amber-50/50' : ''}`}
                  >
                    {/* Order Number & Time */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 text-sm">
                          #{order.order_number}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: '2-digit',
                            month: 'short'
                          })}
                        </span>
                      </div>
                    </td>

                    {/* Table - Highlighted */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold">
                        <MapPin className="w-3 h-3" />
                        {order.table?.table_number || '-'}
                      </span>
                    </td>

                    {/* Items */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">{itemCount} item</span>
                    </td>

                    {/* Total */}
                    <td className="px-4 py-3">
                      <span className="font-semibold text-gray-900 text-sm">
                        {formatCurrency(order.total)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                        {statusInfo.icon}
                        {statusInfo.label}
                      </span>
                    </td>

                    {/* Payment Status */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        order.payment_status === 'paid'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {order.payment_status === 'paid' ? 'Lunas' : 'Belum Bayar'}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-orange-600 hover:bg-orange-50 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Detail
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
            <Package className="w-7 h-7 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium">
            {searchQuery
              ? 'Tidak ada pesanan yang cocok'
              : statusFilter !== 'all'
              ? `Tidak ada pesanan ${statusConfig[statusFilter as OrderStatus]?.label.toLowerCase()}`
              : 'Belum ada pesanan'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {searchQuery ? 'Coba kata kunci lain' : 'Pesanan akan muncul di sini'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Sebelumnya
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => {
                // Show first, last, current, and adjacent pages
                return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1
              })
              .map((page, index, array) => {
                // Add ellipsis
                const prevPage = array[index - 1]
                const showEllipsis = prevPage && page - prevPage > 1

                return (
                  <div key={page} className="flex items-center gap-1">
                    {showEllipsis && (
                      <span className="px-2 text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-orange-500 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  </div>
                )
              })}
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Selanjutnya
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
