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
  DollarSign,
  Calendar,
  Package,
  Sparkles,
} from 'lucide-react'

interface AIAnalyticsData {
  insights: {
    summary: string
    keyMetrics: { label: string; value: string; trend: string; insight: string }[]
    quickWins: { title: string; description: string; effort: string; impact: string }[]
    recommendations: string[]
  }
  forecast: {
    summary: string
    weeklyPrediction: { orders: number; revenue: number; confidence: number }
    peakDays: string[]
    slowDays: string[]
    tips: string[]
  }
  pricing: {
    overallStrategy: string
    opportunities: { item: string; suggestion: string; reason: string }[]
    bundleIdeas: { name: string; items: string[]; discount: string }[]
  }
  generatedAt: string
  cached: boolean
  remainingMinutes: number
}

export function AIAnalyticsPanel() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<AIAnalyticsData | null>(null)
  const [expandedSection, setExpandedSection] = useState<string>('insights')

  const fetchAnalytics = async (forceRefresh = false) => {
    if (forceRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      const url = forceRefresh
        ? '/api/admin/ai-analytics?refresh=true'
        : '/api/admin/ai-analytics'

      const response = await fetch(url)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Gagal memuat analisis')
      }

      setData(result)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-emerald-500" />
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />
      default: return <Minus className="w-4 h-4 text-gray-400" />
    }
  }

  const getEffortBadge = (effort: string) => {
    const colors: Record<string, string> = {
      low: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-red-100 text-red-700',
    }
    const labels: Record<string, string> = { low: 'Mudah', medium: 'Sedang', high: 'Sulit' }
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors[effort] || colors.medium}`}>
        {labels[effort] || effort}
      </span>
    )
  }

  const getImpactBadge = (impact: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-orange-100 text-orange-700',
      high: 'bg-purple-100 text-purple-700',
    }
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors[impact] || colors.medium}`}>
        {impact === 'high' ? 'High Impact' : impact === 'medium' ? 'Medium Impact' : 'Low Impact'}
      </span>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600 mb-4" />
          <p className="text-gray-600">Memuat analisis AI...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-medium">Gagal memuat analisis</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={() => fetchAnalytics()}
            className="ml-auto px-3 py-1 text-sm bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Header with Cache Info */}
      <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">AI Business Analytics</h2>
              <p className="text-violet-200 text-sm">
                Analisis otomatis diperbarui setiap 3 jam
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {data.cached && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full text-sm">
                <Clock className="w-4 h-4" />
                <span>Update dalam {data.remainingMinutes} menit</span>
              </div>
            )}
            <button
              onClick={() => fetchAnalytics(true)}
              disabled={refreshing}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50"
              title="Perbarui sekarang"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      {data.insights.summary && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-violet-100 rounded-lg">
              <Sparkles className="w-5 h-5 text-violet-600" />
            </div>
            <p className="text-gray-700 leading-relaxed">{data.insights.summary}</p>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      {data.insights.keyMetrics && data.insights.keyMetrics.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {data.insights.keyMetrics.map((metric, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 font-medium">{metric.label}</span>
                {getTrendIcon(metric.trend)}
              </div>
              <p className="text-xl font-bold text-gray-900">{metric.value}</p>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{metric.insight}</p>
            </div>
          ))}
        </div>
      )}

      {/* Forecast Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <button
          onClick={() => setExpandedSection(expandedSection === 'forecast' ? '' : 'forecast')}
          className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 rounded-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Prediksi Minggu Ini</h3>
              <p className="text-sm text-gray-500">{data.forecast.summary}</p>
            </div>
          </div>
          {expandedSection === 'forecast' ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSection === 'forecast' && (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Prediksi Pesanan</p>
                <p className="text-2xl font-bold text-gray-900">{data.forecast.weeklyPrediction.orders}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Prediksi Revenue</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(data.forecast.weeklyPrediction.revenue)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Confidence</p>
                <p className="text-2xl font-bold text-violet-600">
                  {(data.forecast.weeklyPrediction.confidence * 100).toFixed(0)}%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <p className="text-xs font-medium text-green-700 mb-2">Hari Tersibuk</p>
                <div className="flex flex-wrap gap-2">
                  {data.forecast.peakDays.map((day, i) => (
                    <span key={i} className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                      {day}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-xs font-medium text-amber-700 mb-2">Hari Sepi</p>
                <div className="flex flex-wrap gap-2">
                  {data.forecast.slowDays.map((day, i) => (
                    <span key={i} className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-sm">
                      {day}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {data.forecast.tips && data.forecast.tips.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Tips Operasional</p>
                {data.forecast.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800">{tip}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Wins Section */}
      {data.insights.quickWins && data.insights.quickWins.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === 'quickwins' ? '' : 'quickwins')}
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500 rounded-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Quick Wins</h3>
                <p className="text-sm text-gray-500">{data.insights.quickWins.length} aksi yang bisa dilakukan segera</p>
              </div>
            </div>
            {expandedSection === 'quickwins' ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSection === 'quickwins' && (
            <div className="p-5 space-y-3">
              {data.insights.quickWins.map((win, index) => (
                <div key={index} className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{win.title}</h4>
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
          )}
        </div>
      )}

      {/* Pricing Strategy Section */}
      {data.pricing && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === 'pricing' ? '' : 'pricing')}
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Strategi Harga</h3>
                <p className="text-sm text-gray-500">{data.pricing.overallStrategy}</p>
              </div>
            </div>
            {expandedSection === 'pricing' ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSection === 'pricing' && (
            <div className="p-5 space-y-4">
              {data.pricing.opportunities && data.pricing.opportunities.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">Peluang Penyesuaian Harga</p>
                  {data.pricing.opportunities.map((opp, i) => (
                    <div key={i} className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                      <p className="font-medium text-gray-900">{opp.item}</p>
                      <p className="text-sm text-orange-700 mt-1">{opp.suggestion}</p>
                      <p className="text-xs text-gray-500 mt-1">{opp.reason}</p>
                    </div>
                  ))}
                </div>
              )}

              {data.pricing.bundleIdeas && data.pricing.bundleIdeas.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">Ide Bundle</p>
                  {data.pricing.bundleIdeas.map((bundle, i) => (
                    <div key={i} className="p-4 bg-violet-50 rounded-lg border border-violet-100">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">{bundle.name}</p>
                        <span className="px-2 py-1 bg-violet-100 text-violet-700 rounded text-xs font-medium">
                          Diskon {bundle.discount}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {bundle.items.map((item, j) => (
                          <span key={j} className="px-2 py-0.5 bg-white text-gray-600 rounded text-xs">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Strategic Recommendations */}
      {data.insights.recommendations && data.insights.recommendations.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-500 rounded-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">Rekomendasi Strategis</h3>
            </div>
          </div>
          <div className="p-5 space-y-3">
            {data.insights.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-violet-50 rounded-lg border border-violet-100">
                <CheckCircle className="w-4 h-4 text-violet-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Updated Info */}
      <div className="text-center">
        <p className="text-xs text-gray-400">
          Terakhir diperbarui: {new Date(data.generatedAt).toLocaleString('id-ID')}
        </p>
      </div>
    </div>
  )
}
