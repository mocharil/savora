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
  CreditCard,
  Store,
  MapPin,
  Phone,
  Globe,
  Bell,
  Shield,
  Palette,
  QrCode,
  Receipt,
  Settings,
  HelpCircle,
  ExternalLink,
  Copy,
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
  monday: { open: '09:00', close: '22:00', isOpen: true },
  tuesday: { open: '09:00', close: '22:00', isOpen: true },
  wednesday: { open: '09:00', close: '22:00', isOpen: true },
  thursday: { open: '09:00', close: '23:00', isOpen: true },
  friday: { open: '09:00', close: '23:00', isOpen: true },
  saturday: { open: '10:00', close: '23:59', isOpen: true },
  sunday: { open: '10:00', close: '22:00', isOpen: false },
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

const formatTimeToAMPM = (time24: string): string => {
  const [hours, minutes] = time24.split(':').map(Number)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
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
  const [copied, setCopied] = useState(false)

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
  })

  const storeUrl = store?.slug ? `${typeof window !== 'undefined' ? window.location.origin : ''}/${store.slug}/order` : ''

  const copyStoreUrl = () => {
    if (storeUrl) {
      navigator.clipboard.writeText(storeUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'banner'
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar')
      return
    }

    const maxSize = type === 'logo' ? 1 : 5
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Ukuran file maksimal ${maxSize}MB`)
      return
    }

    setUploading(type)
    setError('')

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${store?.id}/${type}-${Date.now()}.${fileExt}`

      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('bucket', 'store-assets')
      uploadFormData.append('path', fileName)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload gagal')
      }

      setFormData({
        ...formData,
        [type === 'logo' ? 'logo_url' : 'banner_url']: result.publicUrl
      })
    } catch (err: any) {
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
      const { error } = await supabase
        .from('stores')
        .update({
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
        })
        .eq('id', store.id)

      if (error) throw error

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

        {/* Link Toko */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-purple-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">Link Pemesanan</h2>
                <p className="text-xs text-gray-500">URL untuk pelanggan</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <p className="text-xs text-gray-500 mb-3">
              Bagikan link ini kepada pelanggan atau cetak QR Code untuk meja restoran
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={storeUrl}
                readOnly
                className="flex-1 h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 truncate"
              />
              <button
                type="button"
                onClick={copyStoreUrl}
                className="h-10 w-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 h-10 w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-violet-600 hover:to-purple-700 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              Buka Halaman Pemesanan
            </a>

            <div className="mt-4 p-3 bg-violet-50 rounded-xl">
              <p className="text-xs text-violet-700 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Untuk membuat QR Code per meja, pergi ke menu <strong>Meja & QR</strong></span>
              </p>
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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
      </div>
    </form>
  )
}
