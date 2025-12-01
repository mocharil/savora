'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Brain,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  Loader2,
  Lightbulb,
  Zap,
  RefreshCw,
} from 'lucide-react'

interface QuickInsight {
  type: 'positive' | 'negative' | 'neutral'
  title: string
  description: string
}

interface InsightData {
  summary: string
  highlights: QuickInsight[]
}

export function DashboardAIInsights() {
  const [loading, setLoading] = useState(true)
  const [insights, setInsights] = useState<InsightData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchInsights = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/business-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mendapatkan insights')
      }

      // Transform insights to quick format
      const quickInsights: QuickInsight[] = []

      // Add key metrics as highlights
      if (data.insights?.keyMetrics) {
        data.insights.keyMetrics.slice(0, 3).forEach((metric: any) => {
          quickInsights.push({
            type: metric.trend === 'up' ? 'positive' : metric.trend === 'down' ? 'negative' : 'neutral',
            title: `${metric.label}: ${metric.value}`,
            description: metric.insight,
          })
        })
      }

      // Add quick wins as highlights
      if (data.insights?.quickWins && quickInsights.length < 3) {
        data.insights.quickWins.slice(0, 3 - quickInsights.length).forEach((win: any) => {
          quickInsights.push({
            type: 'neutral',
            title: win.title,
            description: win.description,
          })
        })
      }

      setInsights({
        summary: data.insights?.answer?.split('.').slice(0, 2).join('.') + '.' || 'AI sedang menganalisis bisnis Anda.',
        highlights: quickInsights,
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInsights()
  }, [])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-emerald-500" />
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-500" />
      default:
        return <Lightbulb className="w-4 h-4 text-amber-500" />
    }
  }

  const getTypeBg = (type: string) => {
    switch (type) {
      case 'positive':
        return 'bg-emerald-50 border-emerald-100'
      case 'negative':
        return 'bg-red-50 border-red-100'
      default:
        return 'bg-amber-50 border-amber-100'
    }
  }

  return (
    <div className="bg-gradient-to-r from-violet-50 via-purple-50 to-fuchsia-50 rounded-xl border border-violet-100 p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg shadow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Insights</h3>
            <p className="text-sm text-gray-500">Analisis cerdas untuk bisnis Anda</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchInsights}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/admin/ai"
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-violet-600 hover:text-violet-700 hover:bg-violet-100 rounded-lg transition-colors"
          >
            Selengkapnya
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-3 py-4">
          <Loader2 className="w-5 h-5 animate-spin text-violet-600" />
          <p className="text-gray-600">AI sedang menganalisis data bisnis...</p>
        </div>
      )}

      {error && (
        <div className="py-4">
          <p className="text-sm text-gray-500">
            Tidak dapat memuat insights. <button onClick={fetchInsights} className="text-violet-600 hover:underline">Coba lagi</button>
          </p>
        </div>
      )}

      {!loading && !error && insights && (
        <div className="space-y-4">
          {/* Summary */}
          <p className="text-gray-700 text-sm leading-relaxed">
            {insights.summary}
          </p>

          {/* Quick Highlights */}
          {insights.highlights.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-3">
              {insights.highlights.map((highlight, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${getTypeBg(highlight.type)}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {getTypeIcon(highlight.type)}
                    <span className="text-xs font-medium text-gray-900 truncate">
                      {highlight.title}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {highlight.description}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Link
              href="/admin/ai"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 text-gray-700 rounded-full hover:bg-gray-50 transition-colors"
            >
              <Brain className="w-3 h-3" />
              Lihat Detail Insights
            </Link>
            <Link
              href="/admin/ai"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 text-gray-700 rounded-full hover:bg-gray-50 transition-colors"
            >
              <TrendingUp className="w-3 h-3" />
              Prediksi Penjualan
            </Link>
            <Link
              href="/admin/ai"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 text-gray-700 rounded-full hover:bg-gray-50 transition-colors"
            >
              <Zap className="w-3 h-3" />
              Optimasi Harga
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
