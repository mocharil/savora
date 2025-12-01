/**
 * Analytics Utilities
 * Helper functions for data aggregation and analysis
 */

import { createClient } from '@supabase/supabase-js'
import type { OrderAnalytics, MenuItemAnalytics, HourlyAnalytics } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

/**
 * Get order analytics for a date range
 */
export async function getOrderAnalytics(
  storeId: string,
  outletId: string | null,
  startDate: Date,
  endDate: Date
): Promise<OrderAnalytics[]> {
  const supabase = getSupabase()

  let query = supabase
    .from('orders')
    .select('id, total_amount, created_at, order_items(quantity)')
    .eq('store_id', storeId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .in('status', ['completed', 'ready', 'preparing', 'confirmed'])

  if (outletId) {
    query = query.eq('outlet_id', outletId)
  }

  const { data: orders, error } = await query

  if (error) {
    console.error('Error fetching order analytics:', error)
    return []
  }

  // Group by date
  const dailyData = new Map<string, OrderAnalytics>()

  for (const order of orders || []) {
    const date = new Date(order.created_at).toISOString().split('T')[0]
    const existing = dailyData.get(date) || {
      date,
      orders: 0,
      revenue: 0,
      avgOrderValue: 0,
      itemsSold: 0
    }

    existing.orders += 1
    existing.revenue += order.total_amount || 0
    existing.itemsSold += (order.order_items || []).reduce(
      (sum: number, item: any) => sum + (item.quantity || 0),
      0
    )

    dailyData.set(date, existing)
  }

  // Calculate averages
  const result = Array.from(dailyData.values()).map(day => ({
    ...day,
    avgOrderValue: day.orders > 0 ? day.revenue / day.orders : 0
  }))

  return result.sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Get menu item performance analytics
 */
export async function getMenuItemAnalytics(
  storeId: string,
  outletId: string | null,
  startDate: Date,
  endDate: Date
): Promise<MenuItemAnalytics[]> {
  const supabase = getSupabase()

  // Get orders with items
  let query = supabase
    .from('orders')
    .select(`
      id,
      order_items(
        quantity,
        unit_price,
        menu_item_id,
        menu_items(id, name, category_id, categories(name))
      )
    `)
    .eq('store_id', storeId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .in('status', ['completed', 'ready', 'preparing', 'confirmed'])

  if (outletId) {
    query = query.eq('outlet_id', outletId)
  }

  const { data: orders, error } = await query

  if (error) {
    console.error('Error fetching menu analytics:', error)
    return []
  }

  // Aggregate by menu item
  const itemData = new Map<string, MenuItemAnalytics>()

  for (const order of orders || []) {
    for (const item of order.order_items || []) {
      if (!item.menu_item_id || !item.menu_items) continue

      const menuItem = item.menu_items as any
      const existing = itemData.get(item.menu_item_id) || {
        id: item.menu_item_id,
        name: menuItem.name || 'Unknown',
        category: menuItem.categories?.name || 'Uncategorized',
        price: item.unit_price || 0,
        quantitySold: 0,
        revenue: 0,
        orderCount: 0,
        avgPerOrder: 0
      }

      existing.quantitySold += item.quantity || 0
      existing.revenue += (item.unit_price || 0) * (item.quantity || 0)
      existing.orderCount += 1

      itemData.set(item.menu_item_id, existing)
    }
  }

  // Calculate averages
  const result = Array.from(itemData.values()).map(item => ({
    ...item,
    avgPerOrder: item.orderCount > 0 ? item.quantitySold / item.orderCount : 0
  }))

  return result.sort((a, b) => b.revenue - a.revenue)
}

/**
 * Get hourly order distribution
 */
export async function getHourlyAnalytics(
  storeId: string,
  outletId: string | null,
  startDate: Date,
  endDate: Date
): Promise<HourlyAnalytics[]> {
  const supabase = getSupabase()

  let query = supabase
    .from('orders')
    .select('created_at, total_amount')
    .eq('store_id', storeId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .in('status', ['completed', 'ready', 'preparing', 'confirmed'])

  if (outletId) {
    query = query.eq('outlet_id', outletId)
  }

  const { data: orders, error } = await query

  if (error) {
    console.error('Error fetching hourly analytics:', error)
    return []
  }

  // Initialize all hours
  const hourlyData: HourlyAnalytics[] = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    orders: 0,
    revenue: 0
  }))

  for (const order of orders || []) {
    const hour = new Date(order.created_at).getHours()
    hourlyData[hour].orders += 1
    hourlyData[hour].revenue += order.total_amount || 0
  }

  return hourlyData
}

/**
 * Get comparison data (current vs previous period)
 */
export async function getComparisonData(
  storeId: string,
  outletId: string | null,
  currentStart: Date,
  currentEnd: Date
): Promise<{
  current: { orders: number; revenue: number }
  previous: { orders: number; revenue: number }
  changes: { ordersChange: number; revenueChange: number }
}> {
  const periodDays = Math.ceil(
    (currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24)
  )

  const previousStart = new Date(currentStart)
  previousStart.setDate(previousStart.getDate() - periodDays)
  const previousEnd = new Date(currentStart)
  previousEnd.setDate(previousEnd.getDate() - 1)

  const [currentData, previousData] = await Promise.all([
    getOrderAnalytics(storeId, outletId, currentStart, currentEnd),
    getOrderAnalytics(storeId, outletId, previousStart, previousEnd)
  ])

  const current = currentData.reduce(
    (acc, day) => ({
      orders: acc.orders + day.orders,
      revenue: acc.revenue + day.revenue
    }),
    { orders: 0, revenue: 0 }
  )

  const previous = previousData.reduce(
    (acc, day) => ({
      orders: acc.orders + day.orders,
      revenue: acc.revenue + day.revenue
    }),
    { orders: 0, revenue: 0 }
  )

  const ordersChange = previous.orders > 0
    ? ((current.orders - previous.orders) / previous.orders) * 100
    : current.orders > 0 ? 100 : 0

  const revenueChange = previous.revenue > 0
    ? ((current.revenue - previous.revenue) / previous.revenue) * 100
    : current.revenue > 0 ? 100 : 0

  return {
    current,
    previous,
    changes: {
      ordersChange: Math.round(ordersChange * 10) / 10,
      revenueChange: Math.round(revenueChange * 10) / 10
    }
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

/**
 * Get date range based on period type
 */
export function getDateRange(period: 'daily' | 'weekly' | 'monthly'): {
  start: Date
  end: Date
} {
  const end = new Date()
  const start = new Date()

  switch (period) {
    case 'daily':
      start.setDate(start.getDate() - 1)
      break
    case 'weekly':
      start.setDate(start.getDate() - 7)
      break
    case 'monthly':
      start.setDate(start.getDate() - 30)
      break
  }

  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}
