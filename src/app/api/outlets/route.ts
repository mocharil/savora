import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { jwtVerify } from 'jose'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
// JWT Secret - required environment variable
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  console.error('CRITICAL: JWT_SECRET environment variable is not set')
}
const jwtSecret = new TextEncoder().encode(JWT_SECRET || '')

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, jwtSecret)
    return payload as { userId: string; email: string; role: string; storeId: string }
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)

    if (!user?.storeId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('outlets')
      .select('*')
      .eq('store_id', user.storeId)
      .order('is_main', { ascending: false })
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ outlets: data })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)

    if (!user?.storeId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate store_id matches user's store
    if (body.store_id !== user.storeId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // If this is set as main outlet, unset other main outlets
    if (body.is_main) {
      await supabase
        .from('outlets')
        .update({ is_main: false })
        .eq('store_id', user.storeId)
    }

    const { data, error } = await supabase
      .from('outlets')
      .insert(body)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ outlet: data })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
