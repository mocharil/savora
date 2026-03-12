import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateJSON } from '@/lib/kolosal'
import { getUserFromToken } from '@/lib/tenant-context'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Cache duration: 3 hours in milliseconds
const CACHE_DURATION_MS = 3 * 60 * 60 * 1000

interface CachedAnalysis {
  insights: any
  forecast: any
  pricing: any
  generatedAt: string
  expiresAt: string
}

// In-memory cache (per store)
const analysisCache = new Map<string, CachedAnalysis>()

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken()
    if (!user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const forceRefresh = searchParams.get('refresh') === 'true'

    // Check cache first
    const cached = analysisCache.get(user.storeId)
    const now = new Date()

    if (cached && !forceRefresh) {
      const expiresAt = new Date(cached.expiresAt)
      if (now < expiresAt) {
        // Cache still valid
        const remainingMs = expiresAt.getTime() - now.getTime()
        const remainingMinutes = Math.floor(remainingMs / 60000)

        return NextResponse.json({
          ...cached,
          cached: true,
          remainingMinutes,
          message: `Data dari cache. Akan diperbarui dalam ${remainingMinutes} menit.`
        })
      }
    }

    // Cache expired or force refresh - generate new analysis

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

    // Fetch categories
    const { data: categories } = await supabase
      .from('categories')
      .select('*')
      .eq('store_id', user.storeId)

    // Fetch recent orders (30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('store_id', user.storeId)
      .gte('created_at', thirtyDaysAgo.toISOString())

    // Calculate metrics
    const completedOrders = (orders || []).filter(o => o.payment_status === 'paid')
    const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0)
    const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0

    // Calculate daily patterns
    const dailyData: Record<number, { orders: number; revenue: number; count: number }> = {}
    for (let i = 0; i < 7; i++) {
      dailyData[i] = { orders: 0, revenue: 0, count: 0 }
    }

    completedOrders.forEach((order: any) => {
      const dayOfWeek = new Date(order.created_at).getDay()
      dailyData[dayOfWeek].orders++
      dailyData[dayOfWeek].revenue += order.total || 0
    })

    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

    // Build context for AI
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
      dailyPattern: Object.entries(dailyData).map(([day, data]) => ({
        day: dayNames[parseInt(day)],
        avgOrders: Math.round(data.orders / 4), // Approx 4 weeks
        avgRevenue: Math.round(data.revenue / 4),
      })),
      topMenuItems: menuItems?.slice(0, 10).map(m => ({
        name: m.name,
        price: m.price,
        category: (m.category as any)?.name || 'Uncategorized',
      })),
    }

    // Generate comprehensive AI analysis in one call
    const prompt = `Kamu adalah konsultan bisnis UMKM F&B Indonesia yang ahli. Analisis data bisnis ini dan berikan insight komprehensif.

DATA BISNIS "${businessContext.storeName}":
- Total menu: ${businessContext.totalMenuItems} item dalam ${businessContext.totalCategories} kategori
${businessContext.menuPriceRange ? `- Range harga: Rp ${businessContext.menuPriceRange.min.toLocaleString('id-ID')} - Rp ${businessContext.menuPriceRange.max.toLocaleString('id-ID')}` : ''}

DATA 30 HARI TERAKHIR:
- Total pesanan: ${businessContext.last30Days.totalOrders}
- Total pendapatan: Rp ${businessContext.last30Days.totalRevenue.toLocaleString('id-ID')}
- Rata-rata per pesanan: Rp ${Math.round(businessContext.last30Days.avgOrderValue).toLocaleString('id-ID')}

POLA HARIAN:
${businessContext.dailyPattern.map(d => `- ${d.day}: ${d.avgOrders} pesanan, Rp ${d.avgRevenue.toLocaleString('id-ID')}`).join('\n')}

SAMPLE MENU:
${businessContext.topMenuItems?.map(m => `- ${m.name} (${m.category}): Rp ${m.price.toLocaleString('id-ID')}`).join('\n') || 'Belum ada menu'}

Berikan respons dalam format JSON:
{
  "insights": {
    "summary": "Ringkasan 2-3 kalimat tentang performa bisnis",
    "keyMetrics": [
      {"label": "Metrik", "value": "Nilai", "trend": "up/down/stable", "insight": "Penjelasan"}
    ],
    "quickWins": [
      {"title": "Aksi", "description": "Deskripsi", "effort": "low/medium/high", "impact": "low/medium/high"}
    ],
    "recommendations": ["Rekomendasi 1", "Rekomendasi 2", "Rekomendasi 3"]
  },
  "forecast": {
    "summary": "Prediksi singkat untuk 7 hari ke depan",
    "weeklyPrediction": {
      "orders": number,
      "revenue": number,
      "confidence": number (0.0-1.0)
    },
    "peakDays": ["Hari paling ramai"],
    "slowDays": ["Hari paling sepi"],
    "tips": ["Tips operasional"]
  },
  "pricing": {
    "overallStrategy": "Strategi harga keseluruhan",
    "opportunities": [
      {"item": "Nama menu", "suggestion": "Saran harga", "reason": "Alasan"}
    ],
    "bundleIdeas": [
      {"name": "Nama bundle", "items": ["Item 1", "Item 2"], "discount": "10%"}
    ]
  }
}

ATURAN:
- Gunakan bahasa Indonesia yang mudah dipahami
- Berikan insight yang actionable dan spesifik
- Fokus pada peluang pertumbuhan
- Jangan terlalu teknis`

    let analysis
    try {
      analysis = await generateJSON<any>(prompt)
    } catch (aiError) {
      console.error('AI analysis error:', aiError)
      // Fallback to basic analysis
      analysis = {
        insights: {
          summary: `Dalam 30 hari terakhir, ${businessContext.storeName} mencatat ${businessContext.last30Days.totalOrders} pesanan dengan total pendapatan Rp ${businessContext.last30Days.totalRevenue.toLocaleString('id-ID')}.`,
          keyMetrics: [
            { label: 'Total Pesanan', value: businessContext.last30Days.totalOrders.toString(), trend: 'stable', insight: 'Data 30 hari terakhir' },
            { label: 'Rata-rata Transaksi', value: `Rp ${Math.round(businessContext.last30Days.avgOrderValue).toLocaleString('id-ID')}`, trend: 'stable', insight: 'Per pesanan' },
          ],
          quickWins: [],
          recommendations: ['Tambah variasi menu', 'Optimalkan jam operasional', 'Promosi di media sosial'],
        },
        forecast: {
          summary: 'Prediksi berdasarkan pola historis.',
          weeklyPrediction: {
            orders: Math.round(businessContext.last30Days.totalOrders / 4),
            revenue: Math.round(businessContext.last30Days.totalRevenue / 4),
            confidence: 0.6,
          },
          peakDays: ['Sabtu', 'Minggu'],
          slowDays: ['Senin'],
          tips: ['Siapkan stok lebih untuk weekend'],
        },
        pricing: {
          overallStrategy: 'Pertahankan harga kompetitif.',
          opportunities: [],
          bundleIdeas: [],
        },
      }
    }

    // Create cache entry
    const generatedAt = now.toISOString()
    const expiresAt = new Date(now.getTime() + CACHE_DURATION_MS).toISOString()

    const cacheEntry: CachedAnalysis = {
      insights: analysis.insights,
      forecast: analysis.forecast,
      pricing: analysis.pricing,
      generatedAt,
      expiresAt,
    }

    // Store in cache
    analysisCache.set(user.storeId, cacheEntry)

    return NextResponse.json({
      ...cacheEntry,
      cached: false,
      remainingMinutes: 180, // 3 hours
      message: 'Analisis baru berhasil dibuat. Akan diperbarui dalam 3 jam.',
    })

  } catch (error: any) {
    console.error('AI Analytics error:', error)
    return NextResponse.json(
      { error: error.message || 'Gagal menganalisis data' },
      { status: 500 }
    )
  }
}

// Force refresh endpoint
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken()
    if (!user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Clear cache for this store
    analysisCache.delete(user.storeId)

    // Redirect to GET with refresh
    const url = new URL(request.url)
    url.searchParams.set('refresh', 'true')

    const response = await fetch(url.toString(), {
      headers: request.headers,
    })

    return response

  } catch (error: any) {
    console.error('AI Analytics refresh error:', error)
    return NextResponse.json(
      { error: error.message || 'Gagal memperbarui analisis' },
      { status: 500 }
    )
  }
}
