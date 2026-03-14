'use client'

import { useFTUE } from './FTUEProvider'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Lightbulb,
  ChevronRight,
  X,
  UtensilsCrossed,
  QrCode,
  Users,
  Plus,
  FolderOpen,
} from 'lucide-react'

interface FTUEBannerProps {
  stepId: 'categories' | 'menu' | 'tables' | 'users'
  emptyState?: boolean
  ctaLabel?: string
  ctaHref?: string
}

const stepConfig = {
  categories: {
    icon: FolderOpen,
    title: 'Buat Kategori Menu',
    description: 'Kategori membantu mengelompokkan menu Anda. Contoh: Makanan, Minuman, Dessert.',
    emptyTitle: 'Belum ada kategori',
    emptyDescription: 'Buat kategori dulu sebelum menambahkan menu.',
    ctaLabel: 'Tambah Kategori',
    ctaHref: '/admin/categories',
  },
  menu: {
    icon: UtensilsCrossed,
    title: 'Tambahkan Menu Pertama',
    description: 'Menu adalah produk yang akan ditampilkan ke pelanggan.',
    emptyTitle: 'Belum ada menu',
    emptyDescription: 'Tambahkan menu agar pelanggan bisa melihat dan memesan produk Anda.',
    ctaLabel: 'Tambah Menu',
    ctaHref: '/admin/menu',
  },
  tables: {
    icon: QrCode,
    title: 'Atur Meja & Generate QR',
    description: 'Buat meja dan generate QR code untuk pemesanan di tempat.',
    emptyTitle: 'Belum ada meja',
    emptyDescription: 'Tambahkan meja dan generate QR code untuk mempermudah pemesanan.',
    ctaLabel: 'Tambah Meja',
    ctaHref: '/admin/tables/create',
  },
  users: {
    icon: Users,
    title: 'Undang Staff atau Kasir',
    description: 'Tambahkan user lain untuk membantu mengelola toko dan pesanan.',
    emptyTitle: 'Belum ada staff lain',
    emptyDescription: 'Anda bisa menambahkan staff untuk membantu mengelola toko.',
    ctaLabel: 'Tambah User',
    ctaHref: '/admin/users',
  },
}

export function FTUEBanner({ stepId, emptyState = false, ctaLabel, ctaHref }: FTUEBannerProps) {
  const { steps, currentStep, isFTUEDismissed, isAllCompleted } = useFTUE()
  const pathname = usePathname()

  const step = steps.find(s => s.id === stepId)
  const config = stepConfig[stepId]
  const Icon = config.icon

  // Don't show if:
  // - Step is already completed
  // - FTUE is dismissed and this isn't the empty state variant
  // - All steps are completed
  if (step?.isCompleted || (isFTUEDismissed && !emptyState) || isAllCompleted) {
    return null
  }

  // For empty state variant
  if (emptyState) {
    return (
      <div className="bg-gradient-to-r from-[#F0F9FF] to-[#E0F2FE] border border-[#BAE6FD] rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0EA5E9]/10 flex-shrink-0">
            <Icon className="h-6 w-6 text-[#0EA5E9]" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[#0C4A6E]">
              {config.emptyTitle}
            </h3>
            <p className="text-sm text-[#0369A1] mt-1">
              {config.emptyDescription}
            </p>
            <Link
              href={ctaHref || config.ctaHref}
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#0EA5E9] text-white rounded-lg font-medium text-sm hover:bg-[#0284C7] transition-colors"
            >
              <Plus className="h-4 w-4" />
              {ctaLabel || config.ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // For regular FTUE banner (highlighted step)
  if (currentStep?.id !== stepId) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-[#EFF6FF] to-[#DBEAFE] border border-[#93C5FD] rounded-xl p-4 mb-6">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 flex-shrink-0">
          <Lightbulb className="h-5 w-5 text-orange-500" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-[#1E40AF]">{config.title}</h4>
          <p className="text-sm text-orange-500 mt-0.5">{config.description}</p>
        </div>
        <Link
          href={ctaHref || config.ctaHref}
          className="flex items-center gap-1 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium text-sm hover:bg-orange-600 transition-colors whitespace-nowrap"
        >
          {ctaLabel || config.ctaLabel}
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
