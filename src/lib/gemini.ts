import { VertexAI } from '@google-cloud/vertexai'
import { GoogleAuth } from 'google-auth-library'
import fs from 'fs'
import path from 'path'
import os from 'os'

// Project configuration from environment
const projectId = process.env.GEMINI_PROJECT_ID || ''
const location = process.env.GEMINI_LOCATION || 'us-central1'

let vertexAI: VertexAI | null = null
let googleAuth: GoogleAuth | null = null

export function setupCredentials(): boolean {
  try {
    const geminiCredentials = process.env.GEMINI_CREDENTIALS
    if (geminiCredentials) {
      // Write to temp file (Google Cloud SDK requires a file path)
      const tempPath = path.join(os.tmpdir(), 'gcp-sa-credentials.json')
      fs.writeFileSync(tempPath, geminiCredentials)
      process.env.GOOGLE_APPLICATION_CREDENTIALS = tempPath
      return true
    }

    console.warn('No Gemini credentials found. Set GEMINI_CREDENTIALS env var.')
    return false
  } catch (error) {
    console.warn('Failed to setup Gemini credentials:', error)
    return false
  }
}

// Get or initialize Vertex AI instance
export function getVertexAI(): VertexAI {
  if (!vertexAI) {
    if (!setupCredentials()) {
      throw new Error('AI credentials not configured')
    }
    if (!projectId) {
      throw new Error('GEMINI_PROJECT_ID environment variable not set')
    }
    vertexAI = new VertexAI({
      project: projectId,
      location: location,
    })
  }
  return vertexAI
}

// Initialize on module load if credentials available
if (setupCredentials() && projectId) {
  try {
    vertexAI = new VertexAI({
      project: projectId,
      location: location,
    })
  } catch (error) {
    console.warn('Failed to initialize Vertex AI:', error)
  }
}

export function getGeminiModel(modelName: string = 'gemini-2.5-flash-lite') {
  if (!vertexAI) {
    throw new Error('Vertex AI not configured. Check your credentials.')
  }
  return vertexAI.getGenerativeModel({
    model: modelName,
  })
}

export async function generateContent(prompt: string): Promise<string> {
  const model = getGeminiModel()
  const result = await model.generateContent(prompt)
  const response = result.response

  if (response.candidates && response.candidates[0]?.content?.parts) {
    return response.candidates[0].content.parts
      .map((part) => part.text || '')
      .join('')
  }

  throw new Error('No response from AI model')
}

export async function generateJSON<T>(prompt: string): Promise<T> {
  const fullPrompt = `${prompt}\n\nOutput HANYA valid JSON tanpa markdown code blocks.`
  const response = await generateContent(fullPrompt)

  // Clean up response
  let cleaned = response.trim()
  cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

  try {
    return JSON.parse(cleaned)
  } catch {
    // Try to extract JSON from response
    const jsonMatch = cleaned.match(/[\[{][\s\S]*[\]}]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('Failed to parse AI response as JSON')
  }
}

// ============================================
// Imagen 3 Image Generation
// ============================================

interface ImagenConfig {
  numberOfImages?: number  // 1-4, default 1
  aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9'  // default '1:1'
  personGeneration?: 'dont_allow' | 'allow_adult' | 'allow_all'  // default 'allow_adult'
  safetyFilterLevel?: 'block_low_and_above' | 'block_medium_and_above' | 'block_only_high'
  addWatermark?: boolean  // default true
}

interface GeneratedImage {
  imageBytes: string  // base64 encoded
  mimeType: string
}

interface ImageGenerationResult {
  images: GeneratedImage[]
  prompt: string
}

async function getAccessToken(): Promise<string> {
  if (!googleAuth) {
    googleAuth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    })
  }
  const client = await googleAuth.getClient()
  const token = await client.getAccessToken()
  if (!token.token) {
    throw new Error('Failed to get access token')
  }
  return token.token
}

/**
 * Generate images using Imagen 3 on Vertex AI
 * @param prompt - Text description of the image to generate
 * @param config - Optional configuration for image generation
 * @returns Array of generated images with base64 data
 */
export async function generateImage(
  prompt: string,
  config: ImagenConfig = {}
): Promise<ImageGenerationResult> {
  if (!setupCredentials()) {
    throw new Error('Google Cloud credentials not configured')
  }
  if (!projectId) {
    throw new Error('GEMINI_PROJECT_ID environment variable not set')
  }

  const {
    numberOfImages = 1,
    aspectRatio = '1:1',
    personGeneration = 'allow_adult',
    safetyFilterLevel = 'block_medium_and_above',
    addWatermark = false,
  } = config

  // Imagen 3 model endpoint
  const modelId = 'imagen-3.0-generate-002'
  const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelId}:predict`

  // Get access token for authentication
  const accessToken = await getAccessToken()

  // Build request body
  const requestBody = {
    instances: [
      {
        prompt: prompt,
      },
    ],
    parameters: {
      sampleCount: numberOfImages,
      aspectRatio: aspectRatio,
      personGeneration: personGeneration,
      safetyFilterLevel: safetyFilterLevel,
      addWatermark: addWatermark,
    },
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[Imagen] API Error:', errorText)
    throw new Error(`Imagen API error: ${response.status} - ${errorText}`)
  }

  const result = await response.json()

  if (!result.predictions || result.predictions.length === 0) {
    throw new Error('No images generated')
  }

  const images: GeneratedImage[] = result.predictions.map((prediction: any) => ({
    imageBytes: prediction.bytesBase64Encoded,
    mimeType: prediction.mimeType || 'image/png',
  }))

  return {
    images,
    prompt,
  }
}

/**
 * Generate a single image and return base64 data directly
 */
export async function generateSingleImage(
  prompt: string,
  aspectRatio: ImagenConfig['aspectRatio'] = '1:1'
): Promise<{ imageBytes: string; mimeType: string }> {
  const result = await generateImage(prompt, {
    numberOfImages: 1,
    aspectRatio,
  })

  if (result.images.length === 0) {
    throw new Error('No image generated')
  }

  return result.images[0]
}
