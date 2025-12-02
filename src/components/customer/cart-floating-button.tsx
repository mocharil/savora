'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag, ChevronRight } from 'lucide-react'
import { useCartStore } from '@/stores/cart-store'
import { formatCurrency } from '@/lib/utils'

interface CartFloatingButtonProps {
  storeSlug: string
  outletSlug?: string
}

export function CartFloatingButton({ storeSlug, outletSlug }: CartFloatingButtonProps) {
  const { getTotalItems, getTotalAmount } = useCartStore()
  const [mounted, setMounted] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  const totalItems = getTotalItems()
  const totalAmount = getTotalAmount()

  // Animate when items change
  useEffect(() => {
    if (mounted && totalItems > 0) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 300)
      return () => clearTimeout(timer)
    }
  }, [totalItems, mounted])

  if (!mounted) return null

  if (totalItems === 0) return null

  // Don't show on cart or checkout pages
  if (pathname.includes('/cart') || pathname.includes('/checkout') || pathname.includes('/confirmation')) return null

  const cartUrl = outletSlug
    ? `/${storeSlug}/${outletSlug}/order/cart`
    : `/${storeSlug}/order/cart`

  return (
    <div className="fixed bottom-6 left-4 right-4 z-50 max-w-lg mx-auto">
      <Link
        href={cartUrl}
        className={`flex items-center justify-between w-full h-[60px] px-5 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 shadow-xl shadow-orange-300/50 transition-all duration-300 ${
          isAnimating ? 'scale-105' : 'scale-100'
        }`}
      >
        {/* Left - Icon with Badge */}
        <div className="relative">
          <ShoppingBag className="w-6 h-6 text-white" />
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-orange-600 text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
            {totalItems}
          </span>
        </div>

        {/* Center - Text */}
        <div className="flex-1 text-center">
          <span className="text-white font-semibold">Lihat Keranjang</span>
          <span className="text-white/80 text-sm ml-2">({totalItems} item)</span>
        </div>

        {/* Right - Total */}
        <div className="flex items-center gap-1">
          <span className="text-white font-bold">{formatCurrency(totalAmount)}</span>
          <ChevronRight className="w-5 h-5 text-white/80" />
        </div>
      </Link>
    </div>
  )
}
