// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getUserFromToken } from '@/lib/tenant-context'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string }> }
) {
  try {
    const user = await getUserFromToken()
    if (!user || !user.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { menuId } = await params
    const supabase = createAdminClient()

    const { data: menuItem, error } = await supabase
      .from('menu_items')
      .select(`
        *,
        category:categories(id, name)
      `)
      .eq('id', menuId)
      .eq('store_id', user.storeId)
      .single()

    if (error || !menuItem) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 })
    }

    return NextResponse.json({ menuItem })
  } catch (error) {
    console.error('Menu GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string }> }
) {
  try {
    const user = await getUserFromToken()
    if (!user || !user.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { menuId } = await params
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

    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const supabase = createAdminClient()

    // Verify menu item belongs to user's store
    const { data: existing } = await supabase
      .from('menu_items')
      .select('id')
      .eq('id', menuId)
      .eq('store_id', user.storeId)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 })
    }

    const { data: menuItem, error } = await supabase
      .from('menu_items')
      .update({
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
      .eq('id', menuId)
      .select()
      .single()

    if (error) {
      console.error('Error updating menu item:', error)
      return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 })
    }

    return NextResponse.json({ success: true, menuItem })
  } catch (error) {
    console.error('Menu PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Quick toggle for availability only
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string }> }
) {
  try {
    const user = await getUserFromToken()
    if (!user || !user.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { menuId } = await params
    const body = await request.json()
    const { is_available } = body

    if (typeof is_available !== 'boolean') {
      return NextResponse.json({ error: 'is_available must be a boolean' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Verify menu item belongs to user's store
    const { data: existing } = await supabase
      .from('menu_items')
      .select('id, name')
      .eq('id', menuId)
      .eq('store_id', user.storeId)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('menu_items')
      .update({ is_available })
      .eq('id', menuId)

    if (error) {
      console.error('Error updating menu availability:', error)
      return NextResponse.json({ error: 'Failed to update menu availability' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `${existing.name} ${is_available ? 'sekarang tersedia' : 'tidak tersedia'}`
    })
  } catch (error) {
    console.error('Menu PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string }> }
) {
  try {
    const user = await getUserFromToken()
    if (!user || !user.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { menuId } = await params
    const supabase = createAdminClient()

    // Verify menu item belongs to user's store
    const { data: existing } = await supabase
      .from('menu_items')
      .select('id')
      .eq('id', menuId)
      .eq('store_id', user.storeId)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', menuId)

    if (error) {
      console.error('Error deleting menu item:', error)
      return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Menu DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
