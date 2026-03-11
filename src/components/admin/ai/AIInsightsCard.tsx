'use client'

import { useState, useEffect } from 'react'
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Target,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react'

type Period = 'daily' | 'weekly' | 'monthly'

interface KeyMetric {
  label: string
  value: string
  trend: 'up' | 'down' | 'stable'
  insight: string
}

interface QuickWin {
  title: string
  description: string
  effort: 'low' | 'medium' | 'high'
  impact: 'low' | 'medium' | 'high'
}

interface Insights {
  answer: string
  keyMetrics: KeyMetric[]
  quickWins: QuickWin[]
  strategicRecommendations: string[]
}

interface BusinessContext {
  storeName: string
  totalMenuItems: number
  totalCategories: number
  menuPriceRange: { min: number; max: number; avg: number } | null
  last30Days: {
    totalOrders: number
    totalRevenue: number
    avgOrderValue: number
  }
}

interface AIInsightsCardProps {
  outletId?: string
  compact?: boolean
  showRefresh?: boolean
}

export function AIInsightsCard({
  outletId,
  compact = false,
  showRefresh = true,
}: AIInsightsCardProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [insights, setInsights] = useState<Insights | null>(null)
  const [context, setContext] = useState<BusinessContext | null>(null)
  const [expanded, setExpanded] = useState(!compact)
  const [period, setPeriod] = useState<Period>('weekly')

  const fetchInsights = async (question?: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/business-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, outletId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mendapatkan insights')
      }

      setInsights(data.insights)
      setContext(data.context)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInsights()
  }, [outletId])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-emerald-500" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />
      default:
        return <Minus className="w-4 h-4 text-gray-400" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-emerald-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getEffortBadge = (effort: string) => {
    switch (effort) {
      case 'low':
        return (
          <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
            Mudah
          </span>
        )
      case 'medium':
        return (
          <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
            Sedang
          </span>
        )
      case 'high':
        return (
          <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
            Tinggi
          </span>
        )
    }
  }

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'low':
        return (
          <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
            Low Impact
          </span>
        )
      case 'medium':
        return (
          <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
            Medium Impact
          </span>
        )
      case 'high':
        return (
          <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
            High Impact
          </span>
        )
    }
  }

  if (compact && !expanded) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(true)}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Insights</h3>
              <p className="text-sm text-gray-500">
                {loading ? 'Menganalisis...' : 'Klik untuk melihat insight'}
              </p>
            </div>
          </div>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Business Insights</h3>
              <p className="text-sm text-gray-500">
                Analisis cerdas untuk bisnis Anda
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {showRefresh && (
              <button
                onClick={() => fetchInsights()}
                disabled={loading}
                className="p-2 text-gray-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}
            {compact && (
              <button
                onClick={() => setExpanded(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-violet-600 mb-4" />
            <p className="text-gray-600">AI sedang menganalisis data bisnis Anda...</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Gagal mendapatkan insights</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && insights && (
          <div className="space-y-6">
            {/* Main Insight */}
            <div className="p-4 bg-violet-50 rounded-lg border border-violet-100">
              <p className="text-gray-800 whitespace-pre-wrap">{insights.answer}</p>
            </div>

            {/* Key Metrics */}
            {insights.keyMetrics && insights.keyMetrics.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Metrik Utama
                </h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {insights.keyMetrics.map((metric, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-100"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">{metric.label}</span>
                        {getTrendIcon(metric.trend)}
                      </div>
                      <p className={`text-lg font-bold ${getTrendColor(metric.trend)}`}>
                        {metric.value}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {metric.insight}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Wins */}
            {insights.quickWins && insights.quickWins.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Quick Wins
                </h4>
                <div className="space-y-3">
                  {insights.quickWins.map((win, index) => (
                    <div
                      key={index}
                      className="p-4 bg-amber-50 rounded-lg border border-amber-100"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{win.title}</h5>
                          <p className="text-sm text-gray-600 mt-1">{win.description}</p>
                        </div>
                        <div className="flex flex-col gap-1 ml-4">
                          {getEffortBadge(win.effort)}
                          {getImpactBadge(win.impact)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strategic Recommendations */}
            {insights.strategicRecommendations && insights.strategicRecommendations.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-orange-500" />
                  Rekomendasi Strategis
                </h4>
                <div className="space-y-2">
                  {insights.strategicRecommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100"
                    >
                      <CheckCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Context Info */}
            {context && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  Data dari {context.last30Days.totalOrders} pesanan dalam 30 hari terakhir
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
