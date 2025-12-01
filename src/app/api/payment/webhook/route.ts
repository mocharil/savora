// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Verify notification signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY || ''
    const signatureKey = crypto
      .createHash('sha512')
      .update(`${body.order_id}${body.status_code}${body.gross_amount}${serverKey}`)
      .digest('hex')

    if (signatureKey !== body.signature_key) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const supabase = supabaseAdmin

    // Find order by order_number
    const { data: order } = await supabase
      .from('orders')
      .select('id')
      .eq('order_number', body.order_id)
      .single()

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Map Midtrans transaction status to payment status
    let paymentStatus: 'pending' | 'paid' | 'failed' = 'pending'
    let orderStatus: string | null = null

    switch (body.transaction_status) {
      case 'capture':
      case 'settlement':
        paymentStatus = 'paid'
        orderStatus = 'confirmed'
        break
      case 'pending':
        paymentStatus = 'pending'
        break
      case 'deny':
      case 'expire':
      case 'cancel':
        paymentStatus = 'failed'
        orderStatus = 'cancelled'
        break
    }

    // Update payment
    const { error: paymentError } = await supabase
      .from('payments')
      .update({
        payment_status: paymentStatus,
        paid_at: paymentStatus === 'paid' ? new Date().toISOString() : null,
      })
      .eq('order_id', order.id)

    if (paymentError) {
      console.error('Payment update error:', paymentError)
    }

    // Update order status if needed
    if (orderStatus) {
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: orderStatus })
        .eq('id', order.id)

      if (orderError) {
        console.error('Order update error:', orderError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
