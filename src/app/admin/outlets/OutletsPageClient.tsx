'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { PageTourButton } from '@/components/admin/tour'
import { ShimmerButton } from '@/components/ui/shimmer-button'

export function OutletsPageClient() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Outlet Management</h1>
        <p className="text-gray-500 mt-1">Kelola semua outlet/cabang restoran Anda</p>
      </div>
      <div className="flex items-center gap-3">
        <PageTourButton />
        <Link href="/admin/outlets/create" data-tour="outlets-add-btn">
          <ShimmerButton
            shimmerColor="#34d399"
            shimmerSize="0.08em"
            shimmerDuration="2.5s"
            borderRadius="8px"
            background="linear-gradient(135deg, #10b981 0%, #059669 100%)"
            className="h-10 px-4 text-sm font-medium gap-2"
          >
            <Plus className="w-4 h-4" />
            Tambah Outlet
          </ShimmerButton>
        </Link>
      </div>
    </div>
  )
}
