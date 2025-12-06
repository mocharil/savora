'use client'

import { usePathname } from 'next/navigation'
import { useTour } from './TourProvider'
import { getPageTourId, getTourById } from './tour-config'
import { HelpCircle } from 'lucide-react'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface PageTourButtonProps {
  className?: string
  /** Optional tour ID to override auto-detection based on pathname */
  tourId?: string
}

/**
 * A button that automatically shows the tutorial for the current page.
 * Place this in each page's header area.
 * Can also accept a custom tourId prop to override the auto-detection.
 */
export function PageTourButton({ className, tourId: customTourId }: PageTourButtonProps) {
  const pathname = usePathname()
  const { startTour, isActive } = useTour()

  // Use custom tourId if provided, otherwise auto-detect based on current page
  const tourId = customTourId || getPageTourId(pathname)
  const tour = tourId ? getTourById(tourId) : null

  // Don't render if no tour available for this page
  if (!tour) return null

  const handleClick = () => {
    if (!isActive && tourId) {
      startTour(tourId)
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <ShimmerButton
            onClick={handleClick}
            disabled={isActive}
            shimmerColor="#60a5fa"
            shimmerSize="0.08em"
            shimmerDuration="2.5s"
            borderRadius="8px"
            background="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
            className={cn(
              "h-9 px-4 text-sm font-medium gap-2",
              isActive && "opacity-50 cursor-not-allowed",
              className
            )}
          >
            <HelpCircle className="w-4 h-4" />
            Lihat Tutorial
          </ShimmerButton>
        </TooltipTrigger>
        <TooltipContent>
          <p>Pelajari cara menggunakan halaman ini</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
