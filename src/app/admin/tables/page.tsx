'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Plus,
  QrCode,
  Search,
  Users
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
  dotColor: string
}> = {
  available: {
    label: 'Available',
    color: 'text-emerald-500',
    dotColor: 'bg-emerald-500'
  },
  occupied: {
    label: 'Occupied',
    color: 'text-amber-500',
    dotColor: 'bg-amber-500'
  },
  reserved: {
    label: 'Reserved',
    color: 'text-orange-500',
    dotColor: 'bg-orange-500'
  },
  needs_cleaning: {
    label: 'Needs Cleaning',
    color: 'text-red-500',
    dotColor: 'bg-red-500'
  }
}

const filterTabs = [
  { value: 'all', label: 'All Statuses' },
  { value: 'available', label: 'Available' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'needs_cleaning', label: 'Needs Cleaning' },
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Table & QR Code Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage tables, track status, and generate QR codes for customer ordering.</p>
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
              Add New Table
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
            placeholder="Search by table name or number..."
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
                className={`relative bg-white rounded-xl p-5 cursor-pointer transition-all hover:shadow-lg ${
                  isSelected
                    ? 'border-2 border-orange-500 shadow-lg ring-4 ring-orange-50'
                    : 'border border-gray-100 shadow-sm hover:border-gray-200'
                }`}
              >
                {/* Selected Badge */}
                {isSelected && (
                  <div className="absolute -top-2.5 right-4 bg-orange-500 text-white text-xs font-medium px-2.5 py-1 rounded-md shadow-sm">
                    Selected
                  </div>
                )}

                {/* Table Header */}
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-900">
                    {table.table_name || `Table ${table.table_number}`}
                  </h3>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">{table.capacity}</span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-1.5 mb-4">
                  <span className={`w-2 h-2 rounded-full ${statusInfo.dotColor}`} />
                  <span className={`text-sm font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>

                {/* View QR Code Button */}
                <Link
                  href={`/admin/tables/${table.id}/qr`}
                  onClick={(e) => e.stopPropagation()}
                  data-tour="tables-qr-download"
                  className={`flex items-center justify-center gap-2 w-full h-10 rounded-lg text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-sm'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  View QR Code
                </Link>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
            <QrCode className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-600 font-medium mb-1">
            {searchQuery || activeFilter !== 'all'
              ? 'No tables found'
              : 'No tables yet'}
          </p>
          <p className="text-sm text-gray-400 mb-6">
            {searchQuery || activeFilter !== 'all'
              ? 'Try adjusting your search or filter'
              : 'Add tables to start managing QR codes'}
          </p>
          {!searchQuery && activeFilter === 'all' && (
            <Link
              href="/admin/tables/create"
              className="inline-flex items-center gap-2 h-10 px-5 bg-emerald-500 text-white rounded-full text-sm font-medium hover:bg-emerald-600 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add First Table
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
