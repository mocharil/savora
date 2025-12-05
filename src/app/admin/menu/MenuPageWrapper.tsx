'use client'

import { useState } from 'react'
import { MenuPageClient } from './MenuPageClient'
import { MenuFilters } from '@/components/admin/menu-filters'
import { AIMenuCreatorInline } from '@/components/admin/ai-menu-creator-inline'

interface Category {
  id: string
  name: string
}

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  discount_price: number | null
  image_url: string | null
  is_available: boolean
  is_featured: boolean
  category: { name: string; id: string } | null
}

interface MenuPageWrapperProps {
  categories: Category[]
  menuItems: MenuItem[]
  storeId: string
}

export function MenuPageWrapper({ categories, menuItems, storeId }: MenuPageWrapperProps) {
  const [activeTab, setActiveTab] = useState<'list' | 'ai-creator'>('list')

  return (
    <div className="space-y-6">
      {/* Page Header with Tabs */}
      <MenuPageClient activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      {activeTab === 'list' ? (
        <MenuFilters categories={categories} menuItems={menuItems} />
      ) : (
        <AIMenuCreatorInline storeId={storeId} />
      )}
    </div>
  )
}
