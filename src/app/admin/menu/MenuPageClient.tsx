'use client'

import Link from 'next/link'
import { Plus, Sparkles, UtensilsCrossed, ChefHat } from 'lucide-react'
import { PageTourButton } from '@/components/admin/tour'
import { ShimmerButton } from '@/components/ui/shimmer-button'

interface MenuPageClientProps {
  activeTab?: 'list' | 'ai-creator'
  onTabChange?: (tab: 'list' | 'ai-creator') => void
}

export function MenuPageClient({ activeTab = 'list', onTabChange }: MenuPageClientProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu</h1>
          <p className="text-sm text-gray-500">Kelola menu makanan dan minuman</p>
        </div>
        <div className="flex items-center gap-3">
          <PageTourButton />
          {activeTab === 'list' && (
            <Link href="/admin/menu/create" data-tour="menu-add-btn">
              <ShimmerButton
                shimmerColor="#34d399"
                shimmerSize="0.08em"
                shimmerDuration="2.5s"
                borderRadius="12px"
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

      {/* Modern Tab Navigation */}
      <div className="bg-gray-100/80 p-1.5 rounded-2xl inline-flex gap-1">
        <button
          onClick={() => onTabChange?.('list')}
          className={`relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
            activeTab === 'list'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
          }`}
        >
          <div className={`p-1.5 rounded-lg transition-colors ${
            activeTab === 'list'
              ? 'bg-orange-100'
              : 'bg-transparent'
          }`}>
            <UtensilsCrossed className={`w-4 h-4 ${
              activeTab === 'list' ? 'text-orange-600' : 'text-gray-400'
            }`} />
          </div>
          <span>Daftar Menu</span>
        </button>

        <button
          onClick={() => onTabChange?.('ai-creator')}
          className={`relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
            activeTab === 'ai-creator'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
          }`}
        >
          <div className={`p-1.5 rounded-lg transition-colors ${
            activeTab === 'ai-creator'
              ? 'bg-gradient-to-br from-violet-100 to-purple-100'
              : 'bg-transparent'
          }`}>
            <Sparkles className={`w-4 h-4 ${
              activeTab === 'ai-creator' ? 'text-violet-600' : 'text-gray-400'
            }`} />
          </div>
          <span>AI Menu Creator</span>
          {activeTab !== 'ai-creator' && (
            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-md">
              AI
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
