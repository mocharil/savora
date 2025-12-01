// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getUserFromToken } from '@/lib/tenant-context'
import bcrypt from 'bcryptjs'

// GET: List all users in the store
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken()
    if (!user || !user.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only tenant_admin can view all users
    if (user.role !== 'tenant_admin') {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const supabase = createAdminClient()

    // Get all users in this store
    const { data: users, error } = await supabase
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
      .eq('store_id', user.storeId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    // Get outlet assignments for each user
    const userIds = users?.map(u => u.id) || []

    const { data: outletAssignments, error: assignError } = await supabase
      .from('user_outlets')
      .select(`
        user_id,
        outlet_id,
        role,
        is_primary,
        outlet:outlets(id, name, slug)
      `)
      .in('user_id', userIds)

    if (assignError) {
      console.error('Error fetching outlet assignments:', assignError)
    }

    console.log('Outlet assignments fetched:', outletAssignments)

    // Map assignments to users
    const usersWithOutlets = users?.map(u => ({
      ...u,
      outlets: (outletAssignments || [])
        .filter(a => a.user_id === u.id)
        .map(a => ({
          outlet_id: a.outlet_id,
          outlet_name: a.outlet?.name,
          outlet_slug: a.outlet?.slug,
          role: a.role,
          is_primary: a.is_primary,
        }))
    }))

    return NextResponse.json({ users: usersWithOutlets })
  } catch (error) {
    console.error('Users GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Create a new user
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getUserFromToken()
    if (!currentUser || !currentUser.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only tenant_admin can create users
    if (currentUser.role !== 'tenant_admin') {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const body = await request.json()
    const { email, password, name, role, phone, outlets } = body

    // Validation
    if (!email?.trim() || !password || !name?.trim()) {
      return NextResponse.json(
        { error: 'Email, password, dan nama wajib diisi' },
        { status: 400 }
      )
    }

    if (!['tenant_admin', 'outlet_admin', 'staff'].includes(role)) {
      return NextResponse.json(
        { error: 'Role tidak valid' },
        { status: 400 }
      )
    }

    // outlet_admin and staff must have at least one outlet assigned
    if ((role === 'outlet_admin' || role === 'staff') && (!outlets || outlets.length === 0)) {
      return NextResponse.json(
        { error: 'Outlet admin dan staff harus di-assign ke minimal satu outlet' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        store_id: currentUser.storeId,
        email: email.toLowerCase().trim(),
        password_hash: hashedPassword,
        full_name: name.trim(),
        role,
        is_active: true,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating user:', createError)
      return NextResponse.json({ error: 'Gagal membuat user' }, { status: 500 })
    }

    // Create outlet assignments if provided
    if (outlets && outlets.length > 0) {
      const outletAssignments = outlets.map((o: any) => ({
        user_id: newUser.id,
        outlet_id: o.outlet_id,
        role: o.role || (role === 'outlet_admin' ? 'outlet_admin' : 'staff'),
        is_primary: o.is_primary || false,
      }))

      const { error: assignError } = await supabase
        .from('user_outlets')
        .insert(outletAssignments)

      if (assignError) {
        console.error('Error assigning outlets:', assignError)
        // Return error so user knows assignment failed
        return NextResponse.json({
          error: 'User berhasil dibuat tapi gagal assign outlet: ' + assignError.message
        }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      }
    })
  } catch (error) {
    console.error('Users POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
