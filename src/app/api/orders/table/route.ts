// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// GET orders by table QR code
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const qrCode = searchParams.get('qr')
    const storeSlug = searchParams.get('store')

    if (!qrCode || !storeSlug) {
      return NextResponse.json(
        { error: 'QR code and store slug are required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Get store by slug
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('slug', storeSlug)
      .single()

    if (storeError || !store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      )
    }

    // Get table by QR code
    const { data: table, error: tableError } = await supabase
      .from('tables')
      .select('id, table_number')
      .eq('qr_code', qrCode)
      .eq('store_id', store.id)
      .single()

    if (tableError || !table) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      )
    }

    // Fetch active orders for this table (not completed or cancelled)
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        total,
        created_at,
        customer_name
      `)
      .eq('table_id', table.id)
      .eq('store_id', store.id)
      .not('status', 'in', '("completed","cancelled")')
      .order('created_at', { ascending: false })

    if (ordersError) {
      console.error('Error fetching table orders:', ordersError)
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      )
    }

    // Transform data
    const transformedOrders = orders?.map(order => ({
      id: order.id,
      order_number: order.order_number,
      status: order.status,
      total: order.total,
      created_at: order.created_at,
      customer_name: order.customer_name,
      table_number: table.table_number
    })) || []

    return NextResponse.json({
      orders: transformedOrders,
      table: {
        id: table.id,
        table_number: table.table_number
      }
    })
  } catch (error: any) {
    console.error('Table orders API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
