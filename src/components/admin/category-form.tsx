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
  FileText,
  ToggleLeft,
  ToggleRight,
  ArrowUpDown
} from 'lucide-react'
import type { Category } from '@/types/database'

interface CategoryFormProps {
  storeId: string
  initialData?: Category
}

export function CategoryForm({ storeId, initialData }: CategoryFormProps) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    sort_order: initialData?.sort_order || 0,
    is_active: initialData?.is_active ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    // Validation
    if (!formData.name.trim()) {
      setError('Nama kategori harus diisi')
      setLoading(false)
      return
    }

    try {
      const dataToSave = {
        name: formData.name,
        description: formData.description || null,
        sort_order: Number(formData.sort_order),
        is_active: formData.is_active,
      }

      const url = initialData
        ? `/api/admin/categories/${initialData.id}`
        : '/api/admin/categories'

      const response = await fetch(url, {
        method: initialData ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save category')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/admin/categories')
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
      const response = await fetch(`/api/admin/categories/${initialData.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete category')
      }

      router.push('/admin/categories')
      router.refresh()
    } catch (err: any) {
      setError('Gagal menghapus kategori: ' + err.message)
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Back Button */}
      <Link
        href="/admin/categories"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Kategori
      </Link>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">
            {initialData ? 'Edit Kategori' : 'Tambah Kategori Baru'}
          </h1>
          <p className="text-sm text-[#6B7280]">
            {initialData ? 'Update informasi kategori' : 'Tambahkan kategori baru untuk mengorganisir menu'}
          </p>
        </div>
        {initialData && (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#EF4444] bg-[#EF4444]/5 rounded-lg hover:bg-[#EF4444]/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Hapus Kategori
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
            Kategori berhasil {initialData ? 'diupdate' : 'disimpan'}! Mengalihkan...
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E7EB]">
              <h2 className="font-semibold text-[#111827] flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-500" />
                Informasi Kategori
              </h2>
            </div>
            <div className="p-6 space-y-5">
              {/* Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-[#374151]">
                  Nama Kategori <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Makanan Utama"
                  className="w-full h-11 px-4 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-[#374151]">
                  Deskripsi
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi singkat tentang kategori ini..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all resize-none"
                />
              </div>

              {/* Sort Order */}
              <div className="space-y-2">
                <label htmlFor="sort_order" className="block text-sm font-medium text-[#374151]">
                  Urutan Tampilan
                </label>
                <div className="relative">
                  <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                  <input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                    placeholder="0"
                    min="0"
                    className="w-full h-11 pl-11 pr-4 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                </div>
                <p className="text-xs text-[#6B7280]">
                  Semakin kecil angka, semakin awal ditampilkan
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Settings */}
        <div>
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
                    <p className="text-sm font-medium text-[#111827]">Kategori Aktif</p>
                    <p className="text-xs text-[#6B7280]">
                      {formData.is_active ? 'Ditampilkan di menu' : 'Disembunyikan'}
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
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#E5E7EB]">
        <Link
          href="/admin/categories"
          className="h-11 px-6 inline-flex items-center justify-center rounded-lg text-sm font-medium text-[#374151] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
        >
          Batal
        </Link>
        <button
          type="submit"
          disabled={loading || success}
          className="h-11 px-6 inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            initialData ? 'Update Kategori' : 'Simpan Kategori'
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
                <h3 className="font-semibold text-[#111827]">Hapus Kategori</h3>
                <p className="text-sm text-[#6B7280]">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>
            <p className="text-sm text-[#6B7280] mb-6">
              Apakah Anda yakin ingin menghapus kategori <strong>{initialData?.name}</strong>? Menu dalam kategori ini tidak akan terhapus.
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
