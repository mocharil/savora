// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getUserFromToken } from '@/lib/tenant-context'
import bcrypt from 'bcryptjs'

// GET: Get single user details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const currentUser = await getUserFromToken()
    if (!currentUser || !currentUser.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await params
    const supabase = createAdminClient()

    // Get user
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        role,
        is_active,
        created_at,
        updated_at
      `)
      .eq('id', userId)
      .eq('store_id', currentUser.storeId)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get outlet assignments
    const { data: outletAssignments } = await supabase
      .from('user_outlets')
      .select(`
        outlet_id,
        role,
        permissions,
        is_primary,
        outlet:outlets(id, name, slug)
      `)
      .eq('user_id', userId)

    const userWithOutlets = {
      ...user,
      outlets: (outletAssignments || []).map(a => ({
        outlet_id: a.outlet_id,
        outlet_name: a.outlet?.name,
        outlet_slug: a.outlet?.slug,
        role: a.role,
        permissions: a.permissions,
        is_primary: a.is_primary,
      }))
    }

    return NextResponse.json({ user: userWithOutlets })
  } catch (error) {
    console.error('User GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT: Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const currentUser = await getUserFromToken()
    if (!currentUser || !currentUser.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only tenant_admin can update users
    if (currentUser.role !== 'tenant_admin') {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const { userId } = await params
    const body = await request.json()
    const { name, role, is_active, password, outlets } = body

    const supabase = createAdminClient()

    // Verify user belongs to this store
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', userId)
      .eq('store_id', currentUser.storeId)
      .single()

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent demoting yourself
    if (userId === currentUser.userId && role && role !== 'tenant_admin') {
      return NextResponse.json(
        { error: 'Tidak bisa mengubah role sendiri' },
        { status: 400 }
      )
    }

    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (name !== undefined) updateData.full_name = name.trim()
    if (role !== undefined) updateData.role = role
    if (is_active !== undefined) updateData.is_active = is_active

    // Update password if provided
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10)
    }

    // Update user
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating user:', updateError)
      return NextResponse.json({ error: 'Gagal update user' }, { status: 500 })
    }

    // Update outlet assignments if provided
    if (outlets !== undefined) {
      // Delete existing assignments
      const { error: deleteError } = await supabase
        .from('user_outlets')
        .delete()
        .eq('user_id', userId)

      if (deleteError) {
        console.error('Error deleting existing outlet assignments:', deleteError)
      }

      // Create new assignments
      if (outlets && outlets.length > 0) {
        const outletAssignments = outlets.map((o: any) => ({
          user_id: userId,
          outlet_id: o.outlet_id,
          role: o.role || 'staff',
          is_primary: o.is_primary || false,
        }))

        const { data: insertedData, error: assignError } = await supabase
          .from('user_outlets')
          .insert(outletAssignments)
          .select()

        if (assignError) {
          console.error('Error assigning outlets:', assignError)
          return NextResponse.json({
            error: 'Gagal assign outlet: ' + assignError.message
          }, { status: 500 })
        }

      }
    }

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error('User PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE: Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const currentUser = await getUserFromToken()
    if (!currentUser || !currentUser.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only tenant_admin can delete users
    if (currentUser.role !== 'tenant_admin') {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const { userId } = await params

    // Prevent deleting yourself
    if (userId === currentUser.userId) {
      return NextResponse.json(
        { error: 'Tidak bisa menghapus akun sendiri' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Verify user belongs to this store
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .eq('store_id', currentUser.storeId)
      .single()

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete user (outlet assignments will cascade)
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (error) {
      console.error('Error deleting user:', error)
      return NextResponse.json({ error: 'Gagal menghapus user' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('User DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
