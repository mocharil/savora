import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateJSON } from '@/lib/gemini'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface ParsedItem {
  menuItemId: string
  name: string
  quantity: number
  price: number
  confidence: number
  originalText: string
}

interface VoiceParseResponse {
  items: ParsedItem[]
  unrecognized: string[]
  total: number
  suggestions: {
    text: string
    options: { name: string; id: string; price: number }[]
  }[]
}

// Indonesian number words mapping
const numberWords: Record<string, number> = {
  satu: 1,
  dua: 2,
  tiga: 3,
  empat: 4,
  lima: 5,
  enam: 6,
  tujuh: 7,
  delapan: 8,
  sembilan: 9,
  sepuluh: 10,
  sebelas: 11,
  duabelas: 12,
  selusin: 12,
  setengah: 0.5,
  seperempat: 0.25,
}

// Common food-related filler words to remove
const fillerWords = [
  'tolong',
  'minta',
  'pesan',
  'order',
  'mau',
  'beli',
  'kasih',
  'sama',
  'dengan',
  'dan',
  'plus',
  'tambah',
  'juga',
  'dong',
  'ya',
  'aja',
  'saja',
  'boleh',
  'bisa',
  'kak',
  'mas',
  'mbak',
  'bang',
  'pak',
  'bu',
]

function normalizeText(text: string): string {
  let normalized = text.toLowerCase().trim()

  // Remove common filler words
  fillerWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    normalized = normalized.replace(regex, '')
  })

  // Clean up extra spaces
  normalized = normalized.replace(/\s+/g, ' ').trim()

  return normalized
}

function extractQuantity(text: string): { quantity: number; remainingText: string } {
  let quantity = 1
  let remainingText = text

  // Check for number words
  for (const [word, num] of Object.entries(numberWords)) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    if (regex.test(text)) {
      quantity = num
      remainingText = text.replace(regex, '').trim()
      break
    }
  }

  // Check for digits
  const digitMatch = text.match(/\b(\d+)\b/)
  if (digitMatch) {
    quantity = parseInt(digitMatch[1])
    remainingText = text.replace(/\b\d+\b/, '').trim()
  }

  return { quantity, remainingText }
}

function fuzzyMatch(text: string, target: string): number {
  const textLower = text.toLowerCase()
  const targetLower = target.toLowerCase()

  // Exact match
  if (textLower === targetLower) return 1

  // Contains match
  if (targetLower.includes(textLower) || textLower.includes(targetLower)) return 0.8

  // Word-by-word match
  const textWords = textLower.split(/\s+/)
  const targetWords = targetLower.split(/\s+/)

  let matchedWords = 0
  textWords.forEach((word) => {
    if (targetWords.some((tw) => tw.includes(word) || word.includes(tw))) {
      matchedWords++
    }
  })

  if (matchedWords > 0) {
    return (matchedWords / Math.max(textWords.length, targetWords.length)) * 0.7
  }

  return 0
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { transcript, outletId, storeId } = await request.json()

    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json(
        { error: 'Transcript tidak valid' },
        { status: 400 }
      )
    }

    if (!storeId && !outletId) {
      return NextResponse.json(
        { error: 'Store ID atau Outlet ID diperlukan' },
        { status: 400 }
      )
    }

    // Fetch menu items
    let menuQuery = supabase
      .from('menu_items')
      .select('id, name, price, discount_price, is_available, category:categories(name)')
      .eq('is_available', true)

    if (storeId) {
      menuQuery = menuQuery.eq('store_id', storeId)
    }

    const { data: menuItems, error: menuError } = await menuQuery

    if (menuError || !menuItems || menuItems.length === 0) {
      return NextResponse.json(
        { error: 'Menu tidak ditemukan atau tidak tersedia' },
        { status: 404 }
      )
    }

    // Normalize transcript
    const normalizedTranscript = normalizeText(transcript)

    // Prepare menu list for AI
    const menuList = menuItems.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.discount_price || item.price,
      category: (item.category as any)?.name || 'Lainnya',
    }))

    // Use AI to parse the order
    const prompt = `Kamu adalah sistem pengenalan pesanan restoran Indonesia. Parse transkrip suara berikut menjadi item pesanan.

Menu yang tersedia:
${menuList.map((m) => `- "${m.name}" (Rp ${m.price.toLocaleString('id-ID')}) [ID: ${m.id}]`).join('\n')}

Transkrip pelanggan: "${normalizedTranscript}"
Transkrip asli: "${transcript}"

Parse transkrip dan cocokkan dengan menu yang tersedia. Perhatikan:
1. Angka bisa dalam bentuk kata (satu, dua, tiga) atau digit (1, 2, 3)
2. Nama menu mungkin tidak persis sama, gunakan fuzzy matching
3. Pelanggan mungkin menyingkat nama menu
4. Berikan confidence score untuk setiap item yang dikenali

Respons dalam format JSON:
{
  "items": [
    {
      "menuItemId": "uuid dari menu",
      "name": "nama menu yang cocok",
      "quantity": number,
      "price": number,
      "confidence": number (0.0-1.0),
      "originalText": "bagian transkrip yang merujuk ke item ini"
    }
  ],
  "unrecognized": ["bagian yang tidak bisa dikenali"],
  "total": number (total harga),
  "suggestions": [
    {
      "text": "kata yang ambigu",
      "options": [
        { "name": "nama menu 1", "id": "uuid", "price": number },
        { "name": "nama menu 2", "id": "uuid", "price": number }
      ]
    }
  ]
}

Jika tidak ada item yang bisa dikenali, kembalikan items sebagai array kosong.`

    let parseResult: VoiceParseResponse

    try {
      parseResult = await generateJSON<VoiceParseResponse>(prompt)
    } catch (aiError) {
      console.error('AI parsing error, using fallback:', aiError)

      // Fallback: simple word matching
      const words = normalizedTranscript.split(/\s+/)
      const parsedItems: ParsedItem[] = []
      const unrecognized: string[] = []

      let currentQuantity = 1
      const processedWords: string[] = []

      // Process each word
      for (const word of words) {
        // Check if it's a number word
        if (numberWords[word]) {
          currentQuantity = numberWords[word]
          continue
        }
        // Check if it's a digit
        if (/^\d+$/.test(word)) {
          currentQuantity = parseInt(word)
          continue
        }

        // Try to match with menu items using for loop
        let bestMatch: { id: string; name: string; price: number; category: string } | null = null
        let bestScore = 0

        for (const menuItem of menuList) {
          const score = fuzzyMatch(word, menuItem.name)
          if (score > 0.5 && score > bestScore) {
            bestMatch = {
              id: menuItem.id,
              name: menuItem.name,
              price: menuItem.price,
              category: menuItem.category
            }
            bestScore = score
          }
        }

        if (bestMatch) {
          parsedItems.push({
            menuItemId: bestMatch.id,
            name: bestMatch.name,
            quantity: currentQuantity,
            price: bestMatch.price,
            confidence: bestScore,
            originalText: word,
          })
          currentQuantity = 1 // Reset quantity
        } else {
          processedWords.push(word)
        }
      }

      // Try matching multi-word phrases
      if (processedWords.length > 0 && parsedItems.length === 0) {
        const phrase = processedWords.join(' ')
        for (const menuItem of menuList) {
          const score = fuzzyMatch(phrase, menuItem.name)
          if (score > 0.4) {
            parsedItems.push({
              menuItemId: menuItem.id,
              name: menuItem.name,
              quantity: 1,
              price: menuItem.price,
              confidence: score,
              originalText: phrase,
            })
          }
        }
      }

      if (parsedItems.length === 0) {
        unrecognized.push(normalizedTranscript)
      }

      parseResult = {
        items: parsedItems,
        unrecognized,
        total: parsedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        suggestions: [],
      }
    }

    // Calculate total if not provided
    if (!parseResult.total && parseResult.items.length > 0) {
      parseResult.total = parseResult.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      )
    }

    // Calculate overall confidence
    const overallConfidence =
      parseResult.items.length > 0
        ? parseResult.items.reduce((sum, item) => sum + item.confidence, 0) /
          parseResult.items.length
        : 0

    const processingTime = Date.now() - startTime

    // Log the voice order attempt
    try {
      await supabase.from('voice_orders_log').insert({
        store_id: storeId,
        outlet_id: outletId || null,
        raw_transcript: transcript,
        parsed_items: parseResult.items,
        unrecognized_parts: parseResult.unrecognized,
        confidence_score: overallConfidence,
        was_successful: parseResult.items.length > 0,
        processing_time_ms: processingTime,
      })
    } catch (logError) {
      console.error('Failed to log voice order:', logError)
    }

    return NextResponse.json({
      success: true,
      parsed: parseResult,
      confidence: overallConfidence,
      processingTimeMs: processingTime,
    })
  } catch (error: any) {
    console.error('Voice order parsing error:', error)
    return NextResponse.json(
      { error: error.message || 'Gagal memproses pesanan suara' },
      { status: 500 }
    )
  }
}
