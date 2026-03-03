'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowLeft, Sparkles } from 'lucide-react'
import { PoweredBySavora } from '@/components/ui/powered-by-savora'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login gagal')
        setLoading(false)
        return
      }

      if (data.success) {
        const destination = redirectUrl || '/admin/dashboard'
        window.location.replace(destination)
      } else {
        setError('Login gagal')
        setLoading(false)
      }
    } catch (err: any) {
      setError('Terjadi kesalahan. Coba lagi.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1E293B] via-[#334155] to-[#1E293B] relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-red-500/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-full blur-2xl" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 mb-8">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-white/80">AI-Powered Platform</span>
            </div>

            <Image
              src="/savora_logo.png"
              alt="Savora"
              width={80}
              height={60}
              className="mx-auto mb-6"
            />

            <h1 className="text-3xl font-bold text-white mb-4">
              Kelola Restoran Anda dengan
              <span className="block bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                Lebih Cerdas
              </span>
            </h1>

            <p className="text-white/60 max-w-sm mx-auto">
              Platform manajemen restoran berbasis AI pertama di Indonesia untuk UMKM F&B
            </p>
          </div>

          {/* Features */}
          <div className="mt-12 grid grid-cols-2 gap-4 max-w-md">
            {[
              { label: 'Pesanan Otomatis', desc: 'Kelola pesanan real-time' },
              { label: 'Analitik Cerdas', desc: 'Insight berbasis AI' },
              { label: 'Multi Outlet', desc: 'Satu dashboard semua cabang' },
              { label: 'QR Ordering', desc: 'Tanpa antri, tanpa ribet' },
            ].map((feature, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-sm font-medium text-white">{feature.label}</p>
                <p className="text-xs text-white/50">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-4 py-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-block">
              <Image
                src="/savora_logo.png"
                alt="Savora"
                width={150}
                height={45}
                className="mx-auto"
              />
            </Link>
          </div>

          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 hover:border-orange-200 hover:text-orange-600 transition-all duration-300 mb-8 group shadow-sm hover:shadow-md"
          >
            <div className="w-6 h-6 rounded-full bg-gray-100 group-hover:bg-orange-100 flex items-center justify-center transition-colors duration-300">
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform duration-300" />
            </div>
            <span className="text-sm font-medium">Kembali ke Beranda</span>
          </Link>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Selamat Datang!</h2>
              <p className="text-gray-500 mt-2">Masuk ke dashboard Anda</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  {error}
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-gray-100 group-focus-within:bg-orange-100 transition-colors">
                    <Mail className="h-4 w-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-12 pl-14 pr-4 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-gray-100 group-focus-within:bg-orange-100 transition-colors">
                    <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full h-12 pl-14 pr-12 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="relative w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5 group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Masuk'
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-600">
                Belum punya akun?{' '}
                <Link href="/register" className="text-orange-600 hover:text-orange-700 font-semibold">
                  Daftar sekarang
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8">
            <PoweredBySavora variant="dark" size="md" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-sm text-gray-500">Memuat...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
