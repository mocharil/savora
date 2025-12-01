/**
 * AI Feature Types
 */

// ============================================
// INSIGHTS TYPES
// ============================================

export interface InsightHighlight {
  type: 'positive' | 'negative' | 'neutral' | 'warning'
  title: string
  description: string
  metric?: {
    value: number
    change: number
    unit: string
  }
  action?: string
  icon?: string
}

export interface InsightMetrics {
  totalRevenue: number
  totalOrders: number
  avgOrderValue: number
  revenueChange: number
  ordersChange: number
  avgOrderChange: number
}

export interface TopItem {
  id: string
  name: string
  quantity: number
  revenue: number
  change?: number
}

export interface PeakHour {
  hour: number
  label: string
  orders: number
  revenue: number
}

export interface BusinessInsights {
  summary: string
  highlights: InsightHighlight[]
  metrics: InsightMetrics
  topItems: TopItem[]
  lowItems: TopItem[]
  peakHours: PeakHour[]
  recommendations: string[]
  period: {
    start: string
    end: string
    type: 'daily' | 'weekly' | 'monthly'
  }
}

// ============================================
// FORECAST TYPES
// ============================================

export interface DayForecast {
  date: string
  dayName: string
  dayOfWeek: number
  predictedOrders: number
  predictedRevenue: number
  confidence: number
  factors: string[]
  isWeekend: boolean
  isHoliday?: boolean
  holidayName?: string
}

export interface StockRecommendation {
  menuItemId: string
  name: string
  currentStock?: number
  recommendedQuantity: number
  reason: string
}

export interface SalesForecast {
  forecasts: DayForecast[]
  stockRecommendations: StockRecommendation[]
  modelAccuracy: number
  generatedAt: string
}

// ============================================
// PRICING TYPES
// ============================================

export interface PricingFactor {
  factor: string
  weight: number
  direction: 'up' | 'down' | 'neutral'
  description: string
}

export interface ImpactEstimate {
  revenueChangePercent: number
  volumeChangePercent: number
  profitChangePercent: number
  monthlyRevenueImpact: number
}

export interface PricingRecommendation {
  menuItemId: string
  name: string
  category: string
  currentPrice: number
  recommendedPrice: number
  changePercent: number
  confidence: number
  reasoning: string
  impact: ImpactEstimate
  factors: PricingFactor[]
}

// ============================================
// VOICE ORDER TYPES
// ============================================

export interface ParsedOrderItem {
  menuItemId: string
  name: string
  quantity: number
  price: number
  subtotal: number
  confidence: number
  originalText: string
  variants?: string[]
  notes?: string
}

export interface VoiceParseResult {
  items: ParsedOrderItem[]
  unrecognized: string[]
  total: number
  overallConfidence: number
  suggestions?: {
    text: string
    options: { id: string; name: string; price: number }[]
  }[]
}

// ============================================
// ANALYTICS DATA TYPES
// ============================================

export interface OrderAnalytics {
  date: string
  orders: number
  revenue: number
  avgOrderValue: number
  itemsSold: number
}

export interface MenuItemAnalytics {
  id: string
  name: string
  category: string
  price: number
  quantitySold: number
  revenue: number
  orderCount: number
  avgPerOrder: number
}

export interface HourlyAnalytics {
  hour: number
  orders: number
  revenue: number
}
