import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/lib/kolosal'

export async function POST(request: NextRequest) {
  try {
    const { menuName, category, ingredients, style, language = 'id' } = await request.json()

    if (!menuName) {
      return NextResponse.json(
        { error: 'Nama menu harus diisi' },
        { status: 400 }
      )
    }

    const stylePrompts: Record<string, string> = {
      professional: 'gunakan bahasa formal dan profesional',
      casual: 'gunakan bahasa santai dan friendly',
      luxury: 'gunakan bahasa mewah dan eksklusif',
      playful: 'gunakan bahasa fun dan menarik',
    }

    const styleInstruction = stylePrompts[style] || stylePrompts.professional

    const prompt = `Kamu adalah seorang copywriter profesional untuk industri F&B di Indonesia.
Buatkan deskripsi menu yang menarik dan menggugah selera untuk menu berikut:

Nama Menu: ${menuName}
${category ? `Kategori: ${category}` : ''}
${ingredients ? `Bahan-bahan: ${ingredients}` : ''}

Instruksi:
- ${styleInstruction}
- Buat dalam bahasa ${language === 'id' ? 'Indonesia' : 'Inggris'}
- Deskripsi maksimal 2-3 kalimat
- Fokus pada rasa, tekstur, dan keunikan
- Jangan menyebutkan harga
- Buat pembaca ingin mencoba menu ini

Berikan HANYA deskripsi menu tanpa penjelasan tambahan.`

    const description = await generateContent(prompt)

    return NextResponse.json({
      success: true,
      description: description.trim(),
    })
  } catch (error: any) {
    console.error('Generate description error:', error)
    return NextResponse.json(
      { error: error.message || 'Gagal generate deskripsi' },
      { status: 500 }
    )
  }
}
