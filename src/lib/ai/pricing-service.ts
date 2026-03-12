/**
 * AI Smart Pricing Service
 * Recommends optimal prices based on market analysis
 */

import { generateJSON, isAIEnabled } from './claude-client'
import { getMenuItemAnalytics, formatCurrency } from './analytics-utils'
import type { PricingRecommendation, PricingFactor, ImpactEstimate } from './types'
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

interface PricingParams {
  storeId: string
  outletId?: string | null
  menuItemIds?: string[] // Optional: specific items to analyze
}

interface MenuItem {
  id: string
  name: string
  price: number
  cost_price?: number
  category_id: string
  categories?: { name: string } | { name: string }[] | null
}

/**
 * Generate pricing recommendations
 */
export async function generatePricingRecommendations(
  params: PricingParams
): Promise<{ success: boolean; recommendations?: PricingRecommendation[]; error?: string }> {
  const { storeId, outletId, menuItemIds } = params

  // Get menu items
  const supabase = getSupabase()

  let menuQuery = supabase
    .from('menu_items')
    .select('id, name, price, cost_price, category_id, categories(name)')
    .eq('store_id', storeId)
    .eq('is_available', true)

  if (menuItemIds && menuItemIds.length > 0) {
    menuQuery = menuQuery.in('id', menuItemIds)
  }

  const { data: menuItems, error: menuError } = await menuQuery

  if (menuError || !menuItems || menuItems.length === 0) {
    return {
      success: false,
      error: 'Tidak ada menu item yang ditemukan'
    }
  }

  // Get sales analytics (last 30 days)
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)

  const salesData = await getMenuItemAnalytics(storeId, outletId || null, startDate, endDate)

  // Build recommendations
  const recommendations: PricingRecommendation[] = []

  for (const item of menuItems as unknown as MenuItem[]) {
    const salesInfo = salesData.find(s => s.id === item.id)

    const recommendation = await analyzeItemPricing(
      item,
      salesInfo,
      menuItems as unknown as MenuItem[]
    )

    if (recommendation) {
      recommendations.push(recommendation)
    }
  }

  // Enhance with AI if available
  if (isAIEnabled() && recommendations.length > 0) {
    const enhanced = await enhancePricingWithAI(recommendations, salesData)
    if (enhanced) {
      return { success: true, recommendations: enhanced }
    }
  }

  // Save recommendations to database
  await savePricingRecommendations(storeId, outletId || null, recommendations)

  return { success: true, recommendations }
}

/**
 * Analyze individual item pricing
 */
async function analyzeItemPricing(
  item: MenuItem,
  salesInfo: { quantitySold: number; revenue: number; orderCount: number } | undefined,
  allItems: MenuItem[]
): Promise<PricingRecommendation | null> {
  const factors: PricingFactor[] = []
  let priceAdjustment = 0

  // Factor 1: Sales velocity
  const avgQuantity = salesInfo?.quantitySold || 0
  if (avgQuantity > 50) {
    factors.push({
      factor: 'Penjualan Tinggi',
      weight: 0.3,
      direction: 'up',
      description: `Terjual ${avgQuantity} porsi dalam 30 hari - ada ruang untuk naikkan harga`
    })
    priceAdjustment += 5 // 5% increase
  } else if (avgQuantity < 10 && avgQuantity > 0) {
    factors.push({
      factor: 'Penjualan Rendah',
      weight: 0.2,
      direction: 'down',
      description: `Hanya terjual ${avgQuantity} porsi - pertimbangkan diskon`
    })
    priceAdjustment -= 10 // 10% decrease
  }

  // Factor 2: Profit margin (if cost price available)
  if (item.cost_price && item.cost_price > 0) {
    const margin = ((item.price - item.cost_price) / item.price) * 100

    if (margin < 30) {
      factors.push({
        factor: 'Margin Rendah',
        weight: 0.4,
        direction: 'up',
        description: `Margin hanya ${margin.toFixed(1)}% - perlu dinaikkan`
      })
      priceAdjustment += 10 // Need 10% more
    } else if (margin > 70) {
      factors.push({
        factor: 'Margin Tinggi',
        weight: 0.2,
        direction: 'down',
        description: `Margin ${margin.toFixed(1)}% - bisa lebih kompetitif`
      })
      priceAdjustment -= 5
    }
  }

  // Factor 3: Category comparison
  const categoryItems = allItems.filter(i => i.category_id === item.category_id && i.id !== item.id)
  if (categoryItems.length > 0) {
    const avgCategoryPrice = categoryItems.reduce((sum, i) => sum + i.price, 0) / categoryItems.length
    const priceDiff = ((item.price - avgCategoryPrice) / avgCategoryPrice) * 100

    if (priceDiff > 20) {
      factors.push({
        factor: 'Di Atas Rata-rata Kategori',
        weight: 0.15,
        direction: 'neutral',
        description: `Harga ${priceDiff.toFixed(0)}% lebih tinggi dari rata-rata kategori`
      })
    } else if (priceDiff < -20) {
      factors.push({
        factor: 'Di Bawah Rata-rata Kategori',
        weight: 0.2,
        direction: 'up',
        description: `Harga ${Math.abs(priceDiff).toFixed(0)}% lebih rendah - ada ruang naikkan`
      })
      priceAdjustment += 8
    }
  }

  // Factor 4: Price rounding psychology
  const priceEndsIn = item.price % 1000
  if (priceEndsIn !== 0 && priceEndsIn !== 500 && priceEndsIn !== 900) {
    factors.push({
      factor: 'Harga Tidak Psikologis',
      weight: 0.1,
      direction: 'neutral',
      description: 'Pertimbangkan harga berakhiran 000, 500, atau 900'
    })
  }

  // Calculate recommended price
  if (factors.length === 0) {
    return null // No recommendation needed
  }

  const recommendedPrice = calculateOptimalPrice(item.price, priceAdjustment)
  const changePercent = ((recommendedPrice - item.price) / item.price) * 100

  // Skip if change is minimal
  if (Math.abs(changePercent) < 3) {
    return null
  }

  // Calculate impact estimate
  const impact = estimateImpact(item.price, recommendedPrice, salesInfo)

  // Calculate confidence
  const confidence = calculateConfidence(factors, salesInfo)

  // Get category name (handle both object and array forms)
  const categoryName = item.categories
    ? Array.isArray(item.categories)
      ? item.categories[0]?.name || 'Uncategorized'
      : item.categories.name
    : 'Uncategorized'

  return {
    menuItemId: item.id,
    name: item.name,
    category: categoryName,
    currentPrice: item.price,
    recommendedPrice,
    changePercent: Math.round(changePercent * 10) / 10,
    confidence,
    reasoning: generateReasoning(factors, changePercent),
    impact,
    factors
  }
}

/**
 * Calculate optimal price with psychological pricing
 */
function calculateOptimalPrice(currentPrice: number, adjustmentPercent: number): number {
  const rawPrice = currentPrice * (1 + adjustmentPercent / 100)

  // Round to psychological pricing points
  const thousands = Math.floor(rawPrice / 1000)
  const remainder = rawPrice % 1000

  if (remainder < 250) {
    return thousands * 1000
  } else if (remainder < 700) {
    return thousands * 1000 + 500
  } else {
    return (thousands + 1) * 1000
  }
}

/**
 * Estimate impact of price change
 */
function estimateImpact(
  currentPrice: number,
  newPrice: number,
  salesInfo: { quantitySold: number; revenue: number } | undefined
): ImpactEstimate {
  const priceChange = (newPrice - currentPrice) / currentPrice

  // Price elasticity assumption: -1.5 (1% price increase = 1.5% volume decrease)
  const elasticity = -1.5
  const volumeChange = priceChange * elasticity * 100

  const currentMonthlyRevenue = salesInfo?.revenue || 0
  const newVolume = (salesInfo?.quantitySold || 0) * (1 + volumeChange / 100)
  const newMonthlyRevenue = newVolume * newPrice

  const revenueChange = currentMonthlyRevenue > 0
    ? ((newMonthlyRevenue - currentMonthlyRevenue) / currentMonthlyRevenue) * 100
    : 0

  // Simplified profit calculation (assuming 40% margin)
  const profitChange = revenueChange * 1.2 // Higher margin items benefit more from price increases

  return {
    revenueChangePercent: Math.round(revenueChange * 10) / 10,
    volumeChangePercent: Math.round(volumeChange * 10) / 10,
    profitChangePercent: Math.round(profitChange * 10) / 10,
    monthlyRevenueImpact: Math.round(newMonthlyRevenue - currentMonthlyRevenue)
  }
}

/**
 * Calculate confidence score
 */
function calculateConfidence(
  factors: PricingFactor[],
  salesInfo: { quantitySold: number; orderCount: number } | undefined
): number {
  let confidence = 0.5 // Base

  // More data = higher confidence
  if (salesInfo) {
    if (salesInfo.quantitySold > 50) confidence += 0.2
    else if (salesInfo.quantitySold > 20) confidence += 0.1

    if (salesInfo.orderCount > 30) confidence += 0.1
  }

  // More factors = higher confidence
  confidence += Math.min(factors.length * 0.05, 0.15)

  return Math.min(Math.round(confidence * 100) / 100, 0.9)
}

/**
 * Generate human-readable reasoning
 */
function generateReasoning(factors: PricingFactor[], changePercent: number): string {
  const direction = changePercent > 0 ? 'naikkan' : 'turunkan'
  const mainFactor = factors.sort((a, b) => b.weight - a.weight)[0]

  return `Disarankan ${direction} harga ${Math.abs(changePercent).toFixed(0)}% karena ${mainFactor.description.toLowerCase()}`
}

/**
 * Enhance recommendations with AI
 */
async function enhancePricingWithAI(
  recommendations: PricingRecommendation[],
  salesData: { name: string; quantitySold: number; revenue: number }[]
): Promise<PricingRecommendation[] | null> {
  const systemPrompt = `Kamu adalah konsultan pricing untuk restoran/UMKM F&B di Indonesia.
Analisis rekomendasi harga dan berikan insight tambahan.
Pertimbangkan:
- Psikologi harga di pasar Indonesia
- Kompetisi dan positioning
- Seasonality dan tren
Gunakan bahasa Indonesia.`

  const userPrompt = `Berikut rekomendasi pricing yang sudah dianalisis:

${recommendations.map(r => `
${r.name} (${r.category})
- Harga saat ini: ${formatCurrency(r.currentPrice)}
- Rekomendasi: ${formatCurrency(r.recommendedPrice)} (${r.changePercent > 0 ? '+' : ''}${r.changePercent}%)
- Alasan: ${r.reasoning}
`).join('\n')}

Data penjualan 30 hari terakhir:
${salesData.slice(0, 10).map(s => `- ${s.name}: ${s.quantitySold} porsi, ${formatCurrency(s.revenue)}`).join('\n')}

Berikan response JSON:
{
  "enhancements": [
    {
      "menuItemId": "id",
      "additionalFactors": ["faktor tambahan"],
      "improvedReasoning": "penjelasan lebih detail",
      "marketInsight": "insight pasar yang relevan"
    }
  ]
}

Fokus pada insight yang actionable dan relevan untuk pasar Indonesia.`

  const result = await generateJSON<{
    enhancements: Array<{
      menuItemId: string
      additionalFactors: string[]
      improvedReasoning: string
      marketInsight: string
    }>
  }>(systemPrompt, userPrompt)

  if (!result.success || !result.data) {
    return null
  }

  // Apply enhancements
  return recommendations.map(rec => {
    const enhancement = result.data!.enhancements.find(e => e.menuItemId === rec.menuItemId)
    if (!enhancement) return rec

    return {
      ...rec,
      reasoning: enhancement.improvedReasoning || rec.reasoning,
      factors: [
        ...rec.factors,
        ...enhancement.additionalFactors.map(f => ({
          factor: f,
          weight: 0.1,
          direction: 'neutral' as const,
          description: enhancement.marketInsight
        }))
      ]
    }
  })
}

/**
 * Save recommendations to database
 */
async function savePricingRecommendations(
  storeId: string,
  outletId: string | null,
  recommendations: PricingRecommendation[]
): Promise<void> {
  const supabase = getSupabase()

  const records = recommendations.map(rec => ({
    store_id: storeId,
    outlet_id: outletId,
    menu_item_id: rec.menuItemId,
    current_price: rec.currentPrice,
    recommended_price: rec.recommendedPrice,
    confidence_score: rec.confidence,
    factors: rec.factors,
    reasoning: rec.reasoning,
    impact_estimate: rec.impact,
    status: 'pending'
  }))

  await supabase
    .from('pricing_recommendations')
    .upsert(records, {
      onConflict: 'store_id,outlet_id,menu_item_id'
    })
}

/**
 * Apply a pricing recommendation
 */
export async function applyPricingRecommendation(
  recommendationId: string,
  approved: boolean,
  appliedPrice?: number
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase()

  const { data: rec, error: fetchError } = await supabase
    .from('pricing_recommendations')
    .select('*')
    .eq('id', recommendationId)
    .single()

  if (fetchError || !rec) {
    return { success: false, error: 'Rekomendasi tidak ditemukan' }
  }

  if (approved) {
    // Update menu item price
    const newPrice = appliedPrice || rec.recommended_price

    const { error: updateError } = await supabase
      .from('menu_items')
      .update({ price: newPrice, updated_at: new Date().toISOString() })
      .eq('id', rec.menu_item_id)

    if (updateError) {
      return { success: false, error: 'Gagal update harga menu' }
    }
  }

  // Update recommendation status
  await supabase
    .from('pricing_recommendations')
    .update({
      status: approved ? 'applied' : 'rejected',
      applied_price: approved ? (appliedPrice || rec.recommended_price) : null,
      applied_at: approved ? new Date().toISOString() : null
    })
    .eq('id', recommendationId)

  return { success: true }
}

/**
 * Get pending recommendations for a store
 */
export async function getPendingRecommendations(
  storeId: string,
  outletId?: string | null
): Promise<PricingRecommendation[]> {
  const supabase = getSupabase()

  let query = supabase
    .from('pricing_recommendations')
    .select(`
      *,
      menu_items(name, categories(name))
    `)
    .eq('store_id', storeId)
    .eq('status', 'pending')
    .order('confidence_score', { ascending: false })

  if (outletId) {
    query = query.eq('outlet_id', outletId)
  }

  const { data, error } = await query

  if (error || !data) {
    return []
  }

  return data.map(rec => ({
    menuItemId: rec.menu_item_id,
    name: rec.menu_items?.name || 'Unknown',
    category: rec.menu_items?.categories?.name || 'Uncategorized',
    currentPrice: rec.current_price,
    recommendedPrice: rec.recommended_price,
    changePercent: ((rec.recommended_price - rec.current_price) / rec.current_price) * 100,
    confidence: rec.confidence_score,
    reasoning: rec.reasoning,
    impact: rec.impact_estimate,
    factors: rec.factors
  }))
}
