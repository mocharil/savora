// @ts-nocheck
import { createAdminClient } from '@/lib/supabase/server'
import { getUserFromToken } from '@/lib/tenant-context'
import { redirect } from 'next/navigation'
import { OrdersPageClient } from './OrdersPageClient'

export default async function OrdersPage() {
  const supabase = createAdminClient()

  // Get user from token
  const user = await getUserFromToken()
  if (!user || !user.storeId) {
    redirect('/login')
  }

  const storeId = user.storeId

  // Get counts for each status
  const statusCounts: Record<string, number> = {}
  for (const status of ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']) {
    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', storeId)
      .eq('status', status)
    statusCounts[status] = count || 0
  }

  // Fetch all orders
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      status,
      total,
      payment_status,
      created_at,
      customer_name,
      table:tables(table_number, location),
      order_items(
        id,
        quantity,
        unit_price,
        menu_item:menu_items(name)
      )
    `)
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })

  return (
    <OrdersPageClient
      orders={orders || []}
      statusCounts={statusCounts}
    />
  )
}
