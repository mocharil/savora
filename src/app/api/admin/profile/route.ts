// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getUserFromToken } from '@/lib/tenant-context'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const user = await getUserFromToken()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, phone, role, created_at')
      .eq('id', user.userId)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ user: data })
  } catch (error: any) {
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
    const { full_name, phone, current_password, new_password } = body

    const supabase = createAdminClient()

    // Build update object
    const updateData: Record<string, any> = {}

    if (full_name !== undefined) {
      updateData.full_name = full_name
    }

    if (phone !== undefined) {
      updateData.phone = phone
    }

    // Handle password change
    if (new_password) {
      if (!current_password) {
        return NextResponse.json(
          { error: 'Password saat ini diperlukan untuk mengubah password' },
          { status: 400 }
        )
      }

      // Get current user with password
      const { data: currentUser, error: userError } = await supabase
        .from('users')
        .select('password_hash, password')
        .eq('id', user.userId)
        .single()

      if (userError || !currentUser) {
        return NextResponse.json(
          { error: 'User tidak ditemukan' },
          { status: 404 }
        )
      }

      // Verify current password
      const passwordField = currentUser.password_hash || currentUser.password
      const isValidPassword = await bcrypt.compare(current_password, passwordField)

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
      .select('id, email, full_name, phone, role')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Profil berhasil diperbarui',
      user: data
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
