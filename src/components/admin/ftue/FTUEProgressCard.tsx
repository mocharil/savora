'use client'

import { useFTUE } from './FTUEProvider'
import Link from 'next/link'
import {
  CheckCircle2,
  Circle,
  ChevronRight,
  X,
  Sparkles,
  Building2,
  UtensilsCrossed,
  QrCode,
  Users,
} from 'lucide-react'

const stepIcons: Record<string, typeof Building2> = {
  outlet: Building2,
  menu: UtensilsCrossed,
  tables: QrCode,
  users: Users,
}

export function FTUEProgressCard() {
  const {
    steps,
    currentStep,
    completedCount,
    totalCount,
    isAllCompleted,
    isFTUEDismissed,
    dismissFTUE,
  } = useFTUE()

  // Don't show if dismissed or all completed
  if (isFTUEDismissed || isAllCompleted) {
    return null
  }

  const progressPercent = (completedCount / totalCount) * 100

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#3B82F6] to-[#2563EB] px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Selamat Datang!</h3>
              <p className="text-sm text-white/80">
                Mari siapkan toko Anda dalam beberapa langkah
              </p>
            </div>
          </div>
          <button
            onClick={dismissFTUE}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            title="Sembunyikan panduan"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-white/80 mb-2">
            <span>Progress</span>
            <span>{completedCount} dari {totalCount} selesai</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="divide-y divide-[#E5E7EB]">
        {steps.map((step, index) => {
          const Icon = stepIcons[step.id] || Circle
          const isActive = currentStep?.id === step.id

          return (
            <Link
              key={step.id}
              href={step.href}
              className={`flex items-center gap-4 px-5 py-4 transition-colors ${
                step.isCompleted
                  ? 'bg-[#F0FDF4]'
                  : isActive
                  ? 'bg-[#EFF6FF] hover:bg-[#DBEAFE]'
                  : 'hover:bg-[#F9FAFB]'
              }`}
            >
              {/* Step Number/Check */}
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0 ${
                  step.isCompleted
                    ? 'bg-[#22C55E] text-white'
                    : isActive
                    ? 'bg-[#3B82F6] text-white'
                    : 'bg-[#E5E7EB] text-[#6B7280]'
                }`}
              >
                {step.isCompleted ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${
                    step.isCompleted
                      ? 'text-[#22C55E]'
                      : isActive
                      ? 'text-[#3B82F6]'
                      : 'text-[#6B7280]'
                  }`} />
                  <h4
                    className={`font-medium ${
                      step.isCompleted
                        ? 'text-[#22C55E]'
                        : isActive
                        ? 'text-[#1E40AF]'
                        : 'text-[#111827]'
                    }`}
                  >
                    {step.title}
                  </h4>
                  {step.isCompleted && (
                    <span className="text-xs bg-[#22C55E]/10 text-[#22C55E] px-2 py-0.5 rounded-full font-medium">
                      Selesai
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#6B7280] mt-0.5">{step.description}</p>
              </div>

              {/* Arrow */}
              {!step.isCompleted && (
                <ChevronRight className={`h-5 w-5 flex-shrink-0 ${
                  isActive ? 'text-[#3B82F6]' : 'text-[#9CA3AF]'
                }`} />
              )}
            </Link>
          )
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-[#F9FAFB] border-t border-[#E5E7EB]">
        <button
          onClick={dismissFTUE}
          className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
        >
          Lewati sekarang, tunjukkan lagi nanti
        </button>
      </div>
    </div>
  )
}
