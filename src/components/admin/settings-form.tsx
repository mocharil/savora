'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import {
  Loader2,
  AlertCircle,
  Check,
  Clock,
  X,
  Save,
  ImageIcon,
  Store,
  MapPin,
  Phone,
  Globe,
  Shield,
  Palette,
  Receipt,
  CheckCircle
} from 'lucide-react'
import type { Store as StoreType } from '@/types/database'
import { PageTourButton } from '@/components/admin/tour'

interface SettingsFormProps {
  store: StoreType | null
}

type OperationalHours = {
  [key: string]: { open: string; close: string; isOpen: boolean }
}

const defaultOperationalHours: OperationalHours = {
  monday: { open: '09:00', close: '21:00', isOpen: true },
  tuesday: { open: '09:00', close: '21:00', isOpen: true },
  wednesday: { open: '09:00', close: '21:00', isOpen: true },
  thursday: { open: '09:00', close: '21:00', isOpen: true },
  friday: { open: '09:00', close: '21:00', isOpen: true },
  saturday: { open: '09:00', close: '21:00', isOpen: true },
  sunday: { open: '09:00', close: '21:00', isOpen: true },
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

export function SettingsForm({ store }: SettingsFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const logoInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState<'logo' | 'banner' | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Default theme settings
  const defaultThemeSettings = {
    primary_color: '#f97316', // Orange-500
    secondary_color: '#ef4444', // Red-500
    accent_color: '#10b981', // Emerald-500
    text_color: '#1f2937', // Gray-800
    background_color: '#ffffff', // White
  }

  const [formData, setFormData] = useState({
    name: store?.name || '',
    description: store?.description || '',
    address: store?.address || '',
    phone: store?.phone || '',
    website: '',
    logo_url: store?.logo_url || '',
    banner_url: store?.banner_url || '',
    tax_percentage: store?.tax_percentage || 10,
    service_charge_percentage: store?.service_charge_percentage || 0,
    operational_hours: (store?.operational_hours as OperationalHours) || defaultOperationalHours,
    is_active: store?.is_active ?? true,
    theme_settings: (store?.theme_settings as typeof defaultThemeSettings) || defaultThemeSettings,
  })

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'banner'
  ) => {
    const file = e.target.files?.[0]
    if (!file || !store) return

    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar')
      return
    }

    const maxSize = type === 'logo' ? 2 : 5 // Increased logo max size to 2MB
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Ukuran file maksimal ${maxSize}MB`)
      return
    }

    setUploading(type)
    setError('')

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${store.id}/${type}-${Date.now()}.${fileExt}`

      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('bucket', 'store-assets')
      uploadFormData.append('path', fileName)

      console.log('Uploading file:', { type, fileName, fileSize: file.size })

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      })

      const result = await response.json()
      console.log('Upload response:', result)

      if (!response.ok) {
        throw new Error(result.error || 'Upload gagal')
      }

      const fieldName = type === 'logo' ? 'logo_url' : 'banner_url'
      const newFormData = {
        ...formData,
        [fieldName]: result.publicUrl
      }

      setFormData(newFormData)

      // Auto-save to database after successful upload using API
      const updateResponse = await fetch('/api/store/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: fieldName, value: result.publicUrl })
      })

      const updateResult = await updateResponse.json()

      if (!updateResponse.ok) {
        console.error('Auto-save error:', updateResult.error)
        setError('Gambar terupload tapi gagal menyimpan. Silakan klik Simpan Perubahan.')
      } else {
        console.log('Auto-saved', fieldName, 'to database')
        setSuccess(true)
        router.refresh()
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (err: any) {
      console.error('Upload error:', err)
      setError('Gagal upload gambar: ' + err.message)
    } finally {
      setUploading(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!store) return

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Batch update all fields via API
      const response = await fetch('/api/store/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            name: formData.name,
            description: formData.description,
            address: formData.address,
            phone: formData.phone,
            logo_url: formData.logo_url,
            banner_url: formData.banner_url,
            tax_percentage: Number(formData.tax_percentage),
            service_charge_percentage: Number(formData.service_charge_percentage),
            operational_hours: formData.operational_hours,
            is_active: formData.is_active,
            theme_settings: formData.theme_settings,
          }
        })
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Gagal menyimpan pengaturan')
      }

      setSuccess(true)
      router.refresh()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateOperationalHours = (
    day: string,
    field: 'open' | 'close' | 'isOpen',
    value: string | boolean
  ) => {
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

  const updateThemeColor = (field: string, value: string) => {
    setFormData({
      ...formData,
      theme_settings: {
        ...formData.theme_settings,
        [field]: value
      }
    })
  }

  const resetThemeToDefault = () => {
    setFormData({
      ...formData,
      theme_settings: defaultThemeSettings
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan Toko</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola informasi bisnis, jam operasional, dan preferensi toko Anda</p>
        </div>
        <div className="flex items-center gap-3">
          <PageTourButton />
          <button
            type="submit"
            disabled={loading || success}
            data-tour="settings-save-btn"
            className="flex items-center gap-2 h-10 px-5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-sm font-medium hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 shadow-lg shadow-orange-500/25"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : success ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {loading ? 'Menyimpan...' : success ? 'Tersimpan!' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100">
          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <p className="text-sm text-emerald-600">Pengaturan berhasil disimpan!</p>
        </div>
      )}

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profil Toko - Spans 2 columns */}
        <div data-tour="settings-store-info" className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-red-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">Profil Toko</h2>
                <p className="text-xs text-gray-500">Informasi dasar restoran Anda</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex gap-6">
              {/* Logo Upload */}
              <div className="flex flex-col items-center">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={(e) => handleImageUpload(e, 'logo')}
                  className="hidden"
                />
                {formData.logo_url ? (
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 ring-4 ring-gray-50 shadow-lg">
                    <Image src={formData.logo_url} alt="Logo" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logo_url: '' })}
                      className="absolute -top-1 -right-1 p-1 bg-white rounded-full text-red-500 shadow-md hover:bg-red-50"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center ring-4 ring-gray-50">
                    <ImageIcon className="w-8 h-8 text-gray-300" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploading === 'logo'}
                  className="mt-3 text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                >
                  {uploading === 'logo' ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <>
                      <ImageIcon className="w-3 h-3" />
                      Ubah Logo
                    </>
                  )}
                </button>
              </div>

              {/* Form Fields */}
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                    <Store className="w-3.5 h-3.5" />
                    Nama Restoran
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Warung Savora"
                    className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="081234567890"
                    className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                </div>

                <div className="col-span-2">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    Alamat Lengkap
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Jl. Sudirman No. 123, Jakarta Selatan"
                    className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                </div>

                <div className="col-span-2">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    Website (opsional)
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://www.restoran-anda.com"
                    className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Banner Upload */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-2">
                <Palette className="w-3.5 h-3.5" />
                Banner Toko
              </label>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'banner')}
                className="hidden"
              />
              {formData.banner_url ? (
                <div className="relative aspect-[3/1] rounded-xl overflow-hidden bg-gray-100">
                  <Image src={formData.banner_url} alt="Banner" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, banner_url: '' })}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-red-500 shadow hover:bg-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  disabled={uploading === 'banner'}
                  className="w-full aspect-[3/1] rounded-xl border-2 border-dashed border-gray-200 hover:border-orange-400 bg-gray-50 hover:bg-orange-50/50 transition-all flex flex-col items-center justify-center gap-2"
                >
                  {uploading === 'banner' ? (
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                      <span className="text-sm text-gray-500">Klik untuk upload banner</span>
                      <span className="text-xs text-gray-400">Rekomendasi: 1200 x 400 pixel</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Jam Operasional */}
        <div data-tour="settings-operation" className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">Jam Operasional</h2>
                <p className="text-xs text-gray-500">Atur jadwal buka-tutup mingguan</p>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="space-y-2">
              {Object.entries(formData.operational_hours).map(([day, hours]) => (
                <div key={day} className={`flex items-center gap-3 p-2 rounded-lg ${hours.isOpen ? 'bg-white' : 'bg-red-50'}`}>
                  <span className={`w-16 text-xs font-semibold ${hours.isOpen ? 'text-gray-700' : 'text-red-500'}`}>
                    {dayNames[day]}
                  </span>
                  {hours.isOpen ? (
                    <>
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="time"
                          value={hours.open}
                          onChange={(e) => updateOperationalHours(day, 'open', e.target.value)}
                          className="h-8 px-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 outline-none focus:border-emerald-500"
                        />
                        <span className="text-gray-400 text-xs">-</span>
                        <input
                          type="time"
                          value={hours.close}
                          onChange={(e) => updateOperationalHours(day, 'close', e.target.value)}
                          className="h-8 px-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 outline-none focus:border-emerald-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => updateOperationalHours(day, 'isOpen', false)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-xs text-red-500 font-medium">Tutup</span>
                      <button
                        type="button"
                        onClick={() => updateOperationalHours(day, 'isOpen', true)}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        Buka
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pajak & Biaya Layanan */}
        <div data-tour="settings-payment" className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">Pajak & Biaya</h2>
                <p className="text-xs text-gray-500">Pengaturan PPN dan service charge</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  PPN (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.tax_percentage}
                    onChange={(e) => setFormData({ ...formData, tax_percentage: Number(e.target.value) })}
                    min="0"
                    max="100"
                    step="0.5"
                    className="w-full h-10 px-3 pr-10 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">%</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Service Charge (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.service_charge_percentage}
                    onChange={(e) => setFormData({ ...formData, service_charge_percentage: Number(e.target.value) })}
                    min="0"
                    max="100"
                    step="0.5"
                    className="w-full h-10 px-3 pr-10 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">%</span>
                </div>
              </div>
            </div>

            {/* Preview Kalkulasi */}
            <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
              <p className="text-xs font-medium text-gray-500 mb-3">Contoh Kalkulasi</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900 font-medium">Rp 100.000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">PPN ({formData.tax_percentage}%)</span>
                  <span className="text-gray-900">Rp {(100000 * formData.tax_percentage / 100).toLocaleString('id-ID')}</span>
                </div>
                {formData.service_charge_percentage > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service ({formData.service_charge_percentage}%)</span>
                    <span className="text-gray-900">Rp {(100000 * formData.service_charge_percentage / 100).toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-900 font-semibold">Total</span>
                  <span className="text-orange-600 font-bold">Rp {(100000 * (1 + formData.tax_percentage / 100 + formData.service_charge_percentage / 100)).toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Toko */}
        <div data-tour="settings-status" className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">Status Toko</h2>
                <p className="text-xs text-gray-500">Kelola ketersediaan toko</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-4">
              <div>
                <p className="text-sm font-medium text-gray-900">Status Aktif</p>
                <p className="text-xs text-gray-500 mt-0.5">Toko dapat menerima pesanan</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                className={`relative w-12 h-6 rounded-full transition-colors ${formData.is_active ? 'bg-emerald-500' : 'bg-gray-300'}`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${formData.is_active ? 'left-7' : 'left-1'}`}
                />
              </button>
            </div>

            <div className={`p-4 rounded-xl ${formData.is_active ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
              <div className="flex items-start gap-3">
                {formData.is_active ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                )}
                <div>
                  <p className={`text-sm font-medium ${formData.is_active ? 'text-emerald-700' : 'text-red-700'}`}>
                    {formData.is_active ? 'Toko sedang buka' : 'Toko sedang tutup'}
                  </p>
                  <p className={`text-xs mt-0.5 ${formData.is_active ? 'text-emerald-600' : 'text-red-600'}`}>
                    {formData.is_active
                      ? 'Pelanggan dapat melakukan pemesanan melalui QR Code'
                      : 'Pelanggan tidak dapat melakukan pemesanan saat ini'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Design Settings - Customer Theme */}
        <div data-tour="settings-design" className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-purple-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Tampilan Pelanggan</h2>
                  <p className="text-xs text-gray-500">Kustomisasi warna halaman pemesanan</p>
                </div>
              </div>
              <button
                type="button"
                onClick={resetThemeToDefault}
                className="text-xs font-medium text-violet-600 hover:text-violet-700 hover:underline"
              >
                Reset ke Default
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Primary Color */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Warna Utama
                </label>
                <div className="relative">
                  <input
                    type="color"
                    value={formData.theme_settings.primary_color}
                    onChange={(e) => updateThemeColor('primary_color', e.target.value)}
                    className="w-full h-12 rounded-xl cursor-pointer border-2 border-gray-200 hover:border-violet-400 transition-colors"
                  />
                  <div className="absolute -bottom-5 left-0 right-0 text-center">
                    <span className="text-[10px] text-gray-400 font-mono">{formData.theme_settings.primary_color}</span>
                  </div>
                </div>
              </div>

              {/* Secondary Color */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Warna Sekunder
                </label>
                <div className="relative">
                  <input
                    type="color"
                    value={formData.theme_settings.secondary_color}
                    onChange={(e) => updateThemeColor('secondary_color', e.target.value)}
                    className="w-full h-12 rounded-xl cursor-pointer border-2 border-gray-200 hover:border-violet-400 transition-colors"
                  />
                  <div className="absolute -bottom-5 left-0 right-0 text-center">
                    <span className="text-[10px] text-gray-400 font-mono">{formData.theme_settings.secondary_color}</span>
                  </div>
                </div>
              </div>

              {/* Accent Color */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Warna Aksen
                </label>
                <div className="relative">
                  <input
                    type="color"
                    value={formData.theme_settings.accent_color}
                    onChange={(e) => updateThemeColor('accent_color', e.target.value)}
                    className="w-full h-12 rounded-xl cursor-pointer border-2 border-gray-200 hover:border-violet-400 transition-colors"
                  />
                  <div className="absolute -bottom-5 left-0 right-0 text-center">
                    <span className="text-[10px] text-gray-400 font-mono">{formData.theme_settings.accent_color}</span>
                  </div>
                </div>
              </div>

              {/* Text Color */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Warna Teks
                </label>
                <div className="relative">
                  <input
                    type="color"
                    value={formData.theme_settings.text_color}
                    onChange={(e) => updateThemeColor('text_color', e.target.value)}
                    className="w-full h-12 rounded-xl cursor-pointer border-2 border-gray-200 hover:border-violet-400 transition-colors"
                  />
                  <div className="absolute -bottom-5 left-0 right-0 text-center">
                    <span className="text-[10px] text-gray-400 font-mono">{formData.theme_settings.text_color}</span>
                  </div>
                </div>
              </div>

              {/* Background Color */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Warna Latar
                </label>
                <div className="relative">
                  <input
                    type="color"
                    value={formData.theme_settings.background_color}
                    onChange={(e) => updateThemeColor('background_color', e.target.value)}
                    className="w-full h-12 rounded-xl cursor-pointer border-2 border-gray-200 hover:border-violet-400 transition-colors"
                  />
                  <div className="absolute -bottom-5 left-0 right-0 text-center">
                    <span className="text-[10px] text-gray-400 font-mono">{formData.theme_settings.background_color}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div className="mt-10 pt-6 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-4">Preview Tampilan</p>
              <div
                className="rounded-xl p-6 border-2 border-gray-200 overflow-hidden"
                style={{ backgroundColor: formData.theme_settings.background_color }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: formData.theme_settings.primary_color }}
                  >
                    <Store className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p
                      className="font-semibold text-sm"
                      style={{ color: formData.theme_settings.text_color }}
                    >
                      {formData.name || 'Nama Toko'}
                    </p>
                    <p
                      className="text-xs opacity-60"
                      style={{ color: formData.theme_settings.text_color }}
                    >
                      Halaman Pemesanan
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg text-white text-xs font-medium"
                    style={{
                      background: `linear-gradient(135deg, ${formData.theme_settings.primary_color}, ${formData.theme_settings.secondary_color})`
                    }}
                  >
                    Tombol Utama
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg text-xs font-medium border-2"
                    style={{
                      borderColor: formData.theme_settings.accent_color,
                      color: formData.theme_settings.accent_color
                    }}
                  >
                    Tombol Sekunder
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
