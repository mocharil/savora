import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateJSON } from '@/lib/gemini'
import { jwtVerify } from 'jose'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const jwtSecret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-min-32-chars!'
)

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const BYPASS_AUTH = true
const DUMMY_STORE_ID = '22222222-2222-2222-2222-222222222222'

async function getUserFromToken(request: NextRequest) {
  if (BYPASS_AUTH) {
    return { storeId: DUMMY_STORE_ID }
  }

  const token = request.cookies.get('auth_token')?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, jwtSecret)
    return payload as { userId: string; email: string; role: string; storeId: string }
  } catch {
    return null
  }
}

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

interface ForecastResponse {
  forecasts: DayForecast[]
  summary: string
  stockRecommendations: {
    itemName: string
    currentAvgDaily: number
    recommendedStock: number
    reason: string
  }[]
  weeklyTotals: {
    totalPredictedOrders: number
    totalPredictedRevenue: number
    avgConfidence: number
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { outletId, daysAhead = 7 } = await request.json()

    // Limit forecast days
    const forecastDays = Math.min(Math.max(1, daysAhead), 14)

    // Fetch historical data (last 90 days for better patterns)
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const ordersQuery = supabase
      .from('orders')
      .select('*')
      .eq('store_id', user.storeId)
      .eq('payment_status', 'paid')
      .gte('created_at', ninetyDaysAgo.toISOString())
      .order('created_at', { ascending: true })

    if (outletId) {
      ordersQuery.eq('outlet_id', outletId)
    }

    const { data: orders } = await ordersQuery

    // Fetch order items for stock recommendations
    const { data: orderItems } = await supabase
      .from('order_items')
      .select(`
        quantity,
        menu_item:menu_items(id, name),
        order:orders(store_id, payment_status, created_at)
      `)
      .gte('created_at', ninetyDaysAgo.toISOString())

    // Filter order items by store
    const storeOrderItems = (orderItems || []).filter(
      (item: any) => item.order?.store_id === user.storeId && item.order?.payment_status === 'paid'
    )

    // Aggregate daily data
    const dailyData: Record<string, { orders: number; revenue: number; dayOfWeek: number }> = {}

    ;(orders || []).forEach((order: any) => {
      const date = order.created_at.split('T')[0]
      const dayOfWeek = new Date(order.created_at).getDay()

      if (!dailyData[date]) {
        dailyData[date] = { orders: 0, revenue: 0, dayOfWeek }
      }
      dailyData[date].orders += 1
      dailyData[date].revenue += order.total_amount || 0
    })

    // Calculate day-of-week averages
    const dayOfWeekStats: Record<number, { totalOrders: number; totalRevenue: number; count: number }> = {}
    for (let i = 0; i < 7; i++) {
      dayOfWeekStats[i] = { totalOrders: 0, totalRevenue: 0, count: 0 }
    }

    Object.values(dailyData).forEach((day) => {
      dayOfWeekStats[day.dayOfWeek].totalOrders += day.orders
      dayOfWeekStats[day.dayOfWeek].totalRevenue += day.revenue
      dayOfWeekStats[day.dayOfWeek].count += 1
    })

    // Calculate averages
    const dayOfWeekAverages = Object.entries(dayOfWeekStats).map(([day, stats]) => ({
      dayOfWeek: parseInt(day),
      avgOrders: stats.count > 0 ? Math.round(stats.totalOrders / stats.count) : 0,
      avgRevenue: stats.count > 0 ? Math.round(stats.totalRevenue / stats.count) : 0,
    }))

    // Calculate overall stats
    const totalDays = Object.keys(dailyData).length
    const totalOrders = Object.values(dailyData).reduce((sum, d) => sum + d.orders, 0)
    const totalRevenue = Object.values(dailyData).reduce((sum, d) => sum + d.revenue, 0)
    const avgDailyOrders = totalDays > 0 ? Math.round(totalOrders / totalDays) : 0
    const avgDailyRevenue = totalDays > 0 ? Math.round(totalRevenue / totalDays) : 0

    // Calculate item daily averages for stock recommendations
    const itemDailyUsage: Record<string, { name: string; totalQty: number; days: Set<string> }> = {}

    storeOrderItems.forEach((item: any) => {
      if (item.menu_item?.id) {
        const itemId = item.menu_item.id
        const date = item.order?.created_at?.split('T')[0]
        if (!itemDailyUsage[itemId]) {
          itemDailyUsage[itemId] = {
            name: item.menu_item.name,
            totalQty: 0,
            days: new Set(),
          }
        }
        itemDailyUsage[itemId].totalQty += item.quantity
        if (date) itemDailyUsage[itemId].days.add(date)
      }
    })

    const topItems = Object.values(itemDailyUsage)
      .map((item) => ({
        name: item.name,
        avgDaily: item.days.size > 0 ? Math.round(item.totalQty / item.days.size) : 0,
        totalQty: item.totalQty,
      }))
      .sort((a, b) => b.totalQty - a.totalQty)
      .slice(0, 10)

    // Prepare forecast dates
    const forecastDates: { date: string; dayOfWeek: number; dayName: string; isWeekend: boolean }[] = []
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const dayNamesEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    for (let i = 1; i <= forecastDays; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      const dayOfWeek = date.getDay()
      forecastDates.push({
        date: date.toISOString().split('T')[0],
        dayOfWeek,
        dayName: dayNamesEn[dayOfWeek],
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      })
    }

    // Generate AI forecast
    const prompt = `Kamu adalah analis bisnis F&B Indonesia. Berdasarkan data historis, buat prediksi penjualan.

Data Historis (90 hari terakhir):
- Total hari dengan data: ${totalDays} hari
- Rata-rata pesanan per hari: ${avgDailyOrders}
- Rata-rata pendapatan per hari: Rp ${avgDailyRevenue.toLocaleString('id-ID')}

Pola Hari dalam Seminggu:
${dayOfWeekAverages.map((d) => `- ${dayNames[d.dayOfWeek]}: ${d.avgOrders} pesanan, Rp ${d.avgRevenue.toLocaleString('id-ID')}`).join('\n')}

Menu Terlaris (rata-rata harian):
${topItems.slice(0, 5).map((item) => `- ${item.name}: ${item.avgDaily} porsi/hari`).join('\n')}

Buat prediksi untuk ${forecastDays} hari ke depan:
${forecastDates.map((d) => `- ${d.date} (${dayNames[forecastDates.indexOf(d) === 0 ? d.dayOfWeek : d.dayOfWeek]})`).join('\n')}

Berikan respons dalam format JSON:
{
  "forecasts": [
    {
      "date": "YYYY-MM-DD",
      "dayName": "Monday",
      "dayNameId": "Senin",
      "predictedOrders": number,
      "predictedRevenue": number,
      "confidence": number (0.0-1.0),
      "factors": ["faktor 1", "faktor 2"],
      "isWeekend": boolean,
      "peakHours": [
        { "hour": 12, "expectedOrders": 15 }
      ]
    }
  ],
  "summary": "Ringkasan prediksi dalam 2-3 kalimat bahasa Indonesia",
  "stockRecommendations": [
    {
      "itemName": "nama menu",
      "currentAvgDaily": number,
      "recommendedStock": number,
      "reason": "alasan dalam bahasa Indonesia"
    }
  ],
  "weeklyTotals": {
    "totalPredictedOrders": number,
    "totalPredictedRevenue": number,
    "avgConfidence": number (0.0-1.0)
  }
}

Pertimbangkan:
1. Pola weekend vs weekday
2. Tren pertumbuhan/penurunan
3. Variasi musiman
4. Jam-jam sibuk (11:00-13:00 dan 18:00-20:00)
5. Buffer 10-20% untuk stock recommendation`

    let forecast: ForecastResponse

    try {
      forecast = await generateJSON<ForecastResponse>(prompt)
    } catch (aiError) {
      // Fallback to simple statistical forecast
      console.error('AI forecast error, using fallback:', aiError)

      forecast = {
        forecasts: forecastDates.map((d) => {
          const dayAvg = dayOfWeekAverages.find((avg) => avg.dayOfWeek === d.dayOfWeek)
          const predictedOrders = dayAvg?.avgOrders || avgDailyOrders
          const predictedRevenue = dayAvg?.avgRevenue || avgDailyRevenue

          return {
            date: d.date,
            dayName: d.dayName,
            dayNameId: dayNames[d.dayOfWeek],
            predictedOrders,
            predictedRevenue,
            confidence: 0.65,
            factors: d.isWeekend ? ['Weekend biasanya lebih ramai'] : ['Hari kerja normal'],
            isWeekend: d.isWeekend,
            peakHours: [
              { hour: 12, expectedOrders: Math.round(predictedOrders * 0.25) },
              { hour: 13, expectedOrders: Math.round(predictedOrders * 0.2) },
              { hour: 19, expectedOrders: Math.round(predictedOrders * 0.2) },
            ],
          }
        }),
        summary: `Berdasarkan data ${totalDays} hari terakhir, prediksi menggunakan rata-rata historis per hari. Rata-rata harian: ${avgDailyOrders} pesanan dengan pendapatan Rp ${avgDailyRevenue.toLocaleString('id-ID')}.`,
        stockRecommendations: topItems.slice(0, 5).map((item) => ({
          itemName: item.name,
          currentAvgDaily: item.avgDaily,
          recommendedStock: Math.round(item.avgDaily * 1.2),
          reason: 'Buffer 20% dari rata-rata harian',
        })),
        weeklyTotals: {
          totalPredictedOrders: forecastDates.reduce((sum, d) => {
            const dayAvg = dayOfWeekAverages.find((avg) => avg.dayOfWeek === d.dayOfWeek)
            return sum + (dayAvg?.avgOrders || avgDailyOrders)
          }, 0),
          totalPredictedRevenue: forecastDates.reduce((sum, d) => {
            const dayAvg = dayOfWeekAverages.find((avg) => avg.dayOfWeek === d.dayOfWeek)
            return sum + (dayAvg?.avgRevenue || avgDailyRevenue)
          }, 0),
          avgConfidence: 0.65,
        },
      }
    }

    // Calculate model accuracy from past forecasts
    const { data: pastForecasts } = await supabase
      .from('sales_forecasts')
      .select('accuracy_score')
      .eq('store_id', user.storeId)
      .not('accuracy_score', 'is', null)
      .order('created_at', { ascending: false })
      .limit(30)

    const modelAccuracy =
      pastForecasts && pastForecasts.length > 0
        ? pastForecasts.reduce((sum, f) => sum + (f.accuracy_score || 0), 0) / pastForecasts.length
        : null

    return NextResponse.json({
      success: true,
      forecast,
      historicalData: {
        daysAnalyzed: totalDays,
        avgDailyOrders,
        avgDailyRevenue,
        dayOfWeekAverages,
      },
      modelAccuracy,
      generatedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Forecast error:', error)
    return NextResponse.json(
      { error: error.message || 'Gagal membuat prediksi' },
      { status: 500 }
    )
  }
}
