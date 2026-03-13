'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, CheckCircle2, ExternalLink } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface MayarPaymentStatusProps {
  orderId: string
  paymentUrl: string | null
  total: number
  isPaid: boolean
}

export function MayarPaymentStatus({ orderId, paymentUrl, total, isPaid }: MayarPaymentStatusProps) {
  const router = useRouter()
  const [checking, setChecking] = useState(false)
  const [justChecked, setJustChecked] = useState(false)

  const handleCheck = async () => {
    setChecking(true)
    try {
      // Refresh server component data
      router.refresh()
      await new Promise(resolve => setTimeout(resolve, 1000))
      setJustChecked(true)
      setTimeout(() => setJustChecked(false), 3000)
    } finally {
      setChecking(false)
    }
  }

  if (isPaid) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4">
        <div className="flex gap-3 items-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-200">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-semibold text-green-700">Pembayaran Lunas</p>
            <p className="text-sm text-gray-600 mt-0.5">
              Pembayaran via Mayar telah dikonfirmasi.
            </p>
            <p className="text-sm font-bold text-gray-900 mt-1">
              Total: {formatCurrency(total)}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-4">
      <div className="flex gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-200">
          <RefreshCw className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-orange-700">Menunggu Pembayaran Mayar</p>
          <p className="text-sm text-gray-600 mt-1">
            Selesaikan pembayaran di tab Mayar, lalu klik tombol di bawah untuk cek statusnya.
          </p>
          <p className="text-sm font-bold text-gray-900 mt-1">
            Total: {formatCurrency(total)}
          </p>

          <div className="flex gap-2 mt-3">
            {paymentUrl && (
              <a
                href={paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-orange-200 rounded-xl text-sm font-medium text-orange-600 hover:bg-orange-50 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Buka Mayar
              </a>
            )}
            <button
              onClick={handleCheck}
              disabled={checking}
              className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 rounded-xl text-sm font-medium text-white hover:bg-orange-600 transition-colors disabled:opacity-70"
            >
              <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
              {checking ? 'Mengecek...' : justChecked ? 'Sudah dicek!' : 'Cek Status'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
