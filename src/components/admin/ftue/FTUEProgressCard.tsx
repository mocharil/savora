'use client'

import { useState } from 'react'
import { useFTUE } from './FTUEProvider'
import Link from 'next/link'
import {
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  X,
  Rocket,
  UtensilsCrossed,
  QrCode,
  Users,
  FolderOpen,
} from 'lucide-react'

const stepIcons: Record<string, typeof FolderOpen> = {
  categories: FolderOpen,
  menu: UtensilsCrossed,
  tables: QrCode,
  users: Users,
}

export function FTUEProgressCard() {
  const [isExpanded, setIsExpanded] = useState(false)
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
  const nextStep = steps.find(s => !s.isCompleted)

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg shadow-orange-500/20 overflow-hidden">
      {/* Compact Header - Always Visible */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 flex-shrink-0">
            <Rocket className="h-4 w-4 text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">
                Setup Toko
              </span>
              <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
                {completedCount}/{totalCount}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              {nextStep && (
                <span className="text-xs text-white/80 whitespace-nowrap">
                  Selanjutnya: {nextStep.title}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {nextStep && (
              <Link
                href={nextStep.href}
                className="flex items-center gap-1 h-8 px-3 bg-white text-orange-600 rounded-lg text-xs font-semibold hover:bg-orange-50 transition-colors"
              >
                Lanjutkan
                <ChevronRight className="w-3 h-3" />
              </Link>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/20 text-white transition-colors"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={dismissFTUE}
              className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/20 text-white/70 hover:text-white transition-colors"
              title="Sembunyikan"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Steps - Collapsible */}
      {isExpanded && (
        <div className="bg-white border-t border-orange-200">
          <div className="p-3 space-y-1">
            {steps.map((step, index) => {
              const Icon = stepIcons[step.id]
              const isActive = currentStep?.id === step.id

              return (
                <Link
                  key={step.id}
                  href={step.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    step.isCompleted
                      ? 'bg-emerald-50'
                      : isActive
                      ? 'bg-orange-50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Check/Number */}
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full flex-shrink-0 text-xs font-medium ${
                      step.isCompleted
                        ? 'bg-emerald-500 text-white'
                        : isActive
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.isCompleted ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>

                  {/* Icon & Title */}
                  <Icon className={`h-4 w-4 flex-shrink-0 ${
                    step.isCompleted
                      ? 'text-emerald-500'
                      : isActive
                      ? 'text-orange-500'
                      : 'text-gray-400'
                  }`} />

                  <span className={`text-sm font-medium ${
                    step.isCompleted
                      ? 'text-emerald-700'
                      : isActive
                      ? 'text-orange-700'
                      : 'text-gray-700'
                  }`}>
                    {step.title}
                  </span>

                  {step.isCompleted && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded font-medium ml-auto">
                      Selesai
                    </span>
                  )}

                  {!step.isCompleted && step.isOptional && (
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">
                      Opsional
                    </span>
                  )}

                  {!step.isCompleted && (
                    <ChevronRight className={`h-4 w-4 ${step.isOptional ? '' : 'ml-auto'} ${
                      isActive ? 'text-orange-400' : 'text-gray-300'
                    }`} />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
            <button
              onClick={dismissFTUE}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Lewati setup, tampilkan nanti
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
