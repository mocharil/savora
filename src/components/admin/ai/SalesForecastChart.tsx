'use client'

import { useState, useEffect } from 'react'
import {
  TrendingUp,
  Calendar,
  Package,
  RefreshCw,
  Loader2,
  AlertCircle,
  ChevronDown,
  Info,
  DollarSign,
  ShoppingBag,
  Clock,
  Sun,
  Moon,
} from 'lucide-react'

interface DayForecast {
  date: string
  dayName: string
  dayNameId: string
  predictedOrders: number
  predictedRevenue: number
  confidence: number
  factors: string[]
  isWeekend: boolean
  peakHours: { hour: number; expectedOrders: number }[]
}

interface StockRecommendation {
  itemName: string
  currentAvgDaily: number
  recommendedStock: number
  reason: string
}

interface ForecastData {
  forecasts: DayForecast[]
  summary: string
  stockRecommendations: StockRecommendation[]
  weeklyTotals: {
    totalPredictedOrders: number
    totalPredictedRevenue: number
    avgConfidence: number
  }
}

interface SalesForecastChartProps {
  outletId?: string
}

export function SalesForecastChart({ outletId }: SalesForecastChartProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [forecast, setForecast] = useState<ForecastData | null>(null)
  const [daysAhead, setDaysAhead] = useState(7)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [modelAccuracy, setModelAccuracy] = useState<number | null>(null)
  const [historicalData, setHistoricalData] = useState<any>(null)

  const fetchForecast = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outletId, daysAhead }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mendapatkan prediksi')
      }

      setForecast(data.forecast)
      setModelAccuracy(data.modelAccuracy)
      setHistoricalData(data.historicalData)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchForecast()
  }, [outletId, daysAhead])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-emerald-600 bg-emerald-50'
    if (confidence >= 0.6) return 'text-amber-600 bg-amber-50'
    return 'text-red-600 bg-red-50'
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'Tinggi'
    if (confidence >= 0.6) return 'Sedang'
    return 'Rendah'
  }

  // Calculate max values for chart scaling
  const maxOrders = forecast
    ? Math.max(...forecast.forecasts.map((d) => d.predictedOrders))
    : 0
  const maxRevenue = forecast
    ? Math.max(...forecast.forecasts.map((d) => d.predictedRevenue))
    : 0

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Prediksi Penjualan</h3>
              <p className="text-sm text-gray-500">
                Forecast berbasis AI untuk perencanaan
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Days selector */}
            <div className="relative">
              <select
                value={daysAhead}
                onChange={(e) => setDaysAhead(parseInt(e.target.value))}
                className="appearance-none px-3 py-2 pr-8 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
              >
                <option value={7}>7 Hari</option>
                <option value={14}>14 Hari</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <button
              onClick={fetchForecast}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-4" />
            <p className="text-gray-600">AI sedang menganalisis pola penjualan...</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Gagal mendapatkan prediksi</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && forecast && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
              <p className="text-gray-800">{forecast.summary}</p>
            </div>

            {/* Weekly Totals */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <ShoppingBag className="w-4 h-4 text-orange-500" />
                  <span className="text-xs text-gray-500">Total Prediksi Pesanan</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {forecast.weeklyTotals.totalPredictedOrders}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs text-gray-500">Total Prediksi Revenue</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(forecast.weeklyTotals.totalPredictedRevenue)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <Info className="w-4 h-4 text-violet-500" />
                  <span className="text-xs text-gray-500">Rata-rata Confidence</span>
                </div>
                <p className={`text-2xl font-bold ${getConfidenceColor(forecast.weeklyTotals.avgConfidence).split(' ')[0]}`}>
                  {(forecast.weeklyTotals.avgConfidence * 100).toFixed(0)}%
                </p>
              </div>
            </div>

            {/* Forecast Chart */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Prediksi Harian
              </h4>

              {/* Simple Bar Chart */}
              <div className="space-y-3">
                {forecast.forecasts.map((day, index) => (
                  <div
                    key={day.date}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      selectedDay === index
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-100 bg-gray-50 hover:border-emerald-200'
                    } ${day.isWeekend ? 'ring-1 ring-amber-200' : ''}`}
                    onClick={() => setSelectedDay(selectedDay === index ? null : index)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">{day.date.split('-').slice(1).join('/')}</p>
                          <p className="font-semibold text-gray-900">{day.dayNameId}</p>
                        </div>
                        {day.isWeekend && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                            Weekend
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <p className="text-xs text-gray-500">Pesanan</p>
                          <p className="font-bold text-orange-600">{day.predictedOrders}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Revenue</p>
                          <p className="font-bold text-emerald-600">
                            {formatCurrency(day.predictedRevenue)}
                          </p>
                        </div>
                        <div
                          className={`px-2 py-1 rounded-lg text-xs font-medium ${getConfidenceColor(day.confidence)}`}
                        >
                          {getConfidenceLabel(day.confidence)}
                        </div>
                      </div>
                    </div>

                    {/* Progress bars */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-16">Pesanan</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-500 rounded-full transition-all"
                            style={{
                              width: `${(day.predictedOrders / maxOrders) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-16">Revenue</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all"
                            style={{
                              width: `${(day.predictedRevenue / maxRevenue) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {selectedDay === index && (
                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                        {/* Peak Hours */}
                        {day.peakHours && day.peakHours.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Jam Sibuk
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {day.peakHours.map((ph) => (
                                <span
                                  key={ph.hour}
                                  className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs"
                                >
                                  {ph.hour < 12 ? (
                                    <Sun className="w-3 h-3 inline mr-1 text-amber-500" />
                                  ) : (
                                    <Moon className="w-3 h-3 inline mr-1 text-indigo-500" />
                                  )}
                                  {ph.hour}:00 - ~{ph.expectedOrders} pesanan
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Factors */}
                        {day.factors && day.factors.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-2">
                              Faktor Pertimbangan:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {day.factors.map((factor, fi) => (
                                <span
                                  key={fi}
                                  className="px-2 py-1 bg-violet-100 text-violet-700 rounded-lg text-xs"
                                >
                                  {factor}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Stock Recommendations */}
            {forecast.stockRecommendations && forecast.stockRecommendations.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Package className="w-4 h-4 text-amber-500" />
                  Rekomendasi Persiapan Stok
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                        <th className="pb-2 font-medium">Menu Item</th>
                        <th className="pb-2 font-medium text-right">Rata-rata/Hari</th>
                        <th className="pb-2 font-medium text-right">Rekomendasi</th>
                        <th className="pb-2 font-medium">Alasan</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {forecast.stockRecommendations.map((item, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-50 last:border-0"
                        >
                          <td className="py-3 font-medium text-gray-900">
                            {item.itemName}
                          </td>
                          <td className="py-3 text-right text-gray-600">
                            {item.currentAvgDaily} porsi
                          </td>
                          <td className="py-3 text-right">
                            <span className="font-semibold text-emerald-600">
                              {item.recommendedStock} porsi
                            </span>
                            {item.recommendedStock > item.currentAvgDaily && (
                              <span className="ml-1 text-xs text-amber-600">
                                (+{item.recommendedStock - item.currentAvgDaily})
                              </span>
                            )}
                          </td>
                          <td className="py-3 text-gray-500 text-xs">
                            {item.reason}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Model Accuracy */}
            {modelAccuracy !== null && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Akurasi model historis: {modelAccuracy.toFixed(1)}% (berdasarkan 30 prediksi terakhir)
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
