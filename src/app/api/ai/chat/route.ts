import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/lib/kolosal'
import { createClient } from '@supabase/supabase-js'
import { getUserFromToken } from '@/lib/tenant-context'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function getStoreContext(storeId: string) {
  // Fetch store info
  const { data: store } = await supabase
    .from('stores')
    .select('name, description')
    .eq('id', storeId)
    .single()

  // Fetch menu items
  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('name, price, category:categories(name)')
    .eq('store_id', storeId)
    .limit(20)

  // Fetch recent sales data
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: orders } = await supabase
    .from('orders')
    .select('total, payment_status')
    .eq('store_id', storeId)
    .eq('payment_status', 'paid')
    .gte('created_at', thirtyDaysAgo.toISOString())

  const totalRevenue = orders?.reduce((sum, o) => sum + o.total, 0) || 0
  const totalOrders = orders?.length || 0

  return {
    storeName: store?.name || 'Toko',
    menuCount: menuItems?.length || 0,
    sampleMenu: menuItems?.slice(0, 10).map((m: any) => `${m.name} (${m.category?.name || 'Uncategorized'}): Rp ${m.price.toLocaleString('id-ID')}`).join('\n') || 'Belum ada menu',
    last30Days: {
      totalOrders,
      totalRevenue: `Rp ${totalRevenue.toLocaleString('id-ID')}`,
    },
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken()
    if (!user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, action } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const context = await getStoreContext(user.storeId)

    let systemPrompt = `Kamu adalah AI Assistant untuk bisnis F&B UMKM bernama "${context.storeName}".

Konteks Bisnis:
- Jumlah menu: ${context.menuCount} item
- Pesanan 30 hari terakhir: ${context.last30Days.totalOrders} pesanan
- Revenue 30 hari terakhir: ${context.last30Days.totalRevenue}

Sample Menu:
${context.sampleMenu}

Kamu membantu owner dengan:
1. Membuat deskripsi menu yang menarik
2. Memberikan saran menu baru
3. Menganalisis penjualan dan memberikan insight
4. Membuat prompt untuk foto menu
5. Memberikan tips bisnis F&B

Jawab dalam bahasa Indonesia yang friendly dan profesional. Berikan jawaban yang actionable dan spesifik untuk bisnis F&B.`

    let prompt = message

    // Handle specific actions
    if (action === 'describe') {
      prompt = `User ingin membuat deskripsi menu. Tanyakan nama menu yang ingin dibuatkan deskripsinya, lalu buatkan deskripsi yang menarik dan menggugah selera (2-3 kalimat). Jika user sudah menyebutkan nama menu, langsung buatkan deskripsinya.

User message: ${message}`
    } else if (action === 'suggest') {
      prompt = `User ingin saran menu baru. Tanyakan bahan-bahan yang tersedia dan tema kuliner yang diinginkan, lalu berikan 3-5 rekomendasi menu dengan nama, deskripsi singkat, dan estimasi harga.

User message: ${message}`
    } else if (action === 'analyze') {
      prompt = `User ingin analisis penjualan. Berdasarkan data yang ada (${context.last30Days.totalOrders} pesanan, ${context.last30Days.totalRevenue} revenue), berikan insight tentang performa bisnis dan rekomendasi improvement.

User message: ${message}`
    } else if (action === 'image') {
      prompt = `User ingin membuat prompt untuk foto menu. Tanyakan nama menu dan gaya foto yang diinginkan, lalu buatkan prompt detail dalam bahasa Inggris untuk digunakan di AI image generator (Midjourney/DALL-E).

User message: ${message}`
    }

    const response = await generateContent(prompt, {
      systemPrompt,
    })

    return NextResponse.json({
      success: true,
      response,
      type: action || 'chat',
    })
  } catch (error: any) {
    console.error('AI Chat error:', error)
    return NextResponse.json(
      { error: error.message || 'Gagal memproses permintaan' },
      { status: 500 }
    )
  }
}
