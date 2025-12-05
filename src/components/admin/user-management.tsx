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
  ShieldCheck,
  UserCog,
  X,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  ChefHat,
  Utensils,
} from 'lucide-react'
import { toast } from 'sonner'
import { PageTourButton } from '@/components/admin/tour'
import { ShimmerButton } from '@/components/ui/shimmer-button'

interface UserData {
  id: string
  email: string
  full_name: string
  role: 'tenant_admin' | 'kitchen_staff' | 'waiter' | 'cashier'
  is_active: boolean
  created_at: string
}

interface Props {
  currentUserId: string
}

const ROLE_LABELS: Record<string, string> = {
  tenant_admin: 'Admin',
  kitchen_staff: 'Staff Dapur',
  waiter: 'Pelayan',
  cashier: 'Kasir',
}

const ROLE_DESCRIPTIONS: Record<string, string> = {
  tenant_admin: 'Akses penuh ke semua fitur',
  kitchen_staff: 'Melihat dan mengelola pesanan dapur',
  waiter: 'Melihat pesanan, meja, dan menu',
  cashier: 'Mengelola pembayaran dan pesanan',
}

const ROLE_ICONS: Record<string, any> = {
  tenant_admin: ShieldCheck,
  kitchen_staff: ChefHat,
  waiter: Utensils,
  cashier: User,
}

const ROLE_COLORS: Record<string, string> = {
  tenant_admin: 'bg-purple-100 text-purple-700',
  kitchen_staff: 'bg-orange-100 text-orange-700',
  waiter: 'bg-blue-100 text-blue-700',
  cashier: 'bg-green-100 text-green-700',
}

export function UserManagement({ currentUserId }: Props) {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'waiter' as 'tenant_admin' | 'kitchen_staff' | 'waiter' | 'cashier',
    is_active: true,
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
      role: 'waiter',
      is_active: true,
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

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRole = roleFilter === 'all' || user.role === roleFilter

    return matchesSearch && matchesRole
  })

  const roleOptions = [
    { value: 'all', label: 'Semua Role' },
    { value: 'tenant_admin', label: 'Admin' },
    { value: 'kitchen_staff', label: 'Staff Dapur' },
    { value: 'waiter', label: 'Pelayan' },
    { value: 'cashier', label: 'Kasir' },
  ]

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
          <h1 className="text-2xl font-bold text-gray-900">Manajemen User</h1>
          <p className="text-gray-500 mt-1">Kelola user dan akses staff restoran</p>
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
      <div className="flex flex-wrap gap-4 items-center bg-gray-50 rounded-xl p-4 border">
        <div className="flex-1 relative min-w-[200px]" data-tour="users-search">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau email..."
            className="pl-9 bg-white"
          />
        </div>

        {/* Role Filter Tabs */}
        <div className="flex items-center gap-1 bg-white rounded-lg border p-1" data-tour="users-filter-role">
          {roleOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setRoleFilter(option.value)}
              className={`h-8 px-3 rounded-md text-sm font-medium transition-all ${
                roleFilter === option.value
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <Button variant="outline" onClick={fetchUsers} className="bg-white">
          <RefreshCw className="w-4 h-4" />
        </Button>

        {/* Results count */}
        <div className="text-sm text-gray-500">
          {filteredUsers.length} dari {users.length} user
        </div>
      </div>

      {/* Role Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        {Object.entries(ROLE_LABELS).map(([role, label]) => {
          const Icon = ROLE_ICONS[role]
          return (
            <div key={role} className="flex items-center gap-2">
              <Icon className={`w-4 h-4 ${
                role === 'tenant_admin' ? 'text-purple-600' :
                role === 'kitchen_staff' ? 'text-orange-600' :
                role === 'waiter' ? 'text-blue-600' :
                'text-green-600'
              }`} />
              <span className="text-gray-600">{label} - {ROLE_DESCRIPTIONS[role]}</span>
            </div>
          )
        })}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden" data-tour="users-table">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">User</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Role</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">Status</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  {users.length === 0 ? 'Belum ada user' : 'Tidak ada user yang cocok'}
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => {
                const RoleIcon = ROLE_ICONS[user.role] || User
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
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-700'}`}>
                        <RoleIcon className="w-3.5 h-3.5" />
                        {ROLE_LABELS[user.role] || user.role}
                      </span>
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
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-[#F3F4F6] text-[#374151] text-sm font-medium rounded-lg hover:bg-[#E5E7EB] transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        {user.id !== currentUserId && (
                          <button
                            onClick={() => handleDelete(user)}
                            className="flex items-center justify-center w-9 h-9 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
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
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {(['tenant_admin', 'kitchen_staff', 'waiter', 'cashier'] as const).map(role => {
                    const Icon = ROLE_ICONS[role]
                    const isSelected = formData.role === role
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, role }))}
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
                        <span className="text-[10px] text-gray-400 text-center">
                          {ROLE_DESCRIPTIONS[role]}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

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
                  disabled={saving}
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
