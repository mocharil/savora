'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
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
  TrendingUp,
  ShoppingBag,
  Users,
  Star,
  Bell,
  ImageIcon,
  MessageSquare,
  Clock,
  Target,
  Lightbulb,
  DollarSign,
  ChefHat,
  Wand2,
  Bot,
  PieChart,
  ArrowUpRight,
  Quote,
  UtensilsCrossed,
  BookOpen,
  Calculator
} from 'lucide-react'
import { Compare } from '@/components/ui/compare'
import { Highlighter } from '@/components/ui/highlighter'

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [activeFeature, setActiveFeature] = useState(0)
  const [typedText, setTypedText] = useState('')
  const [isTypingComplete, setIsTypingComplete] = useState(false)
  const [showDetected, setShowDetected] = useState(false)
  const [isListening, setIsListening] = useState(true)

  // Daily Insights animation states
  const [insightText, setInsightText] = useState('')
  const [showRecommendations, setShowRecommendations] = useState<number[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(true)

  // AI Chat animation states
  const [chatMessages, setChatMessages] = useState<number[]>([])
  const [isTypingChat, setIsTypingChat] = useState(false)

  // AI Menu Creator animation states
  const [menuCreatorStep, setMenuCreatorStep] = useState(0)
  const [generatedDish, setGeneratedDish] = useState<{ name: string; price: string; ingredients: string[] } | null>(null)

  const voiceExamples = [
    {
      text: '"Pesan dua nasi goreng spesial dan satu es teh manis"',
      detected: [
        { name: 'Nasi Goreng Spesial', qty: 2 },
        { name: 'Es Teh Manis', qty: 1 }
      ]
    },
    {
      text: '"Mau ayam bakar sama sambal terasi, minumnya jus jeruk"',
      detected: [
        { name: 'Ayam Bakar', qty: 1 },
        { name: 'Sambal Terasi', qty: 1 },
        { name: 'Jus Jeruk', qty: 1 }
      ]
    },
    {
      text: '"Sate ayam sepuluh tusuk, lontong dua porsi"',
      detected: [
        { name: 'Sate Ayam', qty: 10 },
        { name: 'Lontong', qty: 2 }
      ]
    }
  ]

  // Typing animation for voice ordering demo
  useEffect(() => {
    const example = voiceExamples[activeFeature % voiceExamples.length]
    const text = example.text
    let index = 0
    setTypedText('')
    setIsTypingComplete(false)
    setShowDetected(false)
    setIsListening(true)

    const timer = setInterval(() => {
      if (index < text.length) {
        setTypedText(text.substring(0, index + 1))
        index++
      } else {
        clearInterval(timer)
        setIsTypingComplete(true)
        setIsListening(false)
        setTimeout(() => {
          setShowDetected(true)
        }, 300)
      }
    }, 40)

    return () => clearInterval(timer)
  }, [activeFeature])

  // Auto rotate features
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 5)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  // AI Menu Creator animation
  useEffect(() => {
    if (activeFeature !== 2) return

    setMenuCreatorStep(0)
    setGeneratedDish(null)

    // Step 1: Input animation
    const step1Timer = setTimeout(() => setMenuCreatorStep(1), 500)
    // Step 2: Generating
    const step2Timer = setTimeout(() => setMenuCreatorStep(2), 1500)
    // Step 3: Show result
    const step3Timer = setTimeout(() => {
      setMenuCreatorStep(3)
      setGeneratedDish({
        name: 'Nasi Goreng Seafood Spesial',
        price: 'Rp 35.000',
        ingredients: ['Nasi', 'Udang', 'Cumi', 'Telur', 'Sayuran']
      })
    }, 3000)

    return () => {
      clearTimeout(step1Timer)
      clearTimeout(step2Timer)
      clearTimeout(step3Timer)
    }
  }, [activeFeature])

  // Daily Insights animation
  useEffect(() => {
    if (activeFeature !== 3) return

    const fullText = 'Kemarin penjualan naik 23% dibanding hari sebelumnya. Nasi Goreng Spesial adalah menu terlaris dengan 45 porsi. Jam ramai terjadi pukul 12:00-13:00.'
    let index = 0
    setInsightText('')
    setShowRecommendations([])
    setIsAnalyzing(true)

    const typingTimer = setInterval(() => {
      if (index < fullText.length) {
        setInsightText(fullText.substring(0, index + 1))
        index++
      } else {
        clearInterval(typingTimer)
        setIsAnalyzing(false)
        // Show recommendations one by one
        setTimeout(() => setShowRecommendations([0]), 300)
        setTimeout(() => setShowRecommendations([0, 1]), 700)
      }
    }, 25)

    return () => clearInterval(typingTimer)
  }, [activeFeature])

  // AI Chat animation
  useEffect(() => {
    if (activeFeature !== 4) return

    setChatMessages([])
    setIsTypingChat(false)

    // User message appears first
    setTimeout(() => {
      setChatMessages([0])
      setIsTypingChat(true)
    }, 300)

    // AI typing indicator, then response
    setTimeout(() => {
      setIsTypingChat(false)
      setChatMessages([0, 1])
    }, 1500)

    return () => {
      setChatMessages([])
      setIsTypingChat(false)
    }
  }, [activeFeature])

  const aiFeatures = [
    {
      icon: Mic,
      title: 'Voice Ordering AI',
      subtitle: 'Pesan dengan suara',
      description: 'Pelanggan cukup bicara dalam Bahasa Indonesia. AI mengenali menu dan jumlah secara otomatis dengan akurasi tinggi.',
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50',
    },
    {
      icon: ImageIcon,
      title: 'AI Image Generator',
      subtitle: 'Foto menu otomatis',
      description: 'Generate foto menu profesional dengan AI. Tidak perlu fotografer, hasil langsung berkualitas studio.',
      gradient: 'from-violet-500 to-purple-600',
      bgGradient: 'from-violet-50 to-purple-50',
    },
    {
      icon: ChefHat,
      title: 'AI Menu Creator',
      subtitle: 'Kreasi menu dengan AI',
      description: 'Input bahan yang tersedia, AI buatkan resep lengkap dengan estimasi harga, komposisi, dan cara pembuatan.',
      gradient: 'from-amber-500 to-orange-500',
      bgGradient: 'from-amber-50 to-orange-50',
    },
    {
      icon: Brain,
      title: 'Daily AI Insights',
      subtitle: 'Analisis bisnis harian',
      description: 'Setiap pagi terima ringkasan bisnis kemarin lengkap dengan rekomendasi actionable untuk hari ini.',
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
    },
    {
      icon: MessageSquare,
      title: 'AI Business Assistant',
      subtitle: 'Chatbot cerdas',
      description: 'Tanya apapun tentang bisnis Anda. AI menjawab berdasarkan data real-time dari restoran.',
      gradient: 'from-emerald-500 to-teal-500',
      bgGradient: 'from-emerald-50 to-teal-50',
    }
  ]

  const additionalFeatures = [
    { icon: LineChart, title: 'Sales Forecasting', description: 'Prediksi penjualan 14 hari ke depan' },
    { icon: Target, title: 'Smart Pricing', description: 'Rekomendasi harga optimal berbasis data' },
    { icon: Wand2, title: 'Menu Enhancement', description: 'AI tulis deskripsi menu yang menjual' },
    { icon: Bot, title: 'AI Recommendation', description: 'Rekomendasi menu personal untuk pelanggan' },
    { icon: PieChart, title: 'Product Analytics', description: 'Analisis performa setiap menu item' },
    { icon: Calculator, title: 'Cost Calculator', description: 'Hitung HPP dan margin otomatis' }
  ]

  const steps = [
    { number: '01', title: 'Daftar & Setup Menu', description: 'Buat akun gratis, upload menu dengan AI-generated foto dalam hitungan menit.', icon: ShoppingBag },
    { number: '02', title: 'Generate QR Code', description: 'Cetak QR code unik untuk setiap meja. Pelanggan tinggal scan, langsung pesan.', icon: QrCode },
    { number: '03', title: 'AI Kelola Bisnis', description: 'Terima insight harian, forecasting, dan rekomendasi otomatis dari AI assistant.', icon: Brain }
  ]

  const testimonials = [
    { name: 'Pak Hendra', business: 'Warung Sate Madura', location: 'Surabaya', image: '👨‍🍳', quote: 'Voice ordering-nya luar biasa! Pelanggan saya banyak yang sudah tua, sekarang mereka bisa pesan cuma dengan ngomong.', highlight: 'Pesanan naik 40%', highlightColor: '#22c55e', rating: 5 },
    { name: 'Bu Sari', business: 'Kedai Kopi Nusantara', location: 'Bandung', image: '👩‍🍳', quote: 'AI foto generator-nya menghemat', highlight: 'jutaan rupiah', highlightColor: '#f97316', quoteSuffix: '. Dulu bayar fotografer mahal, sekarang generate sendiri hasilnya bagus banget.', rating: 5 },
    { name: 'Mas Adi', business: 'Seafood Bakar 99', location: 'Jakarta', image: '👨‍💼', quote: 'Daily insights-nya kayak punya', highlight: 'konsultan bisnis pribadi', highlightColor: '#8b5cf6', quoteSuffix: '. Setiap pagi dikasih tau apa yang harus diperbaiki, sangat membantu!', rating: 5 }
  ]

  const faqs = [
    { question: 'Apakah pelanggan perlu install aplikasi?', answer: 'Tidak perlu sama sekali. Pelanggan cukup scan QR code dengan kamera smartphone, menu langsung terbuka di browser. Tidak perlu download apapun.', highlight: null },
    { question: 'Bagaimana cara kerja Voice Ordering AI?', answerParts: ['Pelanggan tekan tombol mikrofon dan ucapkan pesanan dalam Bahasa Indonesia, misalnya "Pesan dua nasi goreng dan satu es teh". AI menggunakan ', ' untuk mengenali menu dan jumlah dengan akurasi tinggi.'], highlight: 'Llama 4 Maverick', highlightColor: '#8b5cf6' },
    { question: 'AI Image Generator pakai teknologi apa?', answerParts: ['Kami menggunakan ', ', model text-to-image terbaik dari Google. Hasil foto berkualitas studio profesional, cocok untuk menu digital maupun cetak.'], highlight: 'Google Imagen 3', highlightColor: '#3b82f6' },
    { question: 'Berapa lama proses setup?', answerParts: ['Setup dasar selesai dalam ', ' saja. Upload menu, generate foto dengan AI, generate QR code, dan langsung bisa terima pesanan di hari yang sama.'], highlight: '5 menit', highlightColor: '#22c55e' },
    { question: 'Apakah ada biaya tersembunyi untuk fitur AI?', answerParts: ['', '. Semua fitur AI (voice ordering, image generator, daily insights, chatbot) sudah termasuk dalam paket. Tidak ada charge per penggunaan.'], highlight: 'Tidak ada', highlightColor: '#22c55e' },
    { question: 'Apakah data restoran saya aman?', answerParts: ['', '. Kami menggunakan Supabase dengan Row Level Security, data setiap tenant terisolasi. Enkripsi end-to-end dan backup otomatis setiap hari.'], highlight: 'Sangat aman', highlightColor: '#22c55e' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 via-white to-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-red-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-40 left-1/4 w-80 h-80 bg-violet-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-10 w-64 h-64 bg-cyan-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/savora_logo.png" alt="Savora" width={48} height={48} className="h-10 lg:h-12 w-auto" />
              <span className="text-xl lg:text-2xl font-bold text-gray-900">Savora</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#ai-features" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition">Fitur AI</a>
              <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition">Cara Kerja</a>
              <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition">Testimoni</a>
              <a href="#faq" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition">FAQ</a>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition px-4 py-2">Masuk</Link>
              <Link href="/register" className="text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 px-5 py-2.5 rounded-full transition shadow-lg shadow-orange-500/25">Coba Gratis</Link>
            </div>
            <button className="md:hidden p-2 text-gray-700" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 p-6">
            <div className="flex flex-col gap-4">
              <a href="#ai-features" className="text-gray-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Fitur AI</a>
              <a href="#how-it-works" className="text-gray-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Cara Kerja</a>
              <a href="#testimonials" className="text-gray-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Testimoni</a>
              <a href="#faq" className="text-gray-600 font-medium" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
              <hr className="border-gray-100 my-2" />
              <Link href="/login" className="text-gray-600 font-medium">Masuk</Link>
              <Link href="/register" className="text-white bg-gradient-to-r from-orange-500 to-red-500 text-center py-3 rounded-full font-semibold">Coba Gratis</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-28 pb-8 lg:pt-36 lg:pb-16 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-orange-50 via-red-50 to-transparent rounded-full blur-3xl opacity-70 translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-violet-50 via-blue-50 to-transparent rounded-full blur-3xl opacity-60 -translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200 rounded-full text-sm text-amber-700 font-medium mb-8 animate-pulse">
              <ChefHat className="w-4 h-4" />
              NEW: AI Menu Creator - Buat resep dari bahan yang ada!
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6">
              Platform Restoran dengan{' '}
              <Highlighter action="circle" color="#f97316" strokeWidth={2} animationDuration={800} isView>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-violet-600">7 Fitur AI</span>
              </Highlighter>
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Voice ordering, AI menu creator, image generator, daily insights, dan lebih banyak lagi.
              <Highlighter action="underline" color="#f97316" strokeWidth={2} animationDuration={1000} isView>
                <span className="font-semibold text-gray-900"> Satu-satunya platform restoran AI-powered di Indonesia.</span>
              </Highlighter>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/register" className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-full hover:from-orange-600 hover:to-red-600 transition-all shadow-xl shadow-orange-500/30 hover:shadow-orange-500/40 hover:-translate-y-0.5">
                Mulai Gratis Sekarang
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#ai-features" className="inline-flex items-center justify-center gap-2 px-8 py-4 text-gray-700 font-semibold rounded-full border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all">
                <Play className="w-5 h-5" />
                Lihat Demo AI
              </a>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>Powered by kolosal.ai</span>
              </div>
              {/* <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span>Google Imagen 3</span>
              </div> */}
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section id="ai-features" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 text-sm font-semibold rounded-full mb-4">
              <Brain className="w-4 h-4" />
              7 FITUR AI UNGGULAN
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              <Highlighter action="underline" color="#f97316" strokeWidth={3} animationDuration={1000} isView>
                AI yang Bekerja
              </Highlighter>{' '}
              untuk Bisnis Anda
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Setiap fitur dirancang untuk menghemat waktu, meningkatkan penjualan, dan membuat keputusan lebih cerdas.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
            {/* Feature Selector */}
            <div className="space-y-4">
              {aiFeatures.map((feature, i) => (
                <button
                  key={i}
                  onClick={() => setActiveFeature(i)}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 ${activeFeature === i ? `border-transparent bg-gradient-to-r ${feature.bgGradient} shadow-lg` : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">{feature.title}</h3>
                        {activeFeature === i && <span className="px-2 py-0.5 bg-white/80 rounded text-xs font-medium text-gray-600">Active</span>}
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{feature.subtitle}</p>
                      {activeFeature === i && <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>}
                    </div>
                    <ArrowUpRight className={`w-5 h-5 transition-all ${activeFeature === i ? 'text-gray-900 rotate-45' : 'text-gray-300'}`} />
                  </div>
                </button>
              ))}
            </div>

            {/* Interactive Demo */}
            <div className="relative">
              <div className={`absolute -inset-4 bg-gradient-to-r ${aiFeatures[activeFeature].bgGradient} rounded-3xl blur-2xl opacity-50`} />
              <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden min-h-[400px]">

                {/* Voice Ordering Demo */}
                {activeFeature === 0 && (
                  <div className="p-8 h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isListening ? 'bg-gradient-to-br from-orange-500 to-red-500 animate-pulse' : 'bg-gradient-to-br from-emerald-500 to-green-500'}`}>
                        <Mic className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Voice Ordering</p>
                        <p className={`text-xs transition-colors duration-300 ${isListening ? 'text-orange-500' : 'text-emerald-500'}`}>
                          {isListening ? 'Mendengarkan...' : '✓ Pesanan dikenali'}
                        </p>
                      </div>
                      {isListening && (
                        <div className="ml-auto flex items-end gap-1 h-6">
                          {[1,2,3,4,5].map(j => (
                            <div key={j} className="w-1 bg-orange-500 rounded-full animate-bounce" style={{ height: `${8 + (j * 3)}px`, animationDelay: `${j * 0.1}s`, animationDuration: '0.6s' }} />
                          ))}
                        </div>
                      )}
                      {!isListening && (
                        <div className="ml-auto">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <div className={`rounded-xl p-5 mb-4 transition-all duration-300 ${isTypingComplete ? 'bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200' : 'bg-gray-50'}`}>
                        <p className="text-base text-gray-700 font-medium min-h-[50px] leading-relaxed">
                          {typedText}
                          {!isTypingComplete && <span className="animate-pulse text-orange-500">|</span>}
                        </p>
                      </div>
                      <div className={`rounded-xl overflow-hidden transition-all duration-500 ease-out ${showDetected ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 border border-emerald-200">
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-emerald-600" />
                            <p className="text-xs text-emerald-700 font-semibold">AI Detected Menu:</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {voiceExamples[activeFeature % voiceExamples.length].detected.map((item, idx) => (
                              <span key={idx} className="px-3 py-1.5 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm border border-emerald-100">
                                {item.name} <span className="text-emerald-600 font-bold">x{item.qty}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Image Generator Demo */}
                {activeFeature === 1 && (
                  <div className="p-6 h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">AI Image Generator</p>
                        <p className="text-xs text-gray-500">Powered by Imagen 3</p>
                      </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      <div className="rounded-2xl overflow-hidden border border-violet-200 shadow-lg">
                        <Compare
                          firstImage="/product_after.png"
                          secondImage="/product_before.png"
                          firstImageClassName="object-cover"
                          secondImageClassname="object-cover"
                          className="h-[220px] w-[220px] md:h-[280px] md:w-[280px]"
                          autoplay={true}
                          autoplayDuration={3000}
                          showHandlebar={true}
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs">
                      <span className="text-gray-500">← Foto Biasa</span>
                      <span className="text-violet-600 font-medium">AI Generated →</span>
                    </div>
                    <div className="mt-2 p-3 bg-violet-50 rounded-lg">
                      <p className="text-xs text-violet-700">✨ Foto profesional tanpa fotografer, hasil dalam hitungan detik</p>
                    </div>
                  </div>
                )}

                {/* AI Menu Creator Demo */}
                {activeFeature === 2 && (
                  <div className="p-5 h-full flex flex-col relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/30 to-orange-200/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-200/30 to-green-200/30 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3 relative z-10">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 shadow-lg ${menuCreatorStep < 3 ? 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/30' : 'bg-gradient-to-br from-emerald-500 to-green-500 shadow-emerald-500/30'}`}>
                        <ChefHat className={`w-5 h-5 text-white transition-transform duration-300 ${menuCreatorStep === 2 ? 'animate-bounce' : ''}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">AI Menu Creator</p>
                        <div className="flex items-center gap-2">
                          <p className={`text-xs transition-colors duration-300 ${menuCreatorStep < 3 ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {menuCreatorStep === 0 && 'Siap menerima input...'}
                            {menuCreatorStep === 1 && 'Menganalisis bahan...'}
                            {menuCreatorStep === 2 && 'AI sedang berkreasi...'}
                            {menuCreatorStep === 3 && '✓ Menu berhasil dibuat!'}
                          </p>
                          {menuCreatorStep === 2 && (
                            <div className="flex items-center gap-0.5">
                              {[0, 1, 2].map(i => (
                                <div key={i} className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      {menuCreatorStep === 3 && (
                        <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center animate-in zoom-in duration-300">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1 bg-gray-100 rounded-full mb-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${menuCreatorStep === 3 ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'}`}
                        style={{ width: `${(menuCreatorStep / 3) * 100}%` }}
                      />
                    </div>

                    <div className="flex-1 space-y-2.5 relative z-10">
                      {/* Input Ingredients */}
                      <div className={`rounded-xl p-3 border transition-all duration-500 ${menuCreatorStep >= 1 ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-sm' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center text-xs ${menuCreatorStep >= 1 ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                          <p className="text-xs font-medium text-gray-700">Input Bahan</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { emoji: '🍚', name: 'Nasi' },
                            { emoji: '🦐', name: 'Udang' },
                            { emoji: '🦑', name: 'Cumi' },
                            { emoji: '🥚', name: 'Telur' },
                            { emoji: '🥬', name: 'Sayur' }
                          ].map((item, idx) => (
                            <span
                              key={idx}
                              className={`px-2 py-1 rounded-lg text-xs font-medium transition-all duration-300 transform ${menuCreatorStep >= 1 ? 'bg-white text-amber-700 shadow-sm border border-amber-100 scale-100' : 'bg-gray-100 text-gray-400 scale-95'}`}
                              style={{ transitionDelay: `${idx * 80}ms` }}
                            >
                              {item.emoji} {item.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* AI Processing Visual */}
                      {menuCreatorStep >= 2 && menuCreatorStep < 3 && (
                        <div className="rounded-xl p-3 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-5 h-5 rounded-md bg-violet-500 text-white flex items-center justify-center text-xs">2</div>
                            <p className="text-xs font-medium text-gray-700">AI Processing</p>
                            <Brain className="w-3.5 h-3.5 text-violet-500 animate-pulse ml-auto" />
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-xs text-violet-600">
                              <div className="w-1 h-1 rounded-full bg-violet-400" />
                              <span>Menganalisis kombinasi rasa...</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-violet-600">
                              <div className="w-1 h-1 rounded-full bg-violet-400" />
                              <span>Menghitung estimasi HPP...</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-violet-600">
                              <div className="w-1 h-1 rounded-full bg-violet-400" />
                              <span>Menyusun langkah pembuatan...</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Result Section */}
                      {generatedDish && (
                        <div className="rounded-xl overflow-hidden bg-white border border-emerald-200 shadow-lg shadow-emerald-100/50 animate-in fade-in slide-in-from-bottom-3 duration-500">
                          {/* Result Header */}
                          <div className="bg-gradient-to-r from-emerald-500 to-green-500 px-3 py-2">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-white" />
                              <p className="text-xs text-white font-semibold">Menu Hasil AI</p>
                              <span className="ml-auto text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full">Baru</span>
                            </div>
                          </div>
                          {/* Result Content */}
                          <div className="p-3">
                            <h4 className="font-bold text-gray-900 text-sm mb-2">{generatedDish.name}</h4>
                            <div className="grid grid-cols-3 gap-2 mb-2">
                              <div className="text-center p-1.5 bg-gray-50 rounded-lg">
                                <DollarSign className="w-3.5 h-3.5 text-emerald-500 mx-auto mb-0.5" />
                                <p className="text-[10px] text-gray-500">Harga</p>
                                <p className="text-xs font-semibold text-gray-900">{generatedDish.price}</p>
                              </div>
                              <div className="text-center p-1.5 bg-gray-50 rounded-lg">
                                <Clock className="w-3.5 h-3.5 text-amber-500 mx-auto mb-0.5" />
                                <p className="text-[10px] text-gray-500">Waktu</p>
                                <p className="text-xs font-semibold text-gray-900">20 mnt</p>
                              </div>
                              <div className="text-center p-1.5 bg-gray-50 rounded-lg">
                                <Target className="w-3.5 h-3.5 text-violet-500 mx-auto mb-0.5" />
                                <p className="text-[10px] text-gray-500">Margin</p>
                                <p className="text-xs font-semibold text-emerald-600">65%</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100">
                              <BookOpen className="w-3 h-3 text-emerald-500" />
                              <p className="text-[10px] text-emerald-600 font-medium">Resep lengkap • 8 langkah • HPP Rp12.250</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Daily Insights Demo */}
                {activeFeature === 3 && (
                  <div className="p-8 h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isAnalyzing ? 'bg-gradient-to-br from-blue-500 to-cyan-500 animate-pulse' : 'bg-gradient-to-br from-emerald-500 to-green-500'}`}>
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Daily Insights</p>
                        <p className={`text-xs transition-colors duration-300 ${isAnalyzing ? 'text-blue-500' : 'text-emerald-500'}`}>
                          {isAnalyzing ? 'Menganalisis data...' : '✓ Analisis selesai'}
                        </p>
                      </div>
                      {isAnalyzing && (
                        <div className="ml-auto flex items-center gap-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      )}
                      {!isAnalyzing && (
                        <div className="ml-auto">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className={`rounded-xl p-4 border transition-all duration-300 ${!isAnalyzing ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                        <p className="text-sm text-gray-700 leading-relaxed min-h-[60px]">
                          {insightText}
                          {isAnalyzing && <span className="animate-pulse text-blue-500">|</span>}
                        </p>
                      </div>
                      <div className={`space-y-2 transition-all duration-500 ${showRecommendations.length > 0 ? 'opacity-100' : 'opacity-0'}`}>
                        <p className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          Rekomendasi Hari Ini:
                        </p>
                        <div className={`flex items-start gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-100 transition-all duration-300 transform ${showRecommendations.includes(0) ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
                          <Lightbulb className="w-4 h-4 text-emerald-600 mt-0.5" />
                          <p className="text-sm text-emerald-800">Siapkan lebih banyak stok ayam, prediksi permintaan tinggi</p>
                        </div>
                        <div className={`flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100 transition-all duration-300 transform ${showRecommendations.includes(1) ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
                          <Clock className="w-4 h-4 text-amber-600 mt-0.5" />
                          <p className="text-sm text-amber-800">Tambah 1 staff di jam 12:00-14:00</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Chat Demo */}
                {activeFeature === 4 && (
                  <div className="p-8 h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">AI Assistant</p>
                        <p className="text-xs text-emerald-500 flex items-center gap-1">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                          Online
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 space-y-4">
                      {/* User Message */}
                      <div className={`flex justify-end transition-all duration-500 transform ${chatMessages.includes(0) ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%] shadow-lg">
                          <p className="text-sm">Menu apa yang paling laris minggu ini?</p>
                        </div>
                      </div>

                      {/* Typing Indicator */}
                      {isTypingChat && (
                        <div className="flex justify-start">
                          <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* AI Response */}
                      <div className={`flex justify-start transition-all duration-500 transform ${chatMessages.includes(1) ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                        <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                          <p className="text-sm text-gray-700 leading-relaxed">Berdasarkan data 7 hari terakhir, menu terlaris adalah:</p>
                          <ol className="text-sm text-gray-700 mt-2 space-y-1">
                            <li className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-yellow-100 flex items-center justify-center text-xs">🥇</span>
                              Nasi Goreng Spesial <span className="text-emerald-600 font-semibold">(156)</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-xs">🥈</span>
                              Ayam Bakar <span className="text-emerald-600 font-semibold">(98)</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-xs">🥉</span>
                              Es Teh Manis <span className="text-emerald-600 font-semibold">(201)</span>
                            </li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Features Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {additionalFeatures.map((feature, i) => (
              <div key={i} className="group bg-white rounded-xl p-5 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gray-100 group-hover:bg-gradient-to-br group-hover:from-orange-500 group-hover:to-red-500 flex items-center justify-center transition-all">
                    <feature.icon className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                    <p className="text-sm text-gray-500">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QR Ordering Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 text-sm font-semibold rounded-full mb-6">
                <QrCode className="w-4 h-4" />
                QR CODE ORDERING
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Scan, Pesan, Bayar.<br/>
                <Highlighter action="circle" color="#f97316" strokeWidth={2} animationDuration={800} isView>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Semudah Itu.</span>
                </Highlighter>
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">Tidak perlu install app, tidak perlu antri. Pelanggan scan QR, pilih menu, dan langsung pesan. Dengan voice ordering, bahkan bisa pesan sambil ngobrol!</p>
              <ul className="space-y-4">
                {['Menu digital dengan foto AI-generated berkualitas tinggi', 'Voice ordering dalam Bahasa Indonesia', 'Notifikasi pesanan real-time ke dapur & kasir', 'Integrasi pembayaran QRIS, GoPay, OVO, Dana', 'Pelanggan track status pesanan langsung'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700">
                    <CheckCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-200 to-red-200 rounded-3xl blur-3xl opacity-40" />
              <div className="relative bg-white rounded-3xl p-8 lg:p-12 shadow-2xl border border-gray-100">
                <div className="flex items-center justify-center mb-8">
                  <div className="w-48 h-48 lg:w-56 lg:h-56 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-200 relative overflow-hidden">
                    <QrCode className="w-32 h-32 lg:w-40 lg:h-40 text-gray-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 to-transparent" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">Scan untuk melihat menu</p>
                  <p className="text-xl font-bold text-gray-900">Meja 5</p>
                  <p className="text-gray-600 mb-4">Warung Kopi Nusantara</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                    <Mic className="w-4 h-4" />
                    Voice Ordering Ready
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 lg:py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white text-sm font-semibold rounded-full mb-4">
              <Zap className="w-4 h-4" />
              CARA KERJA
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Mulai dalam 3 Langkah</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">Setup restoran Anda dalam hitungan menit. AI membantu dari awal sampai bisnis berjalan.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, i) => (
              <div key={i} className="relative text-center">
                <div className="text-7xl lg:text-8xl font-bold text-gray-800 mb-6">{step.number}</div>
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed">{step.description}</p>
                {i < steps.length - 1 && <div className="hidden md:block absolute top-16 right-0 w-1/2 border-t-2 border-dashed border-gray-700 translate-x-1/2" />}
              </div>
            ))}
          </div>
          <div className="mt-16 text-center">
            <Link href="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition-all shadow-xl">
              Mulai Sekarang - Gratis
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-full mb-4">
              <Star className="w-4 h-4" />
              TESTIMONI
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Dipercaya UMKM Indonesia</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Dengarkan cerita sukses dari pemilik restoran yang sudah merasakan manfaat AI Savora.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => <Star key={j} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
                </div>
                <Quote className="w-8 h-8 text-gray-200 mb-4" />
                <p className="text-gray-700 leading-relaxed mb-6">
                  {testimonial.quote}{' '}
                  <Highlighter action="highlight" color={testimonial.highlightColor} strokeWidth={2} animationDuration={800} isView>
                    <span className="font-semibold">{testimonial.highlight}</span>
                  </Highlighter>
                  {(testimonial as { quoteSuffix?: string }).quoteSuffix || '.'}
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center text-2xl">{testimonial.image}</div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.business} • {testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 text-center">
            {[
              { value: '7', unit: '', label: 'Fitur AI', icon: Brain },
              { value: '5', unit: ' menit', label: 'Setup time', icon: Clock },
              { value: '100', unit: '%', label: 'Gratis', icon: DollarSign },
              { value: '24/7', unit: '', label: 'AI Ready', icon: Bot }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl lg:text-5xl font-bold text-gray-900">{stat.value}</span>
                  {stat.unit && <span className="text-xl lg:text-2xl font-bold text-orange-500">{stat.unit}</span>}
                </div>
                <p className="text-gray-500 mt-2 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 text-sm font-semibold rounded-full mb-4">FAQ</div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Pertanyaan Umum</h2>
            <p className="text-lg text-gray-600">Punya pertanyaan lain? Hubungi tim support kami.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
                <button className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 leading-relaxed">
                      {(faq as { answer?: string }).answer ? (
                        (faq as { answer: string }).answer
                      ) : (
                        <>
                          {(faq as { answerParts?: string[] }).answerParts?.[0]}
                          {faq.highlight && (
                            <Highlighter action="box" color={(faq as { highlightColor?: string }).highlightColor || '#f97316'} strokeWidth={2} animationDuration={600} padding={3}>
                              <span className="font-semibold">{faq.highlight}</span>
                            </Highlighter>
                          )}
                          {(faq as { answerParts?: string[] }).answerParts?.[1]}
                        </>
                      )}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            7 Fitur AI • Gratis untuk UMKM
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Siap{' '}
            <Highlighter action="underline" color="#ffffff" strokeWidth={3} animationDuration={800} isView>
              Transformasi Restoran Anda
            </Highlighter>{' '}
            dengan AI?
          </h2>
          <p className="text-lg lg:text-xl text-white/90 mb-10 max-w-2xl mx-auto">Voice ordering, AI menu creator, image generator, daily insights, dan lebih banyak lagi. Mulai gratis hari ini, tanpa kartu kredit.</p>
          <Link href="/register" className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white text-gray-900 text-lg font-semibold rounded-full hover:bg-gray-100 transition-all shadow-2xl hover:-translate-y-1">
            Mulai Gratis Sekarang
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm text-white/70 mt-6">Tidak perlu kartu kredit • Setup 5 menit • Cancel kapan saja</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <Image src="/savora_logo.png" alt="Savora" width={40} height={40} className="h-10 w-auto" />
              <span className="text-xl font-bold text-white">Savora</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-gray-400">
              <a href="#ai-features" className="hover:text-white transition">Fitur AI</a>
              <a href="#how-it-works" className="hover:text-white transition">Cara Kerja</a>
              <a href="#testimonials" className="hover:text-white transition">Testimoni</a>
              <a href="#faq" className="hover:text-white transition">FAQ</a>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Brain className="w-4 h-4" />
              <span>Powered by Llama 4 &amp; Imagen 3</span>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-sm text-gray-500">© {new Date().getFullYear()} Savora. AI-Powered Restaurant Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
