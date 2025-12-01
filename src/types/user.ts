// User role hierarchy: tenant_admin > outlet_admin > staff
export type UserRole = 'tenant_admin' | 'outlet_admin' | 'staff'

export interface User {
  id: string
  store_id: string
  email: string
  name: string
  role: UserRole
  phone: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserWithOutlets extends User {
  outlets: UserOutletAssignment[]
}

export interface UserOutletAssignment {
  outlet_id: string
  outlet_name: string
  outlet_slug: string
  role: 'outlet_admin' | 'staff'
  permissions: UserPermissions
  is_primary: boolean
}

export interface UserPermissions {
  canManageMenu: boolean
  canManageOrders: boolean
  canManageTables: boolean
  canViewAnalytics: boolean
}

export const DEFAULT_STAFF_PERMISSIONS: UserPermissions = {
  canManageMenu: true,
  canManageOrders: true,
  canManageTables: true,
  canViewAnalytics: false,
}

export const DEFAULT_OUTLET_ADMIN_PERMISSIONS: UserPermissions = {
  canManageMenu: true,
  canManageOrders: true,
  canManageTables: true,
  canViewAnalytics: true,
}

// For creating new users
export interface CreateUserInput {
  email: string
  password: string
  name: string
  role: UserRole
  phone?: string
  outlets?: {
    outlet_id: string
    role: 'outlet_admin' | 'staff'
    permissions?: UserPermissions
    is_primary?: boolean
  }[]
}

// For updating users
export interface UpdateUserInput {
  name?: string
  role?: UserRole
  phone?: string
  is_active?: boolean
  outlets?: {
    outlet_id: string
    role: 'outlet_admin' | 'staff'
    permissions?: UserPermissions
    is_primary?: boolean
  }[]
}
