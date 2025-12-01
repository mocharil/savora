import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    const { menuName, description, style, cuisineType } = await request.json()

    if (!menuName) {
      return NextResponse.json(
        { error: 'Nama menu harus diisi' },
        { status: 400 }
      )
    }

    const styleDescriptions: Record<string, string> = {
      realistic: 'photorealistic, professional food photography, high-end restaurant presentation',
      artistic: 'artistic food photography, creative plating, dramatic lighting',
      minimalist: 'minimalist food photography, clean white background, simple elegant presentation',
      rustic: 'rustic food photography, wooden table, natural lighting, homemade feel',
      modern: 'modern food photography, sleek presentation, contemporary plating style',
    }

    const selectedStyle = styleDescriptions[style] || styleDescriptions.realistic

    const cuisineStyles: Record<string, string> = {
      indonesian: 'Indonesian cuisine style, traditional Indonesian presentation',
      italian: 'Italian cuisine style, Mediterranean presentation',
      japanese: 'Japanese cuisine style, minimalist Japanese presentation',
      chinese: 'Chinese cuisine style, traditional Chinese presentation',
      western: 'Western cuisine style, fine dining presentation',
      fusion: 'fusion cuisine style, modern creative presentation',
    }

    const cuisineStyle = cuisineStyles[cuisineType] || ''

    const prompt = `You are an expert food photographer and prompt engineer.
Create a detailed image generation prompt for a food photo with these details:

Menu Name: ${menuName}
${description ? `Description: ${description}` : ''}
Photography Style: ${selectedStyle}
${cuisineStyle ? `Cuisine Style: ${cuisineStyle}` : ''}

Generate a detailed prompt that describes:
1. The dish composition and ingredients visible
2. Plating style and presentation
3. Background and setting
4. Lighting (natural, studio, etc.)
5. Camera angle (top-down, 45 degrees, etc.)
6. Color palette and mood

Output ONLY the image prompt, nothing else. The prompt should be in English and be 50-100 words.`

    const imagePrompt = await generateContent(prompt)

    return NextResponse.json({
      success: true,
      imagePrompt: imagePrompt.trim(),
      message: 'Image prompt generated successfully. Use this prompt with an image generation service.',
    })
  } catch (error: any) {
    console.error('Generate image prompt error:', error)
    return NextResponse.json(
      { error: error.message || 'Gagal generate prompt gambar' },
      { status: 500 }
    )
  }
}
