import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/tenant-context'
import { generateContent } from '@/lib/kolosal'
import { generateSingleImage } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken()
    if (!user || !user.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { dishName, description, ingredients } = body

    if (!dishName) {
      return NextResponse.json({ error: 'Dish name is required' }, { status: 400 })
    }

    // Step 1: Generate optimized image prompt using Kolosal AI
    const promptGeneratorInput = `You are an expert food photographer and prompt engineer.
Create a detailed image generation prompt for a food photo with these details:

Menu Name: ${dishName}
${description ? `Description: ${description}` : ''}
${ingredients && ingredients.length > 0 ? `Main Ingredients: ${ingredients.slice(0, 5).join(', ')}` : ''}

Generate a detailed prompt that describes:
1. The dish composition and ingredients visible
2. Plating style and presentation (elegant, restaurant quality)
3. Background and setting (clean, minimalist)
4. Lighting (warm, natural, professional)
5. Camera angle (45 degrees or top-down)
6. Color palette and mood (appetizing, vibrant)

Output ONLY the image prompt, nothing else. The prompt should be in English and be 50-100 words.
DO NOT include any text, watermarks, or logos in the image description.`

    let imagePrompt: string
    try {
      imagePrompt = await generateContent(promptGeneratorInput)
      imagePrompt = imagePrompt.trim()
    } catch (promptError) {
      console.error('[Generate Dish Image] Prompt generation failed, using fallback:', promptError)
      // Fallback to basic prompt
      const ingredientsList = ingredients?.slice(0, 5).join(', ') || ''
      imagePrompt = `Professional food photography of ${dishName}. ${description || ''}
Main ingredients: ${ingredientsList}.
Style: Overhead shot, warm natural lighting, elegant ceramic plate presentation,
beautiful garnish, restaurant quality, 4K resolution, sharp focus,
vibrant appetizing colors, rustic wooden table background.
NO text, NO watermarks, NO logos.`
    }

    // Step 2: Generate image using Gemini Imagen 3
    try {
      const imageResult = await generateSingleImage(imagePrompt, '4:3')

      return NextResponse.json({
        success: true,
        imageUrl: `data:${imageResult.mimeType};base64,${imageResult.imageBytes}`,
        imageData: imageResult.imageBytes,
        mimeType: imageResult.mimeType,
        prompt: imagePrompt,
        source: 'gemini-imagen'
      })
    } catch (imagenError: any) {
      console.error('[Generate Dish Image] Imagen generation failed:', imagenError.message)

      // Fallback to Unsplash
      const searchQuery = encodeURIComponent(`${dishName} food dish plated restaurant`)
      const placeholderUrl = `https://source.unsplash.com/800x600/?${searchQuery}`

      return NextResponse.json({
        success: true,
        imageUrl: placeholderUrl,
        prompt: imagePrompt,
        source: 'unsplash-fallback',
        note: 'Image generation service unavailable. Using placeholder image.'
      })
    }

  } catch (error: any) {
    console.error('[Generate Dish Image] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate image' },
      { status: 500 }
    )
  }
}
