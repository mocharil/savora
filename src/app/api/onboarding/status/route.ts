// @ts-nocheck
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserFromToken } from '@/lib/tenant-context'

export async function GET() {
  try {
    const user = await getUserFromToken()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Get store settings
    const { data: store, error } = await supabase
      .from('stores')
      .select('settings')
      .eq('id', user.storeId)
      .single()

    if (error || !store) {
      return NextResponse.json({
        onboardingCompleted: false,
        onboardingStep: 0,
      })
    }

    const settings = store.settings as Record<string, unknown> || {}

    return NextResponse.json({
      onboardingCompleted: settings.onboardingCompleted || false,
      onboardingStep: settings.onboardingStep || 0,
    })
  } catch (error) {
    console.error('Error checking onboarding status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
