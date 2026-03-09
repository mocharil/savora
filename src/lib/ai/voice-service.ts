/**
 * AI Voice Order Service
 * Parses voice input into order items using NLP
 */

import { generateJSON, isAIEnabled } from './claude-client'
import type { VoiceParseResult, ParsedOrderItem } from './types'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

interface MenuItem {
  id: string
  name: string
  price: number
  variants?: { name: string; price: number }[]
  is_available: boolean
}

interface VoiceParseParams {
  storeId: string
  outletId: string
  transcript: string
  menuItems?: MenuItem[] // Optional pre-fetched menu
}

/**
 * Parse voice transcript into order items
 */
export async function parseVoiceOrder(
  params: VoiceParseParams
): Promise<{ success: boolean; result?: VoiceParseResult; error?: string }> {
  const { storeId, outletId, transcript, menuItems: providedMenu } = params

  if (!transcript || transcript.trim().length === 0) {
    return {
      success: false,
      error: 'Tidak ada input suara yang diterima'
    }
  }

  // Get menu items if not provided
  const menuItems = providedMenu || await getMenuItems(storeId, outletId)

  if (menuItems.length === 0) {
    return {
      success: false,
      error: 'Menu tidak tersedia'
    }
  }

  // Try AI parsing first if available
  if (isAIEnabled()) {
    const aiResult = await parseWithAI(transcript, menuItems)
    if (aiResult) {
      // Log voice order
      await logVoiceOrder(storeId, outletId, transcript, aiResult, 'ai')
      return { success: true, result: aiResult }
    }
  }

  // Fallback to pattern matching
  const basicResult = parseWithPatterns(transcript, menuItems)

  // Log voice order
  await logVoiceOrder(storeId, outletId, transcript, basicResult, 'pattern')

  return { success: true, result: basicResult }
}

/**
 * Get menu items for a store/outlet
 */
async function getMenuItems(storeId: string, outletId: string): Promise<MenuItem[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('menu_items')
    .select('id, name, price, variants, is_available')
    .eq('store_id', storeId)
    .eq('is_available', true)

  if (error) {
    console.error('Error fetching menu items:', error)
    return []
  }

  return data || []
}

/**
 * Parse with AI (Claude)
 */
async function parseWithAI(
  transcript: string,
  menuItems: MenuItem[]
): Promise<VoiceParseResult | null> {
  const menuList = menuItems.map(m => ({
    id: m.id,
    name: m.name,
    price: m.price,
    variants: m.variants?.map(v => v.name) || []
  }))

  const systemPrompt = `Kamu adalah asisten voice ordering untuk restoran.
Tugasmu adalah mengurai pesanan suara menjadi item-item pesanan.

PENTING:
- Cocokkan dengan menu yang tersedia
- Pahami variasi ucapan (misalnya "nasi goring" = "nasi goreng")
- Tangkap jumlah (default 1 jika tidak disebutkan)
- Tangkap catatan/modifikasi (misalnya "tidak pedas", "extra sambal")
- Jika tidak yakin, berikan suggestions

Bahasa: Indonesia (bisa campur English)`

  const userPrompt = `MENU TERSEDIA:
${JSON.stringify(menuList, null, 2)}

TRANSKRIP PESANAN:
"${transcript}"

Parse pesanan ini dan kembalikan JSON:
{
  "items": [
    {
      "menuItemId": "id dari menu",
      "name": "nama item",
      "quantity": 1,
      "price": 0,
      "subtotal": 0,
      "confidence": 0.9,
      "originalText": "bagian transkrip yang match",
      "variants": ["variant jika ada"],
      "notes": "catatan jika ada"
    }
  ],
  "unrecognized": ["bagian yang tidak dikenali"],
  "suggestions": [
    {
      "text": "mungkin maksudnya...",
      "options": [{"id": "id", "name": "nama", "price": 0}]
    }
  ]
}

RULES:
- menuItemId HARUS dari menu yang tersedia
- confidence: 0.0-1.0 seberapa yakin matchingnya
- Jika ada bagian yang tidak bisa diparsing, masukkan ke unrecognized
- Jika ada yang ambigu, berikan suggestions`

  const result = await generateJSON<{
    items: Array<{
      menuItemId: string
      name: string
      quantity: number
      price: number
      subtotal: number
      confidence: number
      originalText: string
      variants?: string[]
      notes?: string
    }>
    unrecognized: string[]
    suggestions?: Array<{
      text: string
      options: Array<{ id: string; name: string; price: number }>
    }>
  }>(systemPrompt, userPrompt)

  if (!result.success || !result.data) {
    return null
  }

  const data = result.data

  // Enrich with actual prices from menu
  const enrichedItems: ParsedOrderItem[] = data.items.map(item => {
    const menuItem = menuItems.find(m => m.id === item.menuItemId)
    const price = menuItem?.price || item.price
    return {
      ...item,
      price,
      subtotal: price * item.quantity
    }
  })

  const total = enrichedItems.reduce((sum, item) => sum + item.subtotal, 0)
  const overallConfidence = enrichedItems.length > 0
    ? enrichedItems.reduce((sum, item) => sum + item.confidence, 0) / enrichedItems.length
    : 0

  return {
    items: enrichedItems,
    unrecognized: data.unrecognized || [],
    total,
    overallConfidence: Math.round(overallConfidence * 100) / 100,
    suggestions: data.suggestions
  }
}

/**
 * Fallback pattern-based parsing
 */
function parseWithPatterns(
  transcript: string,
  menuItems: MenuItem[]
): VoiceParseResult {
  const items: ParsedOrderItem[] = []
  const unrecognized: string[] = []

  // Normalize transcript
  const normalized = transcript.toLowerCase().trim()

  // Common quantity patterns
  const quantityPatterns = [
    { pattern: /(\d+)\s*(porsi|pcs|buah|gelas|mangkok|cup)?\s*/gi, extract: (m: RegExpMatchArray) => parseInt(m[1]) },
    { pattern: /(satu|sebuah|se)\s*/gi, extract: () => 1 },
    { pattern: /(dua|double)\s*/gi, extract: () => 2 },
    { pattern: /(tiga|triple)\s*/gi, extract: () => 3 },
    { pattern: /(empat)\s*/gi, extract: () => 4 },
    { pattern: /(lima)\s*/gi, extract: () => 5 }
  ]

  // Try to match each menu item
  for (const menuItem of menuItems) {
    const itemName = menuItem.name.toLowerCase()
    const itemNameNormalized = normalizeText(itemName)

    // Check if menu item appears in transcript
    if (normalized.includes(itemNameNormalized) || fuzzyMatch(normalized, itemNameNormalized) > 0.7) {
      // Find quantity
      let quantity = 1
      for (const qp of quantityPatterns) {
        const match = normalized.match(qp.pattern)
        if (match) {
          const extractedQty = qp.extract(match)
          if (extractedQty > 0 && extractedQty <= 20) {
            quantity = extractedQty
            break
          }
        }
      }

      // Extract notes if any
      const notes = extractNotes(normalized, itemNameNormalized)

      items.push({
        menuItemId: menuItem.id,
        name: menuItem.name,
        quantity,
        price: menuItem.price,
        subtotal: menuItem.price * quantity,
        confidence: fuzzyMatch(normalized, itemNameNormalized),
        originalText: transcript,
        notes: notes || undefined
      })
    }
  }

  // If nothing matched, add to unrecognized
  if (items.length === 0) {
    unrecognized.push(transcript)
  }

  const total = items.reduce((sum, item) => sum + item.subtotal, 0)
  const overallConfidence = items.length > 0
    ? items.reduce((sum, item) => sum + item.confidence, 0) / items.length
    : 0

  return {
    items,
    unrecognized,
    total,
    overallConfidence: Math.round(overallConfidence * 100) / 100
  }
}

/**
 * Normalize text for matching
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Simple fuzzy matching (Jaccard similarity)
 */
function fuzzyMatch(text1: string, text2: string): number {
  const words1 = new Set(normalizeText(text1).split(' '))
  const words2 = new Set(normalizeText(text2).split(' '))

  const intersection = new Set([...words1].filter(x => words2.has(x)))
  const union = new Set([...words1, ...words2])

  return intersection.size / union.size
}

/**
 * Extract notes/modifications from transcript
 */
function extractNotes(transcript: string, itemName: string): string | null {
  const notePatterns = [
    /tidak\s+(pedas|asin|manis|panas)/gi,
    /extra\s+(\w+)/gi,
    /tanpa\s+(\w+)/gi,
    /tambah\s+(\w+)/gi,
    /kurang\s+(\w+)/gi,
    /level\s+(\d+|pedas|sedang|tidak pedas)/gi
  ]

  const notes: string[] = []

  for (const pattern of notePatterns) {
    const matches = transcript.matchAll(pattern)
    for (const match of matches) {
      notes.push(match[0])
    }
  }

  return notes.length > 0 ? notes.join(', ') : null
}

/**
 * Log voice order for analytics
 */
async function logVoiceOrder(
  storeId: string,
  outletId: string,
  transcript: string,
  result: VoiceParseResult,
  parseMethod: 'ai' | 'pattern'
): Promise<void> {
  const supabase = getSupabase()

  await supabase.from('voice_orders_log').insert({
    store_id: storeId,
    outlet_id: outletId,
    transcript,
    parsed_items: result.items,
    confidence_score: result.overallConfidence,
    parse_method: parseMethod,
    success: result.items.length > 0
  })
}

/**
 * Get voice order statistics
 */
export async function getVoiceOrderStats(
  storeId: string,
  outletId?: string | null
): Promise<{
  totalOrders: number
  successRate: number
  avgConfidence: number
  commonFailures: string[]
}> {
  const supabase = getSupabase()

  let query = supabase
    .from('voice_orders_log')
    .select('success, confidence_score, transcript')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })
    .limit(100)

  if (outletId) {
    query = query.eq('outlet_id', outletId)
  }

  const { data, error } = await query

  if (error || !data || data.length === 0) {
    return {
      totalOrders: 0,
      successRate: 0,
      avgConfidence: 0,
      commonFailures: []
    }
  }

  const successCount = data.filter(d => d.success).length
  const avgConfidence = data.reduce((sum, d) => sum + (d.confidence_score || 0), 0) / data.length

  // Get common failure transcripts
  const failures = data
    .filter(d => !d.success)
    .map(d => d.transcript)
    .slice(0, 5)

  return {
    totalOrders: data.length,
    successRate: Math.round((successCount / data.length) * 100),
    avgConfidence: Math.round(avgConfidence * 100) / 100,
    commonFailures: failures
  }
}

/**
 * Get suggestions for improving voice recognition
 */
export async function getVoiceImprovementSuggestions(
  storeId: string
): Promise<string[]> {
  const stats = await getVoiceOrderStats(storeId)

  const suggestions: string[] = []

  if (stats.successRate < 70) {
    suggestions.push('Pertimbangkan untuk menambah alias/nama alternatif untuk menu')
  }

  if (stats.avgConfidence < 0.7) {
    suggestions.push('Pastikan nama menu mudah diucapkan dan tidak ambigu')
  }

  if (stats.commonFailures.length > 0) {
    suggestions.push(`Beberapa pesanan gagal diparsing: "${stats.commonFailures[0]}"`)
  }

  return suggestions
}
