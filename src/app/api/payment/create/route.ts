// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createTransaction } from '@/lib/midtrans/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(
          id,
          quantity,
          price,
          menu_item:menu_items(name)
        )
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Prepare item details for Midtrans
    const itemDetails = order.order_items.map((item: any) => ({
      id: item.id,
      name: item.menu_item.name,
      price: item.price,
      quantity: item.quantity,
    }))

    // Create Midtrans transaction
    const midtransResponse = await createTransaction({
      transaction_id: order.id,
      order_id: order.order_number,
      gross_amount: order.total_amount,
      customer_details: {
        first_name: 'Customer',
        email: 'customer@example.com',
      },
      item_details: itemDetails,
    })

    // Update payment with transaction token
    const { error: paymentError } = await supabase
      .from('payments')
      .update({
        payment_method: 'midtrans',
        transaction_token: midtransResponse.token,
      })
      .eq('order_id', orderId)

    if (paymentError) {
      console.error('Payment update error:', paymentError)
    }

    return NextResponse.json({
      token: midtransResponse.token,
      redirect_url: midtransResponse.redirect_url,
    })
  } catch (error: any) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment' },
      { status: 500 }
    )
  }
}
