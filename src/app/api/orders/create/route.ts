import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { generateOrderNumber } from '@/lib/utils'

interface CartItem {
  id: string
  menuItemId: string
  name: string
  price: number
  quantity: number
  notes?: string
  image_url?: string
}

interface CheckoutRequest {
  storeId: string
  tableId?: string | null
  items: CartItem[]
  customerNotes?: string
  paymentMethod: 'cash' | 'midtrans'
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json()
    const { storeId, tableId, items, customerNotes, paymentMethod } = body

    // Validate required fields
    if (!storeId || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Store ID dan items diperlukan' },
        { status: 400 }
      )
    }

    // Validate that all items have menuItemId
    const invalidItems = items.filter(item => !item.menuItemId)
    if (invalidItems.length > 0) {
      console.error('Items missing menuItemId:', invalidItems)
      return NextResponse.json(
        { error: 'Beberapa item tidak valid. Silakan hapus keranjang dan coba lagi.' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const total = subtotal // Add tax/service charge if needed

    // Generate order number
    const orderNumber = generateOrderNumber()

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        store_id: storeId,
        table_id: tableId || null,
        order_number: orderNumber,
        subtotal,
        total,
        status: 'pending',
        notes: customerNotes || null,
      })
      .select()
      .single()

    if (orderError) {
      console.error('Order creation error:', orderError)
      return NextResponse.json(
        { error: 'Gagal membuat pesanan: ' + orderError.message },
        { status: 500 }
      )
    }

    // Create order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      menu_item_id: item.menuItemId,
      quantity: item.quantity,
      unit_price: item.price,
      subtotal: item.price * item.quantity,
      notes: item.notes || null,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Order items error:', itemsError)
      // Rollback order if items fail
      await supabase.from('orders').delete().eq('id', order.id)
      return NextResponse.json(
        { error: 'Gagal menambahkan item pesanan: ' + itemsError.message },
        { status: 500 }
      )
    }

    // Create payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id: order.id,
        amount: total,
        payment_method: paymentMethod,
        status: 'pending',
      })

    if (paymentError) {
      console.error('Payment error:', paymentError)
      // Don't rollback, payment can be created later
    }

    // Update table status to occupied if tableId is provided
    if (tableId) {
      const { error: tableError } = await supabase
        .from('tables')
        .update({ status: 'occupied' })
        .eq('id', tableId)

      if (tableError) {
        console.error('Table status update error:', tableError)
        // Non-critical, don't rollback
      }
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
    })
  } catch (error: any) {
    console.error('Checkout API error:', error)
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat memproses pesanan' },
      { status: 500 }
    )
  }
}
