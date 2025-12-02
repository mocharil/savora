import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getUserFromToken } from '@/lib/tenant-context'

// POST - Release/clear table (set to available)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tableId: string }> }
) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tableId } = await params
    const supabase = createAdminClient()

    // Verify table belongs to user's store
    const { data: table, error: tableError } = await supabase
      .from('tables')
      .select('id, table_number, status, store_id')
      .eq('id', tableId)
      .eq('store_id', user.storeId)
      .single()

    if (tableError || !table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 })
    }

    // Check if there are any unpaid orders for this table
    const { data: unpaidOrders, error: unpaidError } = await supabase
      .from('orders')
      .select('id, order_number, payment_status')
      .eq('table_id', tableId)
      .eq('payment_status', 'unpaid')
      .not('status', 'eq', 'cancelled')

    if (!unpaidError && unpaidOrders && unpaidOrders.length > 0) {
      return NextResponse.json({
        error: 'Tidak dapat mengosongkan meja',
        message: `Masih ada ${unpaidOrders.length} pesanan yang belum dibayar`,
        unpaidOrders: unpaidOrders.map(o => o.order_number)
      }, { status: 400 })
    }

    // Update table status to available
    const { error: updateError } = await supabase
      .from('tables')
      .update({
        status: 'available',
        updated_at: new Date().toISOString()
      })
      .eq('id', tableId)

    if (updateError) {
      console.error('Error releasing table:', updateError)
      return NextResponse.json(
        { error: 'Failed to release table' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Meja ${table.table_number} berhasil dikosongkan`
    })

  } catch (error: any) {
    console.error('Release table error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
