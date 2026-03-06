// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getUserFromToken } from '@/lib/tenant-context'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken()
    if (!user || !user.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    const { data: tables, error } = await supabase
      .from('tables')
      .select('*')
      .eq('store_id', user.storeId)
      .order('table_number', { ascending: true })

    if (error) {
      console.error('Error fetching tables:', error)
      return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 })
    }

    return NextResponse.json({ tables })
  } catch (error) {
    console.error('Tables GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken()
    if (!user || !user.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { table_number, location, capacity, is_active, qr_code } = body

    if (!table_number?.trim()) {
      return NextResponse.json({ error: 'Table number is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Generate QR code if not provided
    const finalQrCode = qr_code || `TABLE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    const { data: table, error } = await supabase
      .from('tables')
      .insert({
        store_id: user.storeId,
        table_number: table_number.trim(),
        location: location || null,
        capacity: capacity ?? 4,
        is_active: is_active ?? true,
        qr_code: finalQrCode,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating table:', error)
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Nomor meja sudah ada' }, { status: 400 })
      }
      return NextResponse.json({ error: 'Failed to create table' }, { status: 500 })
    }

    return NextResponse.json({ success: true, table })
  } catch (error) {
    console.error('Tables POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
