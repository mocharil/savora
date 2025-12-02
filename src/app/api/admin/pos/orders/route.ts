import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getUserFromToken } from '@/lib/tenant-context'

// Generate order number
function generateOrderNumber(): string {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `POS${dateStr}${random}`
}

export async function POST(request: NextRequest) {
  try {
    // Get user from token
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      storeId,
      tableId,
      isTakeAway,
      customerName,
      paymentMethod,
      items,
      subtotal,
      tax,
      total
    } = body

    // Validate required fields - tableId is optional for take away
    if (!storeId || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Either tableId or isTakeAway must be set
    if (!tableId && !isTakeAway) {
      return NextResponse.json(
        { error: 'Either table or take away must be selected' },
        { status: 400 }
      )
    }

    // Verify store access
    if (storeId !== user.storeId) {
      return NextResponse.json(
        { error: 'Access denied to this store' },
        { status: 403 }
      )
    }

    const supabase = createAdminClient()
    const orderNumber = generateOrderNumber()

    // Create order (matches actual schema)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        store_id: storeId,
        table_id: tableId || null, // null for take away
        order_number: orderNumber,
        customer_name: customerName || (isTakeAway ? 'Take Away' : 'Walk-in Customer'),
        status: 'pending',
        payment_status: 'unpaid',
        subtotal: subtotal,
        tax_amount: tax,
        total: total,
        notes: isTakeAway ? 'Take Away - POS Order' : 'POS Order'
      })
      .select('id, order_number')
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      )
    }

    // Get menu items prices
    const menuItemIds = items.map((item: any) => item.menuItemId)
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('id, name, price')
      .in('id', menuItemIds)

    if (menuError) {
      console.error('Error fetching menu items:', menuError)
      // Rollback - delete the created order
      await supabase.from('orders').delete().eq('id', order.id)
      return NextResponse.json(
        { error: 'Failed to fetch menu items' },
        { status: 500 }
      )
    }

    // Create a map for quick lookup
    const menuItemMap = new Map(menuItems?.map(m => [m.id, m]) || [])

    // Prepare order items
    const orderItems = items.map((item: any) => {
      const menuItem = menuItemMap.get(item.menuItemId)
      return {
        order_id: order.id,
        menu_item_id: item.menuItemId,
        quantity: item.quantity,
        unit_price: menuItem?.price || 0,
        subtotal: (menuItem?.price || 0) * item.quantity,
        notes: item.notes || null
      }
    })

    // Insert order items
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Error creating order items:', itemsError)
      // Rollback - delete the created order
      await supabase.from('orders').delete().eq('id', order.id)
      return NextResponse.json(
        { error: 'Failed to create order items' },
        { status: 500 }
      )
    }

    // Create payment record if payment method is provided
    if (paymentMethod) {
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          order_id: order.id,
          payment_method: paymentMethod,
          amount: total,
          status: 'pending'
        })

      if (paymentError) {
        console.error('Error creating payment:', paymentError)
        // Non-critical, don't rollback
      }
    }

    // Update table status to occupied (only if dine-in, not take away)
    if (tableId && !isTakeAway) {
      await supabase
        .from('tables')
        .update({ status: 'occupied' })
        .eq('id', tableId)
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number
    })

  } catch (error: any) {
    console.error('POS order API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
