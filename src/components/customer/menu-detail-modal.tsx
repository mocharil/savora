// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'
import {
  X,
  Plus,
  Minus,
  Star,
  UtensilsCrossed,
  ShoppingBag
} from 'lucide-react'
import { useCartStore } from '@/stores/cart-store'

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  discount_price: number | null
  image_url: string | null
  is_available: boolean
  is_featured: boolean
}

interface MenuDetailModalProps {
  item: MenuItem | null
  isOpen: boolean
  onClose: () => void
}

export function MenuDetailModal({ item, isOpen, onClose }: MenuDetailModalProps) {
  const { items: cartItems, addItem, updateQuantity } = useCartStore()
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const [isClosing, setIsClosing] = useState(false)

  // Get current quantity in cart - find by menuItemId
  const cartItem = item ? cartItems.find(i => i.menuItemId === item.id) : null
  const currentCartQty = cartItem?.quantity || 0

  // Reset state when modal opens with new item
  useEffect(() => {
    if (isOpen && item) {
      setQuantity(1)
      setNotes('')
      setIsClosing(false)
    }
  }, [isOpen, item?.id])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
    }, 300)
  }

  const handleAddToCart = () => {
    if (!item) return

    const displayPrice = item.discount_price || item.price

    if (currentCartQty > 0 && cartItem) {
      // Update existing item
      updateQuantity(cartItem.id, currentCartQty + quantity)
    } else {
      // Add new item with correct menuItemId
      addItem({
        menuItemId: item.id,
        name: item.name,
        price: displayPrice,
        image_url: item.image_url || undefined,
        notes: notes || undefined,
        quantity: quantity,
      })
    }

    handleClose()
  }

  const incrementQuantity = () => {
    if (quantity < 99) setQuantity(q => q + 1)
  }

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(q => q - 1)
  }

  if (!isOpen || !item) return null

  const displayPrice = item.discount_price || item.price
  const hasDiscount = item.discount_price !== null
  const totalPrice = displayPrice * quantity

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />

      {/* Bottom Sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-out ${
          isClosing ? 'translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="bg-white rounded-t-[24px] max-h-[90vh] overflow-hidden flex flex-col">
          {/* Drag Indicator */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-[#DADCE0] rounded-full" />
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/10 flex items-center justify-center z-10"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Image */}
            <div className="relative h-64 bg-[#F1F3F4]">
              {item.image_url ? (
                <Image
                  src={item.image_url}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UtensilsCrossed className="w-16 h-16 text-[#BDC1C6]" />
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                {item.is_featured && (
                  <span className="bg-[#FDCB6E] text-[#202124] text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Terlaris
                  </span>
                )}
              </div>

              {hasDiscount && (
                <span className="absolute top-4 right-4 bg-[#E74C3C] text-white text-sm font-bold px-3 py-1.5 rounded-lg">
                  -{Math.round(((item.price - item.discount_price!) / item.price) * 100)}%
                </span>
              )}
            </div>

            {/* Details */}
            <div className="p-5 space-y-4">
              {/* Header */}
              <div>
                <h2 className="text-2xl font-bold text-[#202124]">{item.name}</h2>

                {/* Price */}
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(displayPrice)}
                  </span>
                  {hasDiscount && (
                    <span className="text-base text-[#9AA0A6] line-through">
                      {formatCurrency(item.price)}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              {item.description && (
                <div>
                  <p className="text-[#5F6368] leading-relaxed">{item.description}</p>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-[#202124] mb-2">
                  Catatan Khusus
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Tidak pakai bawang, extra sambal..."
                  className="w-full h-24 px-4 py-3 bg-[#F8F9FA] rounded-xl text-sm text-[#202124] placeholder:text-[#9AA0A6] outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  maxLength={200}
                />
                <p className="text-xs text-[#9AA0A6] mt-1 text-right">
                  {notes.length}/200
                </p>
              </div>
            </div>
          </div>

          {/* Footer - Quantity & Add to Cart */}
          <div className="border-t border-[#F1F3F4] p-4 bg-white">
            <div className="flex items-center justify-between mb-4">
              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <button
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    quantity <= 1
                      ? 'bg-[#F1F3F4] text-[#BDC1C6]'
                      : 'bg-[#F1F3F4] text-[#5F6368] active:scale-95'
                  }`}
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-8 text-center text-xl font-bold text-[#202124]">
                  {quantity}
                </span>
                <button
                  onClick={incrementQuantity}
                  disabled={quantity >= 99}
                  className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center transition-all active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Total Price */}
              <div className="text-right">
                <p className="text-xs text-[#9AA0A6]">Total</p>
                <p className="text-xl font-bold text-primary">{formatCurrency(totalPrice)}</p>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="w-full h-14 rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-2 shadow-savora-lg transition-all active:scale-[0.98]"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Tambah ke Keranjang</span>
              <span className="mx-1">•</span>
              <span>{formatCurrency(totalPrice)}</span>
            </button>

            {/* Current Cart Info */}
            {currentCartQty > 0 && (
              <p className="text-center text-sm text-[#9AA0A6] mt-3">
                Sudah ada {currentCartQty} di keranjang
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
