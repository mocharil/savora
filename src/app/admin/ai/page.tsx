import { AIAssistant } from '@/components/admin/ai/ai-assistant'
import { AIPageClient } from './AIPageClient'

export default function AIPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <AIPageClient />

      {/* AI Chat Assistant */}
      <AIAssistant />
    </div>
  )
}
