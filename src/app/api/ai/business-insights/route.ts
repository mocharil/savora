import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateJSON } from '@/lib/gemini'
import { getUserFromToken } from '@/lib/tenant-context'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface BusinessInsights {
  answer: string
  keyMetrics: {
    label: string
    value: string
    trend: string
    insight: string
  }[]
  quickWins: {
    title: string
    description: string
    effort: string
    impact: string
  }[]
  strategicRecommendations: string[]
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken()
    if (!user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { question } = await request.json()

    // Fetch store data
    const { data: store } = await supabase
      .from('stores')
      .select('*')
      .eq('id', user.storeId)
      .single()

    // Fetch menu items
    const { data: menuItems } = await supabase
      .from('menu_items')
      .select('*, category:categories(name)')
      .eq('store_id', user.storeId)

    // Fetch recent orders
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('store_id', user.storeId)
      .gte('created_at', thirtyDaysAgo.toISOString())

    const { data: categories } = await supabase
      .from('categories')
      .select('*')
      .eq('store_id', user.storeId)

    const completedOrders = (orders || []).filter(o => o.payment_status === 'paid')
    const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0)
    const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0

    const businessContext = {
      storeName: store?.name || 'Toko',
      totalMenuItems: menuItems?.length || 0,
      totalCategories: categories?.length || 0,
      menuPriceRange: menuItems?.length ? {
        min: Math.min(...menuItems.map(m => m.price)),
        max: Math.max(...menuItems.map(m => m.price)),
        avg: menuItems.reduce((sum, m) => sum + m.price, 0) / menuItems.length,
      } : null,
      last30Days: {
        totalOrders: completedOrders.length,
        totalRevenue,
        avgOrderValue,
      },
      menuItems: menuItems?.slice(0, 20).map(m => ({
        name: m.name,
        price: m.price,
        category: (m.category as any)?.name || 'Uncategorized',
      })),
    }

    const prompt = `Kamu adalah konsultan bisnis UMKM F&B yang sangat berpengalaman di Indonesia.

Konteks Bisnis "${businessContext.storeName}":
- Total menu: ${businessContext.totalMenuItems} item dalam ${businessContext.totalCategories} kategori
${businessContext.menuPriceRange ? `- Range harga menu: Rp ${businessContext.menuPriceRange.min.toLocaleString('id-ID')} - Rp ${businessContext.menuPriceRange.max.toLocaleString('id-ID')}` : ''}
${businessContext.menuPriceRange ? `- Rata-rata harga menu: Rp ${Math.round(businessContext.menuPriceRange.avg).toLocaleString('id-ID')}` : ''}

Data 30 Hari Terakhir:
- Total pesanan: ${businessContext.last30Days.totalOrders}
- Total pendapatan: Rp ${businessContext.last30Days.totalRevenue.toLocaleString('id-ID')}
- Rata-rata nilai pesanan: Rp ${Math.round(businessContext.last30Days.avgOrderValue).toLocaleString('id-ID')}

Sample Menu:
${businessContext.menuItems?.map(m => `- ${m.name} (${m.category}): Rp ${m.price.toLocaleString('id-ID')}`).join('\n') || 'Belum ada menu'}

${question ? `Pertanyaan user: ${question}` : 'Berikan insight umum dan rekomendasi untuk mengembangkan bisnis ini.'}

Berikan respons dalam format JSON:
{
  "answer": "Jawaban lengkap dan detail untuk pertanyaan user (atau insight umum jika tidak ada pertanyaan). Gunakan paragraf untuk keterbacaan.",
  "keyMetrics": [
    {
      "label": "Label metrik",
      "value": "Nilai",
      "trend": "up/down/stable",
      "insight": "Penjelasan singkat"
    }
  ],
  "quickWins": [
    {
      "title": "Judul aksi",
      "description": "Deskripsi singkat",
      "effort": "low/medium/high",
      "impact": "low/medium/high"
    }
  ],
  "strategicRecommendations": [
    "Rekomendasi strategis 1",
    "Rekomendasi strategis 2",
    "Rekomendasi strategis 3"
  ]
}`

    const insights = await generateJSON<BusinessInsights>(prompt)

    return NextResponse.json({
      success: true,
      insights,
      context: businessContext,
    })
  } catch (error: any) {
    console.error('Business insights error:', error)
    return NextResponse.json(
      { error: error.message || 'Gagal mendapatkan insights' },
      { status: 500 }
    )
  }
}
