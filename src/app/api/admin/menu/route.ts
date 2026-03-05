// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getUserFromToken } from '@/lib/tenant-context'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken()
    if (!user || !user.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    const { data: menuItems, error } = await supabase
      .from('menu_items')
      .select(`
        *,
        category:categories(id, name)
      `)
      .eq('store_id', user.storeId)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching menu items:', error)
      return NextResponse.json({ error: 'Failed to fetch menu items' }, { status: 500 })
    }

    return NextResponse.json({ menuItems })
  } catch (error) {
    console.error('Menu GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken()
    if (!user || !user.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      category_id,
      description,
      price,
      discount_price,
      is_available,
      is_featured,
      image_url
    } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Menu name is required' }, { status: 400 })
    }

    if (!category_id) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 })
    }

    if (!price || price <= 0) {
      return NextResponse.json({ error: 'Price must be greater than 0' }, { status: 400 })
    }

    // Generate slug with timestamp for uniqueness
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    const timestamp = Date.now().toString(36)
    const slug = `${baseSlug}-${timestamp}`

    const supabase = createAdminClient()

    const { data: menuItem, error } = await supabase
      .from('menu_items')
      .insert({
        store_id: user.storeId,
        name: name.trim(),
        slug,
        category_id,
        description: description || null,
        price: Number(price),
        discount_price: discount_price ? Number(discount_price) : null,
        is_available: is_available ?? true,
        is_featured: is_featured ?? false,
        image_url: image_url || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating menu item:', error)
      return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 })
    }

    return NextResponse.json({ success: true, menuItem })
  } catch (error) {
    console.error('Menu POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
