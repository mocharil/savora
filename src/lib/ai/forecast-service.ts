/**
 * AI Sales Forecasting Service
 * Predicts future sales based on historical patterns
 */

import { generateJSON, isAIEnabled } from './claude-client'
import { getOrderAnalytics, getMenuItemAnalytics, formatCurrency } from './analytics-utils'
import type { SalesForecast, DayForecast, StockRecommendation } from './types'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// Use service role key if available, otherwise fall back to anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY &&
  process.env.SUPABASE_SERVICE_ROLE_KEY !== 'your_service_role_key'
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseKey)
}

const INDONESIAN_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

// Indonesian holidays (simplified list)
const HOLIDAYS_2024: Record<string, string> = {
  '2024-12-25': 'Natal',
  '2024-12-26': 'Cuti Bersama Natal',
  '2024-12-31': 'Tahun Baru',
  '2025-01-01': 'Tahun Baru 2025',
  // Add more as needed
}

interface ForecastParams {
  storeId: string
  outletId: string
  daysAhead?: number
}

/**
 * Generate sales forecast
 */
export async function generateSalesForecast(
  params: ForecastParams
): Promise<{ success: boolean; forecast?: SalesForecast; error?: string }> {
  const { storeId, outletId, daysAhead = 7 } = params

  // Get historical data (last 30 days)
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)

  const [orderData, menuData] = await Promise.all([
    getOrderAnalytics(storeId, outletId, startDate, endDate),
    getMenuItemAnalytics(storeId, outletId, startDate, endDate)
  ])

  if (orderData.length < 3) {
    return {
      success: false,
      error: 'Minimal 3 hari data diperlukan untuk prediksi'
    }
  }

  // Calculate patterns
  const patterns = analyzePatterns(orderData)

  // Generate forecasts for each day
  const forecasts: DayForecast[] = []

  for (let i = 1; i <= Math.min(daysAhead, 14); i++) {
    const forecastDate = new Date()
    forecastDate.setDate(forecastDate.getDate() + i)

    const dayOfWeek = forecastDate.getDay()
    const dateStr = forecastDate.toISOString().split('T')[0]
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const holiday = HOLIDAYS_2024[dateStr]

    // Base prediction from day-of-week pattern
    const dayPattern = patterns.byDayOfWeek[dayOfWeek]
    let predictedOrders = dayPattern.avgOrders
    let predictedRevenue = dayPattern.avgRevenue

    // Apply trend adjustment
    const trendMultiplier = 1 + (patterns.weeklyTrend * (i / 7))
    predictedOrders = Math.round(predictedOrders * trendMultiplier)
    predictedRevenue = Math.round(predictedRevenue * trendMultiplier)

    // Weekend/holiday boost
    if (isWeekend || holiday) {
      const boost = holiday ? 1.3 : 1.2
      predictedOrders = Math.round(predictedOrders * boost)
      predictedRevenue = Math.round(predictedRevenue * boost)
    }

    // Build factors list
    const factors: string[] = []
    if (isWeekend) factors.push('Weekend biasanya lebih ramai')
    if (holiday) factors.push(`Libur ${holiday}`)
    if (patterns.weeklyTrend > 0.05) factors.push('Tren mingguan naik')
    if (patterns.weeklyTrend < -0.05) factors.push('Tren mingguan turun')
    if (dayPattern.isPopular) factors.push(`${INDONESIAN_DAYS[dayOfWeek]} biasanya ramai`)
    if (dayPattern.isSlow) factors.push(`${INDONESIAN_DAYS[dayOfWeek]} biasanya sepi`)

    // Calculate confidence based on data consistency
    const confidence = calculateConfidence(dayPattern, patterns.dataConsistency)

    forecasts.push({
      date: dateStr,
      dayName: INDONESIAN_DAYS[dayOfWeek],
      dayOfWeek,
      predictedOrders,
      predictedRevenue,
      confidence,
      factors: factors.length > 0 ? factors : ['Prediksi berdasarkan pola historis'],
      isWeekend,
      isHoliday: !!holiday,
      holidayName: holiday
    })
  }

  // Generate stock recommendations
  const stockRecommendations = generateStockRecommendations(
    menuData,
    forecasts[0], // Tomorrow's forecast
    patterns
  )

  // Use AI to enhance predictions if available
  let enhancedForecasts = forecasts
  if (isAIEnabled() && orderData.length >= 7) {
    const aiEnhanced = await enhanceWithAI(forecasts, patterns, menuData)
    if (aiEnhanced) {
      enhancedForecasts = aiEnhanced
    }
  }

  // Calculate model accuracy from past predictions
  const modelAccuracy = await calculateModelAccuracy(storeId, outletId)

  // Save forecasts to database
  await saveForecastsToDb(storeId, outletId, enhancedForecasts)

  return {
    success: true,
    forecast: {
      forecasts: enhancedForecasts,
      stockRecommendations,
      modelAccuracy,
      generatedAt: new Date().toISOString()
    }
  }
}

/**
 * Analyze historical patterns
 */
function analyzePatterns(orderData: { date: string; orders: number; revenue: number }[]) {
  // Group by day of week
  const byDayOfWeek: Record<number, { orders: number[]; revenue: number[] }> = {}
  for (let i = 0; i < 7; i++) {
    byDayOfWeek[i] = { orders: [], revenue: [] }
  }

  for (const day of orderData) {
    const date = new Date(day.date)
    const dow = date.getDay()
    byDayOfWeek[dow].orders.push(day.orders)
    byDayOfWeek[dow].revenue.push(day.revenue)
  }

  // Calculate averages and patterns
  const avgOrders = orderData.reduce((sum, d) => sum + d.orders, 0) / orderData.length
  const avgRevenue = orderData.reduce((sum, d) => sum + d.revenue, 0) / orderData.length

  const dayPatterns = Object.entries(byDayOfWeek).map(([dow, data]) => {
    const dayAvgOrders = data.orders.length > 0
      ? data.orders.reduce((a, b) => a + b, 0) / data.orders.length
      : avgOrders

    const dayAvgRevenue = data.revenue.length > 0
      ? data.revenue.reduce((a, b) => a + b, 0) / data.revenue.length
      : avgRevenue

    return {
      dayOfWeek: parseInt(dow),
      avgOrders: Math.round(dayAvgOrders),
      avgRevenue: Math.round(dayAvgRevenue),
      isPopular: dayAvgOrders > avgOrders * 1.2,
      isSlow: dayAvgOrders < avgOrders * 0.8,
      dataPoints: data.orders.length
    }
  })

  // Calculate weekly trend
  const recentWeek = orderData.slice(-7)
  const previousWeek = orderData.slice(-14, -7)

  let weeklyTrend = 0
  if (previousWeek.length >= 7) {
    const recentAvg = recentWeek.reduce((sum, d) => sum + d.revenue, 0) / recentWeek.length
    const prevAvg = previousWeek.reduce((sum, d) => sum + d.revenue, 0) / previousWeek.length
    weeklyTrend = prevAvg > 0 ? (recentAvg - prevAvg) / prevAvg : 0
  }

  // Data consistency (lower variance = higher consistency)
  const revenues = orderData.map(d => d.revenue)
  const mean = revenues.reduce((a, b) => a + b, 0) / revenues.length
  const variance = revenues.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / revenues.length
  const stdDev = Math.sqrt(variance)
  const dataConsistency = mean > 0 ? Math.max(0, 1 - (stdDev / mean)) : 0

  return {
    byDayOfWeek: Object.fromEntries(dayPatterns.map(p => [p.dayOfWeek, p])),
    weeklyTrend,
    dataConsistency,
    avgOrders,
    avgRevenue
  }
}

/**
 * Calculate confidence score
 */
function calculateConfidence(
  dayPattern: { dataPoints: number; isPopular: boolean; isSlow: boolean },
  dataConsistency: number
): number {
  let confidence = 0.5 // Base confidence

  // More data = higher confidence
  confidence += Math.min(dayPattern.dataPoints * 0.1, 0.3)

  // Data consistency boost
  confidence += dataConsistency * 0.2

  // Cap at 0.95
  return Math.min(Math.round(confidence * 100) / 100, 0.95)
}

/**
 * Generate stock recommendations
 */
function generateStockRecommendations(
  menuData: { id: string; name: string; quantitySold: number }[],
  tomorrowForecast: DayForecast,
  patterns: { avgOrders: number }
): StockRecommendation[] {
  const orderMultiplier = patterns.avgOrders > 0
    ? tomorrowForecast.predictedOrders / patterns.avgOrders
    : 1

  return menuData.slice(0, 5).map(item => {
    const avgDaily = item.quantitySold / 30 // Assuming 30 days of data
    const recommended = Math.ceil(avgDaily * orderMultiplier * 1.2) // 20% buffer

    let reason = 'Berdasarkan rata-rata penjualan harian'
    if (orderMultiplier > 1.2) {
      reason = `Perkiraan hari sibuk, siapkan lebih banyak`
    } else if (orderMultiplier < 0.8) {
      reason = 'Perkiraan hari sepi, kurangi persiapan'
    }

    return {
      menuItemId: item.id,
      name: item.name,
      recommendedQuantity: Math.max(recommended, 1),
      reason
    }
  })
}

/**
 * Enhance forecasts with AI
 */
async function enhanceWithAI(
  forecasts: DayForecast[],
  patterns: ReturnType<typeof analyzePatterns>,
  menuData: { name: string; quantitySold: number }[]
): Promise<DayForecast[] | null> {
  const systemPrompt = `Kamu adalah AI forecasting untuk restoran.
Tugasmu adalah menganalisis prediksi penjualan dan memberikan faktor-faktor yang lebih detail.
Gunakan bahasa Indonesia.`

  const userPrompt = `Berikut prediksi penjualan 7 hari ke depan:

${forecasts.map(f => `${f.dayName} (${f.date}): ${f.predictedOrders} pesanan, ${formatCurrency(f.predictedRevenue)}`).join('\n')}

Pola historis:
- Tren mingguan: ${(patterns.weeklyTrend * 100).toFixed(1)}%
- Konsistensi data: ${(patterns.dataConsistency * 100).toFixed(0)}%

Menu terlaris: ${menuData.slice(0, 3).map(m => m.name).join(', ')}

Berikan response JSON dengan format:
{
  "adjustments": [
    {
      "date": "YYYY-MM-DD",
      "additionalFactors": ["faktor1", "faktor2"],
      "confidenceAdjustment": 0.05 atau -0.05
    }
  ]
}

Berikan insight tambahan untuk setiap hari jika ada.`

  const result = await generateJSON<{
    adjustments: Array<{
      date: string
      additionalFactors: string[]
      confidenceAdjustment: number
    }>
  }>(systemPrompt, userPrompt)

  if (!result.success || !result.data) {
    return null
  }

  // Apply AI adjustments
  return forecasts.map(forecast => {
    const adjustment = result.data!.adjustments.find(a => a.date === forecast.date)
    if (!adjustment) return forecast

    return {
      ...forecast,
      factors: [...forecast.factors, ...adjustment.additionalFactors],
      confidence: Math.min(0.95, Math.max(0.3, forecast.confidence + adjustment.confidenceAdjustment))
    }
  })
}

/**
 * Calculate model accuracy from past predictions
 */
async function calculateModelAccuracy(storeId: string, outletId: string): Promise<number> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('sales_forecasts')
    .select('accuracy_score')
    .eq('store_id', storeId)
    .eq('outlet_id', outletId)
    .not('accuracy_score', 'is', null)
    .order('forecast_date', { ascending: false })
    .limit(30)

  if (error || !data || data.length === 0) {
    return 0.7 // Default accuracy
  }

  const avgAccuracy = data.reduce((sum, f) => sum + (f.accuracy_score || 0), 0) / data.length
  return Math.round(avgAccuracy * 100) / 100
}

/**
 * Save forecasts to database
 */
async function saveForecastsToDb(
  storeId: string,
  outletId: string,
  forecasts: DayForecast[]
): Promise<void> {
  const supabase = getSupabase()

  const records = forecasts.map(f => ({
    store_id: storeId,
    outlet_id: outletId,
    forecast_date: f.date,
    predicted_orders: f.predictedOrders,
    predicted_revenue: f.predictedRevenue,
    confidence_level: f.confidence,
    factors: f.factors,
    model_version: 'v1'
  }))

  await supabase
    .from('sales_forecasts')
    .upsert(records, {
      onConflict: 'outlet_id,forecast_date'
    })
}

/**
 * Update actual values and calculate accuracy
 */
export async function updateForecastActuals(
  outletId: string,
  date: string,
  actualOrders: number,
  actualRevenue: number
): Promise<void> {
  const supabase = getSupabase()

  // Get the forecast
  const { data: forecast } = await supabase
    .from('sales_forecasts')
    .select('predicted_orders, predicted_revenue')
    .eq('outlet_id', outletId)
    .eq('forecast_date', date)
    .single()

  if (!forecast) return

  // Calculate accuracy (MAPE-based)
  const orderError = forecast.predicted_orders > 0
    ? Math.abs(forecast.predicted_orders - actualOrders) / forecast.predicted_orders
    : 0
  const revenueError = forecast.predicted_revenue > 0
    ? Math.abs(forecast.predicted_revenue - actualRevenue) / forecast.predicted_revenue
    : 0

  const accuracy = 1 - ((orderError + revenueError) / 2)

  await supabase
    .from('sales_forecasts')
    .update({
      actual_orders: actualOrders,
      actual_revenue: actualRevenue,
      accuracy_score: Math.round(accuracy * 100) / 100,
      updated_at: new Date().toISOString()
    })
    .eq('outlet_id', outletId)
    .eq('forecast_date', date)
}
