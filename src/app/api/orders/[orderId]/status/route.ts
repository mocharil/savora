import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// GET order status for customer side
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: order, error } = await supabase
      .from('orders')
      .select('id, status, updated_at')
      .eq('id', orderId)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({
      orderId: order.id,
      status: order.status,
      updatedAt: order.updated_at
    })
  } catch (error: any) {
    console.error('Get order status error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch order status' },
      { status: 500 }
    )
  }
}
