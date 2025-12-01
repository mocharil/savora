'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTour } from './TourProvider'
import { TourPosition } from './tour-config'
import { cn } from '@/lib/utils'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ElementRect {
  top: number
  left: number
  width: number
  height: number
  bottom: number
  right: number
}

interface TooltipPosition {
  top: number
  left: number
  arrowPosition: 'top' | 'bottom' | 'left' | 'right'
}

export function TourOverlay() {
  const {
    isActive,
    currentStep,
    currentStepIndex,
    totalSteps,
    nextStep,
    prevStep,
    skipTour,
    endTour,
  } = useTour()

  const [targetRect, setTargetRect] = useState<ElementRect | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const tooltipRef = useRef<HTMLDivElement>(null)

  // Find target element and calculate positions
  const updatePositions = useCallback(() => {
    if (!currentStep) {
      setTargetRect(null)
      setTooltipPosition(null)
      return
    }

    const target = document.querySelector(currentStep.target)

    if (!target) {
      // Retry mechanism for elements that might not be loaded yet
      if (retryCount < 10) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
        }, 200)
      }
      return
    }

    const rect = target.getBoundingClientRect()
    const padding = currentStep.spotlightPadding ?? 8

    const newTargetRect: ElementRect = {
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
      bottom: rect.bottom + padding,
      right: rect.right + padding,
    }

    setTargetRect(newTargetRect)

    // Scroll element into view if needed
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })

    // Calculate tooltip position after a small delay to allow for scroll
    setTimeout(() => {
      calculateTooltipPosition(newTargetRect, currentStep.position || 'bottom')
    }, 100)
  }, [currentStep, retryCount])

  const calculateTooltipPosition = useCallback(
    (rect: ElementRect, preferredPosition: TourPosition) => {
      if (!tooltipRef.current) return

      const tooltipRect = tooltipRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const gap = 12

      let top = 0
      let left = 0
      let arrowPosition: TooltipPosition['arrowPosition'] = 'top'
      let finalPosition = preferredPosition

      // Helper to check if position fits
      const fitsTop = rect.top - tooltipRect.height - gap > 0
      const fitsBottom = rect.bottom + tooltipRect.height + gap < viewportHeight
      const fitsLeft = rect.left - tooltipRect.width - gap > 0
      const fitsRight = rect.right + tooltipRect.width + gap < viewportWidth

      // Auto-adjust position if preferred doesn't fit
      if (preferredPosition === 'top' && !fitsTop) {
        finalPosition = fitsBottom ? 'bottom' : fitsRight ? 'right' : 'left'
      } else if (preferredPosition === 'bottom' && !fitsBottom) {
        finalPosition = fitsTop ? 'top' : fitsRight ? 'right' : 'left'
      } else if (preferredPosition === 'left' && !fitsLeft) {
        finalPosition = fitsRight ? 'right' : fitsBottom ? 'bottom' : 'top'
      } else if (preferredPosition === 'right' && !fitsRight) {
        finalPosition = fitsLeft ? 'left' : fitsBottom ? 'bottom' : 'top'
      }

      // Calculate based on final position
      switch (finalPosition) {
        case 'top':
          top = rect.top - tooltipRect.height - gap
          left = rect.left + rect.width / 2 - tooltipRect.width / 2
          arrowPosition = 'bottom'
          break
        case 'bottom':
          top = rect.bottom + gap
          left = rect.left + rect.width / 2 - tooltipRect.width / 2
          arrowPosition = 'top'
          break
        case 'left':
          top = rect.top + rect.height / 2 - tooltipRect.height / 2
          left = rect.left - tooltipRect.width - gap
          arrowPosition = 'right'
          break
        case 'right':
          top = rect.top + rect.height / 2 - tooltipRect.height / 2
          left = rect.right + gap
          arrowPosition = 'left'
          break
        case 'center':
          top = viewportHeight / 2 - tooltipRect.height / 2
          left = viewportWidth / 2 - tooltipRect.width / 2
          arrowPosition = 'top'
          break
      }

      // Final boundary checks - keep within viewport
      const padding = 16
      if (left < padding) left = padding
      if (left + tooltipRect.width > viewportWidth - padding) {
        left = viewportWidth - tooltipRect.width - padding
      }
      if (top < padding) top = padding
      if (top + tooltipRect.height > viewportHeight - padding) {
        top = viewportHeight - tooltipRect.height - padding
      }

      setTooltipPosition({ top, left, arrowPosition })
    },
    []
  )

  // Reset retry count when step changes
  useEffect(() => {
    setRetryCount(0)
  }, [currentStepIndex])

  // Update positions when step changes or on retry
  useEffect(() => {
    if (isActive && currentStep) {
      updatePositions()
    }
  }, [isActive, currentStep, updatePositions])

  // Handle resize and scroll
  useEffect(() => {
    if (!isActive) return

    const handleUpdate = () => updatePositions()
    window.addEventListener('resize', handleUpdate)
    window.addEventListener('scroll', handleUpdate, true)

    return () => {
      window.removeEventListener('resize', handleUpdate)
      window.removeEventListener('scroll', handleUpdate, true)
    }
  }, [isActive, updatePositions])

  // Fade in animation
  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => setIsVisible(true), 50)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [isActive])

  // Handle keyboard navigation
  useEffect(() => {
    if (!isActive) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          skipTour()
          break
        case 'ArrowRight':
        case 'Enter':
          nextStep()
          break
        case 'ArrowLeft':
          if (currentStepIndex > 0) prevStep()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isActive, currentStepIndex, nextStep, prevStep, skipTour])

  if (!isActive || !currentStep) return null

  const overlayContent = (
    <div
      className={cn(
        'fixed inset-0 z-[9999] transition-opacity duration-300',
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
    >
      {/* Backdrop with spotlight cutout using SVG */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left}
                y={targetRect.top}
                width={targetRect.width}
                height={targetRect.height}
                rx="8"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.75)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Spotlight border glow */}
      {targetRect && (
        <div
          className="absolute rounded-lg ring-2 ring-[#3B82F6] ring-offset-2 ring-offset-transparent pointer-events-none"
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={cn(
          'absolute z-[10000] w-[320px] max-w-[calc(100vw-32px)] bg-white rounded-xl shadow-2xl transition-all duration-300',
          isVisible && tooltipPosition ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        )}
        style={{
          top: tooltipPosition?.top ?? 0,
          left: tooltipPosition?.left ?? 0,
        }}
      >
        {/* Arrow */}
        {tooltipPosition && (
          <div
            className={cn(
              'absolute w-3 h-3 bg-white transform rotate-45',
              tooltipPosition.arrowPosition === 'top' && '-top-1.5 left-1/2 -translate-x-1/2',
              tooltipPosition.arrowPosition === 'bottom' && '-bottom-1.5 left-1/2 -translate-x-1/2',
              tooltipPosition.arrowPosition === 'left' && '-left-1.5 top-1/2 -translate-y-1/2',
              tooltipPosition.arrowPosition === 'right' && '-right-1.5 top-1/2 -translate-y-1/2'
            )}
          />
        )}

        {/* Content */}
        <div className="relative p-5">
          {/* Header with step counter and close button */}
          <div className="flex items-center justify-between mb-3">
            {/* Step indicator dots */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    i === currentStepIndex
                      ? 'w-6 bg-[#3B82F6]'
                      : i < currentStepIndex
                      ? 'w-1.5 bg-[#3B82F6]/50'
                      : 'w-1.5 bg-gray-200'
                  )}
                />
              ))}
            </div>

            {/* Step counter and close button */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">
                {currentStepIndex + 1}/{totalSteps}
              </span>
              <button
                onClick={skipTour}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Tutup tour"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Title & Description */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {currentStep.title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            {currentStep.description}
          </p>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={skipTour}
              className="text-gray-500 hover:text-gray-700"
            >
              Lewati
            </Button>

            <div className="flex items-center gap-2">
              {currentStepIndex > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevStep}
                  className="gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Kembali
                </Button>
              )}

              <Button
                size="sm"
                onClick={nextStep}
                className="gap-1 bg-[#3B82F6] hover:bg-[#2563EB]"
              >
                {currentStepIndex === totalSteps - 1 ? (
                  'Selesai'
                ) : (
                  <>
                    Berikutnya
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Use portal to render at document body level
  if (typeof window === 'undefined') return null
  return createPortal(overlayContent, document.body)
}
