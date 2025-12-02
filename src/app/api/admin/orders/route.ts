import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getUserFromToken } from '@/lib/tenant-context'

export async function GET(request: NextRequest) {
  try {
    // Get user from token
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')

    const supabase = createAdminClient()

    // Build query
    let query = supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        total,
        notes,
        created_at,
        tables (
          table_number,
          table_name
        )
      `)
      .eq('store_id', user.storeId)
      .order('created_at', { ascending: false })
      .limit(limit)

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status)
    }

    const { data: orders, error } = await query

    if (error) {
      console.error('Error fetching orders:', error)
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      )
    }

    // Transform data for response
    const transformedOrders = orders?.map(order => ({
      id: order.id,
      order_number: order.order_number,
      status: order.status,
      total: order.total,
      notes: order.notes,
      created_at: order.created_at,
      table_number: order.tables?.table_number || null,
      table_name: order.tables?.table_name || null,
      is_read: false, // TODO: Implement read status tracking
    })) || []

    return NextResponse.json({ orders: transformedOrders })
  } catch (error: any) {
    console.error('Admin orders API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
