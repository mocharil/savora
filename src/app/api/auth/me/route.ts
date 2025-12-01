import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { jwtVerify } from 'jose'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const jwtSecret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-min-32-chars!'
)

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Tidak terautentikasi' },
        { status: 401 }
      )
    }

    // Verify JWT
    const { payload } = await jwtVerify(token, jwtSecret)

    // Get fresh user data from database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, store_id, is_active')
      .eq('id', payload.userId)
      .single()

    if (error || !user || !user.is_active) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        store_id: user.store_id
      }
    })

  } catch (error: any) {
    console.error('Auth me error:', error)
    return NextResponse.json(
      { error: 'Token tidak valid' },
      { status: 401 }
    )
  }
}
