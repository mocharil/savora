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

interface AIInsights {
  summary: string
  topPerformers: {
    analysis: string
    recommendations: string[]
  }
  underperformers: {
    analysis: string
    recommendations: string[]
  }
  categoryInsights: string
  actionItems: {
    priority: string
    action: string
    expectedImpact: string
  }[]
  growthOpportunities: string[]
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { dateRange = '30' } = await request.json()

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(dateRange))

    // Fetch order items with menu info
    const { data: orderItems, error: orderError } = await supabase
      .from('order_items')
      .select(`
        id,
        quantity,
        unit_price,
        subtotal,
        created_at,
        menu_item:menu_items (
          id,
          name,
          price,
          category:categories (
            id,
            name
          )
        ),
        order:orders (
          id,
          status,
          payment_status,
          created_at,
          store_id
        )
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (orderError) {
      console.error('Fetch order items error:', orderError)
    }

    // Filter by store_id and completed orders
    const filteredItems = (orderItems || []).filter(
      (item: any) =>
        item.order?.store_id === user.storeId &&
        item.order?.payment_status === 'paid'
    )

    // Aggregate data by menu item
    const menuStats: Record<string, {
      id: string
      name: string
      category: string
      totalSold: number
      totalRevenue: number
      avgPrice: number
      orderCount: number
    }> = {}

    filteredItems.forEach((item: any) => {
      const menuId = item.menu_item?.id
      if (!menuId) return

      if (!menuStats[menuId]) {
        menuStats[menuId] = {
          id: menuId,
          name: item.menu_item?.name || 'Unknown',
          category: item.menu_item?.category?.name || 'Uncategorized',
          totalSold: 0,
          totalRevenue: 0,
          avgPrice: item.unit_price,
          orderCount: 0,
        }
      }

      menuStats[menuId].totalSold += item.quantity
      menuStats[menuId].totalRevenue += item.subtotal
      menuStats[menuId].orderCount += 1
    })

    const sortedStats = Object.values(menuStats).sort(
      (a, b) => b.totalSold - a.totalSold
    )

    const topProducts = sortedStats.slice(0, 10)
    const bottomProducts = sortedStats.slice(-10).reverse()

    // Category performance
    const categoryStats: Record<string, { name: string; totalSold: number; totalRevenue: number }> = {}
    sortedStats.forEach((item) => {
      if (!categoryStats[item.category]) {
        categoryStats[item.category] = {
          name: item.category,
          totalSold: 0,
          totalRevenue: 0,
        }
      }
      categoryStats[item.category].totalSold += item.totalSold
      categoryStats[item.category].totalRevenue += item.totalRevenue
    })

    const categoryPerformance = Object.values(categoryStats).sort(
      (a, b) => b.totalRevenue - a.totalRevenue
    )

    // Generate AI insights
    let aiInsights: AIInsights | null = null
    if (sortedStats.length > 0) {
      try {
        const analyticsData = {
          period: `${dateRange} hari terakhir`,
          topProducts: topProducts.slice(0, 5),
          bottomProducts: bottomProducts.slice(0, 5),
          categoryPerformance: categoryPerformance.slice(0, 5),
          totalProducts: sortedStats.length,
          totalRevenue: sortedStats.reduce((sum, item) => sum + item.totalRevenue, 0),
          totalItemsSold: sortedStats.reduce((sum, item) => sum + item.totalSold, 0),
        }

        const prompt = `Kamu adalah konsultan bisnis F&B profesional. Analisis data penjualan berikut dan berikan insights yang actionable untuk UMKM:

Data Penjualan (${analyticsData.period}):
- Total produk terjual: ${analyticsData.totalItemsSold} item
- Total pendapatan: Rp ${analyticsData.totalRevenue.toLocaleString('id-ID')}
- Jumlah varian menu: ${analyticsData.totalProducts}

Produk Terlaris:
${analyticsData.topProducts.map((p, i) => `${i + 1}. ${p.name} - ${p.totalSold} terjual (Rp ${p.totalRevenue.toLocaleString('id-ID')})`).join('\n')}

Produk Kurang Laku:
${analyticsData.bottomProducts.map((p, i) => `${i + 1}. ${p.name} - ${p.totalSold} terjual (Rp ${p.totalRevenue.toLocaleString('id-ID')})`).join('\n')}

Performa Kategori:
${analyticsData.categoryPerformance.map((c, i) => `${i + 1}. ${c.name} - ${c.totalSold} item (Rp ${c.totalRevenue.toLocaleString('id-ID')})`).join('\n')}

Berikan analisis dalam format JSON:
{
  "summary": "Ringkasan performa bisnis dalam 2-3 kalimat",
  "topPerformers": {
    "analysis": "Analisis mengapa produk ini laris",
    "recommendations": ["rekomendasi 1", "rekomendasi 2"]
  },
  "underperformers": {
    "analysis": "Analisis mengapa produk ini kurang laku",
    "recommendations": ["rekomendasi 1", "rekomendasi 2"]
  },
  "categoryInsights": "Insight tentang performa kategori",
  "actionItems": [
    {
      "priority": "high/medium/low",
      "action": "Aksi yang harus dilakukan",
      "expectedImpact": "Perkiraan dampak"
    }
  ],
  "growthOpportunities": ["peluang 1", "peluang 2", "peluang 3"]
}`

        aiInsights = await generateJSON<AIInsights>(prompt)
      } catch (aiError) {
        console.error('AI insights error:', aiError)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          days: dateRange,
        },
        overview: {
          totalProducts: sortedStats.length,
          totalItemsSold: sortedStats.reduce((sum, item) => sum + item.totalSold, 0),
          totalRevenue: sortedStats.reduce((sum, item) => sum + item.totalRevenue, 0),
        },
        topProducts,
        bottomProducts,
        categoryPerformance,
        allProducts: sortedStats,
        aiInsights,
      },
    })
  } catch (error: any) {
    console.error('Product analytics error:', error)
    return NextResponse.json(
      { error: error.message || 'Gagal menganalisis produk' },
      { status: 500 }
    )
  }
}
