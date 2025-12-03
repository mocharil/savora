import { VertexAI } from '@google-cloud/vertexai'
import fs from 'fs'
import path from 'path'
import os from 'os'

// Project ID and location
const projectId = 'paper-ds-production'
const location = 'us-central1'

let vertexAI: VertexAI | null = null

function setupCredentials(): boolean {
  try {
    // Option 1: Check for GEMINI_CREDENTIALS env var (for production/deployment)
    const geminiCredentials = process.env.GEMINI_CREDENTIALS
    if (geminiCredentials) {
      // Write to temp file (Google Cloud SDK requires a file path)
      const tempPath = path.join(os.tmpdir(), 'gemini-credentials.json')
      fs.writeFileSync(tempPath, geminiCredentials)
      process.env.GOOGLE_APPLICATION_CREDENTIALS = tempPath
      return true
    }

    // Option 2: Check for local file (for development)
    const localPath = path.join(process.cwd(), 'gemini-credentials.json')
    if (fs.existsSync(localPath)) {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = localPath
      return true
    }

    console.warn('No Gemini credentials found. Set GEMINI_CREDENTIALS env var or create gemini-credentials.json')
    return false
  } catch (error) {
    console.warn('Failed to setup Gemini credentials:', error)
    return false
  }
}

// Setup credentials and initialize Vertex AI
if (setupCredentials()) {
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
