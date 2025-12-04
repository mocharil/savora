import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/tenant-context'
import { generateJSON } from '@/lib/gemini'

type DescriptionStyle = 'professional' | 'friendly' | 'elegant' | 'casual' | 'minimal'

interface StyleResult {
  style: DescriptionStyle
  label: string
  description: string
}

interface EnhancedDescriptions {
  styles: StyleResult[]
}

const STYLE_PROMPTS: Record<DescriptionStyle, { label: string; instruction: string }> = {
  professional: {
    label: 'Profesional',
    instruction: 'Gaya formal dan profesional. Fokus pada komposisi bahan dan teknik memasak. Tanpa kata-kata berlebihan atau gimmick. Singkat, informatif, dan elegan.',
  },
  friendly: {
    label: 'Friendly',
    instruction: 'Gaya ramah dan hangat seperti teman merekomendasikan. Boleh sedikit playful tapi tetap sopan. Mengundang dan bersahabat.',
  },
  elegant: {
    label: 'Elegan',
    instruction: 'Gaya mewah dan sophisticated. Gunakan diksi yang indah dan puitis. Cocok untuk fine dining atau restoran premium.',
  },
  casual: {
    label: 'Kasual',
    instruction: 'Gaya santai dan fun. Boleh menggunakan bahasa sehari-hari yang catchy. Cocok untuk cafe atau tempat makan casual.',
  },
  minimal: {
    label: 'Minimal',
    instruction: 'Sangat singkat dan to-the-point. Hanya menyebutkan bahan utama atau karakteristik utama. Maksimal 50 karakter.',
  },
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken()
    if (!user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, category, description, style } = await request.json()

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      )
    }

    // If specific style requested, generate only that style
    if (style && STYLE_PROMPTS[style as DescriptionStyle]) {
      const styleInfo = STYLE_PROMPTS[style as DescriptionStyle]
      const prompt = `Kamu adalah copywriter restoran. Tulis ulang deskripsi menu ini dengan gaya "${styleInfo.label}".

DATA MENU:
- Nama: ${name}
- Kategori: ${category || 'Tidak disebutkan'}
- Deskripsi asli: ${description}

GAYA PENULISAN: ${styleInfo.instruction}

Berikan respons dalam format JSON:
{
  "description": "Deskripsi yang telah ditulis ulang sesuai gaya (maksimal 120 karakter)"
}

ATURAN:
- Gunakan bahasa Indonesia
- Sesuai dengan gaya yang diminta
- Tetap akurat dengan menu aslinya`

      const result = await generateJSON<{ description: string }>(prompt)

      return NextResponse.json({
        success: true,
        style: style,
        description: result.description,
      })
    }

    // Generate all styles at once
    const prompt = `Kamu adalah copywriter restoran profesional. Tulis ulang deskripsi menu ini dalam 5 gaya berbeda.

DATA MENU:
- Nama: ${name}
- Kategori: ${category || 'Tidak disebutkan'}
- Deskripsi asli: ${description}

Berikan respons dalam format JSON dengan 5 gaya berbeda:
{
  "styles": [
    {
      "style": "professional",
      "label": "Profesional",
      "description": "Deskripsi gaya profesional - formal, fokus komposisi bahan dan teknik, tanpa gimmick (maks 120 karakter)"
    },
    {
      "style": "friendly",
      "label": "Friendly",
      "description": "Deskripsi gaya friendly - ramah, hangat, seperti teman merekomendasikan (maks 120 karakter)"
    },
    {
      "style": "elegant",
      "label": "Elegan",
      "description": "Deskripsi gaya elegan - mewah, sophisticated, diksi indah (maks 120 karakter)"
    },
    {
      "style": "casual",
      "label": "Kasual",
      "description": "Deskripsi gaya kasual - santai, fun, bahasa sehari-hari (maks 120 karakter)"
    },
    {
      "style": "minimal",
      "label": "Minimal",
      "description": "Deskripsi minimal - sangat singkat, hanya bahan/karakter utama (maks 50 karakter)"
    }
  ]
}

ATURAN:
- Semua dalam bahasa Indonesia
- Setiap gaya harus berbeda karakternya
- Tetap akurat dengan menu aslinya
- Jangan gunakan kata berlebihan seperti "terenak" atau "terbaik"`

    const result = await generateJSON<EnhancedDescriptions>(prompt)

    return NextResponse.json({
      success: true,
      styles: result.styles || [],
    })
  } catch (error: any) {
    console.error('Description enhancement error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to enhance description' },
      { status: 500 }
    )
  }
}
