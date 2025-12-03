import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// Use service role key if available, otherwise fall back to anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY &&
  process.env.SUPABASE_SERVICE_ROLE_KEY !== 'your_service_role_key'
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, full_name, store_name } = await request.json()

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password harus diisi' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      )
    }

    if (!store_name) {
      return NextResponse.json(
        { error: 'Nama toko harus diisi' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }

    // Hash password with bcrypt (cost factor 10)
    const password_hash = await bcrypt.hash(password, 10)

    // 1. Insert new user first (without store_id)
    // Register always creates tenant_admin (store owner)
    // outlet_admin and staff are created manually by tenant_admin
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        password_hash,
        full_name: full_name || email.split('@')[0],
        role: 'tenant_admin'
      })
      .select('id, email, full_name, role')
      .single()

    if (userError) {
      console.error('Register error:', userError)
      return NextResponse.json(
        { error: 'Gagal mendaftarkan user' },
        { status: 500 }
      )
    }

    // 2. Create store with owner_id
    const storeSlug = generateSlug(store_name) + '-' + Date.now().toString(36)
    const { data: newStore, error: storeError } = await supabase
      .from('stores')
      .insert({
        name: store_name,
        slug: storeSlug,
        owner_id: newUser.id
      })
      .select('id')
      .single()

    if (storeError) {
      console.error('Store creation error:', storeError)
      // Rollback: delete the user if store creation fails
      await supabase.from('users').delete().eq('id', newUser.id)
      return NextResponse.json(
        { error: 'Gagal membuat toko' },
        { status: 500 }
      )
    }

    // 3. Update user with store_id
    await supabase
      .from('users')
      .update({ store_id: newStore.id })
      .eq('id', newUser.id)

    return NextResponse.json({
      success: true,
      message: 'Registrasi berhasil! Silakan login.',
      user: newUser
    })

  } catch (error: any) {
    console.error('Register API error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
