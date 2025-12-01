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

    const body = await request.json()
    const {
      primaryColor,
      secondaryColor,
      backgroundColor,
      textColor,
      fontFamily,
      logoUrl,
      bannerUrl,
      outletId,
    } = body

    const supabase = await createClient()

    // If outletId is provided, update specific outlet
    // Otherwise, update the main outlet
    let targetOutletId = outletId

    if (!targetOutletId) {
      const { data: mainOutlet } = await supabase
        .from('outlets')
        .select('id')
        .eq('store_id', user.storeId)
        .eq('is_main', true)
        .single()

      targetOutletId = mainOutlet?.id
    }

    if (!targetOutletId) {
      return NextResponse.json({ error: 'No outlet found' }, { status: 404 })
    }

    // Verify outlet belongs to user's store
    const { data: outlet } = await supabase
      .from('outlets')
      .select('id, store_id')
      .eq('id', targetOutletId)
      .single()

    if (!outlet || outlet.store_id !== user.storeId) {
      return NextResponse.json({ error: 'Outlet not found' }, { status: 404 })
    }

    // Update outlet theme
    const { error } = await supabase
      .from('outlets')
      .update({
        theme: {
          primaryColor: primaryColor || '#10b981',
          secondaryColor: secondaryColor || '#059669',
          backgroundColor: backgroundColor || '#ffffff',
          textColor: textColor || '#1f2937',
          fontFamily: fontFamily || 'Inter',
          logoUrl: logoUrl || null,
          bannerUrl: bannerUrl || null,
          customCss: null,
        },
      })
      .eq('id', targetOutletId)

    if (error) {
      console.error('Error updating outlet theme:', error)
      return NextResponse.json({ error: 'Failed to save theme' }, { status: 500 })
    }

    // Update store onboarding step
    const { data: storeData } = await supabase
      .from('stores')
      .select('settings')
      .eq('id', user.storeId)
      .single()

    const currentSettings = storeData?.settings || {}
    await supabase
      .from('stores')
      .update({
        settings: { ...currentSettings as object, onboardingStep: 4 },
      })
      .eq('id', user.storeId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Onboarding theme error:', error)
    return NextResponse.json({ error: 'Failed to save theme' }, { status: 500 })
  }
}
