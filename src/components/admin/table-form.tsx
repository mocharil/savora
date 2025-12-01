// @ts-nocheck
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Loader2,
  ArrowLeft,
  AlertCircle,
  Check,
  Trash2,
  Hash,
  MapPin,
  ToggleLeft,
  ToggleRight,
  QrCode,
  Copy,
  CheckCheck
} from 'lucide-react'
import type { Table } from '@/types/database'

interface Outlet {
  id: string
  name: string
  slug: string
}

interface TableFormProps {
  storeId: string
  outlets: Outlet[]
  initialData?: Table
}

export function TableForm({ storeId, outlets, initialData }: TableFormProps) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [copied, setCopied] = useState(false)

  // Default to first outlet if creating new table
  const defaultOutletId = initialData?.outlet_id || (outlets.length > 0 ? outlets[0].id : '')

  const [formData, setFormData] = useState({
    table_number: initialData?.table_number || '',
    outlet_id: defaultOutletId,
    location: initialData?.location || '',
    capacity: initialData?.capacity ?? 4,
    is_active: initialData?.is_active ?? true,
  })

  const generateQRCode = () => {
    return `TABLE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  }

  const handleCopyQRCode = async () => {
    if (initialData?.qr_code) {
      await navigator.clipboard.writeText(initialData.qr_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    // Validation
    if (!formData.table_number.trim()) {
      setError('Nomor meja harus diisi')
      setLoading(false)
      return
    }

    if (!formData.outlet_id) {
      setError('Outlet harus dipilih')
      setLoading(false)
      return
    }

    try {
      const dataToSave = {
        table_number: formData.table_number,
        outlet_id: formData.outlet_id,
        location: formData.location || null,
        capacity: Number(formData.capacity) || 4,
        is_active: formData.is_active,
        qr_code: initialData?.qr_code || generateQRCode(),
      }

      const url = initialData
        ? `/api/admin/tables/${initialData.id}`
        : '/api/admin/tables'

      const response = await fetch(url, {
        method: initialData ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save table')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/admin/tables')
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
      const response = await fetch(`/api/admin/tables/${initialData.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete table')
      }

      router.push('/admin/tables')
      router.refresh()
    } catch (err: any) {
      setError('Gagal menghapus meja: ' + err.message)
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Back Button */}
      <Link
        href="/admin/tables"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Meja
      </Link>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">
            {initialData ? `Edit Meja ${initialData.table_number}` : 'Tambah Meja Baru'}
          </h1>
          <p className="text-sm text-[#6B7280]">
            {initialData ? 'Update informasi meja' : 'Tambahkan meja baru untuk pemesanan'}
          </p>
        </div>
        {initialData && (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#EF4444] bg-[#EF4444]/5 rounded-lg hover:bg-[#EF4444]/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Hapus Meja
          </button>
        )}
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20">
          <AlertCircle className="w-5 h-5 text-[#EF4444] flex-shrink-0" />
          <p className="text-sm font-medium text-[#EF4444]">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20">
          <Check className="w-5 h-5 text-[#10B981] flex-shrink-0" />
          <p className="text-sm font-medium text-[#10B981]">
            Meja berhasil {initialData ? 'diupdate' : 'disimpan'}! Mengalihkan...
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E7EB]">
              <h2 className="font-semibold text-[#111827] flex items-center gap-2">
                <Hash className="w-4 h-4 text-[#3B82F6]" />
                Informasi Meja
              </h2>
            </div>
            <div className="p-6 space-y-5">
              {/* Outlet Selection */}
              <div className="space-y-2">
                <label htmlFor="outlet_id" className="block text-sm font-medium text-[#374151]">
                  Outlet <span className="text-[#EF4444]">*</span>
                </label>
                <select
                  id="outlet_id"
                  value={formData.outlet_id}
                  onChange={(e) => setFormData({ ...formData, outlet_id: e.target.value })}
                  className="w-full h-11 px-4 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all cursor-pointer"
                >
                  <option value="">Pilih Outlet</option>
                  {outlets.map((outlet) => (
                    <option key={outlet.id} value={outlet.id}>{outlet.name}</option>
                  ))}
                </select>
                <p className="text-xs text-[#6B7280]">
                  Meja akan terdaftar di outlet ini
                </p>
              </div>

              {/* Table Number */}
              <div className="space-y-2">
                <label htmlFor="table_number" className="block text-sm font-medium text-[#374151]">
                  Nomor Meja <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  id="table_number"
                  type="text"
                  value={formData.table_number}
                  onChange={(e) => setFormData({ ...formData, table_number: e.target.value })}
                  placeholder="Contoh: 1, A1, VIP-1"
                  className="w-full h-11 px-4 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all"
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label htmlFor="location" className="block text-sm font-medium text-[#374151]">
                  Lokasi
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                  <input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Contoh: Lantai 1, Area Smoking, Teras"
                    className="w-full h-11 pl-11 pr-4 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all"
                  />
                </div>
                <p className="text-xs text-[#6B7280]">
                  Lokasi digunakan untuk mengelompokkan meja di halaman admin
                </p>
              </div>

              {/* Capacity */}
              <div className="space-y-2">
                <label htmlFor="capacity" className="block text-sm font-medium text-[#374151]">
                  Kapasitas
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, capacity: Math.max(1, formData.capacity - 1) })}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#374151] font-medium transition-colors"
                  >
                    -
                  </button>
                  <input
                    id="capacity"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Math.max(1, Math.min(50, Number(e.target.value) || 1)) })}
                    className="w-20 h-10 px-3 text-center bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, capacity: Math.min(50, formData.capacity + 1) })}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#374151] font-medium transition-colors"
                  >
                    +
                  </button>
                  <span className="text-sm text-[#6B7280]">orang</span>
                </div>
                <p className="text-xs text-[#6B7280]">
                  Jumlah maksimal orang yang dapat duduk di meja ini
                </p>
              </div>

              {/* QR Code Info (Edit mode only) */}
              {initialData && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#374151]">
                    Kode QR
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg">
                      <code className="text-sm text-[#374151] font-mono">{initialData.qr_code}</code>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyQRCode}
                      className="h-11 px-3 bg-[#F3F4F6] rounded-lg border border-[#E5E7EB] hover:bg-[#E5E7EB] transition-colors"
                    >
                      {copied ? (
                        <CheckCheck className="w-4 h-4 text-[#10B981]" />
                      ) : (
                        <Copy className="w-4 h-4 text-[#6B7280]" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-[#6B7280]">
                    QR code tidak dapat diubah setelah dibuat
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Settings */}
        <div className="space-y-6">
          {/* Settings Card */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E7EB]">
              <h2 className="font-semibold text-[#111827]">Pengaturan</h2>
            </div>
            <div className="p-6">
              {/* Active Toggle */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                className="w-full flex items-center justify-between p-4 rounded-lg border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    formData.is_active ? 'bg-[#10B981]/10' : 'bg-[#F3F4F6]'
                  }`}>
                    {formData.is_active ? (
                      <ToggleRight className="w-5 h-5 text-[#10B981]" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-[#9CA3AF]" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-[#111827]">Meja Aktif</p>
                    <p className="text-xs text-[#6B7280]">
                      {formData.is_active ? 'Dapat menerima pesanan' : 'Tidak aktif'}
                    </p>
                  </div>
                </div>
                <div className={`w-12 h-7 rounded-full transition-colors ${
                  formData.is_active ? 'bg-[#10B981]' : 'bg-[#E5E7EB]'
                }`}>
                  <div className={`w-5 h-5 mt-1 rounded-full bg-white shadow-sm transition-transform ${
                    formData.is_active ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </div>
              </button>
            </div>
          </div>

          {/* QR Code Preview (Edit mode only) */}
          {initialData && (
            <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E5E7EB]">
                <h2 className="font-semibold text-[#111827] flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-[#3B82F6]" />
                  QR Code
                </h2>
              </div>
              <div className="p-6 text-center">
                <p className="text-sm text-[#6B7280] mb-4">
                  Lihat dan download QR code untuk meja ini
                </p>
                <Link
                  href={`/admin/tables/${initialData.id}/qr`}
                  className="inline-flex items-center gap-2 h-10 px-4 bg-[#3B82F6] text-white rounded-lg text-sm font-medium hover:bg-[#2563EB] transition-colors"
                >
                  <QrCode className="w-4 h-4" />
                  Lihat QR Code
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#E5E7EB]">
        <Link
          href="/admin/tables"
          className="h-11 px-6 inline-flex items-center justify-center rounded-lg text-sm font-medium text-[#374151] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
        >
          Batal
        </Link>
        <button
          type="submit"
          disabled={loading || success}
          className="h-11 px-6 inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium text-white bg-[#3B82F6] hover:bg-[#2563EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Menyimpan...
            </>
          ) : success ? (
            <>
              <Check className="w-4 h-4" />
              Tersimpan!
            </>
          ) : (
            initialData ? 'Update Meja' : 'Simpan Meja'
          )}
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#EF4444]/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-[#EF4444]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#111827]">Hapus Meja</h3>
                <p className="text-sm text-[#6B7280]">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>
            <p className="text-sm text-[#6B7280] mb-6">
              Apakah Anda yakin ingin menghapus <strong>Meja {initialData?.table_number}</strong>? QR code untuk meja ini tidak akan berfungsi lagi.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 h-10 px-4 rounded-lg text-sm font-medium text-[#374151] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 h-10 px-4 rounded-lg text-sm font-medium text-white bg-[#EF4444] hover:bg-[#DC2626] transition-colors disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  'Ya, Hapus'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
