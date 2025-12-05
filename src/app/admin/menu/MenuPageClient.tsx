'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, UtensilsCrossed, Sparkles } from 'lucide-react'
import { PageTourButton } from '@/components/admin/tour'
import { ShimmerButton } from '@/components/ui/shimmer-button'

interface MenuPageClientProps {
  activeTab?: 'list' | 'ai-creator'
  onTabChange?: (tab: 'list' | 'ai-creator') => void
}

export function MenuPageClient({ activeTab = 'list', onTabChange }: MenuPageClientProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Menu</h1>
          <p className="text-sm text-[#6B7280]">Kelola menu makanan dan minuman</p>
        </div>
        <div className="flex items-center gap-3">
          <PageTourButton />
          {activeTab === 'list' && (
            <Link href="/admin/menu/create" data-tour="menu-add-btn">
              <ShimmerButton
                shimmerColor="#34d399"
                shimmerSize="0.08em"
                shimmerDuration="2.5s"
                borderRadius="8px"
                background="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                className="h-10 px-4 text-sm font-medium gap-2"
              >
                <Plus className="w-4 h-4" />
                Tambah Menu
              </ShimmerButton>
            </Link>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => onTabChange?.('list')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'list'
              ? 'text-orange-600 border-orange-500'
              : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          Daftar Menu
        </button>
        <button
          onClick={() => onTabChange?.('ai-creator')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'ai-creator'
              ? 'text-orange-600 border-orange-500'
              : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          AI Menu Creator
        </button>
      </div>
    </div>
  )
}
