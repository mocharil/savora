/**
 * AI Client (using Gemini)
 * Centralized client for all AI operations
 */

import { generateContent, generateJSON as geminiGenerateJSON } from '@/lib/gemini'

export interface AIResponse<T> {
  success: boolean
  data?: T
  error?: string
  cached?: boolean
  tokensUsed?: number
  responseTimeMs?: number
}

/**
 * Generate AI completion with error handling
 */
export async function generateCompletion(
  systemPrompt: string,
  userPrompt: string,
  options?: {
    maxTokens?: number
    temperature?: number
  }
): Promise<AIResponse<string>> {
  const startTime = Date.now()

  try {
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`
    const result = await generateContent(fullPrompt)

    return {
      success: true,
      data: result,
      responseTimeMs: Date.now() - startTime
    }
  } catch (error: any) {
    console.error('Gemini API error:', error)

    return {
      success: false,
      error: error.message || 'AI service unavailable',
      responseTimeMs: Date.now() - startTime
    }
  }
}

/**
 * Generate AI completion and parse as JSON
 */
export async function generateJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  options?: {
    maxTokens?: number
    temperature?: number
  }
): Promise<AIResponse<T>> {
  const startTime = Date.now()

  try {
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`
    const result = await geminiGenerateJSON<T>(fullPrompt)

    return {
      success: true,
      data: result,
      responseTimeMs: Date.now() - startTime
    }
  } catch (error: any) {
    console.error('Gemini JSON generation error:', error)

    return {
      success: false,
      error: error.message || 'Failed to generate JSON response',
      responseTimeMs: Date.now() - startTime
    }
  }
}

/**
 * Check if AI service is available
 */
export function isAIEnabled(): boolean {
  return !!process.env.GOOGLE_APPLICATION_CREDENTIALS
}
