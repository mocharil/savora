'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  User,
  Shield,
  ShieldCheck,
  UserCog,
  X,
  Check,
  Eye,
  EyeOff,
  Building2,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'
import { PageTourButton } from '@/components/admin/tour'
import { ShimmerButton } from '@/components/ui/shimmer-button'

interface Outlet {
  id: string
  name: string
  slug: string
}

interface UserOutlet {
  outlet_id: string
  outlet_name: string
  role: 'outlet_admin' | 'staff'
  permissions: {
    canManageMenu: boolean
    canManageOrders: boolean
    canManageTables: boolean
    canViewAnalytics: boolean
  }
  is_primary: boolean
}

interface UserData {
  id: string
  email: string
  full_name: string
  role: 'tenant_admin' | 'outlet_admin' | 'staff'
  is_active: boolean
  created_at: string
  outlets: UserOutlet[]
}

interface Props {
  outlets: Outlet[]
  currentUserId: string
}

const ROLE_LABELS = {
  tenant_admin: 'Tenant Admin',
  outlet_admin: 'Outlet Admin',
  staff: 'Staff',
}

const ROLE_ICONS = {
  tenant_admin: ShieldCheck,
  outlet_admin: Shield,
  staff: User,
}

const ROLE_COLORS = {
  tenant_admin: 'bg-purple-100 text-purple-700',
  outlet_admin: 'bg-orange-100 text-orange-700',
  staff: 'bg-gray-100 text-gray-700',
}

export function UserManagement({ outlets, currentUserId }: Props) {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'staff' as 'tenant_admin' | 'outlet_admin' | 'staff',
    is_active: true,
    outlets: [] as { outlet_id: string; role: 'outlet_admin' | 'staff'; is_primary: boolean }[],
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users')
      if (!response.ok) throw new Error('Failed to fetch users')
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Gagal memuat data user')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      name: '',
      role: 'staff',
      is_active: true,
      outlets: [],
    })
    setEditingUser(null)
    setShowPassword(false)
  }

  const openCreateModal = () => {
    resetForm()
    setShowModal(true)
  }

  const openEditModal = (user: UserData) => {
    setEditingUser(user)
    setFormData({
      email: user.email,
      password: '',
      name: user.full_name,
      role: user.role,
      is_active: user.is_active,
      outlets: user.outlets.map(o => ({
        outlet_id: o.outlet_id,
        role: o.role,
        is_primary: o.is_primary,
      })),
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingUser
        ? `/api/admin/users/${editingUser.id}`
        : '/api/admin/users'

      const method = editingUser ? 'PUT' : 'POST'

      const payload: any = {
        name: formData.name,
        role: formData.role,
        is_active: formData.is_active,
      }

      if (!editingUser) {
        payload.email = formData.email
        payload.password = formData.password
      } else if (formData.password) {
        payload.password = formData.password
      }

      // Only include outlets for non-tenant_admin roles
      if (formData.role !== 'tenant_admin') {
        payload.outlets = formData.outlets
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save user')
      }

      toast.success(editingUser ? 'User berhasil diupdate' : 'User berhasil dibuat')
      setShowModal(false)
      resetForm()
      fetchUsers()
    } catch (error: any) {
      console.error('Error saving user:', error)
      toast.error(error.message || 'Gagal menyimpan user')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (user: UserData) => {
    if (user.id === currentUserId) {
      toast.error('Tidak bisa menghapus akun sendiri')
      return
    }

    if (!confirm(`Yakin ingin menghapus user "${user.full_name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete user')
      }

      toast.success('User berhasil dihapus')
      fetchUsers()
    } catch (error: any) {
      console.error('Error deleting user:', error)
      toast.error(error.message || 'Gagal menghapus user')
    }
  }

  const toggleOutlet = (outletId: string) => {
    const exists = formData.outlets.find(o => o.outlet_id === outletId)
    if (exists) {
      setFormData(prev => ({
        ...prev,
        outlets: prev.outlets.filter(o => o.outlet_id !== outletId),
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        outlets: [
          ...prev.outlets,
          {
            outlet_id: outletId,
            role: formData.role === 'outlet_admin' ? 'outlet_admin' : 'staff',
            is_primary: prev.outlets.length === 0,
          },
        ],
      }))
    }
  }

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">Kelola user dan akses outlet</p>
        </div>
        <div className="flex items-center gap-3">
          <PageTourButton />
          <ShimmerButton
            onClick={openCreateModal}
            data-tour="users-add-btn"
            shimmerColor="#34d399"
            shimmerSize="0.08em"
            shimmerDuration="2.5s"
            borderRadius="8px"
            background="linear-gradient(135deg, #10b981 0%, #059669 100%)"
            className="h-10 px-4 text-sm font-medium gap-2"
          >
            <Plus className="w-4 h-4" />
            Tambah User
          </ShimmerButton>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative" data-tour="users-search">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau email..."
            className="pl-9"
          />
        </div>
        <Button variant="outline" onClick={fetchUsers}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Role Legend */}
      <div className="flex gap-4 text-sm" data-tour="users-filter-role">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-purple-600" />
          <span className="text-gray-600">Tenant Admin - Akses semua</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-orange-600" />
          <span className="text-gray-600">Outlet Admin - Kelola outlet tertentu</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-600" />
          <span className="text-gray-600">Staff - Akses terbatas</span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden" data-tour="users-table">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">User</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Role</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Outlets</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">Status</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  {users.length === 0 ? 'Belum ada user' : 'Tidak ada user yang cocok'}
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => {
                const RoleIcon = ROLE_ICONS[user.role]
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    {/* User Info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <UserCog className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.full_name}
                            {user.id === currentUserId && (
                              <span className="ml-2 text-xs text-gray-500">(Anda)</span>
                            )}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[user.role]}`}>
                        <RoleIcon className="w-3.5 h-3.5" />
                        {ROLE_LABELS[user.role]}
                      </span>
                    </td>

                    {/* Outlets */}
                    <td className="px-4 py-3">
                      {user.role === 'tenant_admin' ? (
                        <span className="text-sm text-gray-500 italic">Semua outlet</span>
                      ) : user.outlets.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {user.outlets.map(o => (
                            <span
                              key={o.outlet_id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-xs"
                            >
                              <Building2 className="w-3 h-3" />
                              {o.outlet_name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        user.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {user.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {user.id !== currentUserId && (
                          <button
                            onClick={() => handleDelete(user)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">
                {editingUser ? 'Edit User' : 'Tambah User Baru'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  resetForm()
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Email (only for new users) */}
              {!editingUser && (
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="user@example.com"
                    required
                    className="mt-1"
                  />
                </div>
              )}

              {/* Password */}
              <div>
                <Label htmlFor="password">
                  Password {editingUser ? '(kosongkan jika tidak diubah)' : '*'}
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="••••••••"
                    required={!editingUser}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <Label htmlFor="name">Nama *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nama lengkap"
                  required
                  className="mt-1"
                />
              </div>

              {/* Role */}
              <div>
                <Label>Role *</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {(['tenant_admin', 'outlet_admin', 'staff'] as const).map(role => {
                    const Icon = ROLE_ICONS[role]
                    const isSelected = formData.role === role
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            role,
                            outlets: role === 'tenant_admin' ? [] : prev.outlets,
                          }))
                        }}
                        className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-orange-600' : 'text-gray-500'}`} />
                        <span className={`text-xs font-medium ${isSelected ? 'text-orange-700' : 'text-gray-600'}`}>
                          {ROLE_LABELS[role]}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Outlet Assignment (for non-tenant_admin) */}
              {formData.role !== 'tenant_admin' && (
                <div>
                  <Label>Assign ke Outlet *</Label>
                  <p className="text-xs text-gray-500 mb-2">
                    Pilih outlet yang dapat diakses user ini
                  </p>
                  <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2">
                    {outlets.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-2">
                        Belum ada outlet
                      </p>
                    ) : (
                      outlets.map(outlet => {
                        const isSelected = formData.outlets.some(o => o.outlet_id === outlet.id)
                        return (
                          <label
                            key={outlet.id}
                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                              isSelected ? 'bg-orange-50' : 'hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleOutlet(outlet.id)}
                              className="w-4 h-4 rounded text-orange-600"
                            />
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{outlet.name}</span>
                          </label>
                        )
                      })
                    )}
                  </div>
                  {(formData.role as string) !== 'tenant_admin' && formData.outlets.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">
                      Pilih minimal satu outlet
                    </p>
                  )}
                </div>
              )}

              {/* Status */}
              <div>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="w-4 h-4 rounded text-orange-600"
                  />
                  <div>
                    <span className="font-medium">User Aktif</span>
                    <p className="text-sm text-gray-500">User nonaktif tidak bisa login</p>
                  </div>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={saving || (formData.role !== 'tenant_admin' && formData.outlets.length === 0)}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Simpan
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
