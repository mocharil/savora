import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/tenant-context'
import { getVertexAI, getGeminiModel } from '@/lib/gemini'

interface ImageAnalysis {
  quality_score: number
  issues: string[]
  suggestions: string[]
  enhancement_prompt: string
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken()
    if (!user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { imageBase64, mimeType, name, enhanceType } = await request.json()

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      )
    }

    // Use Gemini Vision to analyze the image
    const geminiModel = getGeminiModel()
    const analysisResult = await geminiModel.generateContent({
      contents: [{
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: imageBase64,
            },
          },
          {
            text: `Kamu adalah fotografer makanan profesional. Analisis foto makanan ini dan berikan:

1. Kualitas foto saat ini (1-10)
2. Masalah yang terdeteksi (blur, lighting buruk, komposisi, dll)
3. Saran perbaikan spesifik

${name ? `Nama menu: ${name}` : ''}

Berikan respons dalam format JSON:
{
  "quality_score": 7,
  "issues": ["Lighting kurang terang", "Sedikit blur"],
  "suggestions": ["Tambah cahaya dari samping", "Gunakan tripod untuk ketajaman"],
  "enhancement_prompt": "Prompt untuk regenerasi foto yang lebih baik berdasarkan foto ini"
}

Output HANYA valid JSON tanpa markdown.`,
          },
        ],
      }],
    })

    const analysisText = analysisResult.response.candidates?.[0]?.content?.parts?.[0]?.text || '{}'

    // Parse the analysis
    let analysis: ImageAnalysis
    try {
      let cleaned = analysisText.trim()
      cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      analysis = JSON.parse(cleaned)
    } catch {
      analysis = {
        quality_score: 5,
        issues: ['Tidak dapat menganalisis'],
        suggestions: ['Coba foto ulang dengan cahaya yang lebih baik'],
        enhancement_prompt: `Professional food photography of ${name || 'delicious dish'}, well-lit, appetizing presentation`
      }
    }

    let enhancedImageData = null

    // Try to use Imagen for enhancement if requested
    if (enhanceType === 'regenerate') {
      try {
        const vertexAI = getVertexAI()
        const imagenModel = vertexAI.getGenerativeModel({
          model: 'imagegeneration@006',
        })

        const regenerateResult = await imagenModel.generateContent({
          contents: [{
            role: 'user',
            parts: [{ text: analysis.enhancement_prompt + '. Professional food photography, high quality, 4K.' }]
          }],
        })

        const imageParts = regenerateResult.response.candidates?.[0]?.content?.parts
        if (imageParts) {
          for (const part of imageParts) {
            if ('inlineData' in part && part.inlineData) {
              enhancedImageData = {
                data: part.inlineData.data,
                mimeType: part.inlineData.mimeType || 'image/png',
              }
              break
            }
          }
        }
      } catch (imagenError: any) {
        console.log('Imagen enhancement not available:', imagenError.message)
      }
    }

    return NextResponse.json({
      success: true,
      analysis: {
        qualityScore: analysis.quality_score,
        issues: analysis.issues || [],
        suggestions: analysis.suggestions || [],
      },
      enhancementPrompt: analysis.enhancement_prompt,
      enhancedImage: enhancedImageData,
      message: enhancedImageData
        ? 'Image enhanced successfully'
        : 'Analysis complete. Use the enhancement prompt to regenerate a better image.',
    })

  } catch (error: any) {
    console.error('Image enhancement error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to enhance image' },
      { status: 500 }
    )
  }
}
