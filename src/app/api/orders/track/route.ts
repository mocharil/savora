// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { orderIds } = await request.json()

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ orders: [] })
    }

    const supabase = createAdminClient()

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        total,
        created_at,
        table:tables(table_number)
      `)
      .in('id', orderIds)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tracked orders:', error)
      return NextResponse.json({ orders: [] })
    }

    // Transform data
    const transformedOrders = orders?.map(order => ({
      id: order.id,
      order_number: order.order_number,
      status: order.status,
      total: order.total,
      created_at: order.created_at,
      table_number: order.table?.table_number || null
    })) || []

    return NextResponse.json({ orders: transformedOrders })
  } catch (error: any) {
    console.error('Track orders API error:', error)
    return NextResponse.json({ orders: [] })
  }
}
