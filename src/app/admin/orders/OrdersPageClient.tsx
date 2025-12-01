'use client'

import { PageTourButton } from '@/components/admin/tour'

export function OrdersPageClient() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-[#111827]">Pesanan</h1>
        <p className="text-sm text-[#6B7280]">Kelola pesanan dari pelanggan</p>
      </div>
      <PageTourButton />
    </div>
  )
}
