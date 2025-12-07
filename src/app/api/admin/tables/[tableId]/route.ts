// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getUserFromToken } from '@/lib/tenant-context'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tableId: string }> }
) {
  try {
    const user = await getUserFromToken()
    if (!user || !user.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tableId } = await params
    const supabase = createAdminClient()

    const { data: table, error } = await supabase
      .from('tables')
      .select('*')
      .eq('id', tableId)
      .eq('store_id', user.storeId)
      .single()

    if (error || !table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 })
    }

    return NextResponse.json({ table })
  } catch (error) {
    console.error('Table GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ tableId: string }> }
) {
  try {
    const user = await getUserFromToken()
    if (!user || !user.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tableId } = await params
    const body = await request.json()
    const { table_number, location, capacity, is_active } = body

    if (!table_number?.trim()) {
      return NextResponse.json({ error: 'Table number is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Verify table belongs to user's store
    const { data: existing } = await supabase
      .from('tables')
      .select('id')
      .eq('id', tableId)
      .eq('store_id', user.storeId)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 })
    }

    const { data: table, error } = await supabase
      .from('tables')
      .update({
        table_number: table_number.trim(),
        location: location || null,
        capacity: capacity ?? 4,
        is_active: is_active ?? true,
      })
      .eq('id', tableId)
      .select()
      .single()

    if (error) {
      console.error('Error updating table:', error)
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Nomor meja sudah ada' }, { status: 400 })
      }
      return NextResponse.json({ error: 'Failed to update table' }, { status: 500 })
    }

    return NextResponse.json({ success: true, table })
  } catch (error) {
    console.error('Table PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tableId: string }> }
) {
  try {
    const user = await getUserFromToken()
    if (!user || !user.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tableId } = await params
    const supabase = createAdminClient()

    // Verify table belongs to user's store
    const { data: existing } = await supabase
      .from('tables')
      .select('id')
      .eq('id', tableId)
      .eq('store_id', user.storeId)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('tables')
      .delete()
      .eq('id', tableId)

    if (error) {
      console.error('Error deleting table:', error)
      return NextResponse.json({ error: 'Failed to delete table' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Table DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
