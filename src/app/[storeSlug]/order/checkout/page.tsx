'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { useCartStore } from '@/stores/cart-store'
import { formatCurrency } from '@/lib/utils'
import {
  ArrowLeft,
  MapPin,
  ChevronDown,
  ChevronUp,
  Banknote,
  CreditCard,
  Wallet,
  AlertCircle,
  Loader2,
  UtensilsCrossed,
  Sparkles,
  ShieldCheck
} from 'lucide-react'
import Link from 'next/link'
import { PaymentMethod } from '@/types/database'

type LocalPaymentMethod = 'cash' | 'midtrans'

interface PaymentOption {
  id: LocalPaymentMethod
  name: string
  description: string
  icon: React.ReactNode
}

const paymentOptions: PaymentOption[] = [
  {
    id: 'cash',
    name: 'Tunai',
    description: 'Bayar di kasir',
    icon: <Banknote className="w-6 h-6" />,
  },
  {
    id: 'midtrans',
    name: 'Bayar Online',
    description: 'QRIS, GoPay, OVO, dll',
    icon: <Wallet className="w-6 h-6" />,
  },
]

// Store order IDs in localStorage for tracking
const TRACKED_ORDERS_KEY = 'savora-tracked-orders'

function saveOrderForTracking(orderId: string) {
  if (typeof window === 'undefined') return
  try {
    const stored = localStorage.getItem(TRACKED_ORDERS_KEY)
    const orders: string[] = stored ? JSON.parse(stored) : []
    if (!orders.includes(orderId)) {
      orders.unshift(orderId) // Add to beginning
      // Keep only last 20 orders
      localStorage.setItem(TRACKED_ORDERS_KEY, JSON.stringify(orders.slice(0, 20)))
    }
  } catch (e) {
    console.error('Failed to save order for tracking:', e)
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const params = useParams()
  const { items, storeId, tableId, getTotalAmount, clearCart } = useCartStore()

  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [customerNotes, setCustomerNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<LocalPaymentMethod>('cash')
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [tableInfo, setTableInfo] = useState<{ table_number: string; table_name: string | null } | null>(null)

  const storeSlug = params.storeSlug as string

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch table info via API
  useEffect(() => {
    async function fetchTableInfo() {
      if (tableId) {
        try {
          const response = await fetch(`/api/tables/${tableId}`)
          if (response.ok) {
            const data = await response.json()
            setTableInfo(data)
          }
        } catch (err) {
          console.error('Failed to fetch table info:', err)
        }
      }
    }
    fetchTableInfo()
  }, [tableId])

  // Redirect if cart is empty (using useEffect to avoid setState during render)
  useEffect(() => {
    if (mounted && items.length === 0) {
      router.push(`/${storeSlug}/order`)
    }
  }, [mounted, items.length, router, storeSlug])

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const totalAmount = getTotalAmount()

  // Show loading while redirecting
  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const handleCheckout = async () => {
    if (!storeId) {
      setError('Store ID tidak ditemukan')
      return
    }

    // Check for invalid cart items (missing menuItemId)
    const invalidItems = items.filter(item => !item.menuItemId)
    if (invalidItems.length > 0) {
      setError('Keranjang berisi item yang tidak valid. Silakan hapus keranjang dan pesan ulang.')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Create order via API
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId,
          tableId,
          items,
          customerNotes,
          paymentMethod,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Gagal membuat pesanan')
      }

      const { orderId } = result

      // Save order ID for tracking
      saveOrderForTracking(orderId)

      if (paymentMethod === 'midtrans') {
        const paymentResponse = await fetch('/api/payment/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        })

        if (!paymentResponse.ok) {
          throw new Error('Failed to create payment')
        }

        const { token } = await paymentResponse.json()

        if (window.snap) {
          window.snap.pay(token, {
            onSuccess: () => {
              clearCart()
              router.push(`/${storeSlug}/order/confirmation/${orderId}`)
            },
            onPending: () => {
              clearCart()
              router.push(`/${storeSlug}/order/confirmation/${orderId}`)
            },
            onError: () => {
              setError('Pembayaran gagal')
              setLoading(false)
            },
            onClose: () => {
              setLoading(false)
            },
          })
          return
        }
      }

      clearCart()
      router.push(`/${storeSlug}/order/confirmation/${orderId}`)
    } catch (err: unknown) {
      console.error('Checkout error:', err)
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses pesanan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pb-40">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-lg border-b border-orange-100/50 px-4 py-4">
        <div className="flex items-center gap-4">
          <Link
            href={`/${storeSlug}/order/cart`}
            className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center transition-all active:scale-95 hover:bg-orange-100"
          >
            <ArrowLeft className="w-5 h-5 text-orange-600" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Checkout</h1>
            <p className="text-sm text-gray-500">Selesaikan pesanan Anda</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Order Summary - Collapsible */}
        <div className="bg-white rounded-2xl shadow-md shadow-orange-100/30 overflow-hidden border border-orange-50">
          <button
            onClick={() => setShowOrderDetails(!showOrderDetails)}
            className="w-full px-4 py-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Ringkasan Pesanan</p>
                <p className="text-sm text-gray-500">{items.length} item</p>
              </div>
            </div>
            {showOrderDetails ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {showOrderDetails && (
            <div className="px-4 pb-4 space-y-3 border-t border-orange-100">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 pt-3">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                        <UtensilsCrossed className="w-5 h-5 text-orange-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 line-clamp-1">{item.name}</p>
                    {item.notes && (
                      <p className="text-xs text-gray-400 italic mt-0.5 line-clamp-1">{item.notes}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {formatCurrency(item.price)} x {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-sm text-gray-900">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Table Info */}
        {tableInfo && (
          <div className="bg-white rounded-2xl shadow-md shadow-orange-100/30 p-4 border border-orange-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Lokasi Meja</p>
                <p className="font-semibold text-gray-900">
                  Meja {tableInfo.table_number}
                  {tableInfo.table_name && ` - ${tableInfo.table_name}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Customer Notes */}
        <div className="bg-white rounded-2xl shadow-md shadow-orange-100/30 p-4 border border-orange-50">
          <p className="font-semibold text-gray-900 mb-3">Catatan Tambahan</p>
          <textarea
            value={customerNotes}
            onChange={(e) => setCustomerNotes(e.target.value)}
            placeholder="Tidak pakai es, pedas sedang, dll..."
            className="w-full h-20 px-4 py-3 bg-orange-50 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-orange-300 resize-none border border-orange-100"
            maxLength={500}
          />
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-2xl shadow-md shadow-orange-100/30 p-4 border border-orange-50">
          <p className="font-semibold text-gray-900 mb-4">Metode Pembayaran</p>
          <div className="space-y-3">
            {paymentOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setPaymentMethod(option.id)}
                className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
                  paymentMethod === option.id
                    ? 'border-orange-400 bg-orange-50'
                    : 'border-orange-100 hover:border-orange-200'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    paymentMethod === option.id ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white' : 'bg-orange-100 text-orange-600'
                  }`}
                >
                  {option.icon}
                </div>
                <div className="flex-1 text-left">
                  <p className={`font-medium ${paymentMethod === option.id ? 'text-orange-600' : 'text-gray-900'}`}>
                    {option.name}
                  </p>
                  <p className="text-sm text-gray-500">{option.description}</p>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === option.id ? 'border-orange-500' : 'border-gray-300'
                  }`}
                >
                  {paymentMethod === option.id && <div className="w-3 h-3 rounded-full bg-gradient-to-br from-orange-500 to-red-500" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl shadow-md shadow-orange-100/30 p-4 border border-orange-50">
          <p className="font-semibold text-gray-900 mb-4">Rincian Pembayaran</p>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Biaya Layanan</span>
              <span className="text-green-600 font-medium">Gratis</span>
            </div>
            <div className="pt-3 border-t border-orange-100 flex justify-between">
              <span className="font-bold text-gray-900">Total</span>
              <span className="text-xl font-bold text-orange-600">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
          <ShieldCheck className="w-4 h-4" />
          <span>Pembayaran aman dan terlindungi</span>
        </div>
      </div>

      {/* Fixed Bottom - Checkout Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-orange-100 z-50">
        <div className="max-w-lg mx-auto p-4">
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="flex items-center justify-center w-full h-14 px-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-lg shadow-orange-300/50 transition-all active:scale-[0.98] hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 text-white animate-spin mr-2" />
                <span className="text-white font-semibold">Memproses...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-white/80 mr-2" />
                <span className="text-white font-semibold">Konfirmasi Pesanan</span>
                <span className="text-white/60 mx-2">•</span>
                <span className="text-white font-bold">{formatCurrency(totalAmount)}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
