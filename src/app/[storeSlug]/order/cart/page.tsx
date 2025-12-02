'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname, useParams } from 'next/navigation'
import Image from 'next/image'
import { useCartStore } from '@/stores/cart-store'
import { formatCurrency } from '@/lib/utils'
import {
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  ShoppingBag,
  UtensilsCrossed,
  Pencil,
  ChevronRight,
  Sparkles,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

export default function CartPage() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const { items, updateQuantity, updateNotes, removeItem, getTotalAmount, clearCart } = useCartStore()
  const [mounted, setMounted] = useState(false)
  const [editingNotes, setEditingNotes] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    // Debug: log cart items
    console.log('Cart items:', JSON.stringify(items, null, 2))
  }, [items])

  const totalAmount = getTotalAmount()
  const storeSlug = params.storeSlug as string

  // Check for invalid items (missing menuItemId)
  const invalidItems = items.filter(item => !item.menuItemId)
  const hasInvalidItems = invalidItems.length > 0

  // Debug: log invalid items
  if (hasInvalidItems) {
    console.log('Invalid items found:', invalidItems)
  }

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="w-40 h-40 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-16 h-16 text-orange-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Keranjang Masih Kosong</h2>
        <p className="text-gray-500 text-center mb-6">Yuk, pilih menu favoritmu!</p>
        <Link
          href={`/${storeSlug}/order`}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold shadow-lg shadow-orange-200 transition-all active:scale-95 hover:shadow-xl"
        >
          Lihat Menu
        </Link>
      </div>
    )
  }

  return (
    <div className="pb-40">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-lg border-b border-orange-100/50 px-4 py-4">
        <div className="flex items-center gap-4">
          <Link
            href={`/${storeSlug}/order`}
            className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center transition-all active:scale-95 hover:bg-orange-100"
          >
            <ArrowLeft className="w-5 h-5 text-orange-600" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Keranjang</h1>
            <p className="text-sm text-gray-500">{items.length} item</p>
          </div>
        </div>
      </div>

      {/* Invalid Items Warning */}
      {hasInvalidItems && (
        <div className="px-4 pt-4">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-700 font-medium">Keranjang berisi item yang tidak valid</p>
                <p className="text-xs text-red-600 mt-1">Silakan hapus keranjang dan pesan ulang menu.</p>
                <button
                  onClick={() => {
                    clearCart()
                    router.push(`/${storeSlug}/order`)
                  }}
                  className="mt-3 px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-xl hover:bg-red-600 transition-colors"
                >
                  Hapus Keranjang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Items */}
      <div className="px-4 pt-4 space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow-md shadow-orange-100/30 p-4 transition-all duration-300 border border-orange-50"
          >
            <div className="flex gap-3">
              {/* Image */}
              <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                    <UtensilsCrossed className="w-6 h-6 text-orange-300" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">{item.name}</h3>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Notes */}
                {editingNotes === item.id ? (
                  <div className="mt-2">
                    <textarea
                      autoFocus
                      value={item.notes || ''}
                      onChange={(e) => updateNotes(item.id, e.target.value)}
                      onBlur={() => setEditingNotes(null)}
                      placeholder="Catatan khusus (opsional)"
                      className="w-full text-sm text-gray-600 bg-orange-50 rounded-xl p-2 outline-none focus:ring-2 focus:ring-orange-300 resize-none border border-orange-100"
                      rows={2}
                      maxLength={200}
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingNotes(item.id)}
                    className="mt-1 flex items-center gap-1 text-xs text-gray-400 hover:text-orange-600 transition-colors"
                  >
                    <Pencil className="w-3 h-3" />
                    {item.notes ? (
                      <span className="italic line-clamp-1">{item.notes}</span>
                    ) : (
                      <span>Tambah catatan</span>
                    )}
                  </button>
                )}

                {/* Price and Quantity */}
                <div className="flex justify-between items-center mt-3">
                  <p className="font-bold text-orange-600">{formatCurrency(item.price * item.quantity)}</p>

                  {/* Quantity Selector */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center transition-transform active:scale-95"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-6 text-center font-bold text-gray-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 text-white flex items-center justify-center transition-transform active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add More Button */}
      <div className="px-4 pt-4">
        <Link
          href={`/${storeSlug}/order`}
          className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-orange-200 rounded-2xl text-orange-600 font-medium hover:border-orange-400 hover:bg-orange-50 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tambah Menu Lain
        </Link>
      </div>

      {/* Fixed Bottom - Order Summary & Checkout */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-orange-100 z-50">
        <div className="max-w-lg mx-auto p-4 space-y-3">
          {/* Order Summary */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4 border border-orange-100">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-orange-200/50">
              <span className="font-bold text-gray-900">Total</span>
              <span className="text-xl font-bold text-orange-600">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={() => router.push(`/${storeSlug}/order/checkout`)}
            className="flex items-center justify-between w-full h-14 px-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-lg shadow-orange-300/50 transition-all active:scale-[0.98] hover:shadow-xl"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-white/80" />
              <span className="text-white font-semibold">Lanjut ke Pembayaran</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold">{formatCurrency(totalAmount)}</span>
              <ChevronRight className="w-5 h-5 text-white/80" />
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
