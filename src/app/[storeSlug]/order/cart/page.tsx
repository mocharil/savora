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
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'

export default function CartPage() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const { items, updateQuantity, updateNotes, removeItem, getTotalAmount } = useCartStore()
  const [mounted, setMounted] = useState(false)
  const [editingNotes, setEditingNotes] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const totalAmount = getTotalAmount()
  const storeSlug = params.storeSlug as string

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="w-40 h-40 bg-[#F1F3F4] rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-16 h-16 text-[#BDC1C6]" />
        </div>
        <h2 className="text-xl font-semibold text-[#202124] mb-2">Keranjang Masih Kosong</h2>
        <p className="text-[#9AA0A6] text-center mb-6">Yuk, pilih menu favoritmu!</p>
        <Link
          href={`/${storeSlug}/order`}
          className="px-6 py-3 bg-primary text-white rounded-xl font-semibold transition-transform active:scale-95"
        >
          Lihat Menu
        </Link>
      </div>
    )
  }

  return (
    <div className="pb-36">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-white px-4 py-4 shadow-savora-sm">
        <div className="flex items-center gap-4">
          <Link
            href={`/${storeSlug}/order`}
            className="w-10 h-10 rounded-full bg-[#F1F3F4] flex items-center justify-center transition-transform active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-[#5F6368]" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-[#202124]">Keranjang</h1>
            <p className="text-sm text-[#9AA0A6]">{items.length} item</p>
          </div>
        </div>
      </div>

      {/* Cart Items */}
      <div className="px-4 pt-4 space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-savora-card p-4 transition-all duration-300"
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
                  <div className="w-full h-full bg-[#F1F3F4] flex items-center justify-center">
                    <UtensilsCrossed className="w-6 h-6 text-[#BDC1C6]" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-[#202124] line-clamp-2">{item.name}</h3>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-[#E74C3C] hover:bg-[#E74C3C]/10 rounded-lg transition-colors"
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
                      className="w-full text-sm text-[#5F6368] bg-[#F8F9FA] rounded-lg p-2 outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      rows={2}
                      maxLength={200}
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingNotes(item.id)}
                    className="mt-1 flex items-center gap-1 text-xs text-[#9AA0A6] hover:text-primary transition-colors"
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
                  <p className="font-bold text-primary">{formatCurrency(item.price * item.quantity)}</p>

                  {/* Quantity Selector */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-[#F1F3F4] text-[#5F6368] flex items-center justify-center transition-transform active:scale-95"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-6 text-center font-bold text-[#202124]">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center transition-transform active:scale-95"
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
          className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-[#E8EAED] rounded-xl text-[#5F6368] font-medium hover:border-primary hover:text-primary transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tambah Menu Lain
        </Link>
      </div>

      {/* Fixed Bottom - Order Summary & Checkout */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-savora-bottom z-50">
        <div className="max-w-lg mx-auto p-4 space-y-4">
          {/* Order Summary */}
          <div className="bg-[#F8F9FA] rounded-xl p-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#5F6368]">Subtotal</span>
              <span className="text-[#202124]">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#E8EAED]">
              <span className="font-bold text-[#202124]">Total</span>
              <span className="text-xl font-bold text-primary">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={() => router.push(`/${storeSlug}/order/checkout`)}
            className="flex items-center justify-between w-full h-14 px-6 bg-primary rounded-xl shadow-savora-lg transition-transform active:scale-[0.98]"
          >
            <span className="text-white font-semibold">Lanjut ke Pembayaran</span>
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
