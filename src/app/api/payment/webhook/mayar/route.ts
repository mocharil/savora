import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, data } = body

    console.log('[Mayar Webhook] event:', event)
    console.log('[Mayar Webhook] data.id:', data?.id)
    console.log('[Mayar Webhook] data.productId:', data?.productId)
    console.log('[Mayar Webhook] data.transactionId:', data?.transactionId)

    if (event === 'payment.received') {
      // data.productId = payment link ID yang kita simpan saat create payment
      // data.id = transaction ID dari pembayaran (berbeda dengan payment link ID)
      const paymentLinkId = data?.productId

      if (!paymentLinkId) {
        console.error('[Mayar Webhook] Missing productId in webhook data:', data)
        return NextResponse.json(
          { error: 'Missing payment link ID' },
          { status: 400 }
        )
      }

      console.log('[Mayar Webhook] Looking up payment with transaction_id:', paymentLinkId)

      // Find payment by transaction_id (yang isinya payment link ID dari Mayar)
      const { data: payment, error: findError } = await createAdminClient()
        .from('payments')
        .select('id, order_id')
        .eq('transaction_id', paymentLinkId)
        .single()

      if (findError || !payment) {
        console.error('[Mayar Webhook] Payment not found. findError:', findError, 'paymentLinkId:', paymentLinkId)
        return NextResponse.json(
          { error: 'Payment not found' },
          { status: 404 }
        )
      }

      // Update payment status to paid
      const { error: paymentError } = await createAdminClient()
        .from('payments')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          raw_response: body,
        })
        .eq('id', payment.id)

      if (paymentError) {
        console.error('Payment update error:', paymentError)
      }

      // Update order status to confirmed
      const { error: orderError } = await createAdminClient()
        .from('orders')
        .update({
          status: 'confirmed',
          payment_status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('id', payment.order_id)

      if (orderError) {
        console.error('Order update error:', orderError)
      }

      return NextResponse.json({ success: true })
    }

    if (event === 'payment.reminder') {
      console.log('Mayar payment reminder:', data?.id)
      return NextResponse.json({ success: true })
    }

    // Unknown event — acknowledge anyway
    console.log('Mayar webhook unhandled event:', event)
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Mayar webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
