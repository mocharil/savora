// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getUserFromToken } from '@/lib/tenant-context'

// GET: Get all menu items with their outlet-specific settings
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken()
    if (!user || !user.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const outletId = searchParams.get('outlet_id')

    if (!outletId) {
      return NextResponse.json({ error: 'outlet_id is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Verify outlet belongs to user's store
    const { data: outlet } = await supabase
      .from('outlets')
      .select('id')
      .eq('id', outletId)
      .eq('store_id', user.storeId)
      .single()

    if (!outlet) {
      return NextResponse.json({ error: 'Outlet not found' }, { status: 404 })
    }

    // Get all menu items with their outlet-specific settings
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select(`
        id,
        name,
        price,
        image_url,
        is_available,
        category:categories(id, name)
      `)
      .eq('store_id', user.storeId)
      .order('name')

    if (menuError) {
      console.error('Error fetching menu items:', menuError)
      return NextResponse.json({ error: 'Failed to fetch menu items' }, { status: 500 })
    }

    // Get outlet-specific settings
    const { data: outletSettings, error: settingsError } = await supabase
      .from('outlet_menu_settings')
      .select('*')
      .eq('outlet_id', outletId)

    if (settingsError) {
      console.error('Error fetching outlet settings:', settingsError)
      return NextResponse.json({ error: 'Failed to fetch outlet settings' }, { status: 500 })
    }

    // Create a map of menu_item_id -> settings
    const settingsMap = new Map(
      (outletSettings || []).map(s => [s.menu_item_id, s])
    )

    // Combine menu items with their outlet settings
    const itemsWithSettings = (menuItems || []).map(item => {
      const settings = settingsMap.get(item.id)
      return {
        ...item,
        outlet_settings: settings ? {
          is_available: settings.is_available,
          price_override: settings.price_override,
        } : null,
        // Computed values for display
        effective_price: settings?.price_override ?? item.price,
        effective_available: settings?.is_available ?? item.is_available,
      }
    })

    return NextResponse.json({ items: itemsWithSettings })
  } catch (error) {
    console.error('Outlet menu settings GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Update outlet-specific settings for a menu item
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken()
    if (!user || !user.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { outlet_id, menu_item_id, is_available, price_override } = body

    if (!outlet_id || !menu_item_id) {
      return NextResponse.json({ error: 'outlet_id and menu_item_id are required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Verify outlet belongs to user's store
    const { data: outlet } = await supabase
      .from('outlets')
      .select('id')
      .eq('id', outlet_id)
      .eq('store_id', user.storeId)
      .single()

    if (!outlet) {
      return NextResponse.json({ error: 'Outlet not found' }, { status: 404 })
    }

    // Verify menu item belongs to user's store
    const { data: menuItem } = await supabase
      .from('menu_items')
      .select('id')
      .eq('id', menu_item_id)
      .eq('store_id', user.storeId)
      .single()

    if (!menuItem) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 })
    }

    // Upsert the outlet menu settings
    const { data: settings, error } = await supabase
      .from('outlet_menu_settings')
      .upsert({
        outlet_id,
        menu_item_id,
        is_available: is_available ?? true,
        price_override: price_override || null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'outlet_id,menu_item_id',
      })
      .select()
      .single()

    if (error) {
      console.error('Error updating outlet menu settings:', error)
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
    }

    return NextResponse.json({ success: true, settings })
  } catch (error) {
    console.error('Outlet menu settings POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE: Remove outlet-specific settings (revert to default)
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromToken()
    if (!user || !user.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const outletId = searchParams.get('outlet_id')
    const menuItemId = searchParams.get('menu_item_id')

    if (!outletId || !menuItemId) {
      return NextResponse.json({ error: 'outlet_id and menu_item_id are required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Verify outlet belongs to user's store
    const { data: outlet } = await supabase
      .from('outlets')
      .select('id')
      .eq('id', outletId)
      .eq('store_id', user.storeId)
      .single()

    if (!outlet) {
      return NextResponse.json({ error: 'Outlet not found' }, { status: 404 })
    }

    // Delete the outlet-specific settings
    const { error } = await supabase
      .from('outlet_menu_settings')
      .delete()
      .eq('outlet_id', outletId)
      .eq('menu_item_id', menuItemId)

    if (error) {
      console.error('Error deleting outlet menu settings:', error)
      return NextResponse.json({ error: 'Failed to delete settings' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Outlet menu settings DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
