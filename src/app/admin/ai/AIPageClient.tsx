'use client'

import { Sparkles } from 'lucide-react'
import { PageTourButton } from '@/components/admin/tour'

export function AIPageClient() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
          <p className="text-gray-600 text-sm">
            Asisten cerdas untuk membantu mengembangkan bisnis UMKM Anda
          </p>
        </div>
      </div>
      <PageTourButton />
    </div>
  )
}
