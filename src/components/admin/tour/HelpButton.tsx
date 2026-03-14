'use client'

import { usePathname } from 'next/navigation'
import { useTour } from './TourProvider'
import { getPageTourId, getTourById } from './tour-config'
import { HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface HelpButtonProps {
  tourId?: string // Override automatic detection
  variant?: 'icon' | 'text' | 'both'
  size?: 'sm' | 'lg' | 'default'
  className?: string
}

export function HelpButton({
  tourId,
  variant = 'both',
  size = 'sm',
  className,
}: HelpButtonProps) {
  const pathname = usePathname()
  const { startTour, isActive } = useTour()

  // Determine which tour to use
  const effectiveTourId = tourId || getPageTourId(pathname)
  const tour = effectiveTourId ? getTourById(effectiveTourId) : null

  if (!tour) return null

  const handleClick = () => {
    if (!isActive && effectiveTourId) {
      startTour(effectiveTourId)
    }
  }

  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'

  if (variant === 'icon') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClick}
              disabled={isActive}
              className={className}
              aria-label="Lihat tutorial halaman ini"
            >
              <HelpCircle className={iconSize} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Panduan halaman</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (variant === 'text') {
    return (
      <Button
        variant="ghost"
        size={size}
        onClick={handleClick}
        disabled={isActive}
        className={className}
      >
        Lihat Tutorial
      </Button>
    )
  }

  // variant === 'both'
  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleClick}
      disabled={isActive}
      className={className}
    >
      <HelpCircle className={`${iconSize} mr-2`} />
      Lihat Tutorial
    </Button>
  )
}
