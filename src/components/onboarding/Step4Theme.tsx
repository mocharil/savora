'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Palette, Loader2, ArrowLeft } from 'lucide-react'

interface Props {
  data: {
    primaryColor?: string
    secondaryColor?: string
    backgroundColor?: string
    textColor?: string
    fontFamily?: string
    logoUrl?: string
    bannerUrl?: string
  }
  outletId?: string
  onComplete: (data: {
    primaryColor: string
    secondaryColor: string
    backgroundColor: string
    textColor: string
    fontFamily: string
    logoUrl: string
    bannerUrl: string
  }) => void
  onBack: () => void
}

const PRESET_THEMES = [
  { name: 'Emerald', primary: '#10b981', secondary: '#059669' },
  { name: 'Blue', primary: '#3b82f6', secondary: '#2563eb' },
  { name: 'Red', primary: '#ef4444', secondary: '#dc2626' },
  { name: 'Orange', primary: '#f97316', secondary: '#ea580c' },
  { name: 'Purple', primary: '#8b5cf6', secondary: '#7c3aed' },
  { name: 'Pink', primary: '#ec4899', secondary: '#db2777' },
  { name: 'Teal', primary: '#14b8a6', secondary: '#0d9488' },
  { name: 'Indigo', primary: '#6366f1', secondary: '#4f46e5' },
]

const FONT_OPTIONS = [
  { name: 'Inter', value: 'Inter' },
  { name: 'Poppins', value: 'Poppins' },
  { name: 'Roboto', value: 'Roboto' },
  { name: 'Open Sans', value: 'Open Sans' },
  { name: 'Lato', value: 'Lato' },
  { name: 'Nunito', value: 'Nunito' },
]

export function OnboardingStep4Theme({ data, outletId, onComplete, onBack }: Props) {
  const [formData, setFormData] = useState({
    primaryColor: data.primaryColor || '#10b981',
    secondaryColor: data.secondaryColor || '#059669',
    backgroundColor: data.backgroundColor || '#ffffff',
    textColor: data.textColor || '#1f2937',
    fontFamily: data.fontFamily || 'Inter',
    logoUrl: data.logoUrl || '',
    bannerUrl: data.bannerUrl || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/onboarding/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, outletId }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save theme')
      }

      onComplete(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const applyPreset = (preset: typeof PRESET_THEMES[0]) => {
    setFormData(prev => ({
      ...prev,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
    }))
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Palette className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Customize Appearance</h3>
          <p className="text-sm text-gray-500">Brand your customer ordering page</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Preset Themes */}
        <div>
          <Label className="mb-3 block">Quick Presets</Label>
          <div className="flex flex-wrap gap-2">
            {PRESET_THEMES.map(preset => (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${
                  formData.primaryColor === preset.primary
                    ? 'border-gray-800 ring-2 ring-offset-2 ring-gray-400'
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: preset.primary }}
                title={preset.name}
              />
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Primary Color</Label>
            <div className="flex gap-2 mt-1">
              <Input
                type="color"
                value={formData.primaryColor}
                onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="w-14 h-10 p-1 cursor-pointer"
              />
              <Input
                value={formData.primaryColor}
                onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                placeholder="#10b981"
              />
            </div>
          </div>

          <div>
            <Label>Secondary Color</Label>
            <div className="flex gap-2 mt-1">
              <Input
                type="color"
                value={formData.secondaryColor}
                onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                className="w-14 h-10 p-1 cursor-pointer"
              />
              <Input
                value={formData.secondaryColor}
                onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                placeholder="#059669"
              />
            </div>
          </div>
        </div>

        {/* Font */}
        <div>
          <Label htmlFor="fontFamily">Font Family</Label>
          <select
            id="fontFamily"
            value={formData.fontFamily}
            onChange={(e) => setFormData(prev => ({ ...prev, fontFamily: e.target.value }))}
            className="w-full border border-gray-300 rounded-md p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {FONT_OPTIONS.map(font => (
              <option key={font.value} value={font.value}>{font.name}</option>
            ))}
          </select>
        </div>

        {/* Preview */}
        <div className="border rounded-lg p-4">
          <Label className="mb-3 block">Preview</Label>
          <div
            className="rounded-lg overflow-hidden border"
            style={{
              backgroundColor: formData.backgroundColor,
              fontFamily: formData.fontFamily,
            }}
          >
            {/* Header Preview */}
            <div
              className="px-4 py-3"
              style={{ backgroundColor: formData.primaryColor }}
            >
              <div className="text-white">
                <h4 className="font-bold">Your Restaurant</h4>
                <p className="text-sm opacity-90">Main Outlet</p>
              </div>
            </div>

            {/* Content Preview */}
            <div className="p-4 space-y-3">
              <div
                className="bg-white rounded-lg p-3 shadow-sm border"
                style={{ color: formData.textColor }}
              >
                <h5 className="font-bold">Nasi Goreng Special</h5>
                <p className="text-sm opacity-70">
                  Delicious fried rice with chicken
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span
                    className="font-bold"
                    style={{ color: formData.primaryColor }}
                  >
                    Rp 35.000
                  </span>
                  <button
                    type="button"
                    className="px-3 py-1 rounded-full text-white text-sm"
                    style={{ backgroundColor: formData.primaryColor }}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
