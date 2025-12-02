'use client'

import { useEffect, useState, useCallback } from 'react'
import { Check, Circle, Loader2, XCircle, Clock, ChefHat, Bell, PartyPopper } from 'lucide-react'

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'

interface StatusStep {
  status: OrderStatus
  label: string
  description: string
  icon: React.ReactNode
}

const statusSteps: StatusStep[] = [
  {
    status: 'pending',
    label: 'Pesanan Diterima',
    description: 'Menunggu konfirmasi restoran',
    icon: <Clock className="w-4 h-4" />,
  },
  {
    status: 'confirmed',
    label: 'Pesanan Dikonfirmasi',
    description: 'Restoran menerima pesanan Anda',
    icon: <Check className="w-4 h-4" />,
  },
  {
    status: 'preparing',
    label: 'Sedang Diproses',
    description: 'Pesanan sedang disiapkan',
    icon: <ChefHat className="w-4 h-4" />,
  },
  {
    status: 'ready',
    label: 'Siap Disajikan',
    description: 'Pesanan siap diantar ke meja Anda',
    icon: <Bell className="w-4 h-4" />,
  },
  {
    status: 'completed',
    label: 'Selesai',
    description: 'Selamat menikmati!',
    icon: <PartyPopper className="w-4 h-4" />,
  },
]

interface OrderStatusTrackerProps {
  orderId: string
  initialStatus: OrderStatus
}

export function OrderStatusTracker({ orderId, initialStatus }: OrderStatusTrackerProps) {
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(initialStatus)

  // Fetch status from API
  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`)
      if (response.ok) {
        const data = await response.json()
        if (data.status !== currentStatus) {
          setCurrentStatus(data.status)
        }
      }
    } catch (error) {
      console.error('Failed to fetch order status:', error)
    }
  }, [orderId, currentStatus])

  // Poll for status updates every 5 seconds
  useEffect(() => {
    // Don't poll if order is completed or cancelled
    if (currentStatus === 'completed' || currentStatus === 'cancelled') {
      return
    }

    // Initial fetch
    fetchStatus()

    // Set up polling interval
    const interval = setInterval(fetchStatus, 5000)

    return () => clearInterval(interval)
  }, [currentStatus, fetchStatus])

  if (currentStatus === 'cancelled') {
    return (
      <div className="bg-[#E74C3C]/10 border border-[#E74C3C] rounded-2xl p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#E74C3C] flex items-center justify-center">
          <XCircle className="w-8 h-8 text-white" />
        </div>
        <p className="text-[#E74C3C] font-semibold text-lg">Pesanan Dibatalkan</p>
        <p className="text-[#9AA0A6] text-sm mt-1">Hubungi restoran untuk informasi lebih lanjut</p>
      </div>
    )
  }

  const currentStepIndex = statusSteps.findIndex((step) => step.status === currentStatus)

  return (
    <div className="bg-white rounded-2xl shadow-savora-card p-4">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-[#202124]">Status Pesanan</h3>
      </div>

      <div className="space-y-0">
        {statusSteps.map((step, index) => {
          const isCompleted = index < currentStepIndex
          const isCurrent = index === currentStepIndex
          const isPending = index > currentStepIndex
          const isLast = index === statusSteps.length - 1

          return (
            <div key={step.status} className="flex gap-4">
              {/* Timeline */}
              <div className="flex flex-col items-center">
                {/* Icon Circle */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                    isCompleted
                      ? 'bg-[#00B894] text-white'
                      : isCurrent
                      ? currentStatus === 'completed' ? 'bg-[#00B894] text-white' : 'bg-primary text-white'
                      : 'bg-[#E8EAED] text-[#9AA0A6]'
                  }`}
                >
                  {isCompleted || (isCurrent && currentStatus === 'completed') ? (
                    <Check className="w-4 h-4" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </div>

                {/* Connector Line */}
                {!isLast && (
                  <div
                    className={`w-0.5 h-16 transition-all duration-500 ${
                      isCompleted ? 'bg-[#00B894]' : 'bg-[#E8EAED]'
                    }`}
                  />
                )}
              </div>

              {/* Content */}
              <div className={`flex-1 pb-6 ${isLast ? 'pb-0' : ''}`}>
                <p
                  className={`font-semibold transition-colors ${
                    isCompleted || isCurrent ? 'text-[#202124]' : 'text-[#9AA0A6]'
                  } ${isCurrent ? 'text-primary' : ''}`}
                >
                  {step.label}
                </p>
                <p
                  className={`text-sm mt-0.5 ${
                    isCompleted || isCurrent ? 'text-[#5F6368]' : 'text-[#BDC1C6]'
                  }`}
                >
                  {step.description}
                </p>

                {/* Current Status Indicator - Only show for non-completed status */}
                {isCurrent && currentStatus !== 'completed' && (
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-primary">Sedang berlangsung</span>
                  </div>
                )}

                {/* Completed Status Indicator */}
                {isCurrent && currentStatus === 'completed' && (
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-[#00B894]/10 rounded-full">
                    <Check className="w-3 h-3 text-[#00B894]" />
                    <span className="text-xs font-medium text-[#00B894]">Pesanan selesai</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
