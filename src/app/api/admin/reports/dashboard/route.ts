import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getUserFromToken } from '@/lib/tenant-context'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user || !user.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const storeId = user.storeId
    const supabase = createAdminClient()

    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Fetch today's orders
    const { data: todayOrders } = await supabase
      .from('orders')
      .select(`
        *,
        table:tables(table_number)
      `)
      .eq('store_id', storeId)
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString())
      .order('created_at', { ascending: false })

    // Calculate stats
    const todayRevenue = todayOrders
      ?.filter(o => o.payment_status === 'paid')
      .reduce((sum, o) => sum + (o.total || 0), 0) || 0

    const todayOrderCount = todayOrders?.length || 0
    const pendingOrders = todayOrders?.filter(o => o.status === 'pending').length || 0
    const preparingOrders = todayOrders?.filter(o => ['confirmed', 'preparing'].includes(o.status)).length || 0
    const readyOrders = todayOrders?.filter(o => o.status === 'ready').length || 0
    const completedOrders = todayOrders?.filter(o => o.status === 'completed').length || 0
    const paidOrders = todayOrders?.filter(o => o.payment_status === 'paid').length || 0
    const unpaidOrders = todayOrders?.filter(o => o.payment_status === 'unpaid').length || 0

    // Get recent orders with table info
    const recentOrders = todayOrders?.slice(0, 20).map(order => ({
      order_number: order.order_number,
      status: order.status,
      table_number: order.table?.table_number || null,
      total: order.total,
      payment_status: order.payment_status,
      created_at: order.created_at
    })) || []

    return NextResponse.json({
      todayRevenue,
      todayOrderCount,
      pendingOrders,
      preparingOrders,
      readyOrders,
      completedOrders,
      paidOrders,
      unpaidOrders,
      recentOrders
    })
  } catch (error: any) {
    console.error('Dashboard report error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
