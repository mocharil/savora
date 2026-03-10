import { NextRequest, NextResponse } from 'next/server'
import { generateJSON } from '@/lib/kolosal'

interface MenuSuggestion {
  name: string
  description: string
  estimatedPrice: string
  mainIngredients: string[]
  cookingTime: string
  difficulty: string
  profitMargin: string
  tips: string
}

export async function POST(request: NextRequest) {
  try {
    const { ingredients, cuisineType, businessType, priceRange, targetAudience } = await request.json()

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
      fusion: 'fusion modern (campuran berbagai kuliner)',
      korean: 'masakan Korea (BBQ, bibimbap, kimchi)',
      thai: 'masakan Thailand (tom yum, pad thai, green curry)',
    }

    const businessDescriptions: Record<string, string> = {
      cafe: 'kafe dengan suasana santai',
      restaurant: 'restoran formal',
      warung: 'warung makan casual',
      foodtruck: 'food truck/gerobak',
      catering: 'layanan catering',
      cloudkitchen: 'cloud kitchen/ghost kitchen',
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

    const prompt = `Kamu adalah konsultan F&B profesional dengan pengalaman 15+ tahun di industri kuliner Indonesia.

Tolong berikan rekomendasi menu untuk ${business} dengan karakteristik:
- Tema kuliner: ${cuisine}
- Range harga: ${price}
${targetAudience ? `- Target market: ${targetAudience}` : ''}

Bahan-bahan yang tersedia:
${Array.isArray(ingredients) ? ingredients.join(', ') : ingredients}

Berikan 5-7 rekomendasi menu dalam format JSON array seperti ini:
[
  {
    "name": "Nama Menu",
    "description": "Deskripsi singkat 1-2 kalimat yang menggugah selera",
    "estimatedPrice": "Rp XX.000",
    "mainIngredients": ["bahan1", "bahan2", "bahan3"],
    "cookingTime": "XX menit",
    "difficulty": "mudah/sedang/sulit",
    "profitMargin": "tinggi/sedang/rendah",
    "tips": "Tips singkat untuk meningkatkan penjualan"
  }
]

Pastikan:
1. Menu sesuai dengan tema kuliner yang dipilih
2. Memanfaatkan bahan yang tersedia
3. Harga sesuai range yang ditentukan
4. Berikan variasi (appetizer, main course, dessert jika memungkinkan)
5. Pertimbangkan margin profit untuk UMKM`

    const suggestions = await generateJSON<MenuSuggestion[]>(prompt)

    return NextResponse.json({
      success: true,
      suggestions,
    })
  } catch (error: any) {
    console.error('Menu suggestion error:', error)
    return NextResponse.json(
      { error: error.message || 'Gagal mendapatkan rekomendasi menu' },
      { status: 500 }
    )
  }
}
