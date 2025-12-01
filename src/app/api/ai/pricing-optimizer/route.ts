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

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { menuItemId, costPrice, targetMargin } = await request.json()

    // Fetch menu items
    const { data: menuItems } = await supabase
      .from('menu_items')
      .select('*, category:categories(name)')
      .eq('store_id', user.storeId)

    // Fetch order items for sales data
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: orderItems } = await supabase
      .from('order_items')
      .select(`
        menu_item_id,
        quantity,
        unit_price,
        order:orders(store_id, payment_status, created_at)
      `)
      .gte('created_at', thirtyDaysAgo.toISOString())

    // Filter and aggregate sales data
    const salesByMenu: Record<string, { totalSold: number; revenue: number }> = {}

    ;(orderItems || []).forEach((item: any) => {
      if (item.order?.store_id === user.storeId && item.order?.payment_status === 'paid') {
        if (!salesByMenu[item.menu_item_id]) {
          salesByMenu[item.menu_item_id] = { totalSold: 0, revenue: 0 }
        }
        salesByMenu[item.menu_item_id].totalSold += item.quantity
        salesByMenu[item.menu_item_id].revenue += item.quantity * item.unit_price
      }
    })

    // Prepare menu data with sales info
    const menuData = (menuItems || []).map(item => ({
      id: item.id,
      name: item.name,
      category: (item.category as any)?.name || 'Uncategorized',
      currentPrice: item.price,
      discountPrice: item.discount_price,
      totalSold: salesByMenu[item.id]?.totalSold || 0,
      revenue: salesByMenu[item.id]?.revenue || 0,
    }))

    let prompt: string

    if (menuItemId) {
      const targetItem = menuData.find(m => m.id === menuItemId)
      if (!targetItem) {
        return NextResponse.json({ error: 'Menu item tidak ditemukan' }, { status: 404 })
      }

      const similarItems = menuData.filter(m => m.category === targetItem.category && m.id !== menuItemId)

      prompt = `Kamu adalah pricing strategist untuk industri F&B Indonesia.

Analisis harga untuk menu item ini:
- Nama: ${targetItem.name}
- Kategori: ${targetItem.category}
- Harga saat ini: Rp ${targetItem.currentPrice.toLocaleString('id-ID')}
${targetItem.discountPrice ? `- Harga diskon: Rp ${targetItem.discountPrice.toLocaleString('id-ID')}` : ''}
- Terjual (30 hari): ${targetItem.totalSold} item
- Revenue (30 hari): Rp ${targetItem.revenue.toLocaleString('id-ID')}
${costPrice ? `- Harga pokok: Rp ${costPrice.toLocaleString('id-ID')}` : ''}
${targetMargin ? `- Target margin: ${targetMargin}%` : ''}

Menu serupa:
${similarItems.map(m => `- ${m.name}: Rp ${m.currentPrice.toLocaleString('id-ID')} (${m.totalSold} terjual)`).join('\n') || 'Tidak ada'}

Berikan rekomendasi dalam format JSON:
{
  "currentAnalysis": {
    "pricePosition": "below_market/at_market/above_market",
    "marginAnalysis": "Analisis margin",
    "salesPerformance": "poor/average/good/excellent"
  },
  "recommendations": {
    "suggestedPrice": number,
    "suggestedDiscountPrice": null atau number,
    "reasoning": "Alasan rekomendasi",
    "expectedImpact": {
      "salesChange": "perkiraan perubahan",
      "revenueChange": "perkiraan perubahan",
      "marginChange": "perkiraan perubahan"
    }
  },
  "pricingStrategies": [
    {
      "strategy": "nama strategi",
      "price": number,
      "pros": ["kelebihan"],
      "cons": ["kekurangan"]
    }
  ],
  "promotionIdeas": [
    {
      "type": "bundle/discount/happy_hour",
      "description": "Deskripsi",
      "suggestedPrice": number,
      "duration": "durasi"
    }
  ]
}`
    } else {
      const sortedByRevenue = [...menuData].sort((a, b) => b.revenue - a.revenue)
      const topItems = sortedByRevenue.slice(0, 10)
      const bottomItems = sortedByRevenue.filter(m => m.totalSold > 0).slice(-10)

      prompt = `Kamu adalah pricing strategist untuk industri F&B Indonesia.

Analisis portfolio pricing:

Top Performers:
${topItems.map(m => `- ${m.name} (${m.category}): Rp ${m.currentPrice.toLocaleString('id-ID')} | ${m.totalSold} sold`).join('\n')}

Underperformers:
${bottomItems.map(m => `- ${m.name} (${m.category}): Rp ${m.currentPrice.toLocaleString('id-ID')} | ${m.totalSold} sold`).join('\n')}

Price Range:
- Min: Rp ${Math.min(...menuData.map(m => m.currentPrice)).toLocaleString('id-ID')}
- Max: Rp ${Math.max(...menuData.map(m => m.currentPrice)).toLocaleString('id-ID')}
- Avg: Rp ${Math.round(menuData.reduce((sum, m) => sum + m.currentPrice, 0) / menuData.length).toLocaleString('id-ID')}

Berikan analisis dalam format JSON:
{
  "portfolioAnalysis": {
    "priceDistribution": "Analisis distribusi",
    "categoryPricing": "Analisis per kategori",
    "competitiveness": "Analisis daya saing"
  },
  "pricingOpportunities": [
    {
      "menuItem": "nama",
      "currentPrice": number,
      "suggestedPrice": number,
      "reason": "alasan",
      "priority": "high/medium/low"
    }
  ],
  "bundleOpportunities": [
    {
      "name": "nama bundle",
      "items": ["item1", "item2"],
      "individualTotal": number,
      "bundlePrice": number,
      "savings": "persentase"
    }
  ],
  "seasonalRecommendations": [
    {
      "timing": "waktu",
      "strategy": "strategi",
      "affectedItems": ["items"]
    }
  ],
  "overallStrategy": "Strategi keseluruhan"
}`
    }

    const analysis = await generateJSON(prompt)

    return NextResponse.json({
      success: true,
      analysis,
      menuData: menuItemId ? menuData.find(m => m.id === menuItemId) : menuData,
    })
  } catch (error: any) {
    console.error('Pricing optimizer error:', error)
    return NextResponse.json(
      { error: error.message || 'Gagal menganalisis harga' },
      { status: 500 }
    )
  }
}
