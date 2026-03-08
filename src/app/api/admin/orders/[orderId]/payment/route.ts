// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getUserFromToken } from '@/lib/tenant-context'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const user = await getUserFromToken()
    if (!user || !user.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId } = await params
    const { status } = await request.json()

    if (!status || !['paid', 'pending', 'failed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Verify order belongs to this store
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, store_id, total, payment_status')
      .eq('id', orderId)
      .eq('store_id', user.storeId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Update payment_status on orders table
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('Error updating payment status:', updateError)
      return NextResponse.json({ error: 'Failed to update payment status' }, { status: 500 })
    }

    // Also update or create payment record if exists
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('order_id', orderId)
      .single()

    if (existingPayment) {
      // Update existing payment
      await supabase
        .from('payments')
        .update({
          status: status,
          paid_at: status === 'paid' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('order_id', orderId)
    } else {
      // Create new payment record
      await supabase
        .from('payments')
        .insert({
          order_id: orderId,
          store_id: user.storeId,
          amount: order.total,
          payment_method: 'cash',
          status: status,
          paid_at: status === 'paid' ? new Date().toISOString() : null
        })
    }

    return NextResponse.json({
      success: true,
      message: status === 'paid' ? 'Payment marked as paid' : 'Payment status updated'
    })
  } catch (error: any) {
    console.error('Payment update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
