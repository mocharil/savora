'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle, ArrowLeft, Loader2, ExternalLink, QrCode, Settings, Menu } from 'lucide-react'

interface OnboardingData {
  business: {
    businessName?: string
    storeSlug?: string
  }
  outlet: {
    outletName?: string
    outletSlug?: string
  }
  menu: Array<{ name: string }>
  theme: {
    primaryColor?: string
  }
}

interface Props {
  data: OnboardingData
  onComplete: () => void
  onBack: () => void
}

export function OnboardingStep5Complete({ data, onComplete, onBack }: Props) {
  const [loading, setLoading] = useState(false)

  const handleComplete = async () => {
    setLoading(true)
    await onComplete()
  }

  const orderingUrl = data.business.storeSlug && data.outlet.outletSlug
    ? `/${data.business.storeSlug}/${data.outlet.outletSlug}/order`
    : '#'

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 sm:p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">You're All Set!</h3>
        <p className="text-gray-500 mt-2">
          Your restaurant is ready to accept orders
        </p>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
        <h4 className="font-semibold text-gray-700">Setup Summary</h4>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Business Name</span>
          <span className="font-medium">{data.business.businessName || 'Not set'}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">First Outlet</span>
          <span className="font-medium">{data.outlet.outletName || 'Not set'}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Menu Items</span>
          <span className="font-medium">
            {data.menu.length > 0 ? `${data.menu.length} item(s)` : 'None yet'}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Theme Color</span>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: data.theme.primaryColor || '#10b981' }}
            />
            <span className="font-medium">{data.theme.primaryColor || '#10b981'}</span>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="border rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-gray-700 mb-3">What's Next?</h4>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <div className="p-1.5 bg-orange-100 rounded mt-0.5">
              <Menu className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <p className="font-medium text-sm">Add Menu Items</p>
              <p className="text-xs text-gray-500">Add your full menu with prices and descriptions</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="p-1.5 bg-purple-100 rounded mt-0.5">
              <QrCode className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-sm">Generate QR Codes</p>
              <p className="text-xs text-gray-500">Create QR codes for each table</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="p-1.5 bg-orange-100 rounded mt-0.5">
              <Settings className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <p className="font-medium text-sm">Configure Settings</p>
              <p className="text-xs text-gray-500">Set up payment methods and operational hours</p>
            </div>
          </li>
        </ul>
      </div>

      {/* Preview Link */}
      {data.business.storeSlug && data.outlet.outletSlug && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-emerald-800 mb-2">
            Your ordering page is now live at:
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-white px-3 py-2 rounded border text-sm truncate">
              {typeof window !== 'undefined' ? window.location.origin : ''}{orderingUrl}
            </code>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.open(orderingUrl, '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          type="button"
          className="flex-1"
          onClick={handleComplete}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Finishing...
            </>
          ) : (
            'Go to Dashboard'
          )}
        </Button>
      </div>
    </div>
  )
}
