'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MapPin, Loader2, ArrowLeft, Phone } from 'lucide-react'

interface Props {
  data: {
    outletName?: string
    outletCode?: string
    address?: string
    phone?: string
    taxPercentage?: number
    serviceChargePercentage?: number
  }
  onComplete: (data: {
    outletName: string
    outletCode: string
    address: string
    phone: string
    taxPercentage: number
    serviceChargePercentage: number
    outletId: string
    outletSlug: string
  }) => void
  onBack: () => void
}

export function OnboardingStep2Outlet({ data, onComplete, onBack }: Props) {
  const [formData, setFormData] = useState({
    outletName: data.outletName || '',
    outletCode: data.outletCode || '',
    address: data.address || '',
    phone: data.phone || '',
    taxPercentage: data.taxPercentage ?? 11,
    serviceChargePercentage: data.serviceChargePercentage ?? 5,
  })
  // Extract number part without +62 for display
  const initialPhoneNumber = data.phone ? data.phone.replace(/^\+62/, '').replace(/[^\d]/g, '') : ''
  const [phoneNumber, setPhoneNumber] = useState(formatPhoneNumber(initialPhoneNumber))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Format: 82118454944 -> 821-1845-4944
  function formatPhoneNumber(num: string): string {
    const digits = num.replace(/[^\d]/g, '')
    if (digits.length >= 10) {
      return `${digits.substring(0, 3)}-${digits.substring(3, 7)}-${digits.substring(7, 11)}`
    } else if (digits.length >= 7) {
      return `${digits.substring(0, 3)}-${digits.substring(3)}`
    } else if (digits.length >= 3) {
      return `${digits.substring(0, 3)}${digits.length > 3 ? '-' + digits.substring(3) : ''}`
    }
    return digits
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/[^\d-]/g, '') // Only allow digits and dashes
    const digits = input.replace(/[^\d]/g, '').substring(0, 12) // Max 12 digits
    const formatted = formatPhoneNumber(digits)
    setPhoneNumber(formatted)
    setFormData(prev => ({ ...prev, phone: digits ? `+62${digits}` : '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/onboarding/outlet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create outlet')
      }

      onComplete({
        ...formData,
        outletId: result.outletId,
        outletSlug: result.slug,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-orange-100 rounded-lg">
          <MapPin className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Outlet Pertama</h3>
          <p className="text-sm text-gray-500">Atur lokasi pertama bisnis Anda</p>
        </div>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
        <p className="text-orange-800 text-sm">
          Outlet adalah lokasi fisik bisnis Anda. Anda dapat menambahkan outlet lainnya nanti melalui dashboard admin.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <Label htmlFor="outletName">Nama Outlet *</Label>
          <Input
            id="outletName"
            value={formData.outletName}
            onChange={(e) => setFormData(prev => ({ ...prev, outletName: e.target.value }))}
            placeholder="Contoh: Cabang Pusat, Cabang Bandung"
            required
            className="mt-1"
          />
          <p className="text-sm text-gray-500 mt-1">Nama lokasi outlet Anda</p>
        </div>

        <div>
          <Label htmlFor="address">Alamat</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            placeholder="Alamat lengkap outlet..."
            rows={2}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="phone">Nomor Telepon</Label>
          <div className="flex mt-1">
            <div className="flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-gray-600 text-sm font-medium">
              +62
            </div>
            <Input
              id="phone"
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="812-3456-7890"
              className="rounded-l-none"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">Masukkan nomor tanpa awalan 0</p>
        </div>

        <div className="border-t pt-6">
          <h4 className="font-medium mb-4">Pajak & Service Charge</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="taxPercentage">Pajak (%)</Label>
              <Input
                id="taxPercentage"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.taxPercentage}
                onChange={(e) => setFormData(prev => ({ ...prev, taxPercentage: parseFloat(e.target.value) || 0 }))}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">Tarif PPN/VAT</p>
            </div>

            <div>
              <Label htmlFor="serviceChargePercentage">Service Charge (%)</Label>
              <Input
                id="serviceChargePercentage"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.serviceChargePercentage}
                onChange={(e) => setFormData(prev => ({ ...prev, serviceChargePercentage: parseFloat(e.target.value) || 0 }))}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">Biaya layanan (opsional)</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <Button type="submit" className="flex-[2]" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Membuat...
              </>
            ) : (
              'Lanjutkan'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
