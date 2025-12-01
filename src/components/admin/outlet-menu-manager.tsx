'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ArrowLeft,
  Loader2,
  Search,
  Check,
  X,
  RefreshCw,
  Filter,
  ChevronDown,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
}

interface MenuItem {
  id: string
  name: string
  price: number
  image_url: string | null
  is_available: boolean
  category: Category | null
  outlet_settings: {
    is_available: boolean
    price_override: number | null
  } | null
  effective_price: number
  effective_available: boolean
}

interface OutletMenuManagerProps {
  outlet: {
    id: string
    name: string
    slug: string
  }
  categories: Category[]
}

export function OutletMenuManager({ outlet, categories }: OutletMenuManagerProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showOnlyModified, setShowOnlyModified] = useState(false)

  // Local state for editing
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState<string>('')

  useEffect(() => {
    fetchMenuItems()
  }, [outlet.id])

  const fetchMenuItems = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/outlet-menu-settings?outlet_id=${outlet.id}`)
      if (!response.ok) throw new Error('Failed to fetch menu items')

      const data = await response.json()
      setMenuItems(data.items || [])
    } catch (error) {
      console.error('Error fetching menu items:', error)
      toast.error('Gagal memuat menu')
    } finally {
      setLoading(false)
    }
  }

  const toggleAvailability = async (item: MenuItem) => {
    setSaving(item.id)

    try {
      const newAvailable = !item.effective_available

      const response = await fetch('/api/admin/outlet-menu-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outlet_id: outlet.id,
          menu_item_id: item.id,
          is_available: newAvailable,
          price_override: item.outlet_settings?.price_override || null,
        }),
      })

      if (!response.ok) throw new Error('Failed to update')

      // Update local state
      setMenuItems(prev => prev.map(m => {
        if (m.id === item.id) {
          return {
            ...m,
            outlet_settings: {
              is_available: newAvailable,
              price_override: m.outlet_settings?.price_override || null,
            },
            effective_available: newAvailable,
          }
        }
        return m
      }))

      toast.success(newAvailable ? 'Menu tersedia' : 'Menu tidak tersedia')
    } catch (error) {
      console.error('Error toggling availability:', error)
      toast.error('Gagal mengubah status')
    } finally {
      setSaving(null)
    }
  }

  const updatePrice = async (item: MenuItem) => {
    const priceValue = editPrice ? parseFloat(editPrice) : null

    // Don't save if price hasn't changed
    if (priceValue === item.outlet_settings?.price_override) {
      setEditingItem(null)
      setEditPrice('')
      return
    }

    setSaving(item.id)

    try {
      const response = await fetch('/api/admin/outlet-menu-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outlet_id: outlet.id,
          menu_item_id: item.id,
          is_available: item.effective_available,
          price_override: priceValue,
        }),
      })

      if (!response.ok) throw new Error('Failed to update')

      // Update local state
      setMenuItems(prev => prev.map(m => {
        if (m.id === item.id) {
          return {
            ...m,
            outlet_settings: {
              is_available: m.effective_available,
              price_override: priceValue,
            },
            effective_price: priceValue ?? m.price,
          }
        }
        return m
      }))

      toast.success('Harga berhasil diubah')
    } catch (error) {
      console.error('Error updating price:', error)
      toast.error('Gagal mengubah harga')
    } finally {
      setSaving(null)
      setEditingItem(null)
      setEditPrice('')
    }
  }

  const resetToDefault = async (item: MenuItem) => {
    if (!item.outlet_settings) return

    setSaving(item.id)

    try {
      const response = await fetch(
        `/api/admin/outlet-menu-settings?outlet_id=${outlet.id}&menu_item_id=${item.id}`,
        { method: 'DELETE' }
      )

      if (!response.ok) throw new Error('Failed to reset')

      // Update local state
      setMenuItems(prev => prev.map(m => {
        if (m.id === item.id) {
          return {
            ...m,
            outlet_settings: null,
            effective_price: m.price,
            effective_available: m.is_available,
          }
        }
        return m
      }))

      toast.success('Reset ke default')
    } catch (error) {
      console.error('Error resetting:', error)
      toast.error('Gagal reset')
    } finally {
      setSaving(null)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  // Filter menu items
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category?.id === selectedCategory
    const matchesModified = !showOnlyModified || item.outlet_settings !== null

    return matchesSearch && matchesCategory && matchesModified
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/outlets"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Kelola Menu Outlet</h1>
            <p className="text-gray-500">{outlet.name}</p>
          </div>
        </div>
        <Button variant="outline" onClick={fetchMenuItems}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Catatan:</strong> Di halaman ini Anda dapat mengatur ketersediaan dan harga menu khusus untuk outlet <strong>{outlet.name}</strong>.
          Menu yang tidak diubah akan menggunakan harga dan status default dari Store.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari menu..."
            className="pl-9"
          />
        </div>

        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-10 px-3 pr-8 border rounded-md bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Kategori</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        <label className="flex items-center gap-2 px-3 border rounded-md bg-white cursor-pointer">
          <input
            type="checkbox"
            checked={showOnlyModified}
            onChange={(e) => setShowOnlyModified(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm">Hanya yang diubah</span>
        </label>
      </div>

      {/* Menu Items Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Menu</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Kategori</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Harga Default</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Harga Outlet</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">Tersedia</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  {menuItems.length === 0 ? 'Belum ada menu' : 'Tidak ada menu yang cocok'}
                </td>
              </tr>
            ) : (
              filteredItems.map(item => (
                <tr key={item.id} className={`hover:bg-gray-50 ${item.outlet_settings ? 'bg-amber-50/50' : ''}`}>
                  {/* Menu Name & Image */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No img</span>
                        </div>
                      )}
                      <span className="font-medium">{item.name}</span>
                      {item.outlet_settings && (
                        <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                          Custom
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3 text-gray-600">
                    {item.category?.name || '-'}
                  </td>

                  {/* Default Price */}
                  <td className="px-4 py-3 text-gray-600">
                    {formatPrice(item.price)}
                  </td>

                  {/* Outlet Price */}
                  <td className="px-4 py-3">
                    {editingItem === item.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          placeholder={item.price.toString()}
                          className="w-32 h-8"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') updatePrice(item)
                            if (e.key === 'Escape') {
                              setEditingItem(null)
                              setEditPrice('')
                            }
                          }}
                        />
                        <button
                          onClick={() => updatePrice(item)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          disabled={saving === item.id}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingItem(null)
                            setEditPrice('')
                          }}
                          className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingItem(item.id)
                          setEditPrice(item.outlet_settings?.price_override?.toString() || '')
                        }}
                        className={`px-2 py-1 rounded hover:bg-gray-100 ${
                          item.outlet_settings?.price_override
                            ? 'font-semibold text-amber-700'
                            : 'text-gray-500'
                        }`}
                      >
                        {item.outlet_settings?.price_override
                          ? formatPrice(item.outlet_settings.price_override)
                          : '(Default)'
                        }
                      </button>
                    )}
                  </td>

                  {/* Availability Toggle */}
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <button
                        onClick={() => toggleAvailability(item)}
                        disabled={saving === item.id}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          item.effective_available
                            ? 'bg-emerald-500'
                            : 'bg-gray-300'
                        }`}
                      >
                        {saving === item.id ? (
                          <Loader2 className="w-4 h-4 animate-spin absolute top-1 left-1 text-white" />
                        ) : (
                          <span
                            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                              item.effective_available ? 'left-7' : 'left-1'
                            }`}
                          />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    {item.outlet_settings && (
                      <button
                        onClick={() => resetToDefault(item)}
                        disabled={saving === item.id}
                        className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
                      >
                        Reset
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
        <span>Total: {menuItems.length} menu</span>
        <span>Custom: {menuItems.filter(m => m.outlet_settings).length} menu</span>
        <span>Tersedia: {menuItems.filter(m => m.effective_available).length} menu</span>
      </div>
    </div>
  )
}
