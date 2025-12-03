// @ts-nocheck
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { jwtVerify } from 'jose'
import type { TenantContext } from '@/types/database'
import type { Outlet } from '@/types/outlet'

const jwtSecret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-min-32-chars!'
)

export interface CustomerTenantContext {
  storeId: string
  storeSlug: string
  storeName: string
  outletId: string
  outletSlug: string
  outletName: string
  outlet: Outlet
}

export interface AdminTenantContext {
  storeId: string
  userId: string
  userRole: string
  outlets: Array<{ id: string; slug: string; name: string; is_main: boolean }>
  currentOutletId?: string
}

/**
 * Get tenant context for customer-facing routes
 * Extracts store and outlet info from URL slugs
 */
export async function getCustomerTenantContext(
  storeSlug: string,
  outletSlug: string
): Promise<CustomerTenantContext | null> {
  const supabase = await createClient()

  // Fetch store by slug
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id, slug, name')
    .eq('slug', storeSlug)
    .eq('is_active', true)
    .single()

  if (storeError || !store) {
    console.error('Store not found:', storeSlug)
    return null
  }

  // Fetch outlet by store and slug
  const { data: outlet, error: outletError } = await supabase
    .from('outlets')
    .select('*')
    .eq('store_id', store.id)
    .eq('slug', outletSlug)
    .eq('is_active', true)
    .single()

  if (outletError || !outlet) {
    console.error('Outlet not found:', outletSlug)
    return null
  }

  return {
    storeId: store.id,
    storeSlug: store.slug,
    storeName: store.name,
    outletId: outlet.id,
    outletSlug: outlet.slug,
    outletName: outlet.name,
    outlet: outlet as Outlet,
  }
}

/**
 * Get tenant context for admin routes
 * Extracts user info from JWT and fetches associated outlets
 */
export async function getAdminTenantContext(): Promise<AdminTenantContext | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    const currentOutletId = cookieStore.get('current_outlet')?.value

    if (!token) {
      return null
    }

    const { payload } = await jwtVerify(token, jwtSecret)
    const userId = payload.userId as string
    const storeId = payload.storeId as string
    const userRole = payload.role as string

    if (!storeId) {
      return null
    }

    const supabase = await createClient()

    // Fetch user's outlets
    const { data: outlets } = await supabase
      .from('outlets')
      .select('id, slug, name, is_main')
      .eq('store_id', storeId)
      .eq('is_active', true)
      .order('is_main', { ascending: false })
      .order('name')

    return {
      storeId,
      userId,
      userRole,
      outlets: outlets || [],
      currentOutletId: currentOutletId || outlets?.[0]?.id,
    }
  } catch (error) {
    console.error('Error getting admin tenant context:', error)
    return null
  }
}

/**
 * Get store ID from JWT token
 * Lightweight version for API routes
 */
export async function getStoreIdFromToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
      return null
    }

    const { payload } = await jwtVerify(token, jwtSecret)
    return payload.storeId as string
  } catch (error) {
    console.error('Error getting store ID from token:', error)
    return null
  }
}

/**
 * Get user info from JWT token
 */
export async function getUserFromToken(): Promise<{
  userId: string
  email: string
  role: string
  storeId: string
} | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    console.log('[getUserFromToken] Token exists:', !!token)

    if (!token) {
      console.log('[getUserFromToken] No token found')
      return null
    }

    const { payload } = await jwtVerify(token, jwtSecret)
    console.log('[getUserFromToken] Token verified, storeId:', payload.storeId)
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as string,
      storeId: payload.storeId as string,
    }
  } catch (error) {
    console.error('[getUserFromToken] Error:', error)
    return null
  }
}

/**
 * Get current outlet ID from cookie or default to main outlet
 */
export async function getCurrentOutletId(storeId: string): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const currentOutletId = cookieStore.get('current_outlet')?.value

    if (currentOutletId) {
      return currentOutletId
    }

    // Get main outlet as default
    const supabase = await createClient()
    const { data: mainOutlet } = await supabase
      .from('outlets')
      .select('id')
      .eq('store_id', storeId)
      .eq('is_main', true)
      .eq('is_active', true)
      .single()

    return mainOutlet?.id || null
  } catch (error) {
    console.error('Error getting current outlet ID:', error)
    return null
  }
}

/**
 * Validate that an outlet belongs to a store
 */
export async function validateOutletBelongsToStore(
  outletId: string,
  storeId: string
): Promise<boolean> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('outlets')
    .select('id')
    .eq('id', outletId)
    .eq('store_id', storeId)
    .eq('is_active', true)
    .single()

  return !!data
}

/**
 * Check if user has access to a specific outlet
 * tenant_admin has access to all outlets in their store
 * outlet_admin and staff need explicit assignment in user_outlets
 */
export async function userHasOutletAccess(
  userId: string,
  outletId: string,
  userRole: string,
  storeId: string
): Promise<boolean> {
  // tenant_admin has access to all outlets in their store
  if (userRole === 'tenant_admin') {
    return validateOutletBelongsToStore(outletId, storeId)
  }

  const supabase = await createClient()

  // Check user_outlets assignment
  const { data } = await supabase
    .from('user_outlets')
    .select('id')
    .eq('user_id', userId)
    .eq('outlet_id', outletId)
    .single()

  return !!data
}

/**
 * Get outlets that user has access to
 */
export async function getUserAccessibleOutlets(
  userId: string,
  userRole: string,
  storeId: string
): Promise<Array<{ id: string; slug: string; name: string; is_main: boolean }>> {
  const supabase = await createClient()

  // tenant_admin has access to all outlets
  if (userRole === 'tenant_admin') {
    const { data } = await supabase
      .from('outlets')
      .select('id, slug, name, is_main')
      .eq('store_id', storeId)
      .eq('is_active', true)
      .order('is_main', { ascending: false })
      .order('name')

    return data || []
  }

  // outlet_admin and staff only see assigned outlets
  const { data } = await supabase
    .from('user_outlets')
    .select(`
      outlet:outlets(id, slug, name, is_main)
    `)
    .eq('user_id', userId)

  const outlets = (data || [])
    .map(d => d.outlet)
    .filter(Boolean)
    .sort((a: any, b: any) => {
      if (a.is_main && !b.is_main) return -1
      if (!a.is_main && b.is_main) return 1
      return a.name.localeCompare(b.name)
    })

  return outlets as any[]
}

/**
 * Get user permissions for a specific outlet
 */
export async function getUserOutletPermissions(
  userId: string,
  outletId: string,
  userRole: string
): Promise<{
  canManageMenu: boolean
  canManageOrders: boolean
  canManageTables: boolean
  canViewAnalytics: boolean
  canManageUsers: boolean
} | null> {
  // tenant_admin has all permissions
  if (userRole === 'tenant_admin') {
    return {
      canManageMenu: true,
      canManageOrders: true,
      canManageTables: true,
      canViewAnalytics: true,
      canManageUsers: true,
    }
  }

  const supabase = await createClient()

  const { data } = await supabase
    .from('user_outlets')
    .select('permissions, role')
    .eq('user_id', userId)
    .eq('outlet_id', outletId)
    .single()

  if (!data) return null

  const permissions = data.permissions as Record<string, boolean> || {}

  return {
    canManageMenu: permissions.canManageMenu ?? true,
    canManageOrders: permissions.canManageOrders ?? true,
    canManageTables: permissions.canManageTables ?? true,
    canViewAnalytics: data.role === 'outlet_admin' ? true : (permissions.canViewAnalytics ?? false),
    canManageUsers: false, // Only tenant_admin can manage users
  }
}
