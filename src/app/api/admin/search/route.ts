import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUserFromToken } from '@/lib/tenant-context'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY &&
  process.env.SUPABASE_SERVICE_ROLE_KEY !== 'your_service_role_key'
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken()
    if (!user || !user.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.toLowerCase() || ''

    if (!query || query.length < 2) {
      return NextResponse.json({
        menu: [],
        orders: [],
        categories: [],
        tables: [],
      })
    }

    // Search menu items
    const { data: menuItems } = await supabase
      .from('menu_items')
      .select('id, name, price, image_url, is_available, categories(name)')
      .eq('store_id', user.storeId)
      .ilike('name', `%${query}%`)
      .limit(5)

    // Search orders by order number or customer name
    const { data: orders } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, status, total, created_at')
      .eq('store_id', user.storeId)
      .or(`order_number.ilike.%${query}%,customer_name.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(5)

    // Search categories
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name, description')
      .eq('store_id', user.storeId)
      .ilike('name', `%${query}%`)
      .limit(5)

    // Search tables
    const { data: tables } = await supabase
      .from('tables')
      .select('id, table_number, status, capacity')
      .eq('store_id', user.storeId)
      .or(`table_number.ilike.%${query}%`)
      .limit(5)

    return NextResponse.json({
      menu: menuItems?.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        image_url: item.image_url,
        is_available: item.is_available,
        category: (item.categories as any)?.name || 'Uncategorized',
        type: 'menu',
      })) || [],
      orders: orders?.map(order => ({
        id: order.id,
        order_number: order.order_number,
        customer_name: order.customer_name,
        status: order.status,
        total: order.total,
        created_at: order.created_at,
        type: 'order',
      })) || [],
      categories: categories?.map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        type: 'category',
      })) || [],
      tables: tables?.map(table => ({
        id: table.id,
        table_number: table.table_number,
        status: table.status,
        capacity: table.capacity,
        type: 'table',
      })) || [],
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
