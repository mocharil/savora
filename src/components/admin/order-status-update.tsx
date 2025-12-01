'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Loader2,
  CheckCircle,
  ChefHat,
  Bell,
  CheckCheck,
  X,
  AlertCircle
} from 'lucide-react'

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'

const statusButtons: {
  status: OrderStatus
  label: string
  icon: React.ReactNode
  color: string
  bgColor: string
  hoverBgColor: string
}[] = [
  {
    status: 'confirmed',
    label: 'Konfirmasi',
    icon: <CheckCircle className="w-4 h-4" />,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    hoverBgColor: 'hover:bg-orange-500/20'
  },
  {
    status: 'preparing',
    label: 'Proses',
    icon: <ChefHat className="w-4 h-4" />,
    color: 'text-[#8B5CF6]',
    bgColor: 'bg-[#8B5CF6]/10',
    hoverBgColor: 'hover:bg-[#8B5CF6]/20'
  },
  {
    status: 'ready',
    label: 'Siap',
    icon: <Bell className="w-4 h-4" />,
    color: 'text-[#10B981]',
    bgColor: 'bg-[#10B981]/10',
    hoverBgColor: 'hover:bg-[#10B981]/20'
  },
  {
    status: 'completed',
    label: 'Selesai',
    icon: <CheckCheck className="w-4 h-4" />,
    color: 'text-[#6B7280]',
    bgColor: 'bg-[#6B7280]/10',
    hoverBgColor: 'hover:bg-[#6B7280]/20'
  },
]

interface OrderStatusUpdateProps {
  orderId: string
  currentStatus: OrderStatus
}

export function OrderStatusUpdate({ orderId, currentStatus }: OrderStatusUpdateProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState<OrderStatus | null>(null)
  const [error, setError] = useState('')
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const handleUpdate = async (newStatus: OrderStatus) => {
    if (newStatus === currentStatus) return

    setLoading(newStatus)
    setError('')

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error

      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(null)
      setShowCancelConfirm(false)
    }
  }

  // Get the next logical status in the flow
  const statusOrder: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'completed']
  const currentIndex = statusOrder.indexOf(currentStatus)

  if (currentStatus === 'completed' || currentStatus === 'cancelled') {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-[#6B7280]">
          Pesanan sudah {currentStatus === 'completed' ? 'selesai' : 'dibatalkan'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Status Update Buttons */}
      <div className="grid grid-cols-2 gap-2">
        {statusButtons.map((btn) => {
          const btnIndex = statusOrder.indexOf(btn.status)
          const isNext = btnIndex === currentIndex + 1
          const isPast = btnIndex <= currentIndex
          const isDisabled = isPast || loading !== null

          return (
            <button
              key={btn.status}
              onClick={() => handleUpdate(btn.status)}
              disabled={isDisabled}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isPast
                  ? 'bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed'
                  : isNext
                  ? `${btn.bgColor} ${btn.color} ${btn.hoverBgColor} ring-2 ring-offset-1 ring-${btn.color.replace('text-', '')}`
                  : `${btn.bgColor} ${btn.color} ${btn.hoverBgColor}`
              }`}
            >
              {loading === btn.status ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                btn.icon
              )}
              {btn.label}
            </button>
          )
        })}
      </div>

      {/* Cancel Button */}
      {!showCancelConfirm ? (
        <button
          onClick={() => setShowCancelConfirm(true)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-[#EF4444] bg-[#EF4444]/5 hover:bg-[#EF4444]/10 transition-all"
        >
          <X className="w-4 h-4" />
          Batalkan Pesanan
        </button>
      ) : (
        <div className="p-4 rounded-lg bg-[#EF4444]/5 border border-[#EF4444]/20">
          <div className="flex items-center gap-2 mb-3 text-[#EF4444]">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Konfirmasi Pembatalan</span>
          </div>
          <p className="text-sm text-[#6B7280] mb-4">
            Apakah Anda yakin ingin membatalkan pesanan ini? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCancelConfirm(false)}
              className="flex-1 px-3 py-2 rounded-lg text-sm font-medium text-[#374151] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
            >
              Batal
            </button>
            <button
              onClick={() => handleUpdate('cancelled')}
              disabled={loading !== null}
              className="flex-1 px-3 py-2 rounded-lg text-sm font-medium text-white bg-[#EF4444] hover:bg-[#DC2626] transition-colors disabled:opacity-50"
            >
              {loading === 'cancelled' ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                'Ya, Batalkan'
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
