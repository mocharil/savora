'use client'

import { Download } from 'lucide-react'
import { PageTourButton } from '@/components/admin/tour'

export function DashboardPageClient() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-[#111827]">Dashboard</h1>
        <p className="text-sm text-[#6B7280]">Ringkasan aktivitas toko Anda</p>
      </div>
      <div className="flex items-center gap-3">
        <PageTourButton />
        <button className="flex items-center gap-2 h-10 px-4 bg-white border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] transition-colors">
          <Download className="w-4 h-4" />
          Export Laporan
        </button>
      </div>
    </div>
  )
}
