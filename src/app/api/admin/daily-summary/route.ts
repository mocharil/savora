import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUserFromToken } from '@/lib/tenant-context'
import { generateJSON } from '@/lib/kolosal'

// Create Supabase client with anon key only
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface TopSellingItem {
  id: string
  name: string
  quantity: number
  revenue: number
}

interface PeakHour {
  hour: number
  orders: number
  revenue: number
}

interface AIInsight {
  type: 'positive' | 'negative' | 'suggestion'
  message: string
}

interface AIRecommendation {
  priority: 'high' | 'medium' | 'low'
  action: string
  reason: string
}

interface AIGeneratedContent {
  summary: string
  insights: AIInsight[]
  recommendations: AIRecommendation[]
}

// Get date in YYYY-MM-DD format (local timezone)
function getDateString(date: Date): string {
  return date.toISOString().split('T')[0]
}

// Get yesterday's date
function getYesterdayDate(): string {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return getDateString(yesterday)
}

// Get day before yesterday
function getDayBeforeYesterdayDate(): string {
  const dayBefore = new Date()
  dayBefore.setDate(dayBefore.getDate() - 2)
  return getDateString(dayBefore)
}

// Format date for display
function formatDateForDisplay(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken()
    if (!user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')

    // Default to YESTERDAY instead of today
    const targetDate = dateParam || getYesterdayDate()

    // Check if summary already exists for this date
    const { data: existingSummary } = await supabase
      .from('daily_summaries')
      .select('*')
      .eq('store_id', user.storeId)
      .eq('summary_date', targetDate)
      .single()

    if (existingSummary) {
      // Return cached summary
      return NextResponse.json({
        summary: existingSummary,
        cached: true,
        isYesterday: targetDate === getYesterdayDate(),
      })
    }

    // No cached summary - generate new one
    // This will only happen once per day per store

    // Get date range for the target date
    const startOfDay = `${targetDate}T00:00:00.000Z`
    const endOfDay = `${targetDate}T23:59:59.999Z`

    // Fetch orders for the target date
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        total,
        payment_status,
        created_at,
        order_items (
          quantity,
          unit_price,
          menu_items (
            id,
            name
          )
        )
      `)
      .eq('store_id', user.storeId)
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)

    if (ordersError) {
      console.error('Error fetching orders:', ordersError)
    }

    // Calculate core metrics
    const totalOrders = orders?.length || 0
    const completedOrders = orders?.filter((o: any) => o.status === 'completed').length || 0
    const cancelledOrders = orders?.filter((o: any) => o.status === 'cancelled').length || 0
    const pendingOrders = orders?.filter((o: any) => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)).length || 0
    const paidOrders = orders?.filter((o: any) => o.payment_status === 'paid').length || 0
    const unpaidOrders = orders?.filter((o: any) => o.payment_status === 'unpaid').length || 0

    const totalRevenue = orders
      ?.filter((o: any) => o.payment_status === 'paid')
      .reduce((sum: number, o: any) => sum + (o.total || 0), 0) || 0

    const averageOrderValue = paidOrders > 0 ? totalRevenue / paidOrders : 0

    // Calculate total items sold
    let totalItemsSold = 0
    orders?.forEach((order: any) => {
      order.order_items?.forEach((item: any) => {
        totalItemsSold += item.quantity || 0
      })
    })

    // Calculate top selling items
    const itemSales: Record<string, { id: string; name: string; quantity: number; revenue: number }> = {}
    orders?.forEach((order: any) => {
      order.order_items?.forEach((item: any) => {
        const menuItem = item.menu_items
        if (menuItem) {
          const key = menuItem.id
          if (!itemSales[key]) {
            itemSales[key] = {
              id: menuItem.id,
              name: menuItem.name,
              quantity: 0,
              revenue: 0,
            }
          }
          itemSales[key].quantity += item.quantity || 0
          itemSales[key].revenue += (item.quantity || 0) * (item.unit_price || 0)
        }
      })
    })

    const topSellingItems: TopSellingItem[] = Object.values(itemSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)

    // Calculate peak hours
    const hourlyData: Record<number, { orders: number; revenue: number }> = {}
    for (let h = 0; h < 24; h++) {
      hourlyData[h] = { orders: 0, revenue: 0 }
    }

    orders?.forEach((order: any) => {
      const hour = new Date(order.created_at).getHours()
      hourlyData[hour].orders += 1
      if (order.payment_status === 'paid') {
        hourlyData[hour].revenue += order.total || 0
      }
    })

    const peakHours: PeakHour[] = Object.entries(hourlyData)
      .map(([hour, data]) => ({
        hour: parseInt(hour),
        orders: data.orders,
        revenue: data.revenue,
      }))
      .filter(h => h.orders > 0)
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5)

    // Get day before target date for comparison
    const comparisonDate = getDayBeforeYesterdayDate()
    const { data: previousDaySummary } = await supabase
      .from('daily_summaries')
      .select('total_revenue, total_orders')
      .eq('store_id', user.storeId)
      .eq('summary_date', comparisonDate)
      .single()

    let revenueChangePercent: number | null = null
    let ordersChangePercent: number | null = null

    if (previousDaySummary) {
      if ((previousDaySummary as any).total_revenue > 0) {
        revenueChangePercent = ((totalRevenue - (previousDaySummary as any).total_revenue) / (previousDaySummary as any).total_revenue) * 100
      }
      if ((previousDaySummary as any).total_orders > 0) {
        ordersChangePercent = ((totalOrders - (previousDaySummary as any).total_orders) / (previousDaySummary as any).total_orders) * 100
      }
    }

    // Generate AI summary and insights
    let aiContent: AIGeneratedContent = {
      summary: '',
      insights: [],
      recommendations: [],
    }

    const displayDate = formatDateForDisplay(targetDate)

    // Only call AI if there's data to analyze
    if (totalOrders > 0) {
      try {
        const prompt = `Kamu adalah analis bisnis restoran. Berikan ringkasan harian dalam Bahasa Indonesia yang singkat dan actionable.

DATA BISNIS KEMARIN (${displayDate}):
- Total Pesanan: ${totalOrders}
- Pesanan Selesai: ${completedOrders}
- Pesanan Dibatalkan: ${cancelledOrders}
- Total Revenue: Rp ${totalRevenue.toLocaleString('id-ID')}
- Rata-rata per Pesanan: Rp ${Math.round(averageOrderValue).toLocaleString('id-ID')}
- Total Item Terjual: ${totalItemsSold}
- Pesanan Lunas: ${paidOrders}
- Pesanan Belum Bayar: ${unpaidOrders}

MENU TERLARIS:
${topSellingItems.map((item, i) => `${i + 1}. ${item.name}: ${item.quantity}x (Rp ${item.revenue.toLocaleString('id-ID')})`).join('\n') || 'Tidak ada data'}

JAM RAMAI:
${peakHours.map(h => `- Jam ${h.hour.toString().padStart(2, '0')}:00: ${h.orders} pesanan`).join('\n') || 'Tidak ada data'}

${previousDaySummary ? `PERBANDINGAN DENGAN HARI SEBELUMNYA:
- Revenue: ${revenueChangePercent !== null ? (revenueChangePercent >= 0 ? '+' : '') + revenueChangePercent.toFixed(1) + '%' : 'N/A'}
- Pesanan: ${ordersChangePercent !== null ? (ordersChangePercent >= 0 ? '+' : '') + ordersChangePercent.toFixed(1) + '%' : 'N/A'}` : 'Data hari sebelumnya tidak tersedia untuk perbandingan.'}

Berikan respons dalam format JSON:
{
  "summary": "Ringkasan singkat 2-3 kalimat tentang performa kemarin, gunakan kata 'kemarin' bukan 'hari ini'",
  "insights": [
    {"type": "positive", "message": "Hal positif yang terjadi kemarin"},
    {"type": "negative", "message": "Hal yang perlu perhatian dari kemarin"},
    {"type": "suggestion", "message": "Saran untuk hari ini berdasarkan data kemarin"}
  ],
  "recommendations": [
    {"priority": "high", "action": "Tindakan untuk hari ini", "reason": "Berdasarkan insight dari kemarin"}
  ]
}

ATURAN:
- insights maksimal 3-4 item yang paling relevan
- recommendations maksimal 2-3 item yang actionable untuk HARI INI
- Gunakan bahasa Indonesia yang mudah dipahami
- Fokus pada insight yang actionable, bukan hanya deskriptif
- Berikan rekomendasi untuk hari ini berdasarkan data kemarin
- Jika kemarin ada penurunan, sarankan cara meningkatkan hari ini
- Jika kemarin ada peningkatan, sarankan cara mempertahankan momentum`

        aiContent = await generateJSON<AIGeneratedContent>(prompt)
      } catch (aiError) {
        console.error('AI generation error:', aiError)
        // Fallback to basic summary if AI fails
        aiContent = {
          summary: `Kemarin (${displayDate}) ada ${totalOrders} pesanan dengan total revenue Rp ${totalRevenue.toLocaleString('id-ID')}. Menu terlaris adalah ${topSellingItems[0]?.name || 'tidak ada data'}.`,
          insights: [],
          recommendations: [],
        }
      }
    } else {
      aiContent = {
        summary: `Tidak ada pesanan kemarin (${displayDate}).`,
        insights: [
          { type: 'negative', message: 'Tidak ada transaksi sama sekali kemarin.' },
          { type: 'suggestion', message: 'Pertimbangkan untuk membuat promo menarik atau promosi di media sosial untuk menarik pelanggan hari ini.' }
        ],
        recommendations: [
          { priority: 'high', action: 'Buat promo atau diskon menarik untuk hari ini', reason: 'Tidak ada penjualan kemarin, perlu strategi untuk menarik pelanggan' }
        ],
      }
    }

    // Save to database (skip if table doesn't exist yet)
    const summaryData = {
      store_id: user.storeId,
      summary_date: targetDate,
      total_revenue: totalRevenue,
      total_orders: totalOrders,
      total_items_sold: totalItemsSold,
      average_order_value: averageOrderValue,
      pending_orders: pendingOrders,
      completed_orders: completedOrders,
      cancelled_orders: cancelledOrders,
      paid_orders: paidOrders,
      unpaid_orders: unpaidOrders,
      top_selling_items: topSellingItems,
      peak_hours: peakHours,
      ai_summary: aiContent.summary,
      ai_insights: aiContent.insights,
      ai_recommendations: aiContent.recommendations,
      revenue_change_percent: revenueChangePercent,
      orders_change_percent: ordersChangePercent,
      generated_at: new Date().toISOString(),
    }

    const { data: newSummary, error: insertError } = await supabase
      .from('daily_summaries')
      .insert(summaryData)
      .select()
      .single()

    if (insertError) {
      console.error('Error saving summary:', insertError)
      // Return the data even if save fails (table might not exist yet)
      return NextResponse.json({
        summary: { ...summaryData, id: 'temp' },
        cached: false,
        saveError: true,
        isYesterday: targetDate === getYesterdayDate(),
      })
    }

    return NextResponse.json({
      summary: newSummary,
      cached: false,
      isYesterday: targetDate === getYesterdayDate(),
    })
  } catch (error: any) {
    console.error('Daily summary error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate daily summary' },
      { status: 500 }
    )
  }
}

// Force regenerate summary (useful if data changed significantly)
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken()
    if (!user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { date } = await request.json()
    const targetDate = date || getYesterdayDate()

    // Delete existing summary for this date
    await supabase
      .from('daily_summaries')
      .delete()
      .eq('store_id', user.storeId)
      .eq('summary_date', targetDate)

    // Redirect to GET to regenerate
    const baseUrl = request.nextUrl.origin
    const response = await fetch(`${baseUrl}/api/admin/daily-summary?date=${targetDate}`, {
      headers: {
        Cookie: request.headers.get('cookie') || '',
      },
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Regenerate summary error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to regenerate summary' },
      { status: 500 }
    )
  }
}
