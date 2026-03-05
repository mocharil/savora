// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUserFromToken } from '@/lib/tenant-context'
import bcrypt from 'bcryptjs'

// Create Supabase client with service role for accessing users table
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY &&
  process.env.SUPABASE_SERVICE_ROLE_KEY !== 'your_service_role_key'
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseKey)
}

export async function GET() {
  try {
    const user = await getUserFromToken()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, created_at')
      .eq('id', user.userId)
      .single()

    if (error) {
      console.error('Profile GET error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ user: data })
  } catch (error: any) {
    console.error('Profile GET exception:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromToken()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { full_name, current_password, new_password } = body

    const supabase = getSupabase()

    // Build update object
    const updateData: Record<string, any> = {}

    if (full_name !== undefined) {
      updateData.full_name = full_name
    }

    // Handle password change
    if (new_password) {
      if (!current_password) {
        return NextResponse.json(
          { error: 'Password saat ini diperlukan untuk mengubah password' },
          { status: 400 }
        )
      }

      // Get current user with password_hash
      const { data: currentUser, error: userError } = await supabase
        .from('users')
        .select('id, password_hash')
        .eq('id', user.userId)
        .single()

      if (userError) {
        console.error('User lookup error:', userError)
        return NextResponse.json(
          { error: `Database error: ${userError.message}` },
          { status: 500 }
        )
      }

      if (!currentUser) {
        return NextResponse.json(
          { error: 'User tidak ditemukan' },
          { status: 404 }
        )
      }

      // Verify current password
      if (!currentUser.password_hash) {
        return NextResponse.json(
          { error: 'Password belum diatur untuk akun ini' },
          { status: 400 }
        )
      }

      const isValidPassword = await bcrypt.compare(current_password, currentUser.password_hash)

      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Password saat ini salah' },
          { status: 400 }
        )
      }

      // Hash new password
      updateData.password_hash = await bcrypt.hash(new_password, 10)
    }

    // Only update if there's something to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada data untuk diperbarui' },
        { status: 400 }
      )
    }

    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.userId)
      .select('id, email, full_name, role')
      .single()

    if (error) {
      console.error('Profile update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Profil berhasil diperbarui',
      user: data
    })
  } catch (error: any) {
    console.error('Profile PUT exception:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
