import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/tenant-context'
import { generateSingleImage } from '@/lib/gemini'
import { generateContent } from '@/lib/kolosal'

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken()
    if (!user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, category, description, customPrompt, aspectRatio } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Menu name is required' },
        { status: 400 }
      )
    }

    // Build the base prompt
    let basePrompt = `Professional food photography of ${name}`
    if (category) {
      basePrompt += `, Indonesian ${category.toLowerCase()} dish`
    }
    if (description) {
      basePrompt += `. ${description}`
    }

    // Add custom user prompt if provided
    const finalPrompt = customPrompt
      ? `${basePrompt}. Additional style: ${customPrompt}`
      : basePrompt

    // Use Kolosal AI to optimize the prompt for food photography
    const optimizedPrompt = await generateContent(`
You are a professional food photographer prompt engineer.
Create a detailed image generation prompt for this food item:

Original prompt: ${finalPrompt}

Create a single paragraph prompt (max 150 words) in English that includes:
- Professional food photography styling
- Appetizing presentation with steam or freshness indicators
- Soft natural lighting from the side
- Shallow depth of field
- Clean plating on a wooden table or ceramic plate
- Warm, inviting Indonesian restaurant aesthetic
- High resolution, 4K quality

Output ONLY the prompt, nothing else. No explanations or markdown.
`)

    // Generate image using Imagen 3
    try {
      const imageResult = await generateSingleImage(
        optimizedPrompt.trim(),
        aspectRatio || '4:3'
      )

      return NextResponse.json({
        success: true,
        imageData: imageResult.imageBytes,
        mimeType: imageResult.mimeType,
        prompt: optimizedPrompt.trim(),
      })
    } catch (imagenError: any) {
      console.error('Imagen generation error:', imagenError.message)

      // Fallback: Return the optimized prompt for manual use
      return NextResponse.json({
        success: true,
        imageData: null,
        prompt: optimizedPrompt.trim(),
        message: 'Image generation failed. Use the optimized prompt with an external image generator.',
        error: imagenError.message,
        suggestedServices: [
          'https://gemini.google.com (paste the prompt)',
          'https://www.bing.com/images/create',
          'Canva AI Image Generator'
        ]
      })
    }

  } catch (error: any) {
    console.error('Image generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate image' },
      { status: 500 }
    )
  }
}
