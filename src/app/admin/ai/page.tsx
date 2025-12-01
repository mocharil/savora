import { AIAssistant } from '@/components/admin/ai/ai-assistant'
import { AIInsightsCard } from '@/components/admin/ai/AIInsightsCard'
import { SalesForecastChart } from '@/components/admin/ai/SalesForecastChart'
import { PricingRecommendationPanel } from '@/components/admin/ai/PricingRecommendationPanel'
import { AIPageClient } from './AIPageClient'

export default function AIPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <AIPageClient />

      {/* AI Insights & Forecast Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* AI Business Insights */}
        <AIInsightsCard />

        {/* Sales Forecast */}
        <SalesForecastChart />
      </div>

      {/* Pricing Optimizer */}
      <PricingRecommendationPanel />

      {/* AI Chat Assistant */}
      <div className="mt-6">
        <AIAssistant />
      </div>
    </div>
  )
}
