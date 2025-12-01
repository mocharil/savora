'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  UtensilsCrossed,
  QrCode,
  BarChart3,
  Smartphone,
  Clock,
  CreditCard,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  Star,
  Users,
  TrendingUp,
  Shield,
  Zap,
  Globe,
  ChefHat,
  Bell,
  Play,
  ShoppingBag,
  Store,
  Heart,
  LayoutDashboard,
  FileText,
  ChevronDown,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Rocket,
  Gift,
  Sparkles,
  Brain,
  Mic,
  LineChart,
  DollarSign,
  Lightbulb,
  Target,
  MessageSquare,
  Wand2
} from 'lucide-react'

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const features = [
    {
      icon: QrCode,
      iconVariant: 'blue',
      title: 'QR Code Ordering',
      description: 'Pelanggan dapat memesan langsung dari meja dengan scan QR code. Tidak perlu install aplikasi, cukup scan dan pesan!',
      features: ['Contactless ordering', 'Menu digital interaktif', 'Payment terintegrasi']
    },
    {
      icon: Mic,
      iconVariant: 'purple',
      title: 'Voice Ordering AI',
      description: 'Pelanggan pesan dengan suara dalam Bahasa Indonesia. Teknologi AI mengenali menu dan jumlah pesanan secara akurat.',
      features: ['Bahasa Indonesia native', 'Inklusif untuk lansia', 'Real-time parsing'],
      isNew: true
    },
    {
      icon: Brain,
      iconVariant: 'purple',
      title: 'AI Business Insights',
      description: 'AI menganalisis data bisnis Anda dan memberikan rekomendasi actionable untuk meningkatkan performa restoran.',
      features: ['Auto-analysis harian', 'Quick wins & tips', 'Rekomendasi strategis'],
      isNew: true
    },
    {
      icon: LineChart,
      iconVariant: 'orange',
      title: 'Sales Forecasting AI',
      description: 'Prediksi penjualan hingga 14 hari ke depan. Siapkan stok bahan dan jadwal staff dengan lebih efisien.',
      features: ['Prediksi per hari', 'Peak hours analysis', 'Stock recommendation'],
      isNew: true
    },
    {
      icon: BarChart3,
      iconVariant: 'green',
      title: 'Dashboard Analytics',
      description: 'Monitor performa bisnis real-time dengan visualisasi data yang mudah dipahami dan actionable insights.',
      features: ['Revenue tracking', 'Menu populer analytics', 'AI-powered insights']
    },
    {
      icon: Menu,
      iconVariant: 'blue',
      title: 'Menu Management',
      description: 'Kelola menu dengan mudah. AI dapat generate deskripsi menu dan gambar secara otomatis!',
      features: ['AI menu description', 'AI image generation', 'Kategori fleksibel']
    },
    {
      icon: DollarSign,
      iconVariant: 'green',
      title: 'Smart Pricing AI',
      description: 'AI merekomendasikan harga optimal berdasarkan data penjualan dan analisis kompetitor.',
      features: ['Dynamic pricing', 'Bundle recommendations', 'Profit optimization'],
      isNew: true
    },
    {
      icon: ShoppingBag,
      iconVariant: 'orange',
      title: 'Order Management',
      description: 'Terima dan kelola pesanan dari semua channel dalam satu tempat dengan notifikasi real-time.',
      features: ['Real-time notifications', 'Status tracking', 'Order history']
    },
    {
      icon: Store,
      iconVariant: 'blue',
      title: 'Multi-Location',
      description: 'Kelola beberapa cabang restoran dari satu dashboard terpusat dengan kontrol akses yang fleksibel.',
      features: ['Centralized management', 'Location-based reports', 'Staff access control']
    }
  ]

  const pricingPlans = [
    {
      name: 'Starter',
      description: 'Sempurna untuk restoran kecil dan cafe',
      price: { amount: '299K', period: '/bulan', currency: 'Rp' },
      features: [
        '1 Lokasi restoran',
        'Hingga 50 item menu',
        'Unlimited QR codes',
        'Dashboard analytics dasar',
        'Voice Ordering AI',
        'AI Menu Assistant',
        'Payment gateway (Midtrans)',
        'Support email'
      ],
      cta: { text: 'Mulai Gratis', variant: 'outline' },
      featured: false
    },
    {
      name: 'Professional',
      description: 'Untuk restoran berkembang dengan fitur AI lengkap',
      price: { amount: '599K', period: '/bulan', currency: 'Rp' },
      features: [
        'Hingga 3 lokasi',
        'Unlimited menu items',
        'Unlimited QR codes',
        'AI Business Insights',
        'Sales Forecasting AI',
        'Smart Pricing AI',
        'Voice Ordering AI',
        'Advanced analytics & reports',
        'WhatsApp notifications',
        'Priority support'
      ],
      cta: { text: 'Mulai Gratis', variant: 'primary' },
      featured: true,
      badge: 'BEST VALUE'
    },
    {
      name: 'Enterprise',
      description: 'Untuk chain restaurant dengan AI custom',
      price: { amount: 'Custom', period: '', currency: '' },
      features: [
        'Unlimited lokasi',
        'Unlimited menu items',
        'Semua fitur AI Premium',
        'Custom AI training',
        'White-label solution',
        'Custom integrations',
        'Dedicated account manager',
        'SLA guarantee',
        'API access'
      ],
      cta: { text: 'Hubungi Kami', variant: 'outline' },
      featured: false
    }
  ]

  const faqs = [
    {
      question: 'Apakah pelanggan perlu install aplikasi untuk memesan?',
      answer: 'Tidak perlu! Pelanggan cukup scan QR code di meja menggunakan kamera smartphone. Menu akan langsung terbuka di browser tanpa perlu install aplikasi apapun.'
    },
    {
      question: 'Bagaimana cara kerja Voice Ordering AI?',
      answer: 'Pelanggan cukup tekan tombol mikrofon dan ucapkan pesanan dalam Bahasa Indonesia, misalnya "Pesan dua nasi goreng dan satu es teh". AI akan mengenali menu dan jumlah secara otomatis. Fitur ini sangat membantu pelanggan lansia atau yang kurang familiar dengan teknologi.'
    },
    {
      question: 'Apa itu AI Business Insights dan bagaimana cara kerjanya?',
      answer: 'AI Business Insights menganalisis data penjualan Anda secara otomatis dan memberikan rekomendasi actionable. AI akan memberikan quick wins seperti "Menu X penjualannya naik 30%, pertimbangkan untuk promosikan lebih" atau tips strategis untuk meningkatkan revenue.'
    },
    {
      question: 'Seberapa akurat prediksi Sales Forecasting AI?',
      answer: 'AI kami belajar dari pola historis penjualan Anda dan mempertimbangkan faktor seperti hari kerja/weekend, jam sibuk, dan tren. Akurasi akan semakin meningkat seiring bertambahnya data. Prediksi ini membantu Anda mempersiapkan stok bahan dan jadwal staff dengan lebih efisien.'
    },
    {
      question: 'Berapa lama proses setup dan implementasi?',
      answer: 'Setup dasar bisa selesai dalam 5 menit! Anda bisa langsung upload menu, generate QR code, dan mulai terima pesanan di hari yang sama. Fitur AI akan aktif otomatis setelah ada data penjualan.'
    },
    {
      question: 'Apakah ada biaya tambahan untuk fitur AI?',
      answer: 'Tidak! Semua fitur AI sudah termasuk dalam paket subscription Anda. Tidak ada biaya tersembunyi atau charge per penggunaan AI.'
    },
    {
      question: 'Apakah data restoran saya aman?',
      answer: 'Sangat aman! Kami menggunakan enkripsi data standar industri, backup otomatis setiap hari, dan server yang aman. Data Anda hanya digunakan untuk meningkatkan layanan AI di restoran Anda sendiri.'
    },
    {
      question: 'Bisakah saya cancel subscription kapan saja?',
      answer: 'Ya, Anda bisa cancel subscription kapan saja tanpa penalty. Tidak ada kontrak jangka panjang atau biaya tersembunyi.'
    },
    {
      question: 'Bagaimana cara mendapat support jika ada masalah?',
      answer: 'Support team kami available via email dan WhatsApp. Untuk paket Professional dan Enterprise, ada priority support dengan response time lebih cepat. AI Assistant juga siap membantu menjawab pertanyaan Anda 24/7.'
    }
  ]

  const iconVariants: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-emerald-100 text-emerald-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] rounded-xl flex items-center justify-center">
                <UtensilsCrossed className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-[#3B82F6]">Savora</span>
            </div>

            {/* Nav Links - Desktop */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-base font-medium text-gray-700 hover:text-[#3B82F6] transition-colors">
                Fitur
              </a>
              <a href="#how-it-works" className="text-base font-medium text-gray-700 hover:text-[#3B82F6] transition-colors">
                Cara Kerja
              </a>
              <a href="#pricing" className="text-base font-medium text-gray-700 hover:text-[#3B82F6] transition-colors">
                Harga
              </a>
              <a href="#faq" className="text-base font-medium text-gray-700 hover:text-[#3B82F6] transition-colors">
                FAQ
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/login"
                className="text-base font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#3B82F6] text-white text-base font-semibold rounded-lg hover:bg-[#2563EB] transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                Coba Gratis
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 p-6">
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-base font-medium text-gray-700 hover:text-[#3B82F6]">Fitur</a>
              <a href="#how-it-works" className="text-base font-medium text-gray-700 hover:text-[#3B82F6]">Cara Kerja</a>
              <a href="#pricing" className="text-base font-medium text-gray-700 hover:text-[#3B82F6]">Harga</a>
              <a href="#faq" className="text-base font-medium text-gray-700 hover:text-[#3B82F6]">FAQ</a>
              <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                <Link href="/login" className="text-base font-medium text-gray-700">Masuk</Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#3B82F6] text-white font-semibold rounded-lg"
                >
                  Coba Gratis
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full blur-3xl opacity-60 translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-emerald-50 to-teal-100 rounded-full blur-3xl opacity-60 -translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Launch Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 text-violet-700 text-sm font-medium rounded-full mb-8 animate-fade-in-up">
            <Brain className="w-4 h-4" />
            Powered by AI - Teknologi Terdepan untuk Restoran Indonesia
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            Platform Restoran{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]">
              AI-Powered
            </span>{' '}
            Pertama di Indonesia
          </h1>

          {/* Subheading */}
          <p className="text-lg lg:text-xl text-gray-600 mb-10 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            Tingkatkan efisiensi restoran dengan <strong>Voice Ordering</strong>, <strong>AI Business Insights</strong>, <strong>Smart Pricing</strong>, dan <strong>Sales Forecasting</strong>. Teknologi canggih yang mudah digunakan untuk UMKM kuliner Indonesia.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#3B82F6] text-white text-lg font-semibold rounded-xl hover:bg-[#2563EB] transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
            >
              Mulai Gratis Sekarang
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 text-lg font-semibold rounded-xl border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              Pelajari Fitur
            </a>
          </div>

          {/* Trust Points - For New App */}
          <div className="flex flex-wrap items-center gap-4 justify-center mb-16 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center gap-2 px-4 py-2 bg-violet-50 rounded-full">
              <Brain className="w-5 h-5 text-violet-500" />
              <span className="text-gray-600 font-medium">AI-Powered</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full">
              <Mic className="w-5 h-5 text-emerald-500" />
              <span className="text-gray-600 font-medium">Voice Ordering</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              <span className="text-gray-600 font-medium">Gratis untuk dicoba</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full">
              <Zap className="w-5 h-5 text-amber-500" />
              <span className="text-gray-600 font-medium">Setup 5 menit</span>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="relative max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Mock Browser Header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 bg-white rounded-md text-xs text-gray-400 border border-gray-200">
                    savora.app/admin/dashboard
                  </div>
                </div>
              </div>

              {/* Dashboard Preview */}
              <div className="p-6 bg-gray-50">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Pendapatan</p>
                        <p className="text-lg font-bold text-gray-900">Rp 2.4M</p>
                      </div>
                    </div>
                    <div className="text-xs text-emerald-600 font-medium">+12.5% dari kemarin</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Pesanan</p>
                        <p className="text-lg font-bold text-gray-900">148</p>
                      </div>
                    </div>
                    <div className="text-xs text-blue-600 font-medium">+18 pesanan baru</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-100 hidden lg:block">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Users className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Pelanggan</p>
                        <p className="text-lg font-bold text-gray-900">89</p>
                      </div>
                    </div>
                    <div className="text-xs text-purple-600 font-medium">+5 pelanggan baru</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-100 hidden lg:block">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                        <UtensilsCrossed className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Menu Terjual</p>
                        <p className="text-lg font-bold text-gray-900">324</p>
                      </div>
                    </div>
                    <div className="text-xs text-orange-600 font-medium">Nasi Goreng #1</div>
                  </div>
                </div>

                {/* Chart Placeholder */}
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-gray-900">Grafik Penjualan</span>
                    <span className="text-xs text-gray-500">7 Hari Terakhir</span>
                  </div>
                  <div className="flex items-end gap-2 h-32">
                    {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-md transition-all hover:from-blue-600 hover:to-blue-500"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2">
                    {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day) => (
                      <span key={day} className="text-xs text-gray-400">{day}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -right-4 lg:-right-12 top-1/4 bg-white rounded-xl p-4 shadow-xl border border-gray-100 animate-bounce-slow hidden sm:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Pesanan Baru!</p>
                  <p className="text-xs text-gray-500">Meja 5 - Rp 125.000</p>
                </div>
              </div>
            </div>

            <div className="absolute -left-4 lg:-left-12 bottom-1/4 bg-white rounded-xl p-4 shadow-xl border border-gray-100 hidden sm:block">
              <div className="flex items-center gap-3">
                <QrCode className="w-10 h-10 text-[#3B82F6]" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Scan & Order</p>
                  <p className="text-xs text-gray-500">Tanpa aplikasi</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Highlight Section */}
      <section className="py-20 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              FITUR AI TERBARU
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Kekuatan AI untuk Bisnis Anda
            </h2>
            <p className="text-lg text-purple-100 max-w-2xl mx-auto">
              Teknologi AI canggih yang dirancang khusus untuk UMKM kuliner Indonesia. Mudah digunakan, hasil luar biasa.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Voice Ordering */}
            <div className="group bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Mic className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Voice Ordering</h3>
              <p className="text-purple-100 text-sm mb-4">
                Pelanggan pesan dengan suara dalam Bahasa Indonesia. Inklusif untuk semua kalangan, termasuk lansia.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-white/10 rounded text-xs text-white">Bahasa Indonesia</span>
                <span className="px-2 py-1 bg-white/10 rounded text-xs text-white">Real-time</span>
              </div>
            </div>

            {/* AI Business Insights */}
            <div className="group bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">AI Business Insights</h3>
              <p className="text-purple-100 text-sm mb-4">
                Analisis bisnis otomatis dengan rekomendasi actionable. AI memahami konteks bisnis kuliner Indonesia.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-white/10 rounded text-xs text-white">Auto-Analysis</span>
                <span className="px-2 py-1 bg-white/10 rounded text-xs text-white">Quick Wins</span>
              </div>
            </div>

            {/* Sales Forecasting */}
            <div className="group bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <LineChart className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Sales Forecasting</h3>
              <p className="text-purple-100 text-sm mb-4">
                Prediksi penjualan 7-14 hari ke depan. Siapkan stok dan staff dengan lebih akurat.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-white/10 rounded text-xs text-white">Prediksi Harian</span>
                <span className="px-2 py-1 bg-white/10 rounded text-xs text-white">Stock Planning</span>
              </div>
            </div>

            {/* Smart Pricing */}
            <div className="group bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Smart Pricing</h3>
              <p className="text-purple-100 text-sm mb-4">
                Rekomendasi harga optimal berdasarkan data penjualan. Maksimalkan profit tanpa kehilangan pelanggan.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-white/10 rounded text-xs text-white">Data-Driven</span>
                <span className="px-2 py-1 bg-white/10 rounded text-xs text-white">Bundle Ideas</span>
              </div>
            </div>
          </div>

          {/* AI Chat Assistant Highlight */}
          <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">AI Chat Assistant</h3>
                </div>
                <p className="text-purple-100 mb-4">
                  Tanya apapun tentang bisnis Anda dalam Bahasa Indonesia. AI asisten siap membantu analisis penjualan, rekomendasi menu, dan strategi bisnis 24/7.
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1.5 bg-white/20 rounded-full text-sm text-white">"Apa menu terlaris bulan ini?"</span>
                  <span className="px-3 py-1.5 bg-white/20 rounded-full text-sm text-white">"Kapan jam tersibuk restoran?"</span>
                  <span className="px-3 py-1.5 bg-white/20 rounded-full text-sm text-white">"Bagaimana meningkatkan penjualan?"</span>
                </div>
              </div>
              <div className="lg:w-80 bg-white rounded-xl p-4 shadow-xl">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-gray-900">Savora AI</span>
                </div>
                <div className="space-y-3">
                  <div className="bg-gray-100 rounded-lg p-3 text-sm text-gray-700">
                    Menu terlaris minggu ini adalah <strong>Nasi Goreng Spesial</strong> dengan 89 porsi terjual. Naik 23% dari minggu lalu!
                  </div>
                  <div className="bg-violet-100 rounded-lg p-3 text-sm text-violet-700">
                    <Lightbulb className="w-4 h-4 inline mr-1" />
                    Tip: Buat paket combo dengan Es Teh untuk tingkatkan nilai transaksi.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-20 bg-gradient-to-r from-[#3B82F6] to-[#60A5FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Kenapa Restoran Membutuhkan Savora?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            {[
              {
                icon: Clock,
                title: 'Hemat Waktu',
                description: 'Proses pemesanan lebih cepat dengan QR & Voice ordering. Staff bisa fokus melayani pelanggan.'
              },
              {
                icon: Brain,
                title: 'Keputusan Lebih Cerdas',
                description: 'AI menganalisis data bisnis dan memberikan rekomendasi actionable untuk pertumbuhan.'
              },
              {
                icon: TrendingUp,
                title: 'Tingkatkan Profit',
                description: 'Smart pricing dan forecasting membantu optimasi revenue dan mengurangi waste.'
              }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-blue-100">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-blue-50 text-[#3B82F6] text-sm font-semibold rounded-full mb-4">
              FITUR LENGKAP
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Semua yang Anda Butuhkan dalam Satu Platform
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Kelola restoran Anda dengan mudah menggunakan fitur-fitur canggih yang dirancang khusus untuk bisnis kuliner
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className={`group relative bg-white rounded-2xl p-8 border-2 transition-all duration-300 hover:-translate-y-1 ${
                  (feature as any).isNew
                    ? 'border-violet-200 hover:border-violet-400 hover:shadow-lg hover:shadow-violet-100'
                    : 'border-gray-200 hover:border-[#3B82F6] hover:shadow-lg'
                }`}
              >
                {(feature as any).isNew && (
                  <div className="absolute -top-3 right-4 px-3 py-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    AI-POWERED
                  </div>
                )}
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${iconVariants[feature.iconVariant]} mb-6`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-500">
                      <CheckCircle className={`w-4 h-4 ${(feature as any).isNew ? 'text-violet-500' : 'text-[#3B82F6]'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-blue-50 text-[#3B82F6] text-sm font-semibold rounded-full mb-4">
              CARA KERJA
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Mulai dalam 3 Langkah Mudah
            </h2>
            <p className="text-lg text-gray-600">
              Setup restoran Anda dalam hitungan menit, tanpa coding
            </p>
          </div>

          <div className="space-y-20">
            {/* Step 1 */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-block px-4 py-2 bg-blue-100 text-[#3B82F6] text-sm font-semibold rounded-full mb-4">
                  LANGKAH 1
                </span>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Setup Restoran & Menu</h3>
                <p className="text-lg text-gray-600 mb-6">
                  Daftar dan setup profil restoran Anda dalam hitungan menit. Upload menu, foto, dan atur kategori dengan mudah menggunakan interface yang intuitif.
                </p>
                <ul className="space-y-3">
                  {['Proses registrasi cepat', 'Upload menu dengan mudah', 'Atur kategori dan harga', 'Tambah foto menu'].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-[#3B82F6]" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <UtensilsCrossed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-400">Setup Dashboard Preview</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-400">QR Code Generation Preview</p>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-600 text-sm font-semibold rounded-full mb-4">
                  LANGKAH 2
                </span>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Generate QR Code untuk Meja</h3>
                <p className="text-lg text-gray-600 mb-6">
                  Buat QR code unik untuk setiap meja restoran Anda. Pelanggan tinggal scan untuk melihat menu dan memesan langsung dari smartphone mereka.
                </p>
                <ul className="space-y-3">
                  {['Generate QR code instan', 'Siap cetak dan pasang', 'Kelola nomor meja', 'Unlimited QR codes'].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Step 3 */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-block px-4 py-2 bg-purple-100 text-purple-600 text-sm font-semibold rounded-full mb-4">
                  LANGKAH 3
                </span>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Terima & Kelola Pesanan</h3>
                <p className="text-lg text-gray-600 mb-6">
                  Monitor semua pesanan real-time dari dashboard. Update status pesanan, lihat analytics, dan kelola operasional restoran dengan efisien.
                </p>
                <ul className="space-y-3">
                  {['Notifikasi pesanan real-time', 'Update status pesanan', 'Lihat riwayat transaksi', 'Analytics penjualan'].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-purple-500" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-400">Order Management Preview</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-blue-50 text-[#3B82F6] text-sm font-semibold rounded-full mb-4">
              KEUNTUNGAN
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Mengapa Memilih Savora?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Platform yang dirancang untuk meningkatkan efisiensi dan revenue restoran Anda
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Zap,
                iconColor: 'bg-amber-100 text-amber-600',
                title: 'Hemat Waktu & Biaya Operasional',
                description: 'Kurangi waktu pemesanan dengan self-ordering. Hemat biaya pencetakan menu fisik dan update harga secara instant.'
              },
              {
                icon: TrendingUp,
                iconColor: 'bg-emerald-100 text-emerald-600',
                title: 'Potensi Tingkatkan Revenue',
                description: 'Menu digital dengan foto menarik dan rekomendasi menu dapat meningkatkan nilai transaksi rata-rata.'
              },
              {
                icon: Heart,
                iconColor: 'bg-red-100 text-red-600',
                title: 'Customer Experience Lebih Baik',
                description: 'Pelanggan menikmati pengalaman ordering yang cepat, mudah, dan modern tanpa perlu tunggu pelayan.'
              },
              {
                icon: Shield,
                iconColor: 'bg-blue-100 text-blue-600',
                title: 'Data Aman & Terpercaya',
                description: 'Sistem keamanan berlapis dengan enkripsi data dan backup otomatis untuk melindungi data bisnis Anda.'
              }
            ].map((benefit, i) => (
              <div key={i} className="flex gap-6 p-6 bg-white rounded-2xl border border-gray-200 hover:shadow-lg transition-all">
                <div className={`flex-shrink-0 w-14 h-14 rounded-xl ${benefit.iconColor} flex items-center justify-center`}>
                  <benefit.icon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-20 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-blue-50 text-[#3B82F6] text-sm font-semibold rounded-full mb-4">
              POWERFUL DASHBOARD
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Dashboard yang Memberi Anda Kontrol Penuh
            </h2>
            <p className="text-lg text-gray-600">
              Kelola seluruh aspek restoran dari satu tempat
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden mb-12">
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <LayoutDashboard className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Full Dashboard Preview</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: LayoutDashboard, title: 'Real-time Overview', description: 'Monitor revenue, orders, dan performance metrics secara real-time' },
              { icon: Bell, title: 'Smart Notifications', description: 'Notifikasi instant untuk setiap pesanan baru dan update penting' },
              { icon: FileText, title: 'Detailed Reports', description: 'Export laporan komprehensif untuk analisis dan accounting' },
              { icon: Smartphone, title: 'Mobile Responsive', description: 'Akses dashboard dari desktop, tablet, atau smartphone' }
            ].map((feature, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-[#3B82F6]" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Early Adopter CTA Section - Replace Testimonials */}
      <section className="py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 lg:p-12 border border-blue-100 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#3B82F6] text-sm font-semibold rounded-full mb-6">
              <Gift className="w-4 h-4" />
              EARLY ADOPTER BENEFIT
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Jadilah Pengguna Pertama!
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Sebagai aplikasi baru, kami memberikan kesempatan spesial bagi Anda untuk mencoba
              semua fitur Savora secara gratis. Bantu kami berkembang dengan feedback Anda!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#3B82F6] text-white text-lg font-semibold rounded-xl hover:bg-[#2563EB] transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-500/25"
              >
                Coba Gratis Sekarang
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 justify-center text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Akses semua fitur premium</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Tanpa batas waktu trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span>Support prioritas</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-blue-50 text-[#3B82F6] text-sm font-semibold rounded-full mb-4">
              HARGA
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Pilih Paket yang Sesuai untuk Bisnis Anda
            </h2>
            <p className="text-lg text-gray-600">
              Mulai gratis, upgrade kapan saja sesuai kebutuhan
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <div
                key={i}
                className={`relative bg-white rounded-2xl p-8 border-2 transition-all ${
                  plan.featured
                    ? 'border-[#3B82F6] shadow-xl scale-105'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#3B82F6] text-white text-xs font-semibold rounded-full">
                    {plan.badge}
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    {plan.price.currency && (
                      <span className="text-2xl font-semibold text-gray-600">{plan.price.currency}</span>
                    )}
                    <span className="text-5xl font-extrabold text-gray-900">{plan.price.amount}</span>
                    {plan.price.period && (
                      <span className="text-gray-500">{plan.price.period}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-[#3B82F6] flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/admin/dashboard"
                  className={`block w-full py-3 text-center font-semibold rounded-xl transition-all ${
                    plan.cta.variant === 'primary'
                      ? 'bg-[#3B82F6] text-white hover:bg-[#2563EB]'
                      : 'border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  {plan.cta.text}
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-600 mt-12">
            Semua paket tersedia untuk dicoba gratis. Tidak perlu kartu kredit.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 lg:py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-blue-50 text-[#3B82F6] text-sm font-semibold rounded-full mb-4">
              FAQ
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-lg text-gray-600">
              Punya pertanyaan lain? Hubungi kami
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
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

      {/* CTA Section */}
      <section className="py-20 lg:py-24 bg-gradient-to-r from-[#3B82F6] to-[#60A5FA]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">
            Siap Mencoba Savora?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Mulai kelola restoran Anda dengan lebih efisien. Gratis untuk dicoba, setup dalam hitungan menit.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#3B82F6] text-lg font-semibold rounded-xl hover:bg-gray-100 transition-all"
            >
              Mulai Gratis Sekarang
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="flex flex-wrap gap-6 justify-center text-blue-100">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Gratis untuk dicoba</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Tanpa kartu kredit</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Setup dalam 5 menit</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1E293B] text-white pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] rounded-xl flex items-center justify-center">
                  <UtensilsCrossed className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">Savora</span>
              </div>
              <p className="text-gray-400 mb-6">
                Platform manajemen restoran modern yang membantu bisnis kuliner berkembang dengan teknologi.
              </p>
              <div className="flex gap-4">
                {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors">
                    <Icon className="w-5 h-5 text-gray-400" />
                  </a>
                ))}
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Produk</h4>
              <ul className="space-y-3 text-gray-400">
                {['Fitur', 'Harga', 'Cara Kerja'].map((item, i) => (
                  <li key={i}>
                    <a href="#" className="hover:text-white transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Perusahaan</h4>
              <ul className="space-y-3 text-gray-400">
                {['Tentang Kami', 'Kontak'].map((item, i) => (
                  <li key={i}>
                    <a href="#" className="hover:text-white transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Support</h4>
              <ul className="space-y-3 text-gray-400">
                {['FAQ', 'Hubungi Kami'].map((item, i) => (
                  <li key={i}>
                    <a href="#" className="hover:text-white transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Savora. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
