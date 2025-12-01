import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { jwtVerify } from 'jose'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const jwtSecret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-min-32-chars!'
)

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ outletId: string }> }
) {
  try {
    const { outletId } = await params
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
      .eq('id', outletId)
      .eq('store_id', user.storeId)
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      )
    }

    // Get store slug for preview URL
    const { data: store } = await supabase
      .from('stores')
      .select('slug')
      .eq('id', user.storeId)
      .single()

    return NextResponse.json({
      outlet: data,
      storeSlug: store?.slug || ''
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ outletId: string }> }
) {
  try {
    const { outletId } = await params
    const user = await getUserFromToken(request)

    if (!user?.storeId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Verify outlet belongs to user's store
    const { data: existing } = await supabase
      .from('outlets')
      .select('id')
      .eq('id', outletId)
      .eq('store_id', user.storeId)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Outlet tidak ditemukan' },
        { status: 404 }
      )
    }

    // If this is set as main outlet, unset other main outlets
    if (body.is_main) {
      await supabase
        .from('outlets')
        .update({ is_main: false })
        .eq('store_id', user.storeId)
        .neq('id', outletId)
    }

    // Remove store_id from body to prevent changing it
    delete body.store_id

    const { data, error } = await supabase
      .from('outlets')
      .update(body)
      .eq('id', outletId)
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ outletId: string }> }
) {
  try {
    const { outletId } = await params
    const user = await getUserFromToken(request)

    if (!user?.storeId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify outlet belongs to user's store and is not main
    const { data: existing } = await supabase
      .from('outlets')
      .select('id, is_main')
      .eq('id', outletId)
      .eq('store_id', user.storeId)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Outlet tidak ditemukan' },
        { status: 404 }
      )
    }

    if (existing.is_main) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus outlet pusat' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('outlets')
      .delete()
      .eq('id', outletId)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
