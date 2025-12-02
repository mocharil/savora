'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Loader2,
  Banknote,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

type PaymentStatus = 'pending' | 'paid' | 'failed'

interface PaymentStatusUpdateProps {
  orderId: string
  currentStatus: PaymentStatus
  total: number
}

export function PaymentStatusUpdate({ orderId, currentStatus, total }: PaymentStatusUpdateProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  const handleMarkAsPaid = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Gagal mengubah status pembayaran')
      }

      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
      setShowConfirm(false)
    }
  }

  // Already paid
  if (currentStatus === 'paid') {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-[#10B981]/10 text-[#10B981]">
        <CheckCircle className="w-5 h-5" />
        <span className="text-sm font-medium">Pembayaran sudah lunas</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-white bg-[#10B981] hover:bg-[#059669] transition-all"
        >
          <Banknote className="w-5 h-5" />
          Tandai Sudah Bayar
        </button>
      ) : (
        <div className="p-4 rounded-lg bg-[#10B981]/5 border border-[#10B981]/20">
          <div className="flex items-center gap-2 mb-3 text-[#10B981]">
            <Banknote className="w-5 h-5" />
            <span className="text-sm font-medium">Konfirmasi Pembayaran Tunai</span>
          </div>
          <p className="text-sm text-[#6B7280] mb-4">
            Pastikan Anda sudah menerima pembayaran dari pelanggan. Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 px-3 py-2.5 rounded-lg text-sm font-medium text-[#374151] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleMarkAsPaid}
              disabled={loading}
              className="flex-1 px-3 py-2.5 rounded-lg text-sm font-medium text-white bg-[#10B981] hover:bg-[#059669] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Ya, Sudah Bayar
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-[#EF4444]/10 text-[#EF4444]">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}
