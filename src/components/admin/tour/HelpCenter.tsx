'use client'

import { useState } from 'react'
import { useTour } from './TourProvider'
import { ALL_TOURS, TourConfig } from './tour-config'
import {
  HelpCircle,
  PlayCircle,
  CheckCircle2,
  RotateCcw,
  BookOpen,
  GraduationCap,
  FileText,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface HelpCenterProps {
  triggerVariant?: 'icon' | 'text' | 'both'
  className?: string
}

export function HelpCenter({ triggerVariant = 'both', className }: HelpCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const {
    startTour,
    completedTours,
    hasCompletedFTUE,
    resetFTUE,
    isActive,
  } = useTour()

  const handleStartTour = (tourId: string) => {
    setIsOpen(false)
    setTimeout(() => {
      startTour(tourId)
    }, 300) // Wait for dialog close animation
  }

  const handleResetFTUE = () => {
    resetFTUE()
    setIsOpen(false)
    setTimeout(() => {
      startTour('ftue_main')
    }, 300)
  }

  const ftueTours = ALL_TOURS.filter(t => t.category === 'ftue')
  const pageTours = ALL_TOURS.filter(t => t.category === 'page')

  const getCategoryIcon = (category: TourConfig['category']) => {
    switch (category) {
      case 'ftue':
        return GraduationCap
      case 'page':
        return FileText
      default:
        return BookOpen
    }
  }

  const trigger = (
    <Button
      variant="ghost"
      size={triggerVariant === 'icon' ? 'icon' : 'sm'}
      className={className}
      disabled={isActive}
    >
      <HelpCircle className={cn('w-5 h-5', triggerVariant !== 'icon' && 'mr-2')} />
      {triggerVariant !== 'icon' && 'Bantuan & Tutorial'}
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="w-5 h-5 text-[#3B82F6]" />
            Bantuan & Tutorial
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* FTUE Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Tour Pengenalan
              </h3>
              {hasCompletedFTUE && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFTUE}
                  className="text-xs text-gray-500 hover:text-[#3B82F6] h-7 px-2"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Ulangi dari awal
                </Button>
              )}
            </div>

            <div className="space-y-2">
              {ftueTours.map(tour => {
                const isCompleted = completedTours.includes(tour.id)
                return (
                  <div
                    key={tour.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{tour.name}</p>
                        <p className="text-xs text-gray-500">{tour.steps.length} langkah</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={isCompleted ? 'outline' : 'default'}
                      onClick={() => handleStartTour(tour.id)}
                      className="gap-1.5"
                    >
                      <PlayCircle className="w-4 h-4" />
                      {isCompleted ? 'Lihat Lagi' : 'Mulai'}
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Page Tours Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4" />
              Tutorial Per Halaman
            </h3>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {pageTours.map(tour => {
                const isCompleted = completedTours.includes(tour.id)
                return (
                  <div
                    key={tour.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{tour.name}</p>
                        <p className="text-xs text-gray-500">
                          {tour.description} - {tour.steps.length} langkah
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleStartTour(tour.id)}
                      className="gap-1.5 shrink-0"
                    >
                      <PlayCircle className="w-4 h-4" />
                      Mulai
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="pt-3 border-t">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Keyboard Shortcuts
            </h4>
            <div className="flex flex-wrap gap-3 text-xs text-gray-600">
              <div className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border text-[10px]">→</kbd>
                <span>Berikutnya</span>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border text-[10px]">←</kbd>
                <span>Kembali</span>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border text-[10px]">Esc</kbd>
                <span>Lewati</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
