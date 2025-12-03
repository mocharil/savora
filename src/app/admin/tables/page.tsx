'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Plus,
  QrCode,
  Search,
  Users,
  CheckCircle,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { PageTourButton } from '@/components/admin/tour'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { TableStatus } from '@/types/database'

type TableWithStore = {
  id: string
  store_id: string
  table_number: string
  table_name: string | null
  capacity: number
  qr_code: string | null
  status: TableStatus
  is_active: boolean
  created_at: string
  updated_at: string
}

const statusConfig: Record<TableStatus, {
  label: string
  color: string
  bgColor: string
  dotColor: string
  gradient: string
}> = {
  available: {
    label: 'Tersedia',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    dotColor: 'bg-emerald-500',
    gradient: 'from-emerald-500 to-teal-500'
  },
  occupied: {
    label: 'Terisi',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    dotColor: 'bg-amber-500',
    gradient: 'from-amber-500 to-orange-500'
  },
  reserved: {
    label: 'Dipesan',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    dotColor: 'bg-blue-500',
    gradient: 'from-blue-500 to-indigo-500'
  },
  needs_cleaning: {
    label: 'Perlu Dibersihkan',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    dotColor: 'bg-red-500',
    gradient: 'from-red-500 to-rose-500'
  }
}

const filterTabs = [
  { value: 'all', label: 'Semua Status' },
  { value: 'available', label: 'Tersedia' },
  { value: 'occupied', label: 'Terisi' },
  { value: 'reserved', label: 'Dipesan' },
  { value: 'needs_cleaning', label: 'Perlu Dibersihkan' },
]

export default function TablesPage() {
  const supabase = createClient()
  const router = useRouter()
  const [tables, setTables] = useState<TableWithStore[]>([])
  const [storeSlug, setStoreSlug] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [releasingTable, setReleasingTable] = useState<string | null>(null)
  const [releaseError, setReleaseError] = useState<{ message: string; hasUnpaidOrders?: boolean } | null>(null)
  const [releaseSuccess, setReleaseSuccess] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      // Get current user's store from API
      const userResponse = await fetch('/api/auth/me')
      if (!userResponse.ok) {
        router.push('/login')
        return
      }
      const userData = await userResponse.json()
      const storeId = userData.user?.store_id

      if (!storeId) {
        router.push('/login')
        return
      }

      // Get store data for slug
      const { data: store } = await supabase
        .from('stores')
        .select('slug')
        .eq('id', storeId)
        .single()

      if (store) setStoreSlug(store.slug)

      const { data } = await supabase
        .from('tables')
        .select('*')
        .eq('store_id', storeId)
        .order('table_number')

      if (data) setTables(data as TableWithStore[])
      setLoading(false)
    }

    fetchData()
  }, [supabase, router])

  // Filter tables based on search and status
  const filteredTables = tables.filter(table => {
    const matchesSearch =
      table.table_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (table.table_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

    const matchesFilter = activeFilter === 'all' || table.status === activeFilter

    return matchesSearch && matchesFilter
  })

  // Handle release table
  const handleReleaseTable = async (tableId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setReleasingTable(tableId)
    setReleaseError(null)
    setReleaseSuccess(null)

    try {
      const response = await fetch(`/api/admin/tables/${tableId}/release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()

      if (!response.ok) {
        setReleaseError({
          message: data.message || data.error || 'Gagal mengosongkan meja',
          hasUnpaidOrders: data.hasUnpaidOrders
        })
        return
      }

      // Update local state
      setTables(prev => prev.map(table =>
        table.id === tableId
          ? { ...table, status: 'available' as TableStatus }
          : table
      ))
      setReleaseSuccess(data.message)

      // Clear success message after 3 seconds
      setTimeout(() => setReleaseSuccess(null), 3000)
    } catch (error) {
      setReleaseError({ message: 'Terjadi kesalahan. Silakan coba lagi.' })
    } finally {
      setReleasingTable(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Success Toast */}
      {releaseSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl shadow-lg">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span className="font-medium">{releaseSuccess}</span>
          </div>
        </div>
      )}

      {/* Error Toast - Modern Design */}
      {releaseError && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="relative bg-white rounded-2xl shadow-2xl shadow-red-500/10 border border-red-100 overflow-hidden max-w-sm">
            {/* Top accent bar */}
            <div className="h-1 bg-gradient-to-r from-red-500 to-orange-500" />

            <div className="p-4">
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/30">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm">Tidak Dapat Mengosongkan</h4>
                  <p className="text-gray-600 text-sm mt-0.5">{releaseError.message}</p>
                </div>
                <button
                  onClick={() => setReleaseError(null)}
                  className="flex-shrink-0 w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Action Button */}
              {releaseError.hasUnpaidOrders && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <Link
                    href="/admin/orders?payment=unpaid"
                    onClick={() => setReleaseError(null)}
                    className="flex items-center justify-center gap-2 w-full h-10 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-orange-500/25 hover:shadow-lg hover:shadow-orange-500/30"
                  >
                    <span>Lihat Pesanan Belum Bayar</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meja & QR Code</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola meja, pantau status, dan buat QR code untuk pemesanan pelanggan.</p>
        </div>
        <div className="flex items-center gap-3">
          <PageTourButton />
          <Link href="/admin/tables/create" data-tour="tables-add-btn">
            <ShimmerButton
              shimmerColor="#34d399"
              shimmerSize="0.08em"
              shimmerDuration="2.5s"
              borderRadius="9999px"
              background="linear-gradient(135deg, #10b981 0%, #059669 100%)"
              className="h-10 px-5 text-sm font-medium gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Tambah Meja
            </ShimmerButton>
          </Link>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-shrink-0 w-full sm:w-auto sm:min-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama atau nomor meja..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-white rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={`h-9 px-4 rounded-lg text-sm font-medium transition-all ${
                activeFilter === tab.value
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tables Grid */}
      {filteredTables.length > 0 ? (
        <div data-tour="tables-list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTables.map((table) => {
            const statusInfo = statusConfig[table.status]
            const isSelected = selectedTable === table.id

            return (
              <div
                key={table.id}
                onClick={() => setSelectedTable(isSelected ? null : table.id)}
                className={`relative bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl group ${
                  isSelected
                    ? 'ring-2 ring-orange-500 shadow-xl shadow-orange-100/50'
                    : 'border border-gray-100 shadow-md hover:border-gray-200 hover:shadow-lg'
                }`}
              >
                {/* Top Gradient Bar */}
                <div className={`h-1.5 bg-gradient-to-r ${statusInfo.gradient}`} />

                <div className="p-5">
                  {/* Table Number Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${statusInfo.gradient} flex items-center justify-center shadow-lg shadow-${statusInfo.dotColor.replace('bg-', '')}/30`}>
                        <span className="text-lg font-bold text-white">{table.table_number}</span>
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900">
                          {table.table_name || `Meja ${table.table_number}`}
                        </h3>
                        <div className="flex items-center gap-1 text-gray-500 mt-0.5">
                          <Users className="w-3.5 h-3.5" />
                          <span className="text-sm">{table.capacity} orang</span>
                        </div>
                      </div>
                    </div>

                    {/* Selected Indicator */}
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${statusInfo.bgColor} mb-4`}>
                    <span className={`w-2 h-2 rounded-full ${statusInfo.dotColor} animate-pulse`} />
                    <span className={`text-sm font-semibold ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    {/* Release Table Button - only show for occupied tables */}
                    {table.status === 'occupied' && (
                      <button
                        onClick={(e) => handleReleaseTable(table.id, e)}
                        disabled={releasingTable === table.id}
                        className="flex items-center justify-center gap-2 w-full h-11 rounded-xl text-sm font-semibold transition-all bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-200"
                      >
                        {releasingTable === table.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Memproses...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Kosongkan Meja
                          </>
                        )}
                      </button>
                    )}

                    {/* View QR Code Button */}
                    <Link
                      href={`/admin/tables/${table.id}/qr`}
                      onClick={(e) => e.stopPropagation()}
                      data-tour="tables-qr-download"
                      className={`flex items-center justify-center gap-2 w-full h-11 rounded-xl text-sm font-semibold transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md shadow-orange-200 hover:shadow-lg'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 group-hover:border-orange-200 group-hover:bg-orange-50 group-hover:text-orange-600'
                      }`}
                    >
                      <QrCode className="w-4 h-4" />
                      Lihat QR Code
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-16 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
            <QrCode className="w-10 h-10 text-gray-300" />
          </div>
          <p className="text-lg text-gray-700 font-semibold mb-2">
            {searchQuery || activeFilter !== 'all'
              ? 'Meja tidak ditemukan'
              : 'Belum ada meja'}
          </p>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            {searchQuery || activeFilter !== 'all'
              ? 'Coba ubah pencarian atau filter Anda'
              : 'Tambahkan meja untuk mulai mengelola QR code dan pemesanan pelanggan'}
          </p>
          {!searchQuery && activeFilter === 'all' && (
            <Link
              href="/admin/tables/create"
              className="inline-flex items-center gap-2 h-12 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-200"
            >
              <Plus className="w-4 h-4" />
              Tambah Meja Pertama
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
