// @ts-nocheck
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getUserFromToken } from '@/lib/tenant-context'

export async function GET() {
  try {
    const user = await getUserFromToken()
    if (!user || !user.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Check categories
    const { count: categoryCount } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', user.storeId)

    // Check menu items
    const { count: menuCount } = await supabase
      .from('menu_items')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', user.storeId)

    // Check tables
    const { count: tableCount } = await supabase
      .from('tables')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', user.storeId)
      .eq('is_active', true)

    // Check users (other than current user)
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', user.storeId)
      .neq('id', user.userId)

    return NextResponse.json({
      hasCategories: (categoryCount || 0) > 0,
      hasMenu: (menuCount || 0) > 0,
      hasTables: (tableCount || 0) > 0,
      hasUsers: (userCount || 0) > 0,
    })
  } catch (error) {
    console.error('FTUE status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
