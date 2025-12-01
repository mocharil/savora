// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserFromToken } from '@/lib/tenant-context'

// Generate outlet code from name
function generateOutletCode(name: string): string {
  const words = name.toUpperCase().split(/\s+/)
  let code = ''

  if (words.length >= 2) {
    // Take first letter of first two words + random number
    code = words[0][0] + words[1][0] + Math.floor(Math.random() * 100).toString().padStart(2, '0')
  } else {
    // Take first 3 letters + random number
    code = name.toUpperCase().substring(0, 3) + Math.floor(Math.random() * 100).toString().padStart(2, '0')
  }

  return code.substring(0, 6)
}

// Clean phone number (remove dashes, spaces, keep only digits and +)
function cleanPhoneNumber(phone: string): string {
  if (!phone) return ''
  return phone.replace(/[^\d+]/g, '')
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      outletName,
      outletCode,
      address,
      phone,
      taxPercentage,
      serviceChargePercentage,
    } = body

    if (!outletName) {
      return NextResponse.json({ error: 'Outlet name is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Generate slug from outlet name with timestamp to ensure uniqueness
    const baseSlug = outletName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    const timestamp = Date.now().toString(36) // Short alphanumeric timestamp
    const slug = `${baseSlug}-${timestamp}`

    // Auto-generate outlet code if not provided
    const finalOutletCode = outletCode?.trim() || generateOutletCode(outletName)

    // Clean phone number
    const cleanedPhone = cleanPhoneNumber(phone)

    // Check if this is the first outlet (make it main)
    const { count } = await supabase
      .from('outlets')
      .select('id', { count: 'exact', head: true })
      .eq('store_id', user.storeId)

    const isMain = count === 0

    // Create outlet
    const { data: outlet, error } = await supabase
      .from('outlets')
      .insert({
        store_id: user.storeId,
        name: outletName,
        slug,
        code: finalOutletCode.toUpperCase(),
        address: address || null,
        phone: cleanedPhone || null,
        is_main: isMain,
        is_active: true,
        tax_percentage: taxPercentage ?? 11,
        service_charge_percentage: serviceChargePercentage ?? 5,
        settings: {
          allowTakeaway: true,
          allowDineIn: true,
          allowDelivery: false,
          minimumOrderAmount: 0,
          estimatedPrepTime: 15,
          autoAcceptOrders: false,
        },
        theme: {
          primaryColor: '#10b981',
          secondaryColor: '#059669',
          backgroundColor: '#ffffff',
          textColor: '#1f2937',
          fontFamily: 'Inter',
          logoUrl: null,
          bannerUrl: null,
          customCss: null,
        },
        branding: {
          businessName: null,
          tagline: null,
          description: null,
          socialLinks: {},
          contactInfo: {},
        },
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating outlet:', error)
      return NextResponse.json({ error: 'Failed to create outlet' }, { status: 500 })
    }

    // Update store onboarding step
    try {
      const { data: storeData } = await supabase
        .from('stores')
        .select('settings')
        .eq('id', user.storeId)
        .single()

      const currentSettings = (storeData?.settings as object) || {}

      await supabase
        .from('stores')
        .update({
          settings: { ...currentSettings, onboardingStep: 2 },
        })
        .eq('id', user.storeId)
    } catch (updateErr) {
      console.error('Error updating onboarding step:', updateErr)
      // Don't fail the request if this update fails
    }

    return NextResponse.json({
      success: true,
      outletId: outlet.id,
      slug: outlet.slug,
    })
  } catch (error) {
    console.error('Onboarding outlet error:', error)
    return NextResponse.json({ error: 'Failed to create outlet' }, { status: 500 })
  }
}
