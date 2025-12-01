'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { PageTourButton } from '@/components/admin/tour'
import { ShimmerButton } from '@/components/ui/shimmer-button'

export function CategoriesPageClient() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-[#111827]">Kategori Menu</h1>
        <p className="text-sm text-[#6B7280]">Kelola kategori untuk mengorganisir menu Anda</p>
      </div>
      <div className="flex items-center gap-3">
        <PageTourButton />
        <Link href="/admin/categories/create" data-tour="categories-add-btn">
          <ShimmerButton
            shimmerColor="#34d399"
            shimmerSize="0.08em"
            shimmerDuration="2.5s"
            borderRadius="8px"
            background="linear-gradient(135deg, #10b981 0%, #059669 100%)"
            className="h-10 px-4 text-sm font-medium gap-2"
          >
            <Plus className="w-4 h-4" />
            Tambah Kategori
          </ShimmerButton>
        </Link>
      </div>
    </div>
  )
}
