'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  ArrowLeft,
  Loader2,
  Palette,
  Store,
  Settings,
  Eye,
  Save,
  Upload,
  ExternalLink,
  Link2,
  Copy,
  Check,
  QrCode,
  Share2,
  X,
  ImageIcon
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import type { Outlet, OutletTheme, OutletBranding, OutletSettings } from '@/types/outlet'

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

export default function OutletSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'branding' | 'theme' | 'ordering' | 'preview'>('branding')

  const [outlet, setOutlet] = useState<Outlet | null>(null)
  const [storeSlug, setStoreSlug] = useState<string>('')
  const [copiedLink, setCopiedLink] = useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const [theme, setTheme] = useState<OutletTheme>({
    primaryColor: '#10b981',
    secondaryColor: '#059669',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    fontFamily: 'Inter',
    logoUrl: null,
    bannerUrl: null,
    customCss: null,
  })

  const [branding, setBranding] = useState<OutletBranding>({
    businessName: null,
    tagline: null,
    description: null,
    socialLinks: {},
    contactInfo: {},
  })

  const [settings, setSettings] = useState<OutletSettings>({
    allowTakeaway: true,
    allowDineIn: true,
    allowDelivery: false,
    minimumOrderAmount: 0,
    estimatedPrepTime: 15,
    autoAcceptOrders: false,
  })

  useEffect(() => {
    fetchOutlet()
  }, [params.outletId])

  const fetchOutlet = async () => {
    try {
      const response = await fetch(`/api/outlets/${params.outletId}`)
      if (!response.ok) throw new Error('Failed to fetch outlet')

      const data = await response.json()
      setOutlet(data.outlet)
      setStoreSlug(data.storeSlug)

      if (data.outlet.theme) {
        setTheme(data.outlet.theme)
      }
      if (data.outlet.branding) {
        setBranding(data.outlet.branding)
      }
      if (data.outlet.settings) {
        setSettings(data.outlet.settings)
      }
    } catch (error) {
      console.error('Error fetching outlet:', error)
      toast.error('Failed to load outlet settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)

    try {
      const response = await fetch(`/api/outlets/${params.outletId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme,
          branding,
          settings,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save settings')
      }

      const data = await response.json()

      // Update local state with saved data
      if (data.outlet) {
        if (data.outlet.theme) setTheme(data.outlet.theme)
        if (data.outlet.branding) setBranding(data.outlet.branding)
        if (data.outlet.settings) setSettings(data.outlet.settings)
      }

      toast.success('Settings saved successfully')
    } catch (error: any) {
      console.error('Error saving settings:', error)
      toast.error(error.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const applyPreset = (preset: typeof PRESET_THEMES[0]) => {
    setTheme(prev => ({
      ...prev,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
    }))
  }

  const handleImageUpload = async (
    file: File,
    type: 'logo' | 'banner'
  ) => {
    if (type === 'logo') setUploadingLogo(true)
    else setUploadingBanner(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'store-assets')
      formData.append('path', `outlets/${params.outletId}/${type}-${Date.now()}.${file.name.split('.').pop()}`)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const data = await response.json()

      if (type === 'logo') {
        setTheme(prev => ({ ...prev, logoUrl: data.publicUrl }))
      } else {
        setTheme(prev => ({ ...prev, bannerUrl: data.publicUrl }))
      }

      toast.success(`${type === 'logo' ? 'Logo' : 'Banner'} uploaded successfully`)
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Failed to upload image')
    } finally {
      if (type === 'logo') setUploadingLogo(false)
      else setUploadingBanner(false)
    }
  }

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'banner'
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    handleImageUpload(file, type)
  }

  const removeImage = (type: 'logo' | 'banner') => {
    if (type === 'logo') {
      setTheme(prev => ({ ...prev, logoUrl: null }))
    } else {
      setTheme(prev => ({ ...prev, bannerUrl: null }))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!outlet) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Outlet not found</p>
      </div>
    )
  }

  const previewUrl = storeSlug && outlet.slug
    ? `/${storeSlug}/${outlet.slug}/order`
    : '#'

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const customerOrderUrl = storeSlug && outlet.slug ? `${baseUrl}/${storeSlug}/${outlet.slug}/order` : ''
  const customerMenuUrl = storeSlug && outlet.slug ? `${baseUrl}/${storeSlug}/${outlet.slug}/order` : ''

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedLink(type)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopiedLink(null), 2000)
    } catch (err) {
      toast.error('Failed to copy link')
    }
  }

  const shareToSocial = (platform: string, url: string, text: string) => {
    const encodedUrl = encodeURIComponent(url)
    const encodedText = encodeURIComponent(text)

    const shareUrls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    }

    window.open(shareUrls[platform], '_blank', 'width=600,height=400')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/outlets"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Outlet Settings</h1>
            <p className="text-gray-500">{outlet.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {storeSlug && outlet.slug && (
            <Link
              href={previewUrl}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Preview
            </Link>
          )}
          <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Customer Links Section */}
      {customerOrderUrl && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Link2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Customer Order Link</h3>
              <p className="text-sm text-gray-600">Share this link with your customers to place orders</p>
            </div>
          </div>

          {/* Main Link */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-1">Order Page URL</p>
                <p className="text-sm font-mono text-gray-800 truncate">{customerOrderUrl}</p>
              </div>
              <button
                onClick={() => copyToClipboard(customerOrderUrl, 'order')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  copiedLink === 'order'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {copiedLink === 'order' ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
              <Link
                href={previewUrl}
                target="_blank"
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open
              </Link>
            </div>
          </div>

          {/* Share to Social Media */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <Share2 className="w-4 h-4" />
              Share:
            </span>
            <button
              onClick={() => shareToSocial('whatsapp', customerOrderUrl, `Pesan makanan dari ${branding.businessName || outlet.name} sekarang!`)}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </button>
            <button
              onClick={() => shareToSocial('facebook', customerOrderUrl, `Pesan makanan dari ${branding.businessName || outlet.name}`)}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
            <button
              onClick={() => shareToSocial('twitter', customerOrderUrl, `Pesan makanan dari ${branding.businessName || outlet.name} sekarang!`)}
              className="flex items-center gap-2 px-3 py-1.5 bg-black hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              X
            </button>
            <button
              onClick={() => shareToSocial('telegram', customerOrderUrl, `Pesan makanan dari ${branding.businessName || outlet.name} sekarang!`)}
              className="flex items-center gap-2 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              Telegram
            </button>
          </div>

          {/* QR Code hint */}
          <div className="mt-4 pt-4 border-t border-emerald-200">
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              <span>
                Want QR codes for tables? Go to{' '}
                <Link href="/admin/tables" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  Tables Management
                </Link>{' '}
                to generate QR codes for each table.
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
        {[
          { id: 'branding', label: 'Branding', icon: Store },
          { id: 'theme', label: 'Theme', icon: Palette },
          { id: 'ordering', label: 'Ordering', icon: Settings },
          { id: 'preview', label: 'Preview', icon: Eye },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border shadow-sm">
        {/* Branding Tab */}
        {activeTab === 'branding' && (
          <div className="p-6 space-y-6">
            <div>
              <Label htmlFor="businessName">Display Name</Label>
              <Input
                id="businessName"
                value={branding.businessName || ''}
                onChange={(e) => setBranding(prev => ({ ...prev, businessName: e.target.value || null }))}
                placeholder="Override store name for this outlet"
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Leave empty to use main store name
              </p>
            </div>

            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={branding.tagline || ''}
                onChange={(e) => setBranding(prev => ({ ...prev, tagline: e.target.value || null }))}
                placeholder="e.g., Authentic Indonesian Cuisine"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={branding.description || ''}
                onChange={(e) => setBranding(prev => ({ ...prev, description: e.target.value || null }))}
                placeholder="Tell customers about this location..."
                rows={3}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Logo Upload */}
              <div>
                <Label>Logo</Label>
                <div className="mt-2">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, 'logo')}
                    className="hidden"
                  />
                  <div className="flex items-start gap-4">
                    <div className="relative group">
                      {theme.logoUrl ? (
                        <>
                          <img
                            src={theme.logoUrl}
                            alt="Logo"
                            className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage('logo')}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => logoInputRef.current?.click()}
                        disabled={uploadingLogo}
                        className="w-full mb-2"
                      >
                        {uploadingLogo ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Logo
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, WebP. Max 5MB.
                        <br />Recommended: 200x200px
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Banner Upload */}
              <div>
                <Label>Banner Image</Label>
                <div className="mt-2">
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, 'banner')}
                    className="hidden"
                  />
                  <div className="relative group mb-3">
                    {theme.bannerUrl ? (
                      <>
                        <img
                          src={theme.bannerUrl}
                          alt="Banner"
                          className="w-full h-28 rounded-xl object-cover border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage('banner')}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <div
                        onClick={() => bannerInputRef.current?.click()}
                        className="w-full h-28 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-colors"
                      >
                        <Upload className="w-8 h-8 text-gray-400 mb-1" />
                        <span className="text-sm text-gray-500">Click to upload banner</span>
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => bannerInputRef.current?.click()}
                    disabled={uploadingBanner}
                    className="w-full"
                  >
                    {uploadingBanner ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        {theme.bannerUrl ? 'Change Banner' : 'Upload Banner'}
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    PNG, JPG, WebP. Max 5MB. Recommended: 1200x400px
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="font-medium mb-4">Social & Contact</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Instagram</Label>
                  <Input
                    value={branding.socialLinks?.instagram || ''}
                    onChange={(e) => setBranding(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, instagram: e.target.value }
                    }))}
                    placeholder="@username"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>WhatsApp</Label>
                  <Input
                    value={branding.contactInfo?.whatsapp || ''}
                    onChange={(e) => setBranding(prev => ({
                      ...prev,
                      contactInfo: { ...prev.contactInfo, whatsapp: e.target.value }
                    }))}
                    placeholder="+62812345678"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Theme Tab */}
        {activeTab === 'theme' && (
          <div className="p-6 space-y-6">
            <div>
              <Label className="mb-3 block">Quick Presets</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_THEMES.map(preset => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${
                      theme.primaryColor === preset.primary
                        ? 'border-gray-800 ring-2 ring-offset-2 ring-gray-400'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: preset.primary }}
                    title={preset.name}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label>Primary Color</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="color"
                    value={theme.primaryColor}
                    onChange={(e) => setTheme(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-14 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={theme.primaryColor}
                    onChange={(e) => setTheme(prev => ({ ...prev, primaryColor: e.target.value }))}
                    placeholder="#10b981"
                  />
                </div>
              </div>

              <div>
                <Label>Secondary Color</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="color"
                    value={theme.secondaryColor}
                    onChange={(e) => setTheme(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    className="w-14 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={theme.secondaryColor}
                    onChange={(e) => setTheme(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    placeholder="#059669"
                  />
                </div>
              </div>

              <div>
                <Label>Background Color</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="color"
                    value={theme.backgroundColor}
                    onChange={(e) => setTheme(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    className="w-14 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={theme.backgroundColor}
                    onChange={(e) => setTheme(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              <div>
                <Label>Text Color</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="color"
                    value={theme.textColor}
                    onChange={(e) => setTheme(prev => ({ ...prev, textColor: e.target.value }))}
                    className="w-14 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={theme.textColor}
                    onChange={(e) => setTheme(prev => ({ ...prev, textColor: e.target.value }))}
                    placeholder="#1f2937"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>Font Family</Label>
              <select
                value={theme.fontFamily}
                onChange={(e) => setTheme(prev => ({ ...prev, fontFamily: e.target.value }))}
                className="w-full border rounded-md p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {FONT_OPTIONS.map(font => (
                  <option key={font.value} value={font.value}>{font.name}</option>
                ))}
              </select>
            </div>

            <div>
              <Label>Custom CSS (Advanced)</Label>
              <Textarea
                value={theme.customCss || ''}
                onChange={(e) => setTheme(prev => ({ ...prev, customCss: e.target.value || null }))}
                placeholder=".menu-item { border-radius: 12px; }"
                rows={4}
                className="mt-1 font-mono text-sm"
              />
            </div>
          </div>
        )}

        {/* Ordering Tab */}
        {activeTab === 'ordering' && (
          <div className="p-6 space-y-6">
            <div>
              <h4 className="font-medium mb-4">Order Types</h4>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allowDineIn}
                    onChange={(e) => setSettings(prev => ({ ...prev, allowDineIn: e.target.checked }))}
                    className="w-5 h-5 rounded text-emerald-600"
                  />
                  <div>
                    <span className="font-medium">Allow Dine-in Orders</span>
                    <p className="text-sm text-gray-500">Customers can order from tables via QR code</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allowTakeaway}
                    onChange={(e) => setSettings(prev => ({ ...prev, allowTakeaway: e.target.checked }))}
                    className="w-5 h-5 rounded text-emerald-600"
                  />
                  <div>
                    <span className="font-medium">Allow Takeaway Orders</span>
                    <p className="text-sm text-gray-500">Customers can place takeaway orders</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allowDelivery}
                    onChange={(e) => setSettings(prev => ({ ...prev, allowDelivery: e.target.checked }))}
                    className="w-5 h-5 rounded text-emerald-600"
                  />
                  <div>
                    <span className="font-medium">Allow Delivery Orders</span>
                    <p className="text-sm text-gray-500">Enable delivery option (requires integration)</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="font-medium mb-4">Order Settings</h4>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label>Minimum Order Amount</Label>
                  <Input
                    type="number"
                    value={settings.minimumOrderAmount}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      minimumOrderAmount: parseInt(e.target.value) || 0
                    }))}
                    min={0}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">Set to 0 for no minimum</p>
                </div>

                <div>
                  <Label>Estimated Prep Time (minutes)</Label>
                  <Input
                    type="number"
                    value={settings.estimatedPrepTime}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      estimatedPrepTime: parseInt(e.target.value) || 15
                    }))}
                    min={1}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoAcceptOrders}
                  onChange={(e) => setSettings(prev => ({ ...prev, autoAcceptOrders: e.target.checked }))}
                  className="w-5 h-5 rounded text-emerald-600"
                />
                <div>
                  <span className="font-medium">Auto-accept Orders</span>
                  <p className="text-sm text-gray-500">
                    Automatically confirm incoming orders without manual review
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <div className="p-6">
            <p className="text-center text-gray-500 mb-6">
              Live preview of customer ordering page
            </p>

            {/* Phone mockup */}
            <div className="max-w-sm mx-auto">
              <div
                className="rounded-3xl overflow-hidden border-8 border-gray-800 shadow-xl"
                style={{
                  backgroundColor: theme.backgroundColor,
                  fontFamily: theme.fontFamily,
                }}
              >
                {/* Header */}
                <div
                  className="px-4 py-3"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  <div className="flex items-center gap-3">
                    {theme.logoUrl && (
                      <img
                        src={theme.logoUrl}
                        alt="Logo"
                        className="w-10 h-10 rounded-full bg-white object-cover"
                      />
                    )}
                    <div className="text-white">
                      <h4 className="font-bold">
                        {branding.businessName || outlet.name}
                      </h4>
                      {branding.tagline && (
                        <p className="text-sm opacity-90">{branding.tagline}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div
                    className="bg-white rounded-lg p-3 shadow-sm border"
                    style={{ color: theme.textColor }}
                  >
                    <h5 className="font-bold">Nasi Goreng Special</h5>
                    <p className="text-sm opacity-70">
                      Delicious fried rice with chicken
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span
                        className="font-bold"
                        style={{ color: theme.primaryColor }}
                      >
                        Rp 35.000
                      </span>
                      <button
                        type="button"
                        className="px-3 py-1 rounded-full text-white text-sm"
                        style={{ backgroundColor: theme.primaryColor }}
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <div
                    className="bg-white rounded-lg p-3 shadow-sm border"
                    style={{ color: theme.textColor }}
                  >
                    <h5 className="font-bold">Es Teh Manis</h5>
                    <p className="text-sm opacity-70">Sweet iced tea</p>
                    <div className="flex items-center justify-between mt-2">
                      <span
                        className="font-bold"
                        style={{ color: theme.primaryColor }}
                      >
                        Rp 8.000
                      </span>
                      <button
                        type="button"
                        className="px-3 py-1 rounded-full text-white text-sm"
                        style={{ backgroundColor: theme.primaryColor }}
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Cart Button Preview */}
                  <div
                    className="rounded-xl p-3 text-white text-center"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    <span className="font-semibold">View Cart - Rp 43.000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
