import OpenAI from 'openai'

// Kolosal AI client using OpenAI SDK (OpenAI-compatible API)
const kolosalClient = new OpenAI({
  apiKey: process.env.KOLOSAL_API_KEY || '',
  baseURL: 'https://api.kolosal.ai/v1',
})

// Available models
export const KOLOSAL_MODELS = {
  // Best value - very cheap, good for UMKM use cases
  MAVERICK: 'meta-llama/llama-4-maverick-17b-128e-instruct',
  // Good balance of cost and quality
  MINIMAX: 'minimax/minimax-m2',
  // Premium - best quality
  CLAUDE: 'global.anthropic.claude-sonnet-4-5-20250929-v1:0',
  // Large context
  KIMI: 'moonshotai/kimi-k2-0905',
  // Vision capable
  QWEN_VL: 'qwen/qwen3-vl-30b-a3b-instruct',
} as const

// Default model for chat/analytics
const DEFAULT_MODEL = KOLOSAL_MODELS.MAVERICK

export function getKolosalClient() {
  if (!process.env.KOLOSAL_API_KEY) {
    throw new Error('KOLOSAL_API_KEY environment variable not set')
  }
  return kolosalClient
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function generateContent(
  prompt: string,
  options?: {
    model?: string
    maxTokens?: number
    temperature?: number
    systemPrompt?: string
  }
): Promise<string> {
  const client = getKolosalClient()

  const messages: ChatMessage[] = []

  if (options?.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt })
  }

  messages.push({ role: 'user', content: prompt })

  const completion = await client.chat.completions.create({
    model: options?.model || DEFAULT_MODEL,
    messages,
    max_tokens: options?.maxTokens || 2000,
    temperature: options?.temperature || 0.7,
  })

  const content = completion.choices[0]?.message?.content
  if (!content) {
    throw new Error('No response from AI model')
  }

  return content
}

export async function generateJSON<T>(
  prompt: string,
  options?: {
    model?: string
    maxTokens?: number
    systemPrompt?: string
  }
): Promise<T> {
  const jsonSystemPrompt = `${options?.systemPrompt || ''}

PENTING: Output HARUS berupa valid JSON tanpa markdown code blocks. Jangan tambahkan teks apapun sebelum atau sesudah JSON.`

  const response = await generateContent(prompt, {
    ...options,
    systemPrompt: jsonSystemPrompt,
    temperature: 0.3, // Lower temperature for more consistent JSON
  })

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
    throw new Error('Failed to parse AI response as JSON: ' + cleaned.substring(0, 200))
  }
}

export async function chat(
  messages: ChatMessage[],
  options?: {
    model?: string
    maxTokens?: number
    temperature?: number
  }
): Promise<string> {
  const client = getKolosalClient()

  const completion = await client.chat.completions.create({
    model: options?.model || DEFAULT_MODEL,
    messages,
    max_tokens: options?.maxTokens || 2000,
    temperature: options?.temperature || 0.7,
  })

  const content = completion.choices[0]?.message?.content
  if (!content) {
    throw new Error('No response from AI model')
  }

  return content
}

// Stream response (for real-time chat)
export async function* streamChat(
  messages: ChatMessage[],
  options?: {
    model?: string
    maxTokens?: number
    temperature?: number
  }
): AsyncGenerator<string> {
  const client = getKolosalClient()

  const stream = await client.chat.completions.create({
    model: options?.model || DEFAULT_MODEL,
    messages,
    max_tokens: options?.maxTokens || 2000,
    temperature: options?.temperature || 0.7,
    stream: true,
  })

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content
    if (content) {
      yield content
    }
  }
}
