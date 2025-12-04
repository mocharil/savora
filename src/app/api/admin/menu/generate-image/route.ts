import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/tenant-context'
import { getVertexAI, getGeminiModel } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken()
    if (!user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, category, description, customPrompt } = await request.json()

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

    // Use Gemini to optimize the prompt for food photography
    const geminiModel = getGeminiModel()
    const promptOptimization = await geminiModel.generateContent(`
You are a professional food photographer prompt engineer.
Create a detailed image generation prompt for this food item:

Original prompt: ${finalPrompt}

Create a single paragraph prompt (max 200 words) that includes:
- Professional food photography styling
- Appetizing presentation
- Soft natural lighting
- Shallow depth of field
- Clean plating on a suitable background
- Indonesian restaurant aesthetic

Output ONLY the prompt, nothing else. No explanations.
`)

    const optimizedPrompt = promptOptimization.response.candidates?.[0]?.content?.parts?.[0]?.text || finalPrompt

    // Try to use Imagen if available
    try {
      const vertexAI = getVertexAI()
      const imagenModel = vertexAI.getGenerativeModel({
        model: 'imagegeneration@006',
      })

      const imageResult = await imagenModel.generateContent({
        contents: [{
          role: 'user',
          parts: [{ text: `${optimizedPrompt}. High quality, 4K resolution, professional food photography.` }]
        }],
      })

      // Check if we got an image response
      const imageParts = imageResult.response.candidates?.[0]?.content?.parts
      if (imageParts) {
        for (const part of imageParts) {
          if ('inlineData' in part && part.inlineData) {
            return NextResponse.json({
              success: true,
              imageData: part.inlineData.data,
              mimeType: part.inlineData.mimeType || 'image/png',
              prompt: optimizedPrompt,
            })
          }
        }
      }
    } catch (imagenError: any) {
      console.log('Imagen not available, returning prompt only:', imagenError.message)
    }

    // Fallback: Return the optimized prompt for manual use
    return NextResponse.json({
      success: true,
      imageData: null,
      prompt: optimizedPrompt,
      message: 'Image generation model not available. Use the optimized prompt with an external image generator.',
      suggestedServices: [
        'https://gemini.google.com (paste the prompt)',
        'https://www.bing.com/images/create',
        'Canva AI Image Generator'
      ]
    })

  } catch (error: any) {
    console.error('Image generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate image' },
      { status: 500 }
    )
  }
}
