import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// Use service role key if available, otherwise fall back to anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY &&
  process.env.SUPABASE_SERVICE_ROLE_KEY !== 'your_service_role_key'
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// JWT Secret - required environment variable
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  console.error('CRITICAL: JWT_SECRET environment variable is not set')
}
const jwtSecret = new TextEncoder().encode(JWT_SECRET || '')

const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password harus diisi' },
        { status: 400 }
      )
    }

    // Get user by email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    // Verify password with bcrypt
    // Support both password_hash (new) and password (legacy) columns
    const passwordField = user.password_hash || user.password
    const isValidPassword = await bcrypt.compare(password, passwordField)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    // Check if user has store_id
    if (!user.store_id) {
      return NextResponse.json(
        { error: 'Akun tidak terhubung dengan store. Hubungi admin.' },
        { status: 403 }
      )
    }

    // Create JWT token (expires in 7 days)
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      storeId: user.store_id
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(jwtSecret)

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil!',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        store_id: user.store_id
      }
    })

    // Set HTTP-only cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })

    return response

  } catch (error: any) {
    console.error('Login API error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
