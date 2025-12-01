'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { useCartStore } from '@/stores/cart-store'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, generateOrderNumber } from '@/lib/utils'
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
  UtensilsCrossed
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

export default function CheckoutPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
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

  // Fetch table info
  useEffect(() => {
    async function fetchTableInfo() {
      if (tableId) {
        const { data } = await supabase
          .from('tables')
          .select('table_number, table_name')
          .eq('id', tableId)
          .single()
        if (data) setTableInfo(data)
      }
    }
    fetchTableInfo()
  }, [tableId, supabase])

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const totalAmount = getTotalAmount()

  if (items.length === 0) {
    router.push(`/${storeSlug}/order`)
    return null
  }

  const handleCheckout = async () => {
    if (!storeId) {
      setError('Store ID tidak ditemukan')
      return
    }

    setLoading(true)
    setError('')

    try {
      const orderNumber = generateOrderNumber()
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          store_id: storeId,
          table_id: tableId,
          order_number: orderNumber,
          subtotal: totalAmount,
          total: totalAmount,
          status: 'pending',
          notes: customerNotes || null,
        })
        .select()
        .single()

      if (orderError) throw orderError

      const orderItems = items.map((item) => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity,
        notes: item.notes || null,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          order_id: order.id,
          amount: totalAmount,
          payment_method: paymentMethod as PaymentMethod,
          status: 'pending',
        })

      if (paymentError) throw paymentError

      if (paymentMethod === 'midtrans') {
        const response = await fetch('/api/payment/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: order.id }),
        })

        if (!response.ok) {
          throw new Error('Failed to create payment')
        }

        const { token } = await response.json()

        if (window.snap) {
          window.snap.pay(token, {
            onSuccess: () => {
              clearCart()
              router.push(`/${storeSlug}/order/confirmation/${order.id}`)
            },
            onPending: () => {
              clearCart()
              router.push(`/${storeSlug}/order/confirmation/${order.id}`)
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
      router.push(`/${storeSlug}/order/confirmation/${order.id}`)
    } catch (err: unknown) {
      console.error('Checkout error:', err)
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses pesanan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pb-36">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-white px-4 py-4 shadow-savora-sm">
        <div className="flex items-center gap-4">
          <Link
            href={`/${storeSlug}/order/cart`}
            className="w-10 h-10 rounded-full bg-[#F1F3F4] flex items-center justify-center transition-transform active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-[#5F6368]" />
          </Link>
          <h1 className="text-lg font-bold text-[#202124]">Checkout</h1>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Error Message */}
        {error && (
          <div className="bg-[#E74C3C]/10 border border-[#E74C3C] rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#E74C3C] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#E74C3C]">{error}</p>
          </div>
        )}

        {/* Order Summary - Collapsible */}
        <div className="bg-white rounded-2xl shadow-savora-card overflow-hidden">
          <button
            onClick={() => setShowOrderDetails(!showOrderDetails)}
            className="w-full px-4 py-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-[#202124]">Ringkasan Pesanan</p>
                <p className="text-sm text-[#9AA0A6]">{items.length} item</p>
              </div>
            </div>
            {showOrderDetails ? (
              <ChevronUp className="w-5 h-5 text-[#9AA0A6]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#9AA0A6]" />
            )}
          </button>

          {showOrderDetails && (
            <div className="px-4 pb-4 space-y-3 border-t border-[#F1F3F4]">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 pt-3">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#F1F3F4] flex items-center justify-center">
                        <UtensilsCrossed className="w-5 h-5 text-[#BDC1C6]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-[#202124] line-clamp-1">{item.name}</p>
                    {item.notes && (
                      <p className="text-xs text-[#9AA0A6] italic mt-0.5 line-clamp-1">{item.notes}</p>
                    )}
                    <p className="text-xs text-[#5F6368] mt-1">
                      {formatCurrency(item.price)} x {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-sm text-[#202124]">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Table Info */}
        {tableInfo && (
          <div className="bg-white rounded-2xl shadow-savora-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0984E3]/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-[#0984E3]" />
              </div>
              <div>
                <p className="text-sm text-[#9AA0A6]">Lokasi Meja</p>
                <p className="font-semibold text-[#202124]">
                  Meja {tableInfo.table_number}
                  {tableInfo.table_name && ` - ${tableInfo.table_name}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Customer Notes */}
        <div className="bg-white rounded-2xl shadow-savora-card p-4">
          <p className="font-semibold text-[#202124] mb-3">Catatan Tambahan</p>
          <textarea
            value={customerNotes}
            onChange={(e) => setCustomerNotes(e.target.value)}
            placeholder="Tidak pakai es, pedas sedang, dll..."
            className="w-full h-20 px-4 py-3 bg-[#F8F9FA] rounded-xl text-sm text-[#202124] placeholder:text-[#9AA0A6] outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            maxLength={500}
          />
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-2xl shadow-savora-card p-4">
          <p className="font-semibold text-[#202124] mb-4">Metode Pembayaran</p>
          <div className="space-y-3">
            {paymentOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setPaymentMethod(option.id)}
                className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
                  paymentMethod === option.id
                    ? 'border-primary bg-primary/5'
                    : 'border-[#E8EAED] hover:border-[#DADCE0]'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    paymentMethod === option.id ? 'bg-primary text-white' : 'bg-[#F1F3F4] text-[#5F6368]'
                  }`}
                >
                  {option.icon}
                </div>
                <div className="flex-1 text-left">
                  <p className={`font-medium ${paymentMethod === option.id ? 'text-primary' : 'text-[#202124]'}`}>
                    {option.name}
                  </p>
                  <p className="text-sm text-[#9AA0A6]">{option.description}</p>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === option.id ? 'border-primary' : 'border-[#DADCE0]'
                  }`}
                >
                  {paymentMethod === option.id && <div className="w-3 h-3 rounded-full bg-primary" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl shadow-savora-card p-4">
          <p className="font-semibold text-[#202124] mb-4">Rincian Pembayaran</p>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#5F6368]">Subtotal</span>
              <span className="text-[#202124]">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#5F6368]">Biaya Layanan</span>
              <span className="text-[#00B894]">Gratis</span>
            </div>
            <div className="pt-3 border-t border-[#F1F3F4] flex justify-between">
              <span className="font-bold text-[#202124]">Total</span>
              <span className="text-xl font-bold text-primary">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom - Checkout Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-savora-bottom z-50">
        <div className="max-w-lg mx-auto p-4">
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="flex items-center justify-center w-full h-14 px-6 bg-primary rounded-xl shadow-savora-lg transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 text-white animate-spin mr-2" />
                <span className="text-white font-semibold">Memproses...</span>
              </>
            ) : (
              <>
                <span className="text-white font-semibold">Konfirmasi Pesanan</span>
                <span className="text-white/80 mx-2">•</span>
                <span className="text-white font-bold">{formatCurrency(totalAmount)}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
