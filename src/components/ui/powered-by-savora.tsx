'use client'

import { cn } from '@/lib/utils'

interface PoweredBySavoraProps {
  className?: string
  variant?: 'light' | 'dark'
  size?: 'sm' | 'md'
}

export function PoweredBySavora({
  className,
  variant = 'light',
  size = 'sm'
}: PoweredBySavoraProps) {
  const textColor = variant === 'light' ? 'text-gray-400' : 'text-gray-500'
  const linkColor = variant === 'light'
    ? 'text-orange-500 hover:text-orange-600'
    : 'text-orange-600 hover:text-orange-700'
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs'
  const iconSize = size === 'sm' ? 12 : 14

  return (
    <div className={cn("flex items-center justify-center gap-1.5", className)}>
      <span className={cn(textColor, textSize)}>Powered by</span>
      <a
        href="https://savora.id"
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex items-center gap-1 font-semibold transition-colors",
          linkColor,
          textSize
        )}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
        Savora
      </a>
    </div>
  )
}
