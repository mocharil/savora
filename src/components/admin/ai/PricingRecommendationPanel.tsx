'use client'

import { useState, useEffect } from 'react'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Loader2,
  AlertCircle,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Info,
  ArrowRight,
  Sparkles,
  Target,
  Package,
  Percent,
} from 'lucide-react'

interface PricingRecommendation {
  menuItem: string
  currentPrice: number
  suggestedPrice: number
  reason: string
  priority: 'high' | 'medium' | 'low'
}

interface BundleOpportunity {
  name: string
  items: string[]
  individualTotal: number
  bundlePrice: number
  savings: string
}

interface PortfolioAnalysis {
  priceDistribution: string
  categoryPricing: string
  competitiveness: string
}

interface PricingAnalysisData {
  portfolioAnalysis: PortfolioAnalysis
  pricingOpportunities: PricingRecommendation[]
  bundleOpportunities: BundleOpportunity[]
  seasonalRecommendations: {
    timing: string
    strategy: string
    affectedItems: string[]
  }[]
  overallStrategy: string
}

interface PricingRecommendationPanelProps {
  outletId?: string
}

export function PricingRecommendationPanel({ outletId }: PricingRecommendationPanelProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<PricingAnalysisData | null>(null)
  const [expandedSection, setExpandedSection] = useState<string | null>('opportunities')
  const [appliedRecommendations, setAppliedRecommendations] = useState<Set<number>>(new Set())
  const [rejectedRecommendations, setRejectedRecommendations] = useState<Set<number>>(new Set())

  const fetchAnalysis = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/pricing-optimizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outletId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menganalisis harga')
      }

      setAnalysis(data.analysis)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalysis()
  }, [outletId])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return (
          <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
            Prioritas Tinggi
          </span>
        )
      case 'medium':
        return (
          <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
            Prioritas Sedang
          </span>
        )
      case 'low':
        return (
          <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
            Prioritas Rendah
          </span>
        )
    }
  }

  const handleApply = (index: number) => {
    const newApplied = new Set(appliedRecommendations)
    newApplied.add(index)
    setAppliedRecommendations(newApplied)
    // In real implementation, this would call an API to update the price
  }

  const handleReject = (index: number) => {
    const newRejected = new Set(rejectedRecommendations)
    newRejected.add(index)
    setRejectedRecommendations(newRejected)
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Pricing Optimizer</h3>
              <p className="text-sm text-gray-500">
                Rekomendasi harga berbasis data penjualan
              </p>
            </div>
          </div>
          <button
            onClick={fetchAnalysis}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600 mb-4" />
            <p className="text-gray-600">AI sedang menganalisis strategi harga...</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Gagal menganalisis harga</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && analysis && (
          <div className="space-y-6">
            {/* Overall Strategy */}
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Strategi Keseluruhan</h4>
                  <p className="text-gray-700 text-sm">{analysis.overallStrategy}</p>
                </div>
              </div>
            </div>

            {/* Portfolio Analysis */}
            {analysis.portfolioAnalysis && (
              <div>
                <button
                  onClick={() => toggleSection('portfolio')}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    <span className="font-medium text-gray-900">Analisis Portfolio Harga</span>
                  </div>
                  {expandedSection === 'portfolio' ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                {expandedSection === 'portfolio' && (
                  <div className="mt-3 p-4 border border-gray-100 rounded-lg space-y-3">
                    <div>
                      <h5 className="text-xs font-medium text-gray-500 mb-1">Distribusi Harga</h5>
                      <p className="text-sm text-gray-700">{analysis.portfolioAnalysis.priceDistribution}</p>
                    </div>
                    <div>
                      <h5 className="text-xs font-medium text-gray-500 mb-1">Harga per Kategori</h5>
                      <p className="text-sm text-gray-700">{analysis.portfolioAnalysis.categoryPricing}</p>
                    </div>
                    <div>
                      <h5 className="text-xs font-medium text-gray-500 mb-1">Daya Saing</h5>
                      <p className="text-sm text-gray-700">{analysis.portfolioAnalysis.competitiveness}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pricing Opportunities */}
            {analysis.pricingOpportunities && analysis.pricingOpportunities.length > 0 && (
              <div>
                <button
                  onClick={() => toggleSection('opportunities')}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span className="font-medium text-gray-900">
                      Peluang Penyesuaian Harga ({analysis.pricingOpportunities.length})
                    </span>
                  </div>
                  {expandedSection === 'opportunities' ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                {expandedSection === 'opportunities' && (
                  <div className="mt-3 space-y-3">
                    {analysis.pricingOpportunities.map((opp, index) => {
                      const isApplied = appliedRecommendations.has(index)
                      const isRejected = rejectedRecommendations.has(index)
                      const priceChange = opp.suggestedPrice - opp.currentPrice
                      const priceChangePercent = ((priceChange / opp.currentPrice) * 100).toFixed(1)

                      return (
                        <div
                          key={index}
                          className={`p-4 border rounded-lg transition-all ${
                            isApplied
                              ? 'border-emerald-500 bg-emerald-50'
                              : isRejected
                              ? 'border-gray-200 bg-gray-50 opacity-60'
                              : 'border-gray-200 hover:border-amber-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h5 className="font-medium text-gray-900">{opp.menuItem}</h5>
                                {getPriorityBadge(opp.priority)}
                              </div>

                              {/* Price Change */}
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-gray-500">
                                  {formatCurrency(opp.currentPrice)}
                                </span>
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                                <span className="font-semibold text-gray-900">
                                  {formatCurrency(opp.suggestedPrice)}
                                </span>
                                <span
                                  className={`flex items-center gap-1 text-sm font-medium ${
                                    priceChange > 0 ? 'text-emerald-600' : 'text-red-600'
                                  }`}
                                >
                                  {priceChange > 0 ? (
                                    <TrendingUp className="w-3 h-3" />
                                  ) : (
                                    <TrendingDown className="w-3 h-3" />
                                  )}
                                  {priceChange > 0 ? '+' : ''}{priceChangePercent}%
                                </span>
                              </div>

                              <p className="text-sm text-gray-600">{opp.reason}</p>
                            </div>

                            {/* Actions */}
                            {!isApplied && !isRejected && (
                              <div className="flex items-center gap-2 ml-4">
                                <button
                                  onClick={() => handleReject(index)}
                                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Tolak"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleApply(index)}
                                  className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                                  title="Terapkan"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              </div>
                            )}

                            {isApplied && (
                              <span className="px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
                                Diterapkan
                              </span>
                            )}

                            {isRejected && (
                              <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-500 rounded-full">
                                Ditolak
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Bundle Opportunities */}
            {analysis.bundleOpportunities && analysis.bundleOpportunities.length > 0 && (
              <div>
                <button
                  onClick={() => toggleSection('bundles')}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-violet-500" />
                    <span className="font-medium text-gray-900">
                      Peluang Bundle ({analysis.bundleOpportunities.length})
                    </span>
                  </div>
                  {expandedSection === 'bundles' ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                {expandedSection === 'bundles' && (
                  <div className="mt-3 space-y-3">
                    {analysis.bundleOpportunities.map((bundle, index) => (
                      <div
                        key={index}
                        className="p-4 border border-gray-200 rounded-lg hover:border-violet-200 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h5 className="font-medium text-gray-900">{bundle.name}</h5>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {bundle.items.map((item, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                          <span className="px-2 py-1 text-xs font-medium bg-violet-100 text-violet-700 rounded-full flex items-center gap-1">
                            <Percent className="w-3 h-3" />
                            Hemat {bundle.savings}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Individual: </span>
                            <span className="line-through text-gray-400">
                              {formatCurrency(bundle.individualTotal)}
                            </span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                          <div>
                            <span className="text-gray-500">Bundle: </span>
                            <span className="font-semibold text-violet-600">
                              {formatCurrency(bundle.bundlePrice)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Seasonal Recommendations */}
            {analysis.seasonalRecommendations && analysis.seasonalRecommendations.length > 0 && (
              <div>
                <button
                  onClick={() => toggleSection('seasonal')}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-500" />
                    <span className="font-medium text-gray-900">
                      Rekomendasi Musiman ({analysis.seasonalRecommendations.length})
                    </span>
                  </div>
                  {expandedSection === 'seasonal' ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                {expandedSection === 'seasonal' && (
                  <div className="mt-3 space-y-3">
                    {analysis.seasonalRecommendations.map((rec, index) => (
                      <div
                        key={index}
                        className="p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Info className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900 mb-1">{rec.timing}</h5>
                            <p className="text-sm text-gray-600 mb-2">{rec.strategy}</p>
                            <div className="flex flex-wrap gap-1">
                              {rec.affectedItems.map((item, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
