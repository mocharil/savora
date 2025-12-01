'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import {
  Loader2,
  ArrowLeft,
  Upload,
  X,
  ImageIcon,
  AlertCircle,
  Check,
  Star,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Tag,
  DollarSign,
  FileText,
  Layers,
  Plus
} from 'lucide-react'
import type { MenuItem, Category } from '@/types/database'

interface MenuFormProps {
  storeId: string
  categories: Category[]
  initialData?: MenuItem
}

export function MenuForm({ storeId, categories: initialCategories, initialData }: MenuFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Categories state (can be updated when new category is added)
  const [categories, setCategories] = useState<Category[]>(initialCategories)

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // New category modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [categoryError, setCategoryError] = useState('')

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    category_id: initialData?.category_id || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    discount_price: initialData?.discount_price || 0,
    is_available: initialData?.is_available ?? true,
    is_featured: initialData?.is_featured ?? false,
    image_url: initialData?.image_url || '',
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5MB')
      return
    }

    setUploading(true)
    setError('')

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${storeId}/${Date.now()}.${fileExt}`

      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('bucket', 'menu-images')
      uploadFormData.append('path', fileName)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      setFormData({ ...formData, image_url: result.publicUrl })
    } catch (err: any) {
      setError('Gagal mengupload gambar: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setFormData({ ...formData, image_url: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    // Validation
    if (!formData.name.trim()) {
      setError('Nama menu harus diisi')
      setLoading(false)
      return
    }

    if (!formData.category_id) {
      setError('Kategori harus dipilih')
      setLoading(false)
      return
    }

    if (formData.price <= 0) {
      setError('Harga harus lebih dari 0')
      setLoading(false)
      return
    }

    if (formData.discount_price && formData.discount_price >= formData.price) {
      setError('Harga diskon harus lebih kecil dari harga normal')
      setLoading(false)
      return
    }

    try {
      const dataToSave = {
        name: formData.name,
        category_id: formData.category_id,
        description: formData.description || null,
        price: Number(formData.price),
        discount_price: formData.discount_price ? Number(formData.discount_price) : null,
        is_available: formData.is_available,
        is_featured: formData.is_featured,
        image_url: formData.image_url || null,
      }

      const url = initialData
        ? `/api/admin/menu/${initialData.id}`
        : '/api/admin/menu'

      const response = await fetch(url, {
        method: initialData ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save menu')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/admin/menu')
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
      const response = await fetch(`/api/admin/menu/${initialData.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete menu')
      }

      router.push('/admin/menu')
      router.refresh()
    } catch (err: any) {
      setError('Gagal menghapus menu: ' + err.message)
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const discountPercentage = formData.discount_price && formData.price > 0
    ? Math.round(((formData.price - formData.discount_price) / formData.price) * 100)
    : 0

  // Handle creating new category
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setCategoryError('Nama kategori harus diisi')
      return
    }

    setCreatingCategory(true)
    setCategoryError('')

    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          is_active: true,
          sort_order: categories.length,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Gagal membuat kategori')
      }

      // Add new category to list and select it
      const newCategory = result.category
      setCategories([...categories, newCategory])
      setFormData({ ...formData, category_id: newCategory.id })

      // Close modal and reset
      setShowCategoryModal(false)
      setNewCategoryName('')
    } catch (err: any) {
      setCategoryError(err.message)
    } finally {
      setCreatingCategory(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Back Button */}
      <Link
        href="/admin/menu"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Menu
      </Link>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">
            {initialData ? 'Edit Menu' : 'Tambah Menu Baru'}
          </h1>
          <p className="text-sm text-[#6B7280]">
            {initialData ? 'Update informasi menu' : 'Tambahkan menu makanan atau minuman baru'}
          </p>
        </div>
        {initialData && (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#EF4444] bg-[#EF4444]/5 rounded-lg hover:bg-[#EF4444]/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Hapus Menu
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
            Menu berhasil {initialData ? 'diupdate' : 'disimpan'}! Mengalihkan...
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E7EB]">
              <h2 className="font-semibold text-[#111827] flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-500" />
                Informasi Dasar
              </h2>
            </div>
            <div className="p-6 space-y-5">
              {/* Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-[#374151]">
                  Nama Menu <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Nasi Goreng Spesial"
                  className="w-full h-11 px-4 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label htmlFor="category" className="block text-sm font-medium text-[#374151]">
                  Kategori <span className="text-[#EF4444]">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                    <select
                      id="category"
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="w-full h-11 pl-11 pr-4 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Pilih kategori</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(true)}
                    className="h-11 px-3 bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#E5E7EB] rounded-lg text-[#374151] transition-colors flex items-center gap-1.5"
                    title="Tambah Kategori Baru"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:inline">Baru</span>
                  </button>
                </div>
                {categories.length === 0 && (
                  <p className="text-xs text-[#F59E0B]">
                    Belum ada kategori. Klik tombol &quot;Baru&quot; untuk menambahkan kategori.
                  </p>
                )}
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
                  placeholder="Deskripsi singkat tentang menu ini..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E7EB]">
              <h2 className="font-semibold text-[#111827] flex items-center gap-2">
                <Tag className="w-4 h-4 text-orange-500" />
                Harga
              </h2>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Price */}
                <div className="space-y-2">
                  <label htmlFor="price" className="block text-sm font-medium text-[#374151]">
                    Harga Normal <span className="text-[#EF4444]">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#9CA3AF]">Rp</span>
                    <input
                      id="price"
                      type="number"
                      value={formData.price || ''}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      placeholder="0"
                      min="0"
                      className="w-full h-11 pl-12 pr-4 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Discount Price */}
                <div className="space-y-2">
                  <label htmlFor="discount_price" className="block text-sm font-medium text-[#374151]">
                    Harga Diskon
                    {discountPercentage > 0 && (
                      <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-[#10B981]/10 text-[#10B981] rounded">
                        -{discountPercentage}%
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#9CA3AF]">Rp</span>
                    <input
                      id="discount_price"
                      type="number"
                      value={formData.discount_price || ''}
                      onChange={(e) => setFormData({ ...formData, discount_price: Number(e.target.value) })}
                      placeholder="0"
                      min="0"
                      className="w-full h-11 pl-12 pr-4 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Price Preview */}
              {formData.price > 0 && (
                <div className="p-4 bg-[#F9FAFB] rounded-lg">
                  <p className="text-xs text-[#6B7280] mb-1">Preview Harga</p>
                  <div className="flex items-end gap-2">
                    <span className="text-xl font-bold text-orange-500">
                      {formatCurrency(formData.discount_price || formData.price)}
                    </span>
                    {formData.discount_price > 0 && formData.discount_price < formData.price && (
                      <span className="text-sm text-[#9CA3AF] line-through">
                        {formatCurrency(formData.price)}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Image & Settings */}
        <div className="space-y-6">
          {/* Image Upload Card */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E7EB]">
              <h2 className="font-semibold text-[#111827] flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-orange-500" />
                Foto Menu
              </h2>
            </div>
            <div className="p-6">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {formData.image_url ? (
                <div className="relative aspect-square rounded-lg overflow-hidden bg-[#F3F4F6]">
                  <Image
                    src={formData.image_url}
                    alt="Menu preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-[#EF4444] hover:bg-white transition-colors shadow-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full aspect-square rounded-lg border-2 border-dashed border-[#E5E7EB] hover:border-orange-500 bg-[#F9FAFB] hover:bg-orange-500/5 transition-all flex flex-col items-center justify-center gap-3"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                      <span className="text-sm text-[#6B7280]">Mengupload...</span>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                        <Upload className="w-6 h-6 text-orange-500" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-[#374151]">Upload Gambar</p>
                        <p className="text-xs text-[#9CA3AF] mt-1">PNG, JPG maksimal 5MB</p>
                      </div>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Settings Card */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E7EB]">
              <h2 className="font-semibold text-[#111827]">Pengaturan</h2>
            </div>
            <div className="p-6 space-y-4">
              {/* Available Toggle */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_available: !formData.is_available })}
                className="w-full flex items-center justify-between p-4 rounded-lg border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    formData.is_available ? 'bg-[#10B981]/10' : 'bg-[#F3F4F6]'
                  }`}>
                    {formData.is_available ? (
                      <ToggleRight className="w-5 h-5 text-[#10B981]" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-[#9CA3AF]" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-[#111827]">Tersedia</p>
                    <p className="text-xs text-[#6B7280]">
                      {formData.is_available ? 'Menu dapat dipesan' : 'Menu tidak tersedia'}
                    </p>
                  </div>
                </div>
                <div className={`w-12 h-7 rounded-full transition-colors ${
                  formData.is_available ? 'bg-[#10B981]' : 'bg-[#E5E7EB]'
                }`}>
                  <div className={`w-5 h-5 mt-1 rounded-full bg-white shadow-sm transition-transform ${
                    formData.is_available ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </div>
              </button>

              {/* Featured Toggle */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_featured: !formData.is_featured })}
                className="w-full flex items-center justify-between p-4 rounded-lg border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    formData.is_featured ? 'bg-[#F59E0B]/10' : 'bg-[#F3F4F6]'
                  }`}>
                    <Star className={`w-5 h-5 ${
                      formData.is_featured ? 'text-[#F59E0B] fill-current' : 'text-[#9CA3AF]'
                    }`} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-[#111827]">Menu Unggulan</p>
                    <p className="text-xs text-[#6B7280]">
                      {formData.is_featured ? 'Ditampilkan di beranda' : 'Menu biasa'}
                    </p>
                  </div>
                </div>
                <div className={`w-12 h-7 rounded-full transition-colors ${
                  formData.is_featured ? 'bg-[#F59E0B]' : 'bg-[#E5E7EB]'
                }`}>
                  <div className={`w-5 h-5 mt-1 rounded-full bg-white shadow-sm transition-transform ${
                    formData.is_featured ? 'translate-x-6' : 'translate-x-1'
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
          href="/admin/menu"
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
            initialData ? 'Update Menu' : 'Simpan Menu'
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
                <h3 className="font-semibold text-[#111827]">Hapus Menu</h3>
                <p className="text-sm text-[#6B7280]">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>
            <p className="text-sm text-[#6B7280] mb-6">
              Apakah Anda yakin ingin menghapus <strong>{initialData?.name}</strong> dari menu?
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

      {/* New Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Layers className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h3 className="font-semibold text-[#111827]">Tambah Kategori Baru</h3>
                <p className="text-sm text-[#6B7280]">Buat kategori untuk mengorganisir menu</p>
              </div>
            </div>

            {categoryError && (
              <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20">
                <AlertCircle className="w-4 h-4 text-[#EF4444] flex-shrink-0" />
                <p className="text-sm text-[#EF4444]">{categoryError}</p>
              </div>
            )}

            <div className="space-y-2 mb-6">
              <label htmlFor="newCategoryName" className="block text-sm font-medium text-[#374151]">
                Nama Kategori <span className="text-[#EF4444]">*</span>
              </label>
              <input
                id="newCategoryName"
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Contoh: Makanan Utama, Minuman, Snack"
                className="w-full h-11 px-4 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleCreateCategory()
                  }
                }}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowCategoryModal(false)
                  setNewCategoryName('')
                  setCategoryError('')
                }}
                className="flex-1 h-10 px-4 rounded-lg text-sm font-medium text-[#374151] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCreateCategory}
                disabled={creatingCategory}
                className="flex-1 h-10 px-4 rounded-lg text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {creatingCategory ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Membuat...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Tambah
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
