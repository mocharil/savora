// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getUserFromToken } from '@/lib/tenant-context'

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { menu } = body

    const supabase = createAdminClient()

    // Save menu items if provided
    if (menu && Array.isArray(menu) && menu.length > 0) {
      // Get or create categories
      const categoryMap = new Map<string, string>() // category name -> category id

      // Get unique category names from menu items
      const uniqueCategories = [...new Set(menu.map(item => item.category))]

      for (const categoryName of uniqueCategories) {
        // Check if category exists
        const { data: existingCategory } = await supabase
          .from('categories')
          .select('id')
          .eq('store_id', user.storeId)
          .eq('name', categoryName)
          .single()

        if (existingCategory) {
          categoryMap.set(categoryName, existingCategory.id)
        } else {
          // Create category
          const slug = categoryName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')

          const { data: newCategory, error: catError } = await supabase
            .from('categories')
            .insert({
              store_id: user.storeId,
              name: categoryName,
              slug: `${slug}-${Date.now().toString(36)}`,
              is_active: true,
              sort_order: categoryMap.size,
            })
            .select('id')
            .single()

          if (newCategory) {
            categoryMap.set(categoryName, newCategory.id)
          } else {
            console.error('Error creating category:', catError)
          }
        }
      }

      // Create menu items
      for (const item of menu) {
        const categoryId = categoryMap.get(item.category)
        if (!categoryId) continue

        const itemSlug = item.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')

        const { error: menuError } = await supabase
          .from('menu_items')
          .insert({
            store_id: user.storeId,
            category_id: categoryId,
            name: item.name,
            slug: `${itemSlug}-${Date.now().toString(36)}`,
            price: item.price,
            is_available: true,
            is_featured: false,
          })

        if (menuError) {
          console.error('Error creating menu item:', menuError)
        }
      }
    }

    // Get current settings
    const { data: storeData } = await supabase
      .from('stores')
      .select('settings')
      .eq('id', user.storeId)
      .single()

    const currentSettings = storeData?.settings || {}

    // Mark onboarding as complete
    const { error } = await supabase
      .from('stores')
      .update({
        settings: {
          ...currentSettings as object,
          onboardingCompleted: true,
          onboardingStep: 5,
        },
      })
      .eq('id', user.storeId)

    if (error) {
      console.error('Error completing onboarding:', error)
      return NextResponse.json({ error: 'Failed to complete onboarding' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Onboarding complete error:', error)
    return NextResponse.json({ error: 'Failed to complete onboarding' }, { status: 500 })
  }
}
