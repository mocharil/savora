import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getUserFromToken } from '@/lib/tenant-context'

// GET single order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId } = await params
    const supabase = createAdminClient()

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        table:tables(table_number, location),
        order_items(
          id,
          quantity,
          unit_price,
          notes,
          menu_item:menu_items(name, description, image_url)
        )
      `)
      .eq('id', orderId)
      .eq('store_id', user.storeId)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error: any) {
    console.error('Get order error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

// PATCH update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId } = await params
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Verify order belongs to user's store and get table_id
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id, store_id, table_id')
      .eq('id', orderId)
      .eq('store_id', user.storeId)
      .single()

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Update order status
    const { data: order, error } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single()

    if (error) {
      console.error('Update order error:', error)
      return NextResponse.json(
        { error: 'Failed to update order status' },
        { status: 500 }
      )
    }

    // Note: Table status is NOT auto-released when order is completed
    // Staff must manually release the table after customer leaves
    // This is because customer may still be eating after order is served

    return NextResponse.json({
      success: true,
      order,
      message: `Status pesanan berhasil diubah menjadi ${status}`
    })
  } catch (error: any) {
    console.error('Update order error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update order' },
      { status: 500 }
    )
  }
}
