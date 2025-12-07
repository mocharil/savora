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
} from 'lucide-react'

interface ParsedItem {
  menuItemId: string
  name: string
  quantity: number
  price: number
  confidence: number
  originalText: string
}

interface VoiceOrderButtonProps {
  storeId: string
  outletId?: string
  onOrderConfirmed: (items: ParsedItem[]) => void
  onClose?: () => void
  className?: string
}

type RecordingState = 'ready' | 'recording' | 'processing' | 'confirming' | 'error'

export function VoiceOrderButton({
  storeId,
  outletId,
  onOrderConfirmed,
  onClose,
  className = '',
}: VoiceOrderButtonProps) {
  const [state, setState] = useState<RecordingState>('ready')
  const [transcript, setTranscript] = useState('')
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(true)
  const [editedItems, setEditedItems] = useState<ParsedItem[]>([])
  const [showTips, setShowTips] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)

  const recognitionRef = useRef<any>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isRecordingRef = useRef(false)

  const MAX_RECORDING_TIME = 30 // seconds

  // Request microphone permission
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
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('Mikrofon tidak ditemukan. Pastikan perangkat Anda memiliki mikrofon.')
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('Mikrofon sedang digunakan aplikasi lain.')
      } else {
        setError(`Gagal mengakses mikrofon: ${err.message}`)
      }
      setState('error')
      return false
    }
  }

  // Initialize speech recognition
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

      if (event.error === 'not-allowed') {
        setError('Akses mikrofon ditolak. Mohon izinkan akses mikrofon.')
      } else if (event.error === 'no-speech') {
        setError('Tidak terdengar suara. Coba bicara lebih dekat ke mikrofon.')
      } else if (event.error === 'audio-capture') {
        setError('Mikrofon tidak terdeteksi.')
      } else if (event.error === 'network') {
        setError('Koneksi internet bermasalah.')
      } else {
        setError(`Terjadi kesalahan: ${event.error}`)
      }
      setState('error')
    }

    recognition.onstart = () => {
      isRecordingRef.current = true
    }

    recognition.onend = () => {
      isRecordingRef.current = false
      // Don't auto-process, let user click "Selesai"
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch (e) {
          // Ignore
        }
      }
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
      isRecordingRef.current = false
    }
  }, [])

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setError('Browser tidak mendukung pengenalan suara')
      return
    }

    if (isRecordingRef.current) return

    setTranscript('')
    setError(null)
    setParsedItems([])
    setRecordingTime(0)

    const hasPermission = await requestMicrophonePermission()
    if (!hasPermission) return

    setState('recording')

    try {
      recognitionRef.current?.start()

      // Start recording timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= MAX_RECORDING_TIME - 1) {
            stopRecording()
            return MAX_RECORDING_TIME
          }
          return prev + 1
        })
      }, 1000)

      // Auto-stop after max time
      timeoutRef.current = setTimeout(() => {
        stopRecording()
      }, MAX_RECORDING_TIME * 1000)

    } catch (err: any) {
      if (err.name === 'InvalidStateError') {
        console.warn('Recognition already started')
        return
      }
      console.error('Start recording error:', err)
      setError('Gagal memulai perekaman')
      setState('error')
    }
  }, [isSupported])

  const stopRecording = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)

    try {
      recognitionRef.current?.stop()
    } catch (err) {
      console.error('Stop recording error:', err)
    }

    // Process if there's transcript
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
        body: JSON.stringify({
          transcript,
          storeId,
          outletId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gagal memproses pesanan')
      }

      if (data.parsed.items.length === 0) {
        setError('Menu tidak dikenali. Coba sebutkan nama menu yang lebih jelas.')
        setState('error')
        return
      }

      setParsedItems(data.parsed.items)
      setEditedItems(data.parsed.items)
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

  const confirmOrder = () => {
    onOrderConfirmed(editedItems)
    reset()
  }

  const reset = () => {
    if (isRecordingRef.current && recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch (e) {
        // Ignore
      }
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

  if (!isSupported) {
    return (
      <div className={`fixed inset-0 bg-black/60 z-50 flex items-center justify-center ${className}`}>
        <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Browser tidak mendukung voice ordering</p>
          <button onClick={reset} className="px-6 py-2 bg-gray-100 rounded-lg text-gray-700">
            Tutup
          </button>
        </div>
      </div>
    )
  }

  // Ready State - Initial screen with tips
  if (state === 'ready') {
    return (
      <div className={`fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center ${className}`}>
        <div className="bg-white rounded-t-3xl sm:rounded-2xl p-6 mx-0 sm:mx-4 max-w-md w-full shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Pesan dengan Suara</h3>
                <p className="text-sm text-gray-500">AI akan mengenali pesanan Anda</p>
              </div>
            </div>
            <button
              onClick={reset}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tips Section */}
          <div className="bg-violet-50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle className="w-4 h-4 text-violet-600" />
              <span className="text-sm font-semibold text-violet-800">Contoh cara bicara:</span>
            </div>
            <div className="space-y-2 text-sm text-violet-700">
              <p>"<span className="font-medium">Nasi goreng dua, es teh satu</span>"</p>
              <p>"<span className="font-medium">Saya mau mie ayam tiga porsi</span>"</p>
              <p>"<span className="font-medium">Bakso dua mangkok sama es jeruk</span>"</p>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={startRecording}
            className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
          >
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Mic className="w-5 h-5" />
            </div>
            Mulai Bicara
          </button>

          <p className="text-center text-xs text-gray-400 mt-4">
            Tekan tombol di atas, lalu sebutkan pesanan Anda
          </p>
        </div>
      </div>
    )
  }

  // Recording State
  if (state === 'recording') {
    const progressPercent = (recordingTime / MAX_RECORDING_TIME) * 100

    return (
      <div className={`fixed inset-0 bg-black/60 z-50 flex items-center justify-center ${className}`}>
        <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl">
          <div className="text-center">
            {/* Animated Mic with Progress */}
            <div className="relative mx-auto w-28 h-28 mb-4">
              {/* Progress Ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="52"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="6"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="52"
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 52}`}
                  strokeDashoffset={`${2 * Math.PI * 52 * (1 - progressPercent / 100)}`}
                  className="transition-all duration-1000"
                />
              </svg>
              {/* Pulsing Background */}
              <div className="absolute inset-3 bg-red-500 rounded-full animate-pulse" />
              {/* Mic Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Mic className="w-10 h-10 text-white" />
              </div>
            </div>

            <p className="text-xl font-bold text-gray-900 mb-1">
              Mendengarkan...
            </p>
            <p className="text-sm text-gray-500 mb-1">
              {MAX_RECORDING_TIME - recordingTime} detik tersisa
            </p>

            {/* Live Transcript */}
            <div className="min-h-[60px] p-3 bg-gray-50 rounded-xl mb-4 mt-4">
              {transcript ? (
                <p className="text-sm text-gray-700">"{transcript}"</p>
              ) : (
                <p className="text-sm text-gray-400 italic">Bicara sekarang...</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={reset}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Batal
              </button>
              <button
                onClick={stopRecording}
                disabled={!transcript.trim()}
                className="flex-1 px-4 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MicOff className="w-4 h-4" />
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
      <div className={`fixed inset-0 bg-black/60 z-50 flex items-center justify-center ${className}`}>
        <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-violet-100 rounded-2xl flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
            </div>
            <p className="text-lg font-bold text-gray-900 mb-2">
              Memproses Pesanan
            </p>
            <p className="text-sm text-gray-500 mb-4">
              AI sedang mengenali menu...
            </p>

            {transcript && (
              <div className="p-3 bg-gray-50 rounded-xl text-left">
                <p className="text-xs text-gray-500 mb-1">Transkrip:</p>
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
      <div className={`fixed inset-0 bg-black/60 z-50 flex items-center justify-center ${className}`}>
        <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-2xl flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-lg font-bold text-gray-900 mb-2">
              Gagal Memproses
            </p>
            <p className="text-sm text-gray-600 mb-6">{error}</p>

            <div className="flex gap-3">
              <button
                onClick={reset}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Tutup
              </button>
              <button
                onClick={() => setState('ready')}
                className="flex-1 px-4 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Confirming State
  if (state === 'confirming') {
    return (
      <div className={`fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center ${className}`}>
        <div className="bg-white rounded-t-3xl sm:rounded-2xl p-6 mx-0 sm:mx-4 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Pesanan Dikenali</h3>
                <p className="text-xs text-gray-500">Periksa dan sesuaikan jika perlu</p>
              </div>
            </div>
            <button
              onClick={reset}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Transcript */}
          <div className="p-3 bg-gray-50 rounded-xl mb-4">
            <p className="text-xs text-gray-500 mb-1">Anda berkata:</p>
            <p className="text-sm text-gray-700">"{transcript}"</p>
          </div>

          {/* Items */}
          {editedItems.length > 0 ? (
            <div className="space-y-3 mb-4">
              {editedItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(item.price)} x {item.quantity} = {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 ml-3">
                    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg">
                      <button
                        onClick={() => updateItemQuantity(index, -1)}
                        className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-bold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateItemQuantity(index, 1)}
                        className="p-2 text-gray-500 hover:text-gray-700"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(index)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <X className="w-4 h-4" />
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
            <div className="flex items-center justify-between p-4 bg-violet-50 rounded-xl mb-4">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="text-xl font-bold text-violet-600">
                {formatCurrency(total)}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => setState('ready')}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Mic className="w-4 h-4" />
              Ulang
            </button>
            <button
              onClick={confirmOrder}
              disabled={editedItems.length === 0}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              <ShoppingCart className="w-4 h-4" />
              Tambah ke Keranjang
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
