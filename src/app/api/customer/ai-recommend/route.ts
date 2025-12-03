import { NextRequest, NextResponse } from 'next/server'
import { generateJSON } from '@/lib/gemini'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// Use service role key if available, otherwise fall back to anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY &&
  process.env.SUPABASE_SERVICE_ROLE_KEY !== 'your_service_role_key'
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// System prompt to restrict AI to only food recommendations
const SYSTEM_PROMPT = `Kamu adalah asisten rekomendasi menu di restoran. Tugasmu HANYA untuk:
1. Membantu pelanggan memilih menu berdasarkan preferensi mereka (rasa, kalori, diet, alergi, dll)
2. Memberikan rekomendasi menu yang tersedia di restoran ini
3. Menjelaskan menu yang direkomendasikan

ATURAN KETAT:
- HANYA jawab pertanyaan tentang rekomendasi makanan/minuman
- HANYA rekomendasikan menu yang ada dalam daftar menu restoran ini
- JANGAN jawab pertanyaan yang tidak berhubungan dengan makanan/menu
- JANGAN membahas topik politik, agama, atau hal sensitif lainnya
- JANGAN memberikan saran medis atau nutrisi yang spesifik
- Jika ditanya hal di luar topik makanan, jawab dengan sopan: "Maaf, saya hanya bisa membantu rekomendasi menu makanan dan minuman di restoran ini. Ada preferensi makanan yang bisa saya bantu carikan?"

GAYA BAHASA:
- Gunakan bahasa Indonesia yang ramah dan santai
- Jawab singkat dan jelas (maksimal 2-3 paragraf)
- Sebutkan nama menu dengan jelas
- Jelaskan mengapa menu tersebut cocok dengan preferensi pelanggan`

interface MenuItemForAI {
  id: string
  name: string
  description: string | null
  price: number
  discount_price: number | null
  category_name: string
  is_available: boolean
  image_url: string | null
}

interface AIRecommendation {
  message: string
  recommended_items: Array<{
    id: string
    name: string
    reason: string
  }>
  is_food_related: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, storeId, outletId, conversationHistory = [] } = body

    if (!message || !storeId) {
      return NextResponse.json(
        { error: 'Message and storeId are required' },
        { status: 400 }
      )
    }

    // Fetch menu items for this store/outlet
    let menuItems: MenuItemForAI[] = []

    if (outletId) {
      // Use outlet-specific menu with pricing
      const { data } = await supabase
        .from('outlet_menu_view')
        .select('id, name, description, price, discount_price, is_available')
        .eq('outlet_id', outletId)
        .eq('is_available', true)

      if (data) {
        // Get categories
        const { data: categories } = await supabase
          .from('categories')
          .select('id, name')
          .eq('store_id', storeId)

        const categoryMap = new Map(categories?.map(c => [c.id, c.name]) || [])

        menuItems = data.map(item => ({
          ...item,
          category_name: 'Menu',
        }))
      }
    } else {
      // Fallback to store menu
      const { data } = await supabase
        .from('menu_items')
        .select(`
          id,
          name,
          description,
          price,
          discount_price,
          is_available,
          image_url,
          categories(name)
        `)
        .eq('store_id', storeId)
        .eq('is_available', true)

      if (data) {
        menuItems = data.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          discount_price: item.discount_price,
          category_name: (item.categories as any)?.name || 'Menu',
          is_available: item.is_available,
          image_url: item.image_url,
        }))
      }
    }

    if (menuItems.length === 0) {
      return NextResponse.json({
        message: 'Maaf, saat ini belum ada menu yang tersedia.',
        recommended_items: [],
        is_food_related: true,
      })
    }

    // Format menu list for AI context - include ID for accurate recommendations
    const menuList = menuItems.map(item => {
      const price = item.discount_price || item.price
      return `- [ID: ${item.id}] ${item.name} (${item.category_name}) - Rp ${price.toLocaleString('id-ID')}${item.description ? `: ${item.description}` : ''}`
    }).join('\n')

    // Format conversation history
    const historyText = conversationHistory.length > 0
      ? conversationHistory.map((h: { role: string; content: string }) =>
          `${h.role === 'user' ? 'Pelanggan' : 'Asisten'}: ${h.content}`
        ).join('\n')
      : ''

    // Create the AI prompt
    const prompt = `${SYSTEM_PROMPT}

DAFTAR MENU RESTORAN (dengan ID):
${menuList}

${historyText ? `RIWAYAT PERCAKAPAN:\n${historyText}\n` : ''}
PERTANYAAN PELANGGAN: ${message}

Berikan respons dalam format JSON berikut:
{
  "message": "Pesan balasan untuk pelanggan (dalam bahasa Indonesia yang ramah, gunakan **bold** untuk menyebut nama menu)",
  "recommended_items": [
    {
      "id": "ID menu PERSIS dari daftar (contoh: abc123-def456-...)",
      "name": "Nama menu PERSIS dari daftar",
      "reason": "Alasan singkat kenapa menu ini cocok (1 kalimat)"
    }
  ],
  "is_food_related": true/false
}

ATURAN WAJIB:
1. recommended_items WAJIB diisi dengan menu yang relevan (minimal 1, maksimal 3)
2. ID harus PERSIS sama dengan ID dalam daftar menu [ID: xxx]
3. Nama harus PERSIS sama dengan nama dalam daftar menu
4. JANGAN rekomendasikan menu jika ID tidak ada dalam daftar
5. Jika pertanyaan tidak berhubungan dengan makanan, set is_food_related ke false dan recommended_items kosong []`

    const aiResponse = await generateJSON<AIRecommendation>(prompt)

    // Validate recommended items exist in menu
    const validRecommendations = aiResponse.recommended_items.filter(rec =>
      menuItems.some(item => item.id === rec.id)
    )

    // Enrich recommendations with full menu data
    const enrichedRecommendations = validRecommendations.map(rec => {
      const menuItem = menuItems.find(item => item.id === rec.id)!
      return {
        ...rec,
        price: menuItem.price,
        discount_price: menuItem.discount_price,
        description: menuItem.description,
        category: menuItem.category_name,
        image_url: menuItem.image_url,
      }
    })

    return NextResponse.json({
      message: aiResponse.message,
      recommended_items: enrichedRecommendations,
      is_food_related: aiResponse.is_food_related,
    })
  } catch (error: any) {
    console.error('AI Recommendation error:', error)
    console.error('Error details:', {
      message: error?.message,
      name: error?.name,
      code: error?.code,
      stack: error?.stack?.split('\n').slice(0, 5).join('\n')
    })

    // Check for common AI configuration errors
    let errorMessage = 'Maaf, terjadi kesalahan. Silakan coba lagi.'
    if (error?.message?.includes('credentials') || error?.message?.includes('GOOGLE_APPLICATION_CREDENTIALS')) {
      errorMessage = 'Layanan AI tidak tersedia saat ini. Silakan coba lagi nanti.'
      console.error('AI Credentials Error: Check GOOGLE_APPLICATION_CREDENTIALS or skilled-compass.json')
    } else if (error?.message?.includes('quota') || error?.message?.includes('rate limit')) {
      errorMessage = 'Layanan AI sedang sibuk. Silakan coba lagi dalam beberapa menit.'
    } else if (error?.message?.includes('model')) {
      errorMessage = 'Model AI tidak tersedia. Silakan coba lagi nanti.'
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
