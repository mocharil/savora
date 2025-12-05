'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Loader2,
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Mail,
  Hash,
  Percent,
  Clock,
  Star,
  AlertCircle,
  Check,
  Trash2
} from 'lucide-react'
import { Outlet, OperationalHours } from '@/types/outlet'

interface OutletFormProps {
  storeId: string
  initialData?: Outlet
}

const defaultOperationalHours: OperationalHours = {
  monday: { open: '09:00', close: '21:00', isOpen: true },
  tuesday: { open: '09:00', close: '21:00', isOpen: true },
  wednesday: { open: '09:00', close: '21:00', isOpen: true },
  thursday: { open: '09:00', close: '21:00', isOpen: true },
  friday: { open: '09:00', close: '21:00', isOpen: true },
  saturday: { open: '09:00', close: '22:00', isOpen: true },
  sunday: { open: '09:00', close: '22:00', isOpen: true },
}

const dayNames: Record<string, string> = {
  monday: 'Senin',
  tuesday: 'Selasa',
  wednesday: 'Rabu',
  thursday: 'Kamis',
  friday: 'Jumat',
  saturday: 'Sabtu',
  sunday: 'Minggu',
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function OutletForm({ storeId, initialData }: OutletFormProps) {
  const router = useRouter()
  const isEditing = !!initialData

  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    code: initialData?.code || '',
    address: initialData?.address || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    is_main: initialData?.is_main || false,
    is_active: initialData?.is_active ?? true,
    tax_percentage: initialData?.tax_percentage || 11,
    service_charge_percentage: initialData?.service_charge_percentage || 0,
    operational_hours: (initialData?.operational_hours as OperationalHours) || defaultOperationalHours,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    if (!formData.name.trim()) {
      setError('Nama outlet harus diisi')
      setLoading(false)
      return
    }

    try {
      const slug = generateSlug(formData.name)
      const payload = {
        store_id: storeId,
        name: formData.name,
        slug: isEditing ? initialData.slug : slug + '-' + Date.now().toString(36).slice(-4),
        code: formData.code || null,
        address: formData.address || null,
        phone: formData.phone || null,
        email: formData.email || null,
        is_main: formData.is_main,
        is_active: formData.is_active,
        tax_percentage: Number(formData.tax_percentage),
        service_charge_percentage: Number(formData.service_charge_percentage),
        operational_hours: formData.operational_hours,
      }

      const url = isEditing
        ? `/api/outlets/${initialData.id}`
        : '/api/outlets'

      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan outlet')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/admin/outlets')
        router.refresh()
      }, 1000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!initialData) return

    setDeleting(true)
    setError('')

    try {
      const res = await fetch(`/api/outlets/${initialData.id}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Gagal menghapus outlet')
      }

      router.push('/admin/outlets')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setShowDeleteConfirm(false)
    } finally {
      setDeleting(false)
    }
  }

  const handleHoursChange = (day: string, field: 'open' | 'close' | 'isOpen', value: string | boolean) => {
    setFormData({
      ...formData,
      operational_hours: {
        ...formData.operational_hours,
        [day]: {
          ...formData.operational_hours[day],
          [field]: value
        }
      }
    })
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back Button */}
      <Link
        href="/admin/outlets"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 group mb-6"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Kembali</span>
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Outlet' : 'Tambah Outlet Baru'}
        </h1>
        <p className="text-gray-500 mt-1">
          {isEditing ? 'Perbarui informasi outlet' : 'Tambah cabang baru untuk restoran Anda'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error/Success Messages */}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            <Check className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">Outlet berhasil disimpan!</p>
          </div>
        )}

        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gray-400" />
            Informasi Dasar
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Outlet *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Outlet Bandung"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kode Outlet
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="BDG01"
                  maxLength={10}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alamat
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Jl. Sudirman No. 123, Bandung"
                rows={2}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telepon
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="081234567890"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="outlet@email.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-6 pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_main}
                onChange={(e) => setFormData({ ...formData, is_main: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="flex items-center gap-2 text-sm text-gray-700">
                <Star className="w-4 h-4 text-yellow-500" />
                Outlet Pusat
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">Aktif</span>
            </label>
          </div>
        </div>

        {/* Tax & Service */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Percent className="w-5 h-5 text-gray-400" />
            Pajak & Biaya Layanan
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pajak (%)
              </label>
              <input
                type="number"
                value={formData.tax_percentage}
                onChange={(e) => setFormData({ ...formData, tax_percentage: Number(e.target.value) })}
                min={0}
                max={100}
                step={0.5}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Biaya Layanan (%)
              </label>
              <input
                type="number"
                value={formData.service_charge_percentage}
                onChange={(e) => setFormData({ ...formData, service_charge_percentage: Number(e.target.value) })}
                min={0}
                max={100}
                step={0.5}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Operational Hours */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" />
            Jam Operasional
          </h2>

          <div className="space-y-3">
            {Object.entries(dayNames).map(([key, label]) => (
              <div key={key} className="flex items-center gap-4">
                <label className="flex items-center gap-2 w-24">
                  <input
                    type="checkbox"
                    checked={formData.operational_hours[key]?.isOpen ?? true}
                    onChange={(e) => handleHoursChange(key, 'isOpen', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>

                {formData.operational_hours[key]?.isOpen && (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={formData.operational_hours[key]?.open || '09:00'}
                      onChange={(e) => handleHoursChange(key, 'open', e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="time"
                      value={formData.operational_hours[key]?.close || '21:00'}
                      onChange={(e) => handleHoursChange(key, 'close', e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                )}

                {!formData.operational_hours[key]?.isOpen && (
                  <span className="text-sm text-gray-400">Tutup</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4">
          {isEditing && !initialData.is_main && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Hapus Outlet
            </button>
          )}

          <div className={`flex items-center gap-3 ${isEditing && !initialData.is_main ? '' : 'ml-auto'}`}>
            <Link
              href="/admin/outlets"
              className="px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEditing ? 'Update Outlet' : 'Tambah Outlet'}
            </button>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Hapus Outlet?</h3>
            <p className="text-gray-600 mb-4">
              Outlet &quot;{initialData?.name}&quot; akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
