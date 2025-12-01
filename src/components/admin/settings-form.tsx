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
  CreditCard
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
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
}

const formatTimeToAMPM = (time24: string): string => {
  const [hours, minutes] = time24.split(':').map(Number)
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const hours12 = hours % 12 || 12
  return `${hours12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`
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

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'banner'
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('File must be an image')
      return
    }

    const maxSize = type === 'logo' ? 1 : 5
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Maximum file size is ${maxSize}MB`)
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
        throw new Error(result.error || 'Upload failed')
      }

      setFormData({
        ...formData,
        [type === 'logo' ? 'logo_url' : 'banner_url']: result.publicUrl
      })
    } catch (err: any) {
      setError('Failed to upload image: ' + err.message)
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
          <p className="text-sm text-gray-500">Kelola pengaturan toko dan informasi bisnis Anda</p>
        </div>
        <PageTourButton />
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-100">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-100">
          <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <p className="text-sm text-emerald-600">Settings saved successfully!</p>
        </div>
      )}

      {/* Store Profile + Banner Card */}
      <div data-tour="settings-store-info" className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Store Profile</h2>
            <p className="text-xs text-gray-500">Update your restaurant's logo, banner, and details.</p>
          </div>
          <button
            type="submit"
            disabled={loading || success}
            className="flex items-center gap-1.5 h-8 px-4 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : success ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {loading ? 'Saving...' : success ? 'Saved!' : 'Save'}
          </button>
        </div>

        <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-x-5 gap-y-3 items-start">
          {/* Logo */}
          <div className="row-span-3 flex flex-col items-center">
            <input
              ref={logoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif"
              onChange={(e) => handleImageUpload(e, 'logo')}
              className="hidden"
            />
            {formData.logo_url ? (
              <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gray-100 ring-2 ring-gray-100">
                <Image src={formData.logo_url} alt="Logo" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, logo_url: '' })}
                  className="absolute -top-0.5 -right-0.5 p-0.5 bg-white rounded-full text-red-500 shadow"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center ring-2 ring-gray-50">
                <ImageIcon className="w-5 h-5 text-gray-400" />
              </div>
            )}
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              disabled={uploading === 'logo'}
              className="mt-1.5 text-[10px] text-blue-600 hover:text-blue-700 font-medium"
            >
              {uploading === 'logo' ? '...' : 'Change'}
            </button>
          </div>

          {/* Restaurant Name */}
          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-1">Restaurant Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Warung Savora"
              className="w-full h-9 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="081234567890"
              className="w-full h-9 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
            />
          </div>

          {/* Banner */}
          <div className="row-span-3 w-44">
            <label className="block text-[10px] font-medium text-gray-500 mb-1">Store Banner</label>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'banner')}
              className="hidden"
            />
            {formData.banner_url ? (
              <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-gray-100">
                <Image src={formData.banner_url} alt="Banner" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, banner_url: '' })}
                  className="absolute top-1 right-1 p-0.5 bg-white/90 rounded-full text-red-500 shadow hover:bg-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                disabled={uploading === 'banner'}
                className="w-full aspect-[16/9] rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-400 bg-gray-50 hover:bg-blue-50/50 transition-all flex flex-col items-center justify-center"
              >
                {uploading === 'banner' ? (
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                ) : (
                  <>
                    <ImageIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-[9px] text-gray-400 mt-1">Upload banner</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Address - spans 2 columns */}
          <div className="col-span-2">
            <label className="block text-[10px] font-medium text-gray-500 mb-1">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Jl. Sudirman No. 123, Jakarta Selatan 12930"
              className="w-full h-9 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
            />
          </div>

          {/* Website - spans 2 columns */}
          <div className="col-span-2">
            <label className="block text-[10px] font-medium text-gray-500 mb-1">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://example.com"
              className="w-full h-9 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </div>

      {/* Operating Hours + Tax & Charges Card */}
      <div data-tour="settings-operation" className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Operating Hours */}
          <div>
            <div className="mb-4">
              <h2 className="text-base font-semibold text-gray-900">Operating Hours</h2>
              <p className="text-xs text-gray-500">Set your weekly opening and closing times.</p>
            </div>
            <div className="space-y-2">
              {Object.entries(formData.operational_hours).map(([day, hours]) => (
                <div key={day} className="flex items-center gap-3">
                  <span className={`w-24 text-sm font-medium ${hours.isOpen ? 'text-gray-700' : 'text-red-500'}`}>
                    {dayNames[day]}
                  </span>
                  {hours.isOpen ? (
                    <>
                      <div className="relative">
                        <input
                          type="text"
                          value={formatTimeToAMPM(hours.open)}
                          readOnly
                          onClick={() => (document.getElementById(`open-${day}`) as HTMLInputElement)?.showPicker?.()}
                          className="w-24 h-8 px-2.5 pr-7 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 cursor-pointer hover:border-gray-300"
                        />
                        <input
                          type="time"
                          id={`open-${day}`}
                          value={hours.open}
                          onChange={(e) => updateOperationalHours(day, 'open', e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <Clock className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                      </div>
                      <span className="text-gray-400">-</span>
                      <div className="relative">
                        <input
                          type="text"
                          value={formatTimeToAMPM(hours.close)}
                          readOnly
                          onClick={() => (document.getElementById(`close-${day}`) as HTMLInputElement)?.showPicker?.()}
                          className="w-24 h-8 px-2.5 pr-7 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 cursor-pointer hover:border-gray-300"
                        />
                        <input
                          type="time"
                          id={`close-${day}`}
                          value={hours.close}
                          onChange={(e) => updateOperationalHours(day, 'close', e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <Clock className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                      </div>
                      <button
                        type="button"
                        onClick={() => updateOperationalHours(day, 'isOpen', false)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-sm text-red-500">Closed</span>
                      <button
                        type="button"
                        onClick={() => updateOperationalHours(day, 'isOpen', true)}
                        className="text-xs text-blue-500 hover:text-blue-600 font-medium"
                      >
                        Set Hours
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Tax & Charges */}
          <div data-tour="settings-payment" className="lg:border-l lg:border-gray-100 lg:pl-6 lg:w-56 flex-shrink-0">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4 text-blue-500" />
              <h2 className="text-base font-semibold text-gray-900">Tax & Charges</h2>
            </div>
            <div className="flex gap-3 mb-4">
              <div className="flex-1">
                <label className="block text-[10px] font-medium text-gray-500 mb-1">Tax (PPN)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.tax_percentage}
                    onChange={(e) => setFormData({ ...formData, tax_percentage: Number(e.target.value) })}
                    min="0"
                    max="100"
                    step="0.5"
                    className="w-full h-9 px-3 pr-8 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">%</span>
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-medium text-gray-500 mb-1">Service</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.service_charge_percentage}
                    onChange={(e) => setFormData({ ...formData, service_charge_percentage: Number(e.target.value) })}
                    min="0"
                    max="100"
                    step="0.5"
                    className="w-full h-9 px-3 pr-8 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">%</span>
                </div>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-700">Rp 100.000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tax ({formData.tax_percentage}%)</span>
                <span className="text-gray-700">Rp {(100000 * formData.tax_percentage / 100).toLocaleString('id-ID')}</span>
              </div>
              {formData.service_charge_percentage > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Service ({formData.service_charge_percentage}%)</span>
                  <span className="text-gray-700">Rp {(100000 * formData.service_charge_percentage / 100).toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between pt-1.5 border-t border-gray-200 font-medium">
                <span className="text-gray-900">Total</span>
                <span className="text-blue-600">Rp {(100000 * (1 + formData.tax_percentage / 100 + formData.service_charge_percentage / 100)).toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
