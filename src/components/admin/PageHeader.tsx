'use client'

import { ReactNode } from 'react'
import { HelpButton } from './tour'

interface PageHeaderProps {
  title: string
  description?: string
  tourId?: string // Optional tour ID, will auto-detect from path if not provided
  actions?: ReactNode
}

export function PageHeader({ title, description, tourId, actions }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-[#6B7280]">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <HelpButton tourId={tourId} variant="both" size="sm" className="text-[#6B7280]" />
          {actions}
        </div>
      </div>
    </div>
  )
}
