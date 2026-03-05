'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Loader2,
  AlertCircle,
  Check,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Save,
  Calendar,
  Sparkles,
  KeyRound
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface User {
  id: string
  email: string
  full_name: string | null
  role: string
  created_at: string
}

interface ProfileFormProps {
  user: User
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const [formData, setFormData] = useState({
    full_name: user.full_name || '',
    email: user.email || '',
    current_password: '',
    new_password: '',
    confirm_password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Validate password change if attempting
      if (formData.new_password) {
        if (!formData.current_password) {
          throw new Error('Masukkan password saat ini untuk mengubah password')
        }
        if (formData.new_password.length < 6) {
          throw new Error('Password baru minimal 6 karakter')
        }
        if (formData.new_password !== formData.confirm_password) {
          throw new Error('Konfirmasi password tidak cocok')
        }
      }

      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          current_password: formData.current_password || undefined,
          new_password: formData.new_password || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menyimpan profil')
      }

      setSuccess(true)
      // Clear password fields after successful update
      setFormData(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: '',
      }))

      setTimeout(() => setSuccess(false), 3000)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      tenant_admin: 'Pemilik Toko',
      outlet_admin: 'Admin Outlet',
      kitchen_staff: 'Staff Dapur',
      waiter: 'Pelayan',
      cashier: 'Kasir',
      owner: 'Pemilik',
      staff: 'Staff',
    }
    return roles[role] || role
  }

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      tenant_admin: 'from-orange-500 to-red-500',
      outlet_admin: 'from-blue-500 to-indigo-500',
      kitchen_staff: 'from-green-500 to-emerald-500',
      waiter: 'from-purple-500 to-pink-500',
      cashier: 'from-yellow-500 to-orange-500',
      owner: 'from-orange-500 to-red-500',
      staff: 'from-gray-500 to-slate-500',
    }
    return colors[role] || 'from-gray-500 to-slate-500'
  }

  const getInitials = (name: string | null) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Section with Avatar */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1E293B] via-[#334155] to-[#1E293B] p-8">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-red-500/20 to-transparent rounded-full blur-3xl" />

        <div className="relative flex flex-col md:flex-row items-center gap-6">
          {/* Large Avatar */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur opacity-40 group-hover:opacity-60 transition duration-300" />
            <Avatar className="relative h-28 w-28 border-4 border-white/20">
              <AvatarImage src={undefined} alt={user.full_name || 'User'} />
              <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white text-3xl font-bold">
                {getInitials(user.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 p-1.5 bg-green-500 rounded-full border-3 border-[#1E293B]">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {user.full_name || 'Nama Belum Diatur'}
            </h1>
            <p className="text-white/60 mb-3">{user.email}</p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              {/* Role Badge */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getRoleBadgeColor(user.role)}`}>
                <Shield className="w-3.5 h-3.5" />
                {getRoleLabel(user.role)}
              </span>

              {/* Join Date */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/70 bg-white/10">
                <Calendar className="w-3.5 h-3.5" />
                Bergabung {formatDate(user.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl animate-in slide-in-from-top-2 duration-300">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl animate-in slide-in-from-top-2 duration-300">
          <div className="p-2 bg-green-100 rounded-lg">
            <Check className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium">Profil berhasil diperbarui!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Information Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg shadow-orange-500/25">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Informasi Profil</h2>
                <p className="text-sm text-gray-500">Kelola data pribadi Anda</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Full Name */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Lengkap
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-gray-100 rounded-lg group-focus-within:bg-orange-100 transition-colors">
                  <User className="w-4 h-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full h-12 pl-14 pr-4 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  placeholder="Masukkan nama lengkap"
                />
              </div>
            </div>

            {/* Email (Read Only) */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-gray-100 rounded-lg">
                  <Mail className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full h-12 pl-14 pr-4 border border-gray-200 rounded-xl text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Lock className="w-4 h-4 text-gray-300" />
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Email tidak dapat diubah untuk keamanan akun
              </p>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-lg shadow-blue-500/25">
                <KeyRound className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Keamanan Akun</h2>
                <p className="text-sm text-gray-500">Kosongkan jika tidak ingin mengubah password</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Current Password */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password Saat Ini
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-gray-100 rounded-lg group-focus-within:bg-blue-100 transition-colors">
                  <Lock className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.current_password}
                  onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                  className="w-full h-12 pl-14 pr-12 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="Masukkan password saat ini"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password Baru
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-gray-100 rounded-lg group-focus-within:bg-blue-100 transition-colors">
                  <Lock className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={formData.new_password}
                  onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                  className="w-full h-12 pl-14 pr-12 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="Masukkan password baru (min. 6 karakter)"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-gray-100 rounded-lg group-focus-within:bg-blue-100 transition-colors">
                  <Lock className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                  className="w-full h-12 pl-14 pr-4 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="Ulangi password baru"
                />
              </div>
              {formData.new_password && formData.confirm_password && (
                <p className={`mt-2 text-xs flex items-center gap-1 ${formData.new_password === formData.confirm_password ? 'text-green-600' : 'text-red-500'}`}>
                  {formData.new_password === formData.confirm_password ? (
                    <>
                      <Check className="w-3 h-3" />
                      Password cocok
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3" />
                      Password tidak cocok
                    </>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="group relative flex items-center gap-2 h-12 px-8 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-sm font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
            )}
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </form>
    </div>
  )
}
