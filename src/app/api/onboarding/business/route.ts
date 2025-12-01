// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserFromToken } from '@/lib/tenant-context'

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Onboarding business - User:', { userId: user.userId, storeId: user.storeId })

    if (!user.storeId) {
      return NextResponse.json({ error: 'User has no store assigned' }, { status: 400 })
    }

    const body = await request.json()
    const { businessName, businessType, description, currency, timezone } = body

    if (!businessName) {
      return NextResponse.json({ error: 'Business name is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // First check if store exists
    const { data: existingStore, error: checkError } = await supabase
      .from('stores')
      .select('id, name')
      .eq('id', user.storeId)
      .single()

    console.log('Existing store check:', { existingStore, checkError })

    if (checkError || !existingStore) {
      console.error('Store not found for user:', user.storeId)
      return NextResponse.json({ error: 'Store not found. Please re-register.' }, { status: 404 })
    }

    // Generate slug from business name
    let slug = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if slug exists (for other stores)
    const { data: slugExists } = await supabase
      .from('stores')
      .select('id')
      .eq('slug', slug)
      .neq('id', user.storeId)
      .maybeSingle()

    if (slugExists) {
      slug = `${slug}-${Date.now().toString(36)}`
    }

    // Update store (created during registration)
    const { error: updateError } = await supabase
      .from('stores')
      .update({
        name: businessName,
        slug,
        description: description || null,
        settings: {
          businessType: businessType || 'restaurant',
          currency: currency || 'IDR',
          timezone: timezone || 'Asia/Jakarta',
          language: 'id',
          onboardingCompleted: false,
          onboardingStep: 1,
        },
      })
      .eq('id', user.storeId)

    if (updateError) {
      console.error('Error updating store:', updateError)
      return NextResponse.json({ error: 'Failed to save business info' }, { status: 500 })
    }

    console.log('Store updated successfully:', user.storeId)

    return NextResponse.json({
      success: true,
      storeId: user.storeId,
      slug: slug,
    })
  } catch (error) {
    console.error('Onboarding business error:', error)
    return NextResponse.json({ error: 'Failed to save business info' }, { status: 500 })
  }
}
