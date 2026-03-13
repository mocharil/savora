import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createSinglePayment } from '@/lib/mayar/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, gateway } = body

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(
          id,
          quantity,
          unit_price,
          menu_item:menu_items(name)
        )
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      console.error('Order fetch error:', orderError)
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Get store slug separately
    const { data: store } = await supabase
      .from('stores')
      .select('slug')
      .eq('id', order.store_id)
      .single()

    const storeSlug = store?.slug || ''

    // --- Mayar gateway ---
    if (gateway === 'mayar') {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const redirectUrl = `${appUrl}/${storeSlug}/order/confirmation/${orderId}`

      const mayarResponse = await createSinglePayment({
        name: `Order #${order.order_number}`,
        amount: order.total,
        redirectUrl,
        description: `Pembayaran untuk order ${order.order_number}`,
      })

      console.log('[Mayar] createSinglePayment response:', JSON.stringify(mayarResponse))
      console.log('[Mayar] Saving transaction_id:', mayarResponse.data.id)

      // Update payment record with Mayar transaction info
      const { error: paymentError } = await supabase
        .from('payments')
        .update({
          transaction_id: mayarResponse.data.id,
          payment_url: mayarResponse.data.link,
        })
        .eq('order_id', orderId)

      if (paymentError) {
        console.error('[Mayar] Payment update error:', paymentError)
      } else {
        console.log('[Mayar] transaction_id saved successfully to DB')
      }

      return NextResponse.json({
        gateway: 'mayar',
        payment_url: mayarResponse.data.link,
      })
    }

    return NextResponse.json(
      { error: 'Unsupported payment gateway' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment' },
      { status: 500 }
    )
  }
}
