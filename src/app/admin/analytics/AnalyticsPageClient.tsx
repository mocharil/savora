'use client'

import { PageTourButton } from '@/components/admin/tour'

export function AnalyticsPageClient() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-[#111827]">Analytics</h1>
        <p className="text-sm text-[#6B7280]">Pantau performa bisnis Anda</p>
      </div>
      <PageTourButton />
    </div>
  )
}
