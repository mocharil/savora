import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getUserFromToken } from '@/lib/tenant-context'

const allowedFields = [
  'name', 'description', 'address', 'phone', 'website',
  'logo_url', 'banner_url',
  'tax_percentage', 'service_charge_percentage',
  'operational_hours', 'is_active',
  'theme_settings'
]

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getUserFromToken()
    if (!user || !user.storeId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Support both single field update and batch update
    let updateData: Record<string, any> = {}

    if (body.field && body.value !== undefined) {
      // Single field update
      if (!allowedFields.includes(body.field)) {
        return NextResponse.json(
          { error: 'Invalid field' },
          { status: 400 }
        )
      }
      updateData[body.field] = body.value
    } else if (body.data && typeof body.data === 'object') {
      // Batch update
      for (const [field, value] of Object.entries(body.data)) {
        if (allowedFields.includes(field)) {
          updateData[field] = value
        }
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('stores')
      .update(updateData)
      .eq('id', user.storeId)

    if (error) {
      console.error('Update store error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Store update API error:', error)
    return NextResponse.json(
      { error: error.message || 'Update failed' },
      { status: 500 }
    )
  }
}
