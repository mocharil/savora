import { VertexAI } from '@google-cloud/vertexai'
import path from 'path'

// Path to service account JSON
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.join(process.cwd(), 'skilled-compass.json')

// Set environment variable for Google Cloud auth
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath
}

// Project ID from the service account
const projectId = 'paper-ds-production'
const location = 'us-central1'

let vertexAI: VertexAI | null = null

try {
  vertexAI = new VertexAI({
    project: projectId,
    location: location,
  })
} catch (error) {
  console.warn('Failed to initialize Vertex AI:', error)
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
