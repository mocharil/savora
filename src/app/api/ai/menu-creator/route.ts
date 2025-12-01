import { NextRequest, NextResponse } from 'next/server'
import { generateJSON } from '@/lib/gemini'

interface GeneratedMenuItem {
  name: string
  description: string
  imagePrompt: string
  estimatedPrice: string
  cookingTime: string
  difficulty: string
  profitMargin: string
  servingTips: string
}

export async function POST(request: NextRequest) {
  try {
    const { ingredients, cuisineType, businessType, priceRange } = await request.json()

    if (!ingredients || ingredients.length === 0) {
      return NextResponse.json(
        { error: 'Daftar bahan harus diisi' },
        { status: 400 }
      )
    }

    const cuisineDescriptions: Record<string, string> = {
      indonesian: 'masakan Indonesia tradisional dan modern',
      italian: 'masakan Italia (pasta, pizza, risotto)',
      japanese: 'masakan Jepang (sushi, ramen, donburi)',
      chinese: 'masakan China (dimsum, mi, nasi goreng)',
      western: 'masakan Western (steak, burger, salad)',
      korean: 'masakan Korea (BBQ, bibimbap, kimchi)',
      fusion: 'fusion modern (campuran berbagai kuliner)',
    }

    const businessDescriptions: Record<string, string> = {
      cafe: 'kafe dengan suasana santai',
      restaurant: 'restoran formal',
      warung: 'warung makan casual',
      foodtruck: 'food truck/gerobak',
      catering: 'layanan catering',
    }

    const priceDescriptions: Record<string, string> = {
      budget: 'budget-friendly (Rp 15.000 - Rp 35.000)',
      medium: 'menengah (Rp 35.000 - Rp 75.000)',
      premium: 'premium (Rp 75.000 - Rp 150.000)',
      luxury: 'luxury (di atas Rp 150.000)',
    }

    const cuisine = cuisineDescriptions[cuisineType] || 'berbagai jenis masakan'
    const business = businessDescriptions[businessType] || 'bisnis F&B'
    const price = priceDescriptions[priceRange] || 'berbagai range harga'

    const prompt = `Kamu adalah konsultan F&B dan food photographer profesional dengan pengalaman 15+ tahun.

Berdasarkan bahan-bahan berikut, buatkan rekomendasi menu lengkap untuk ${business}:

BAHAN YANG TERSEDIA:
${Array.isArray(ingredients) ? ingredients.join(', ') : ingredients}

PREFERENSI:
- Tema kuliner: ${cuisine}
- Range harga: ${price}

Buatkan 4 rekomendasi menu dalam format JSON array. Setiap menu harus lengkap dengan:
1. Nama menu yang menarik dan marketable
2. Deskripsi menu yang menggugah selera (2-3 kalimat dalam bahasa Indonesia)
3. Image prompt dalam bahasa Inggris untuk AI image generator (50-80 kata, detail tentang komposisi, plating, lighting, angle kamera)

Format JSON:
[
  {
    "name": "Nama Menu yang Menarik",
    "description": "Deskripsi menu dalam bahasa Indonesia yang menggugah selera, fokus pada rasa dan tekstur. 2-3 kalimat.",
    "imagePrompt": "Professional food photography of [dish name], [detailed description of the dish composition], [plating style], [background setting], [lighting description], [camera angle], [color palette], appetizing and Instagram-worthy, 4K quality",
    "estimatedPrice": "Rp XX.000",
    "cookingTime": "XX menit",
    "difficulty": "mudah/sedang/sulit",
    "profitMargin": "tinggi/sedang/rendah",
    "servingTips": "Tips singkat untuk menyajikan atau meningkatkan penjualan"
  }
]

PENTING:
- Nama menu harus kreatif dan menjual
- Deskripsi harus membuat pembaca lapar
- Image prompt harus sangat detail agar menghasilkan foto yang profesional
- Gunakan semua atau sebagian besar bahan yang tersedia
- Sesuaikan dengan tema kuliner yang dipilih`

    const menus = await generateJSON<GeneratedMenuItem[]>(prompt)

    return NextResponse.json({
      success: true,
      menus,
    })
  } catch (error: any) {
    console.error('Menu creator error:', error)
    return NextResponse.json(
      { error: error.message || 'Gagal membuat rekomendasi menu' },
      { status: 500 }
    )
  }
}
