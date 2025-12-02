'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import {
  Mic,
  MicOff,
  Loader2,
  X,
  Check,
  AlertCircle,
  Volume2,
  Plus,
  Minus,
  ShoppingCart,
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
  autoStart?: boolean
}

type RecordingState = 'idle' | 'recording' | 'processing' | 'confirming' | 'error'

export function VoiceOrderButton({
  storeId,
  outletId,
  onOrderConfirmed,
  onClose,
  className = '',
  autoStart = true,
}: VoiceOrderButtonProps) {
  const [state, setState] = useState<RecordingState>(autoStart ? 'recording' : 'idle')
  const [transcript, setTranscript] = useState('')
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(true)
  const [editedItems, setEditedItems] = useState<ParsedItem[]>([])

  const recognitionRef = useRef<any>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isRecordingRef = useRef(false)

  // Check browser support
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
    recognition.lang = 'id-ID' // Indonesian

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
      // Ignore "aborted" error - this happens when we intentionally stop/abort recognition
      if (event.error === 'aborted') {
        isRecordingRef.current = false
        return
      }

      console.error('Speech recognition error:', event.error)
      isRecordingRef.current = false
      if (event.error === 'not-allowed') {
        setError('Akses mikrofon ditolak. Mohon izinkan akses mikrofon.')
      } else if (event.error === 'no-speech') {
        setError('Tidak terdengar suara. Silakan coba lagi.')
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi.')
      }
      setState('error')
    }

    recognition.onstart = () => {
      isRecordingRef.current = true
    }

    recognition.onend = () => {
      isRecordingRef.current = false
      if (state === 'recording') {
        // Auto-stop after silence
        processTranscript()
      }
    }

    recognitionRef.current = recognition

    // Auto-start recording if autoStart is true
    if (autoStart) {
      try {
        recognition.start()
        // Auto-stop after 10 seconds of recording
        timeoutRef.current = setTimeout(() => {
          try {
            recognition.stop()
          } catch (e) {
            console.error('Auto-stop error:', e)
          }
        }, 10000)
      } catch (err) {
        console.error('Auto-start recording error:', err)
        setError('Gagal memulai perekaman')
        setState('error')
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch (e) {
          // Ignore abort errors
        }
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      isRecordingRef.current = false
    }
  }, [autoStart])

  const startRecording = useCallback(() => {
    if (!isSupported) {
      setError('Browser tidak mendukung pengenalan suara')
      return
    }

    // Don't start if already recording
    if (isRecordingRef.current) {
      return
    }

    setTranscript('')
    setError(null)
    setParsedItems([])
    setState('recording')

    try {
      recognitionRef.current?.start()

      // Auto-stop after 10 seconds of recording
      timeoutRef.current = setTimeout(() => {
        stopRecording()
      }, 10000)
    } catch (err: any) {
      // Handle "already started" error gracefully
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
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    try {
      recognitionRef.current?.stop()
    } catch (err) {
      console.error('Stop recording error:', err)
    }

    if (transcript) {
      processTranscript()
    } else {
      setState('idle')
    }
  }, [transcript])

  const processTranscript = async () => {
    if (!transcript.trim()) {
      setError('Tidak ada suara yang terdeteksi')
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
        setError('Tidak ada menu yang dikenali. Silakan coba lagi dengan menyebutkan nama menu yang jelas.')
        setState('error')
        return
      }

      setParsedItems(data.parsed.items)
      setEditedItems(data.parsed.items)
      setState('confirming')
    } catch (err: any) {
      console.error('Process transcript error:', err)
      setError(err.message || 'Gagal memproses pesanan suara')
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
    // Stop recognition if running
    if (isRecordingRef.current && recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch (e) {
        // Ignore abort errors
      }
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    isRecordingRef.current = false
    setState('idle')
    setTranscript('')
    setParsedItems([])
    setEditedItems([])
    setError(null)
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
      <div className={`text-center text-gray-500 text-sm ${className}`}>
        Browser tidak mendukung voice ordering
      </div>
    )
  }

  // Idle State - Mic Button
  if (state === 'idle') {
    return (
      <button
        onClick={startRecording}
        className={`flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-full font-medium shadow-lg hover:shadow-xl hover:from-violet-600 hover:to-purple-700 transition-all ${className}`}
      >
        <Mic className="w-5 h-5" />
        <span>Pesan dengan Suara</span>
      </button>
    )
  }

  // Recording State
  if (state === 'recording') {
    return (
      <div className={`fixed inset-0 bg-black/60 z-50 flex items-center justify-center ${className}`}>
        <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl">
          <div className="text-center">
            {/* Animated Mic */}
            <div className="relative mx-auto w-24 h-24 mb-4">
              <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-25" />
              <div className="absolute inset-2 bg-red-500 rounded-full animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Mic className="w-10 h-10 text-white" />
              </div>
            </div>

            <p className="text-lg font-semibold text-gray-900 mb-2">
              Mendengarkan...
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Sebutkan pesanan Anda
            </p>

            {/* Live Transcript */}
            {transcript && (
              <div className="p-3 bg-gray-100 rounded-lg mb-4 text-left">
                <p className="text-sm text-gray-700">"{transcript}"</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={reset}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={stopRecording}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
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
            <Loader2 className="w-12 h-12 animate-spin text-violet-600 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-900 mb-2">
              Memproses Pesanan...
            </p>
            <p className="text-sm text-gray-500">
              AI sedang mengenali menu dari suara Anda
            </p>

            {transcript && (
              <div className="mt-4 p-3 bg-gray-100 rounded-lg text-left">
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
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900 mb-2">
              Gagal Memproses
            </p>
            <p className="text-sm text-gray-500 mb-4">{error}</p>

            <div className="flex gap-3">
              <button
                onClick={reset}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Tutup
              </button>
              <button
                onClick={startRecording}
                className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center justify-center gap-2"
              >
                <Mic className="w-4 h-4" />
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
        <div className="bg-white rounded-t-2xl sm:rounded-2xl p-6 mx-0 sm:mx-4 max-w-md w-full shadow-2xl max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-violet-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Pesanan Dikenali
              </h3>
            </div>
            <button
              onClick={reset}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Transcript */}
          <div className="p-3 bg-gray-100 rounded-lg mb-4">
            <p className="text-xs text-gray-500 mb-1">Anda berkata:</p>
            <p className="text-sm text-gray-700">"{transcript}"</p>
          </div>

          {/* Items */}
          <div className="space-y-3 mb-4">
            {editedItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(item.price)} x {item.quantity}
                  </p>
                </div>

                <div className="flex items-center gap-2 ml-3">
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg">
                    <button
                      onClick={() => updateItemQuantity(index, -1)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateItemQuantity(index, 1)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(index)}
                    className="p-1 text-red-400 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between p-3 bg-violet-50 rounded-lg mb-4">
            <span className="font-medium text-gray-900">Total</span>
            <span className="text-lg font-bold text-violet-600">
              {formatCurrency(total)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={startRecording}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Mic className="w-4 h-4" />
              Ulang
            </button>
            <button
              onClick={confirmOrder}
              disabled={editedItems.length === 0}
              className="flex-1 px-4 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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
