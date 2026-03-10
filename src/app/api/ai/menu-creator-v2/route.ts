import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/tenant-context'
import { generateJSON } from '@/lib/kolosal'

interface IngredientDetail {
  name: string
  amount: string
  unit: string
  price: number
}

interface Recipe {
  prepTime: string
  cookTime: string
  totalTime: string
  steps: string[]
}

interface DishIdea {
  id: string
  name: string
  description: string
  ingredients: string[]
  ingredientDetails: IngredientDetail[]
  recipe: Recipe
  composition: string
  plating: string
  imageUrl: string | null
  suggestedPrice: number
  costEstimate: number
  profitMargin: number
  cookingTime: string
  difficulty: 'mudah' | 'sedang' | 'sulit'
  servings: number
  tags: string[]
  tips: string
  variations: string
  storage: string
  allergens: string[]
}

interface AIResponse {
  dishes: Array<{
    name: string
    description: string
    ingredients: string[]
    ingredientDetails: Array<{
      name: string
      amount: string
      unit: string
      price: number
    }>
    recipe: {
      prepTime: string
      cookTime: string
      totalTime: string
      steps: string[]
    }
    composition: string
    plating: string
    suggestedPrice: number
    costEstimate: number
    profitMargin: number
    cookingTime: string
    difficulty: string
    servings: number
    tags: string[]
    tips: string
    variations: string
    storage: string
    allergens: string[]
  }>
}

const cuisineNames: Record<string, string> = {
  indonesian: 'Indonesia',
  western: 'Western/Barat',
  japanese: 'Jepang',
  chinese: 'China',
  korean: 'Korea',
  italian: 'Italia',
  dessert: 'Dessert/Penutup',
  beverage: 'Minuman',
}

const priceRangeValues: Record<string, { min: number; max: number }> = {
  budget: { min: 15000, max: 35000 },
  medium: { min: 35000, max: 75000 },
  premium: { min: 75000, max: 150000 },
  luxury: { min: 150000, max: 500000 },
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken()
    if (!user || !user.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      cuisineType = 'indonesian',
      ingredients = [],
      priceRange = 'medium',
      difficulty = 'sedang',
      portion = '1',
      outputFormat = 'multiple',
    } = body

    const cuisineName = cuisineNames[cuisineType] || 'Indonesia'
    const priceInfo = priceRangeValues[priceRange] || priceRangeValues.medium
    const numDishes = outputFormat === 'single' ? 1 : outputFormat === 'set' ? 4 : 3
    const servingsNum = portion === '2-3' ? 2 : portion === '4-6' ? 4 : 1

    const ingredientsList = ingredients.length > 0
      ? `dengan bahan utama: ${ingredients.join(', ')}`
      : 'dengan bahan yang umum tersedia di pasar Indonesia'

    const prompt = `Kamu adalah chef profesional dan konsultan F&B Indonesia dengan pengalaman 15+ tahun di restoran bintang 5. Buatkan ${numDishes} ide menu ${cuisineName} yang kreatif, unik, dan SIAP JUAL untuk restoran/kafe ${ingredientsList}.

TARGET BISNIS:
- Harga jual target: Rp ${priceInfo.min.toLocaleString('id-ID')} - Rp ${priceInfo.max.toLocaleString('id-ID')}
- Tingkat kesulitan memasak: ${difficulty}
- Ukuran porsi: ${servingsNum} porsi

Berikan output dalam format JSON seperti ini:
{
  "dishes": [
    {
      "name": "Nama menu yang catchy dan marketable",
      "description": "Deskripsi 2-3 kalimat yang menggugah selera untuk ditulis di menu",
      "ingredients": ["Bahan 1 (takaran)", "Bahan 2 (takaran)", "dst"],
      "ingredientDetails": [
        {"name": "Nama bahan", "amount": "jumlah", "unit": "satuan", "price": harga_estimasi_rupiah}
      ],
      "recipe": {
        "prepTime": "waktu persiapan",
        "cookTime": "waktu masak",
        "totalTime": "total waktu",
        "steps": [
          "Langkah 1: Detail lengkap cara mempersiapkan bahan",
          "Langkah 2: Detail proses memasak tahap pertama",
          "Langkah 3: Detail proses memasak tahap kedua",
          "Langkah 4: Detail finishing dan plating",
          "Langkah 5: dst (minimal 5-7 langkah detail)"
        ]
      },
      "composition": "Penjelasan komposisi hidangan: protein, karbohidrat, sauce, garnish",
      "plating": "Instruksi plating: jenis piring, tata letak, garnish final",
      "suggestedPrice": harga_jual_rupiah,
      "costEstimate": estimasi_hpp_rupiah,
      "profitMargin": persentase_margin,
      "cookingTime": "total waktu memasak",
      "difficulty": "${difficulty}",
      "servings": ${servingsNum},
      "tags": ["tag1", "tag2", "tag3"],
      "tips": "Tips penting untuk hasil terbaik",
      "variations": "Variasi yang bisa ditawarkan ke pelanggan",
      "storage": "Cara penyimpanan bahan/hidangan",
      "allergens": ["alergen1", "alergen2"]
    }
  ]
}

KRITERIA WAJIB:
1. NAMA: Catchy, modern, mudah diingat, cocok untuk menu Indonesia
2. BAHAN (ingredientDetails): Setiap bahan HARUS ada takaran pasti (gram, ml, sdm, sdt, buah, dll). Estimasi harga per bahan dalam Rupiah berdasarkan harga pasar Indonesia 2024.
3. RESEP (recipe.steps): Minimal 5-7 langkah DETAIL yang bisa diikuti oleh cook. Sertakan teknik, suhu, dan waktu spesifik.
4. HARGA: HPP maksimal 35-40% dari harga jual. Hitung profitMargin = ((suggestedPrice - costEstimate) / suggestedPrice) * 100
5. Jika diminta lebih dari 1 menu, berikan variasi yang BERBEDA (bukan mirip-mirip)`

    const aiResponse = await generateJSON<AIResponse>(prompt, {
      maxTokens: 4000,
      systemPrompt: 'Kamu adalah chef profesional dan konsultan F&B dengan keahlian kuliner Indonesia. Berikan resep yang detail, akurat, dan bisa langsung dipraktikkan.'
    })

    if (!aiResponse.dishes || !Array.isArray(aiResponse.dishes) || aiResponse.dishes.length === 0) {
      console.error('[Menu Creator V2] No dishes in AI response')
      return NextResponse.json(
        { error: 'AI tidak dapat menghasilkan ide menu. Silakan coba lagi.' },
        { status: 500 }
      )
    }

    const dishes: DishIdea[] = aiResponse.dishes.map((dish, index) => {
      // Calculate cost from ingredientDetails if available
      let calculatedCost = 0
      if (dish.ingredientDetails && Array.isArray(dish.ingredientDetails)) {
        calculatedCost = dish.ingredientDetails.reduce((sum, ing) => {
          return sum + (Number(ing.price) || 0)
        }, 0)
      }

      const costEstimate = calculatedCost > 0 ? calculatedCost : (Number(dish.costEstimate) || Math.floor(priceInfo.min * 0.35))
      const suggestedPrice = Number(dish.suggestedPrice) || Math.floor(costEstimate / 0.35)
      const profitMargin = suggestedPrice > 0
        ? Math.round(((suggestedPrice - costEstimate) / suggestedPrice) * 100)
        : 60

      return {
        id: `dish-${Date.now()}-${index}`,
        name: dish.name || 'Menu Spesial',
        description: dish.description || 'Hidangan spesial dari chef kami',
        ingredients: Array.isArray(dish.ingredients) ? dish.ingredients : [],
        ingredientDetails: Array.isArray(dish.ingredientDetails)
          ? dish.ingredientDetails.map((ing) => ({
              name: ing.name || 'Bahan',
              amount: String(ing.amount || ''),
              unit: ing.unit || '',
              price: Number(ing.price) || 0
            }))
          : [],
        recipe: {
          prepTime: dish.recipe?.prepTime || '15 menit',
          cookTime: dish.recipe?.cookTime || '20 menit',
          totalTime: dish.recipe?.totalTime || '35 menit',
          steps: Array.isArray(dish.recipe?.steps) ? dish.recipe.steps : [
            'Siapkan semua bahan sesuai takaran',
            'Ikuti langkah pembuatan dari chef',
            'Sajikan dengan garnish yang menarik'
          ]
        },
        composition: dish.composition || '',
        plating: dish.plating || '',
        imageUrl: null,
        suggestedPrice,
        costEstimate,
        profitMargin,
        cookingTime: dish.cookingTime || dish.recipe?.totalTime || '30 menit',
        difficulty: ['mudah', 'sedang', 'sulit'].includes(dish.difficulty)
          ? dish.difficulty as 'mudah' | 'sedang' | 'sulit'
          : difficulty as 'mudah' | 'sedang' | 'sulit',
        servings: Number(dish.servings) || servingsNum,
        tags: Array.isArray(dish.tags) ? dish.tags : [],
        tips: dish.tips || '',
        variations: dish.variations || '',
        storage: dish.storage || '',
        allergens: Array.isArray(dish.allergens) ? dish.allergens : [],
      }
    })

    return NextResponse.json({ dishes })

  } catch (error: any) {
    console.error('[Menu Creator V2] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Gagal generate ide menu. Silakan coba lagi.' },
      { status: 500 }
    )
  }
}
