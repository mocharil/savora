'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import {
  Mic,
  MicOff,
  Loader2,
  X,
  AlertCircle,
  Volume2,
  Plus,
  Minus,
  ShoppingCart,
  HelpCircle,
  RefreshCw,
  Sparkles,
  MessageCircle,
  ChevronRight,
} from 'lucide-react'

interface ParsedItem {
  menuItemId: string
  name: string
  quantity: number
  price: number
  confidence: number
  originalText: string
}

interface RecommendedItem {
  menuItemId: string
  name: string
  price: number
  reason: string
}

interface VoiceOrderButtonProps {
  storeId: string
  outletId?: string
  onOrderConfirmed: (items: ParsedItem[]) => void
  onClose?: () => void
  className?: string
}

type ViewState = 'ready' | 'recording' | 'processing' | 'confirming' | 'recommendations' | 'error'

export function VoiceOrderButton({
  storeId,
  outletId,
  onOrderConfirmed,
  onClose,
  className = '',
}: VoiceOrderButtonProps) {
  const [state, setState] = useState<ViewState>('ready')
  const [transcript, setTranscript] = useState('')
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(true)
  const [editedItems, setEditedItems] = useState<ParsedItem[]>([])
  const [recordingTime, setRecordingTime] = useState(0)

  // Recommendations state
  const [recommendations, setRecommendations] = useState<RecommendedItem[]>([])
  const [aiMessage, setAiMessage] = useState('')
  const [selectedRecommendations, setSelectedRecommendations] = useState<Set<string>>(new Set())

  const recognitionRef = useRef<any>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isRecordingRef = useRef(false)

  const MAX_RECORDING_TIME = 30

  const requestMicrophonePermission = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Perangkat tidak mendukung akses mikrofon')
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(track => track.stop())
      return true
    } catch (err: any) {
      console.error('Microphone permission error:', err)
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Akses mikrofon ditolak. Mohon izinkan akses mikrofon di pengaturan browser.')
      } else if (err.name === 'NotFoundError') {
        setError('Mikrofon tidak ditemukan.')
      } else {
        setError(`Gagal mengakses mikrofon: ${err.message}`)
      }
      setState('error')
      return false
    }
  }

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setIsSupported(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'id-ID'

    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interimTranscript += result[0].transcript
        }
      }

      setTranscript(finalTranscript || interimTranscript)
    }

    recognition.onerror = (event: any) => {
      if (event.error === 'aborted') {
        isRecordingRef.current = false
        return
      }
      console.error('Speech recognition error:', event.error)
      isRecordingRef.current = false

      const errorMessages: Record<string, string> = {
        'not-allowed': 'Akses mikrofon ditolak.',
        'no-speech': 'Tidak terdengar suara. Coba bicara lebih dekat.',
        'audio-capture': 'Mikrofon tidak terdeteksi.',
        'network': 'Koneksi internet bermasalah.',
      }
      setError(errorMessages[event.error] || `Terjadi kesalahan: ${event.error}`)
      setState('error')
    }

    recognition.onstart = () => { isRecordingRef.current = true }
    recognition.onend = () => { isRecordingRef.current = false }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort() } catch (e) {}
      }
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
      isRecordingRef.current = false
    }
  }, [])

  const startRecording = useCallback(async () => {
    if (!isSupported || isRecordingRef.current) return

    setTranscript('')
    setError(null)
    setParsedItems([])
    setRecordingTime(0)
    setRecommendations([])
    setAiMessage('')
    setSelectedRecommendations(new Set())

    const hasPermission = await requestMicrophonePermission()
    if (!hasPermission) return

    setState('recording')

    try {
      recognitionRef.current?.start()

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= MAX_RECORDING_TIME - 1) {
            stopRecording()
            return MAX_RECORDING_TIME
          }
          return prev + 1
        })
      }, 1000)

      timeoutRef.current = setTimeout(() => {
        stopRecording()
      }, MAX_RECORDING_TIME * 1000)

    } catch (err: any) {
      if (err.name === 'InvalidStateError') return
      console.error('Start recording error:', err)
      setError('Gagal memulai perekaman')
      setState('error')
    }
  }, [isSupported])

  const stopRecording = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)

    try { recognitionRef.current?.stop() } catch (err) {}

    if (transcript.trim()) {
      processTranscript()
    } else {
      setError('Tidak ada suara yang terdeteksi. Coba bicara lebih keras.')
      setState('error')
    }
  }, [transcript])

  const processTranscript = async () => {
    if (!transcript.trim()) {
      setError('Tidak ada suara yang terdeteksi.')
      setState('error')
      return
    }

    setState('processing')

    try {
      const response = await fetch('/api/ai/voice-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, storeId, outletId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gagal memproses pesanan')
      }

      const parsed = data.parsed

      // Check if user is asking for recommendations
      if (parsed.isAskingRecommendation && parsed.recommendations?.length > 0) {
        setRecommendations(parsed.recommendations)
        setAiMessage(parsed.aiMessage || 'Berikut rekomendasi untuk Anda:')
        setState('recommendations')
        return
      }

      // Direct order
      if (parsed.items.length === 0) {
        // No items recognized, but maybe AI has a message
        if (parsed.aiMessage) {
          setAiMessage(parsed.aiMessage)
          setRecommendations(parsed.recommendations || [])
          setState('recommendations')
        } else {
          setError('Menu tidak dikenali. Coba sebutkan nama menu yang lebih jelas.')
          setState('error')
        }
        return
      }

      setParsedItems(parsed.items)
      setEditedItems(parsed.items)
      setState('confirming')
    } catch (err: any) {
      console.error('Process transcript error:', err)
      setError(err.message || 'Gagal memproses pesanan')
      setState('error')
    }
  }

  const updateItemQuantity = (index: number, delta: number) => {
    setEditedItems((prev) => {
      const newItems = [...prev]
      const newQty = Math.max(1, newItems[index].quantity + delta)
      newItems[index] = { ...newItems[index], quantity: newQty }
      return newItems
    })
  }

  const removeItem = (index: number) => {
    setEditedItems((prev) => prev.filter((_, i) => i !== index))
  }

  const toggleRecommendation = (menuItemId: string) => {
    setSelectedRecommendations(prev => {
      const newSet = new Set(prev)
      if (newSet.has(menuItemId)) {
        newSet.delete(menuItemId)
      } else {
        newSet.add(menuItemId)
      }
      return newSet
    })
  }

  const addRecommendationsToCart = () => {
    const itemsToAdd: ParsedItem[] = recommendations
      .filter(rec => selectedRecommendations.has(rec.menuItemId))
      .map(rec => ({
        menuItemId: rec.menuItemId,
        name: rec.name,
        quantity: 1,
        price: rec.price,
        confidence: 1,
        originalText: rec.name,
      }))

    if (itemsToAdd.length > 0) {
      onOrderConfirmed(itemsToAdd)
    }
    reset()
  }

  const confirmOrder = () => {
    onOrderConfirmed(editedItems)
    reset()
  }

  const reset = () => {
    if (isRecordingRef.current && recognitionRef.current) {
      try { recognitionRef.current.abort() } catch (e) {}
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)

    isRecordingRef.current = false
    setState('ready')
    setTranscript('')
    setParsedItems([])
    setEditedItems([])
    setError(null)
    setRecordingTime(0)
    setRecommendations([])
    setAiMessage('')
    setSelectedRecommendations(new Set())
    onClose?.()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const total = editedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const recommendationTotal = recommendations
    .filter(rec => selectedRecommendations.has(rec.menuItemId))
    .reduce((sum, rec) => sum + rec.price, 0)

  if (!isSupported) {
    return (
      <div className={`fixed inset-0 bg-black/60 z-50 flex items-center justify-center ${className}`}>
        <div className="bg-white rounded-3xl p-6 mx-4 max-w-sm w-full shadow-2xl text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Browser tidak mendukung voice ordering</p>
          <button onClick={reset} className="px-6 py-3 bg-gray-100 rounded-xl text-gray-700 font-medium">
            Tutup
          </button>
        </div>
      </div>
    )
  }

  // Ready State
  if (state === 'ready') {
    return (
      <div className={`fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center ${className}`}>
        <div className="bg-gradient-to-b from-white to-violet-50 rounded-t-[32px] sm:rounded-3xl p-6 mx-0 sm:mx-4 max-w-md w-full shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-200">
                <Mic className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Pesan dengan Suara</h3>
                <p className="text-sm text-gray-500">Powered by AI</p>
              </div>
            </div>
            <button
              onClick={reset}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-white/80 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tips Section */}
          <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-violet-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                <HelpCircle className="w-4 h-4 text-violet-600" />
              </div>
              <span className="text-sm font-semibold text-gray-800">Cara menggunakan:</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-violet-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Pesan langsung</p>
                  <p className="text-xs text-gray-500">"Nasi goreng dua, es teh satu"</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-violet-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Minta rekomendasi</p>
                  <p className="text-xs text-gray-500">"Minuman dingin apa yang enak?"</p>
                </div>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={startRecording}
            className="w-full py-5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-violet-200 hover:shadow-2xl hover:shadow-violet-300 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
          >
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Mic className="w-6 h-6" />
            </div>
            Mulai Bicara
          </button>

          <p className="text-center text-xs text-gray-400 mt-4">
            Tekan tombol, lalu bicara dengan jelas
          </p>
        </div>
      </div>
    )
  }

  // Recording State
  if (state === 'recording') {
    const progressPercent = (recordingTime / MAX_RECORDING_TIME) * 100

    return (
      <div className={`fixed inset-0 bg-black/70 z-50 flex items-center justify-center ${className}`}>
        <div className="bg-white rounded-3xl p-8 mx-4 max-w-sm w-full shadow-2xl">
          <div className="text-center">
            {/* Animated Mic with Progress */}
            <div className="relative mx-auto w-32 h-32 mb-6">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="64" cy="64" r="58" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                <circle
                  cx="64" cy="64" r="58" fill="none" stroke="url(#gradient)" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 58}`}
                  strokeDashoffset={`${2 * Math.PI * 58 * (1 - progressPercent / 100)}`}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full animate-pulse shadow-lg shadow-red-200" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Mic className="w-12 h-12 text-white drop-shadow-lg" />
              </div>
            </div>

            <p className="text-2xl font-bold text-gray-900 mb-2">Mendengarkan...</p>
            <p className="text-sm text-gray-500 mb-2">{MAX_RECORDING_TIME - recordingTime} detik tersisa</p>

            {/* Live Transcript */}
            <div className="min-h-[80px] p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl mb-6 mt-4 border border-gray-200">
              {transcript ? (
                <p className="text-base text-gray-800 font-medium">"{transcript}"</p>
              ) : (
                <p className="text-base text-gray-400 italic">Bicara sekarang...</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={reset}
                className="flex-1 px-4 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
              >
                Batal
              </button>
              <button
                onClick={stopRecording}
                disabled={!transcript.trim()}
                className="flex-1 px-4 py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl transition-all flex items-center justify-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <MicOff className="w-5 h-5" />
                Selesai
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Processing State
  if (state === 'processing') {
    return (
      <div className={`fixed inset-0 bg-black/70 z-50 flex items-center justify-center ${className}`}>
        <div className="bg-white rounded-3xl p-8 mx-4 max-w-sm w-full shadow-2xl">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl flex items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-violet-600" />
            </div>
            <p className="text-xl font-bold text-gray-900 mb-2">Memproses...</p>
            <p className="text-sm text-gray-500 mb-6">AI sedang mengenali pesanan Anda</p>

            {transcript && (
              <div className="p-4 bg-gray-50 rounded-2xl text-left border border-gray-100">
                <p className="text-xs text-gray-500 mb-1 font-medium">Transkrip:</p>
                <p className="text-sm text-gray-700">"{transcript}"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Error State
  if (state === 'error') {
    return (
      <div className={`fixed inset-0 bg-black/70 z-50 flex items-center justify-center ${className}`}>
        <div className="bg-white rounded-3xl p-8 mx-4 max-w-sm w-full shadow-2xl">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-red-50 rounded-2xl flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <p className="text-xl font-bold text-gray-900 mb-2">Oops!</p>
            <p className="text-sm text-gray-600 mb-6">{error}</p>

            <div className="flex gap-3">
              <button
                onClick={reset}
                className="flex-1 px-4 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
              >
                Tutup
              </button>
              <button
                onClick={() => setState('ready')}
                className="flex-1 px-4 py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl transition-all flex items-center justify-center gap-2 font-semibold shadow-lg"
              >
                <RefreshCw className="w-5 h-5" />
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Recommendations State (NEW!)
  if (state === 'recommendations') {
    return (
      <div className={`fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center ${className}`}>
        <div className="bg-gradient-to-b from-white to-violet-50 rounded-t-[32px] sm:rounded-3xl p-6 mx-0 sm:mx-4 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Rekomendasi AI</h3>
                <p className="text-xs text-gray-500">Pilih menu yang Anda inginkan</p>
              </div>
            </div>
            <button onClick={reset} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-white/80">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* AI Message */}
          <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-violet-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-700">{aiMessage}</p>
              </div>
            </div>
          </div>

          {/* Transcript */}
          <div className="p-3 bg-white/60 rounded-xl mb-4 border border-violet-100">
            <p className="text-xs text-gray-500 mb-1">Anda berkata:</p>
            <p className="text-sm text-gray-700">"{transcript}"</p>
          </div>

          {/* Recommendation Items */}
          <div className="space-y-3 mb-4">
            {recommendations.map((rec) => {
              const isSelected = selectedRecommendations.has(rec.menuItemId)
              return (
                <button
                  key={rec.menuItemId}
                  onClick={() => toggleRecommendation(rec.menuItemId)}
                  className={`w-full p-4 rounded-2xl text-left transition-all ${
                    isSelected
                      ? 'bg-violet-500 text-white shadow-lg shadow-violet-200 scale-[1.02]'
                      : 'bg-white border border-gray-200 hover:border-violet-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                        {rec.name}
                      </p>
                      <p className={`text-sm mt-1 ${isSelected ? 'text-violet-100' : 'text-gray-500'}`}>
                        {rec.reason}
                      </p>
                      <p className={`text-sm font-bold mt-2 ${isSelected ? 'text-white' : 'text-violet-600'}`}>
                        {formatCurrency(rec.price)}
                      </p>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ml-3 ${
                      isSelected ? 'bg-white' : 'bg-violet-100'
                    }`}>
                      {isSelected ? (
                        <div className="w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <Plus className="w-5 h-5 text-violet-500" />
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Total if selected */}
          {selectedRecommendations.size > 0 && (
            <div className="flex items-center justify-between p-4 bg-white rounded-2xl mb-4 border border-violet-200">
              <span className="font-semibold text-gray-900">Total ({selectedRecommendations.size} item)</span>
              <span className="text-xl font-bold text-violet-600">{formatCurrency(recommendationTotal)}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => setState('ready')}
              className="flex-1 px-4 py-4 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-semibold"
            >
              <Mic className="w-5 h-5" />
              Bicara Lagi
            </button>
            <button
              onClick={addRecommendationsToCart}
              disabled={selectedRecommendations.size === 0}
              className="flex-1 px-4 py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl transition-all flex items-center justify-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              <ShoppingCart className="w-5 h-5" />
              Tambah
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Confirming State
  if (state === 'confirming') {
    return (
      <div className={`fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center ${className}`}>
        <div className="bg-gradient-to-b from-white to-green-50 rounded-t-[32px] sm:rounded-3xl p-6 mx-0 sm:mx-4 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Volume2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Pesanan Dikenali</h3>
                <p className="text-xs text-gray-500">Periksa dan sesuaikan jika perlu</p>
              </div>
            </div>
            <button onClick={reset} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-white/80">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Transcript */}
          <div className="p-3 bg-white/60 rounded-xl mb-4 border border-green-100">
            <p className="text-xs text-gray-500 mb-1">Anda berkata:</p>
            <p className="text-sm text-gray-700">"{transcript}"</p>
          </div>

          {/* Items */}
          {editedItems.length > 0 ? (
            <div className="space-y-3 mb-4">
              {editedItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(item.price)} x {item.quantity} = <span className="font-semibold text-green-600">{formatCurrency(item.price * item.quantity)}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 ml-3">
                    <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
                      <button
                        onClick={() => updateItemQuantity(index, -1)}
                        className="p-2 text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-bold text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => updateItemQuantity(index, 1)}
                        className="p-2 text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(index)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Semua item dihapus</p>
            </div>
          )}

          {/* Total */}
          {editedItems.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-white rounded-2xl mb-4 border border-green-200">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-green-600">{formatCurrency(total)}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => setState('ready')}
              className="flex-1 px-4 py-4 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-semibold"
            >
              <Mic className="w-5 h-5" />
              Ulang
            </button>
            <button
              onClick={confirmOrder}
              disabled={editedItems.length === 0}
              className="flex-1 px-4 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl transition-all flex items-center justify-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              <ShoppingCart className="w-5 h-5" />
              Tambah ke Keranjang
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
