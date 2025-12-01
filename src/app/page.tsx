'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import {
  QrCode,
  BarChart3,
  ArrowRight,
  Menu,
  X,
  CheckCircle,
  Mic,
  LineChart,
  Brain,
  Sparkles,
  ChevronDown,
  Play,
  Zap,
  Clock,
  TrendingUp,
  ShoppingBag,
  Users,
  Star,
  Bell
} from 'lucide-react'

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const aiFeatures = [
    {
      icon: Mic,
      title: 'Voice Ordering',
      description: 'Pelanggan pesan dengan suara dalam Bahasa Indonesia. Inklusif untuk semua kalangan.',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: Brain,
      title: 'AI Business Insights',
      description: 'Analisis bisnis otomatis dengan rekomendasi actionable untuk pertumbuhan.',
      gradient: 'from-violet-500 to-purple-600'
    },
    {
      icon: LineChart,
      title: 'Sales Forecasting',
      description: 'Prediksi penjualan 14 hari ke depan untuk planning stok dan staff.',
      gradient: 'from-orange-500 to-cyan-500'
    },
    {
      icon: BarChart3,
      title: 'Smart Pricing',
      description: 'Rekomendasi harga optimal berbasis data untuk maksimalkan profit.',
      gradient: 'from-emerald-500 to-teal-500'
    }
  ]

  const steps = [
    {
      number: '01',
      title: 'Daftar & Setup Menu',
      description: 'Buat akun gratis dan upload menu restoran Anda dalam hitungan menit.',
      icon: ShoppingBag
    },
    {
      number: '02',
      title: 'Generate QR Code',
      description: 'Cetak QR code unik untuk setiap meja. Pelanggan tinggal scan!',
      icon: QrCode
    },
    {
      number: '03',
      title: 'Terima & Kelola Pesanan',
      description: 'Monitor pesanan real-time dari dashboard. AI bantu analisis bisnis.',
      icon: Bell
    }
  ]

  const faqs = [
    {
      question: 'Apakah pelanggan perlu install aplikasi?',
      answer: 'Tidak perlu sama sekali. Pelanggan cukup scan QR code dengan kamera smartphone, menu langsung terbuka di browser. Tidak perlu download apapun.'
    },
    {
      question: 'Bagaimana cara kerja Voice Ordering AI?',
      answer: 'Pelanggan tekan tombol mikrofon dan ucapkan pesanan dalam Bahasa Indonesia, misalnya "Pesan dua nasi goreng dan satu es teh". AI akan mengenali menu dan jumlah secara otomatis.'
    },
    {
      question: 'Berapa lama proses setup?',
      answer: 'Setup dasar selesai dalam 5 menit saja. Upload menu, generate QR code, dan langsung bisa terima pesanan di hari yang sama.'
    },
    {
      question: 'Apakah ada biaya tersembunyi?',
      answer: 'Tidak ada. Semua fitur AI sudah termasuk dalam paket. Tidak ada charge per penggunaan atau biaya tambahan lainnya.'
    },
    {
      question: 'Apakah data restoran saya aman?',
      answer: 'Sangat aman. Kami menggunakan enkripsi standar industri dan backup otomatis. Data Anda hanya digunakan untuk meningkatkan layanan di restoran Anda sendiri.'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/savora_logo.png"
                alt="Savora"
                width={140}
                height={40}
                className="h-8 lg:h-10 w-auto"
              />
            </Link>

            {/* Nav Links - Desktop */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition">Fitur</a>
              <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition">Cara Kerja</a>
              <a href="#faq" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition">FAQ</a>
            </div>

            {/* CTA - Desktop */}
            <div className="hidden md:flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition px-4 py-2">
                Masuk
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 px-5 py-2.5 rounded-full transition shadow-lg shadow-orange-500/25"
              >
                Coba Gratis
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 p-6">
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-gray-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Fitur</a>
              <a href="#how-it-works" className="text-gray-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Cara Kerja</a>
              <a href="#faq" className="text-gray-600 font-medium" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
              <hr className="border-gray-100 my-2" />
              <Link href="/login" className="text-gray-600 font-medium">Masuk</Link>
              <Link href="/register" className="text-white bg-gradient-to-r from-orange-500 to-red-500 text-center py-3 rounded-full font-semibold">
                Coba Gratis
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-orange-50 via-red-50 to-transparent rounded-full blur-3xl opacity-70 translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-orange-50 via-violet-50 to-transparent rounded-full blur-3xl opacity-60 -translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-full text-sm text-orange-700 font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              Platform Restoran AI-Powered Pertama di Indonesia
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6">
              Kelola Restoran{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
                Lebih Cerdas
              </span>{' '}
              dengan AI
            </h1>

            {/* Subheadline */}
            <p className="text-lg lg:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              QR ordering, voice command, dan analisis bisnis otomatis dalam satu platform.
              Dirancang khusus untuk UMKM kuliner Indonesia.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-full hover:from-orange-600 hover:to-red-600 transition-all shadow-xl shadow-orange-500/30 hover:shadow-orange-500/40 hover:-translate-y-0.5"
              >
                Mulai Gratis Sekarang
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-gray-700 font-semibold rounded-full border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
              >
                <Play className="w-5 h-5" />
                Lihat Cara Kerja
              </a>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span>Setup 5 menit</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span>Tanpa kartu kredit</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span>Support Bahasa Indonesia</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="pb-20 lg:pb-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-violet-500/20 rounded-3xl blur-2xl opacity-50" />

            {/* Browser Mockup */}
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Browser Header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 border-b border-gray-200">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1.5 bg-white rounded-lg text-xs text-gray-500 border border-gray-200 font-medium">
                    app.savora.id/dashboard
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-4 lg:p-6 bg-gray-50">
                {/* Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4">
                  {[
                    { icon: TrendingUp, label: 'Pendapatan', value: 'Rp 2.4M', change: '+12.5%', color: 'emerald' },
                    { icon: ShoppingBag, label: 'Pesanan', value: '148', change: '+18 baru', color: 'blue' },
                    { icon: Users, label: 'Pelanggan', value: '89', change: '+5 hari ini', color: 'violet' },
                    { icon: Star, label: 'Rating', value: '4.8', change: '124 review', color: 'orange' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                          <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                      <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                      <p className={`text-xs font-medium mt-1 text-${stat.color}-600`}>{stat.change}</p>
                    </div>
                  ))}
                </div>

                {/* Chart */}
                <div className="bg-white rounded-xl p-4 lg:p-5 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Penjualan Minggu Ini</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Total: Rp 16.8M</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="flex items-center gap-1 text-emerald-600 font-medium">
                        <TrendingUp className="w-3 h-3" />
                        +23%
                      </span>
                      <span className="text-gray-400">vs minggu lalu</span>
                    </div>
                  </div>
                  <div className="flex items-end gap-2 lg:gap-3 h-36 lg:h-44">
                    {[
                      { h: 45, day: 'Sen' },
                      { h: 65, day: 'Sel' },
                      { h: 50, day: 'Rab' },
                      { h: 80, day: 'Kam' },
                      { h: 60, day: 'Jum' },
                      { h: 90, day: 'Sab' },
                      { h: 100, day: 'Min' }
                    ].map((bar, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className="w-full bg-gradient-to-t from-orange-500 to-red-400 rounded-lg transition-all hover:from-orange-600 hover:to-red-500"
                          style={{ height: `${bar.h}%` }}
                        />
                        <span className="text-xs text-gray-400 font-medium">{bar.day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Notification */}
            <div className="absolute -right-4 lg:right-8 top-1/3 bg-white rounded-xl p-4 shadow-xl border border-gray-100 hidden sm:flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <Bell className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Pesanan Baru!</p>
                <p className="text-xs text-gray-500">Meja 5 - Rp 125.000</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section id="features" className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-700 text-sm font-semibold rounded-full mb-4">
              <Brain className="w-4 h-4" />
              FITUR AI CANGGIH
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Kekuatan AI untuk Bisnis Anda
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Empat fitur AI yang dirancang khusus untuk membantu UMKM kuliner Indonesia berkembang lebih cepat.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {aiFeatures.map((feature, i) => (
              <div
                key={i}
                className="group bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QR Ordering Feature */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 text-sm font-semibold rounded-full mb-6">
                <QrCode className="w-4 h-4" />
                QR CODE ORDERING
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Pelanggan Pesan Sendiri, Staff Lebih Produktif
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Cukup scan QR code di meja, pelanggan langsung bisa lihat menu dan pesan dari smartphone mereka.
                Tanpa install aplikasi, tanpa antri, tanpa repot.
              </p>
              <ul className="space-y-4">
                {[
                  'Menu digital dengan foto HD dan deskripsi lengkap',
                  'Notifikasi pesanan real-time ke dapur',
                  'Integrasi pembayaran digital (QRIS, GoPay, OVO)',
                  'Pelanggan bisa track status pesanan'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700">
                    <CheckCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* QR Preview */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-200 to-red-200 rounded-3xl blur-3xl opacity-40" />
              <div className="relative bg-white rounded-3xl p-8 lg:p-12 shadow-2xl border border-gray-100">
                <div className="flex items-center justify-center mb-8">
                  <div className="w-48 h-48 lg:w-56 lg:h-56 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-200">
                    <QrCode className="w-32 h-32 lg:w-40 lg:h-40 text-gray-300" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">Scan untuk melihat menu</p>
                  <p className="text-xl font-bold text-gray-900">Meja 5</p>
                  <p className="text-gray-600">Warung Kopi Nusantara</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white text-sm font-semibold rounded-full mb-4">
              <Zap className="w-4 h-4" />
              CARA KERJA
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Mulai dalam 3 Langkah Mudah
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Tidak perlu keahlian teknis. Setup restoran Anda dalam hitungan menit, bukan jam.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, i) => (
              <div key={i} className="relative text-center">
                {/* Step Number */}
                <div className="text-7xl lg:text-8xl font-bold text-gray-800 mb-6">{step.number}</div>

                {/* Icon */}
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                  <step.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-xl lg:text-2xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed">{step.description}</p>

                {/* Connector Line */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 right-0 w-1/2 border-t-2 border-dashed border-gray-700 translate-x-1/2" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition-all shadow-xl"
            >
              Mulai Sekarang - Gratis
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 lg:py-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 text-center">
            {[
              { value: '5', unit: 'menit', label: 'Waktu setup' },
              { value: '100', unit: '%', label: 'Fitur gratis' },
              { value: '24/7', unit: '', label: 'AI Assistant' },
              { value: '0', unit: '', label: 'Biaya tersembunyi' }
            ].map((stat, i) => (
              <div key={i}>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl lg:text-5xl font-bold text-gray-900">{stat.value}</span>
                  {stat.unit && <span className="text-2xl lg:text-3xl font-bold text-orange-500">{stat.unit}</span>}
                </div>
                <p className="text-gray-500 mt-2 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 text-sm font-semibold rounded-full mb-4">
              FAQ
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Pertanyaan Umum
            </h2>
            <p className="text-lg text-gray-600">
              Punya pertanyaan lain? Hubungi tim support kami.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
                <button
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Gratis untuk UMKM Indonesia
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Siap Tingkatkan Bisnis Restoran Anda?
          </h2>
          <p className="text-lg lg:text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Bergabung sekarang dan rasakan kemudahan mengelola restoran dengan teknologi AI.
            Setup gratis, tanpa komitmen.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white text-gray-900 text-lg font-semibold rounded-full hover:bg-gray-100 transition-all shadow-2xl hover:-translate-y-1"
          >
            Mulai Gratis Sekarang
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm text-white/70 mt-6">
            Tidak perlu kartu kredit • Setup dalam 5 menit • Cancel kapan saja
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Image
                src="/savora_logo.png"
                alt="Savora"
                width={120}
                height={36}
                className="h-8 w-auto brightness-0 invert"
              />
            </div>

            {/* Links */}
            <div className="flex items-center gap-8 text-sm text-gray-400">
              <a href="#features" className="hover:text-white transition">Fitur</a>
              <a href="#how-it-works" className="hover:text-white transition">Cara Kerja</a>
              <a href="#faq" className="hover:text-white transition">FAQ</a>
            </div>

            {/* Tagline */}
            <p className="text-sm text-gray-500">
              Faster. Smarter. Yours.
            </p>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Savora. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
