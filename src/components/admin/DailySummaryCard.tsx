'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  ShoppingBag,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Package,
  Utensils,
  Loader2,
  Calendar,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface TopSellingItem {
  id: string
  name: string
  quantity: number
  revenue: number
}

interface PeakHour {
  hour: number
  orders: number
  revenue: number
}

interface AIInsight {
  type: 'positive' | 'negative' | 'suggestion'
  message: string
}

interface AIRecommendation {
  priority: 'high' | 'medium' | 'low'
  action: string
  reason: string
}

interface DailySummary {
  id: string
  store_id: string
  summary_date: string
  total_revenue: number
  total_orders: number
  total_items_sold: number
  average_order_value: number
  pending_orders: number
  completed_orders: number
  cancelled_orders: number
  paid_orders: number
  unpaid_orders: number
  top_selling_items: TopSellingItem[]
  peak_hours: PeakHour[]
  ai_summary: string
  ai_insights: AIInsight[]
  ai_recommendations: AIRecommendation[]
  revenue_change_percent: number | null
  orders_change_percent: number | null
  generated_at: string
}

function formatHour(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00`
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function isYesterday(dateString: string): boolean {
  const date = new Date(dateString)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return date.toDateString() === yesterday.toDateString()
}

function TrendIndicator({ value, suffix = '%' }: { value: number | null; suffix?: string }) {
  if (value === null) return <span className="text-gray-400 text-xs">-</span>

  const isPositive = value >= 0
  const Icon = value > 0 ? TrendingUp : value < 0 ? TrendingDown : Minus
  const colorClass = value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-500'

  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${colorClass}`}>
      <Icon className="w-3 h-3" />
      {isPositive && value !== 0 ? '+' : ''}{value.toFixed(1)}{suffix}
    </span>
  )
}

function InsightIcon({ type }: { type: AIInsight['type'] }) {
  switch (type) {
    case 'positive':
      return <CheckCircle className="w-4 h-4 text-green-500" />
    case 'negative':
      return <AlertCircle className="w-4 h-4 text-red-500" />
    case 'suggestion':
      return <Lightbulb className="w-4 h-4 text-yellow-500" />
  }
}

function PriorityBadge({ priority }: { priority: AIRecommendation['priority'] }) {
  const styles = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-blue-100 text-blue-700',
  }

  const labels = {
    high: 'Penting',
    medium: 'Sedang',
    low: 'Rendah',
  }

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${styles[priority]}`}>
      {labels[priority]}
    </span>
  )
}

interface DailySummaryCardProps {
  hasData?: boolean
}

export function DailySummaryCard({ hasData = true }: DailySummaryCardProps) {
  const [summary, setSummary] = useState<DailySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(true)
  const [regenerating, setRegenerating] = useState(false)
  const [cached, setCached] = useState(false)
  const [isToday, setIsToday] = useState(false)

  const fetchSummary = async (forceRegenerate = false) => {
    try {
      if (forceRegenerate) {
        setRegenerating(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const url = '/api/admin/daily-summary'
      const options: RequestInit = forceRegenerate
        ? {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
          }
        : { method: 'GET' }

      const response = await fetch(url, options)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch summary')
      }

      setSummary(data.summary)
      setCached(data.cached || false)
      setIsToday(data.isToday || false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
      setRegenerating(false)
    }
  }

  useEffect(() => {
    // Only fetch if there's data to analyze
    if (hasData) {
      fetchSummary()
    } else {
      setLoading(false)
    }
  }, [hasData])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-center gap-3 py-8">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
          <span className="text-gray-500">Memuat ringkasan harian...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
        <button
          onClick={() => fetchSummary()}
          className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    )
  }

  // Show empty state if no data
  if (!hasData) {
    return (
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-200 p-6" data-tour="dashboard-daily-summary">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Ringkasan Harian AI</h3>
            <p className="text-xs text-gray-500">Analisis performa bisnis Anda</p>
          </div>
        </div>
        <div className="text-center py-6">
          <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-7 h-7 text-orange-400" />
          </div>
          <h4 className="font-medium text-gray-900 mb-1">Belum Ada Ringkasan</h4>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Ringkasan AI akan tersedia setelah ada data penjualan.
            Mulai terima pesanan untuk melihat insight harian.
          </p>
        </div>
      </div>
    )
  }

  if (!summary) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-200 overflow-hidden"
      data-tour="dashboard-daily-summary"
    >
      {/* Header */}
      <div
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">
                  Ringkasan {isToday ? 'Hari Ini' : 'Kemarin'}
                </h3>
                {isToday && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-semibold">
                    Live
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                {formatDate(summary.summary_date)}
                {cached && (
                  <span className="text-gray-400">• Update setiap 3 jam</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                fetchSummary(true)
              }}
              disabled={regenerating}
              className="p-2 hover:bg-orange-100 rounded-lg transition-colors disabled:opacity-50"
              title="Perbarui ringkasan"
            >
              <RefreshCw className={`w-4 h-4 text-orange-600 ${regenerating ? 'animate-spin' : ''}`} />
            </button>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>

        {/* AI Summary - always visible */}
        <p className="mt-3 text-sm text-gray-700 leading-relaxed">
          {summary.ai_summary}
        </p>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Key Metrics */}
            <div className="px-4 pb-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Performa {isToday ? 'Hari Ini' : 'Kemarin'}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Revenue */}
                <div className="bg-white rounded-xl p-3 border border-orange-100">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <DollarSign className="w-3 h-3" />
                    Revenue
                  </div>
                  <div className="font-bold text-gray-900">
                    {formatCurrency(summary.total_revenue)}
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendIndicator value={summary.revenue_change_percent} />
                    {summary.revenue_change_percent !== null && (
                      <span className="text-[10px] text-gray-400">vs {isToday ? 'kemarin' : 'lusa'}</span>
                    )}
                  </div>
                </div>

                {/* Orders */}
                <div className="bg-white rounded-xl p-3 border border-orange-100">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <ShoppingBag className="w-3 h-3" />
                    Pesanan
                  </div>
                  <div className="font-bold text-gray-900">
                    {summary.total_orders}
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendIndicator value={summary.orders_change_percent} />
                    {summary.orders_change_percent !== null && (
                      <span className="text-[10px] text-gray-400">vs {isToday ? 'kemarin' : 'lusa'}</span>
                    )}
                  </div>
                </div>

                {/* Items Sold */}
                <div className="bg-white rounded-xl p-3 border border-orange-100">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <Utensils className="w-3 h-3" />
                    Item Terjual
                  </div>
                  <div className="font-bold text-gray-900">
                    {summary.total_items_sold}
                  </div>
                </div>

                {/* Avg Order Value */}
                <div className="bg-white rounded-xl p-3 border border-orange-100">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <Package className="w-3 h-3" />
                    Rata-rata
                  </div>
                  <div className="font-bold text-gray-900">
                    {formatCurrency(summary.average_order_value)}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insights */}
            {summary.ai_insights.length > 0 && (
              <div className="px-4 pb-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Insight
                </h4>
                <div className="space-y-2">
                  {summary.ai_insights.map((insight, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 bg-white rounded-lg p-3 border border-orange-100"
                    >
                      <InsightIcon type={insight.type} />
                      <p className="text-sm text-gray-700">{insight.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Recommendations */}
            {summary.ai_recommendations.length > 0 && (
              <div className="px-4 pb-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Aksi untuk Hari Ini
                </h4>
                <div className="space-y-2">
                  {summary.ai_recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-lg p-3 border border-orange-100"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-gray-900">{rec.action}</span>
                        <PriorityBadge priority={rec.priority} />
                      </div>
                      <p className="text-xs text-gray-500">{rec.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Selling & Peak Hours */}
            <div className="px-4 pb-4 grid md:grid-cols-2 gap-4">
              {/* Top Selling */}
              {summary.top_selling_items.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Menu Terlaris
                  </h4>
                  <div className="bg-white rounded-lg border border-orange-100 divide-y divide-orange-50">
                    {summary.top_selling_items.slice(0, 3).map((item, idx) => (
                      <div key={item.id} className="px-3 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <span className="text-sm text-gray-700">{item.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">{item.quantity}x</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Peak Hours */}
              {summary.peak_hours.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Jam Ramai
                  </h4>
                  <div className="bg-white rounded-lg border border-orange-100 divide-y divide-orange-50">
                    {summary.peak_hours.slice(0, 3).map((hour, idx) => (
                      <div key={hour.hour} className="px-3 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-orange-500" />
                          <span className="text-sm text-gray-700">{formatHour(hour.hour)}</span>
                        </div>
                        <span className="text-xs text-gray-500">{hour.orders} pesanan</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-orange-100/50 border-t border-orange-200">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  Di-generate: {new Date(summary.generated_at).toLocaleString('id-ID')}
                </span>
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-orange-500" />
                  Powered by Savora AI
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
