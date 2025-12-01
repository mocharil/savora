/**
 * AI Business Insights Service
 * Generates intelligent business insights from sales data
 */

import { generateJSON, isAIEnabled } from './claude-client'
import {
  getOrderAnalytics,
  getMenuItemAnalytics,
  getHourlyAnalytics,
  getComparisonData,
  getDateRange,
  formatCurrency
} from './analytics-utils'
import type { BusinessInsights, InsightHighlight, TopItem, PeakHour } from './types'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

const CACHE_TTL_HOURS = 1

interface InsightsParams {
  storeId: string
  outletId?: string | null
  period: 'daily' | 'weekly' | 'monthly'
  forceRefresh?: boolean
}

/**
 * Generate business insights
 */
export async function generateBusinessInsights(
  params: InsightsParams
): Promise<{ success: boolean; insights?: BusinessInsights; error?: string; cached?: boolean }> {
  const { storeId, outletId, period, forceRefresh } = params

  // Check cache first
  if (!forceRefresh) {
    const cached = await getCachedInsights(storeId, outletId || null, period)
    if (cached) {
      return { success: true, insights: cached, cached: true }
    }
  }

  // Get date range
  const { start, end } = getDateRange(period)

  // Fetch all analytics data in parallel
  const [orderData, menuData, hourlyData, comparison] = await Promise.all([
    getOrderAnalytics(storeId, outletId || null, start, end),
    getMenuItemAnalytics(storeId, outletId || null, start, end),
    getHourlyAnalytics(storeId, outletId || null, start, end),
    getComparisonData(storeId, outletId || null, start, end)
  ])

  // If no data, return empty insights
  if (orderData.length === 0) {
    return {
      success: true,
      insights: createEmptyInsights(period, start, end)
    }
  }

  // Calculate basic metrics
  const metrics = {
    totalRevenue: comparison.current.revenue,
    totalOrders: comparison.current.orders,
    avgOrderValue: comparison.current.orders > 0
      ? comparison.current.revenue / comparison.current.orders
      : 0,
    revenueChange: comparison.changes.revenueChange,
    ordersChange: comparison.changes.ordersChange,
    avgOrderChange: 0 // Will calculate below
  }

  const prevAvg = comparison.previous.orders > 0
    ? comparison.previous.revenue / comparison.previous.orders
    : 0
  metrics.avgOrderChange = prevAvg > 0
    ? ((metrics.avgOrderValue - prevAvg) / prevAvg) * 100
    : 0

  // Get top and low performers
  const topItems: TopItem[] = menuData.slice(0, 5).map(item => ({
    id: item.id,
    name: item.name,
    quantity: item.quantitySold,
    revenue: item.revenue
  }))

  const lowItems: TopItem[] = menuData
    .filter(item => item.quantitySold > 0)
    .slice(-3)
    .reverse()
    .map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantitySold,
      revenue: item.revenue
    }))

  // Get peak hours
  const peakHours: PeakHour[] = hourlyData
    .filter(h => h.orders > 0)
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 5)
    .map(h => ({
      hour: h.hour,
      label: `${h.hour.toString().padStart(2, '0')}:00`,
      orders: h.orders,
      revenue: h.revenue
    }))

  // Generate AI insights if available
  let aiInsights: { summary: string; highlights: InsightHighlight[]; recommendations: string[] } | null = null

  if (isAIEnabled()) {
    aiInsights = await generateAIAnalysis(
      metrics,
      topItems,
      lowItems,
      peakHours,
      period,
      comparison
    )
  }

  // Build final insights
  const insights: BusinessInsights = {
    summary: aiInsights?.summary || generateBasicSummary(metrics, period),
    highlights: aiInsights?.highlights || generateBasicHighlights(metrics, topItems, lowItems),
    metrics,
    topItems,
    lowItems,
    peakHours,
    recommendations: aiInsights?.recommendations || generateBasicRecommendations(metrics, lowItems, peakHours),
    period: {
      start: start.toISOString(),
      end: end.toISOString(),
      type: period
    }
  }

  // Cache the insights
  await cacheInsights(storeId, outletId || null, period, insights)

  return { success: true, insights, cached: false }
}

/**
 * Generate AI-powered analysis
 */
async function generateAIAnalysis(
  metrics: BusinessInsights['metrics'],
  topItems: TopItem[],
  lowItems: TopItem[],
  peakHours: PeakHour[],
  period: string,
  comparison: { current: any; previous: any; changes: any }
) {
  const systemPrompt = `Kamu adalah analis bisnis AI untuk restoran/UMKM F&B di Indonesia.
Tugasmu adalah menganalisis data penjualan dan memberikan insight yang actionable.
Gunakan bahasa Indonesia yang mudah dipahami.
Fokus pada insight yang bisa langsung ditindaklanjuti oleh pemilik usaha.`

  const userPrompt = `Analisis data penjualan berikut dan berikan insight:

PERIODE: ${period}

METRIK UTAMA:
- Total Revenue: ${formatCurrency(metrics.totalRevenue)}
- Total Pesanan: ${metrics.totalOrders}
- Rata-rata per Pesanan: ${formatCurrency(metrics.avgOrderValue)}
- Perubahan Revenue: ${metrics.revenueChange > 0 ? '+' : ''}${metrics.revenueChange.toFixed(1)}%
- Perubahan Pesanan: ${metrics.ordersChange > 0 ? '+' : ''}${metrics.ordersChange.toFixed(1)}%

MENU TERLARIS:
${topItems.map((item, i) => `${i + 1}. ${item.name}: ${item.quantity} porsi (${formatCurrency(item.revenue)})`).join('\n')}

MENU KURANG LARIS:
${lowItems.map((item, i) => `${i + 1}. ${item.name}: ${item.quantity} porsi (${formatCurrency(item.revenue)})`).join('\n')}

JAM TERSIBUK:
${peakHours.map(h => `- ${h.label}: ${h.orders} pesanan`).join('\n')}

Berikan response dalam format JSON:
{
  "summary": "Ringkasan singkat 1-2 kalimat tentang performa bisnis",
  "highlights": [
    {
      "type": "positive|negative|neutral|warning",
      "title": "Judul singkat",
      "description": "Penjelasan detail",
      "action": "Saran tindakan (opsional)"
    }
  ],
  "recommendations": [
    "Rekomendasi 1",
    "Rekomendasi 2",
    "Rekomendasi 3"
  ]
}

Berikan 3-5 highlights dan 3-4 rekomendasi yang spesifik dan actionable.`

  const result = await generateJSON<{
    summary: string
    highlights: InsightHighlight[]
    recommendations: string[]
  }>(systemPrompt, userPrompt)

  if (!result.success || !result.data) {
    return null
  }

  return result.data
}

/**
 * Generate basic summary without AI
 */
function generateBasicSummary(
  metrics: BusinessInsights['metrics'],
  period: string
): string {
  const periodLabel = period === 'daily' ? 'Hari ini' : period === 'weekly' ? 'Minggu ini' : 'Bulan ini'
  const trend = metrics.revenueChange >= 0 ? 'naik' : 'turun'
  const trendPercent = Math.abs(metrics.revenueChange).toFixed(1)

  return `${periodLabel} tercatat ${metrics.totalOrders} pesanan dengan total ${formatCurrency(metrics.totalRevenue)}. Performa ${trend} ${trendPercent}% dibanding periode sebelumnya.`
}

/**
 * Generate basic highlights without AI
 */
function generateBasicHighlights(
  metrics: BusinessInsights['metrics'],
  topItems: TopItem[],
  lowItems: TopItem[]
): InsightHighlight[] {
  const highlights: InsightHighlight[] = []

  // Revenue trend
  if (metrics.revenueChange !== 0) {
    highlights.push({
      type: metrics.revenueChange > 0 ? 'positive' : 'negative',
      title: `Revenue ${metrics.revenueChange > 0 ? 'Naik' : 'Turun'}`,
      description: `Pendapatan ${metrics.revenueChange > 0 ? 'meningkat' : 'menurun'} ${Math.abs(metrics.revenueChange).toFixed(1)}% dari periode sebelumnya`,
      metric: {
        value: metrics.totalRevenue,
        change: metrics.revenueChange,
        unit: 'IDR'
      }
    })
  }

  // Top seller
  if (topItems.length > 0) {
    highlights.push({
      type: 'positive',
      title: 'Menu Terlaris',
      description: `${topItems[0].name} menjadi menu paling laris dengan ${topItems[0].quantity} porsi terjual`
    })
  }

  // Low performer warning
  if (lowItems.length > 0 && lowItems[0].quantity < 5) {
    highlights.push({
      type: 'warning',
      title: 'Menu Kurang Diminati',
      description: `${lowItems[0].name} hanya terjual ${lowItems[0].quantity} porsi. Pertimbangkan promo atau evaluasi menu.`,
      action: 'Buat promo untuk menu ini'
    })
  }

  return highlights
}

/**
 * Generate basic recommendations without AI
 */
function generateBasicRecommendations(
  metrics: BusinessInsights['metrics'],
  lowItems: TopItem[],
  peakHours: PeakHour[]
): string[] {
  const recommendations: string[] = []

  if (metrics.revenueChange < -10) {
    recommendations.push('Pertimbangkan promo atau diskon untuk menarik lebih banyak pelanggan')
  }

  if (lowItems.length > 0) {
    recommendations.push(`Evaluasi menu ${lowItems[0].name} - pertimbangkan untuk update atau promo khusus`)
  }

  if (peakHours.length > 0) {
    const peak = peakHours[0]
    recommendations.push(`Jam tersibuk adalah ${peak.label} - pastikan stok dan staff cukup`)
  }

  if (metrics.avgOrderValue < 50000) {
    recommendations.push('Tingkatkan nilai pesanan rata-rata dengan bundling atau upselling')
  }

  return recommendations.length > 0 ? recommendations : ['Lanjutkan performa baik dan monitor tren penjualan']
}

/**
 * Create empty insights structure
 */
function createEmptyInsights(
  period: 'daily' | 'weekly' | 'monthly',
  start: Date,
  end: Date
): BusinessInsights {
  return {
    summary: 'Belum ada data penjualan untuk periode ini.',
    highlights: [{
      type: 'neutral',
      title: 'Belum Ada Data',
      description: 'Mulai terima pesanan untuk melihat insight bisnis Anda'
    }],
    metrics: {
      totalRevenue: 0,
      totalOrders: 0,
      avgOrderValue: 0,
      revenueChange: 0,
      ordersChange: 0,
      avgOrderChange: 0
    },
    topItems: [],
    lowItems: [],
    peakHours: [],
    recommendations: ['Mulai promosikan restoran Anda untuk mendapat pesanan pertama'],
    period: {
      start: start.toISOString(),
      end: end.toISOString(),
      type: period
    }
  }
}

/**
 * Get cached insights
 */
async function getCachedInsights(
  storeId: string,
  outletId: string | null,
  period: string
): Promise<BusinessInsights | null> {
  const supabase = getSupabase()

  let query = supabase
    .from('ai_insights_cache')
    .select('insights, expires_at')
    .eq('store_id', storeId)
    .eq('insight_type', period)
    .gt('expires_at', new Date().toISOString())
    .order('generated_at', { ascending: false })
    .limit(1)

  if (outletId) {
    query = query.eq('outlet_id', outletId)
  } else {
    query = query.is('outlet_id', null)
  }

  const { data, error } = await query.single()

  if (error || !data) {
    return null
  }

  return data.insights as BusinessInsights
}

/**
 * Cache insights
 */
async function cacheInsights(
  storeId: string,
  outletId: string | null,
  period: string,
  insights: BusinessInsights
): Promise<void> {
  const supabase = getSupabase()

  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + CACHE_TTL_HOURS)

  await supabase
    .from('ai_insights_cache')
    .upsert({
      store_id: storeId,
      outlet_id: outletId,
      insight_type: period,
      insights,
      expires_at: expiresAt.toISOString(),
      generated_at: new Date().toISOString()
    }, {
      onConflict: 'store_id,outlet_id,insight_type'
    })
}
