'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  Sparkles,
  X,
  Send,
  Loader2,
  ShoppingCart,
  ChevronDown,
  Bot,
  User,
  Plus,
  Minus,
  Check,
  ChefHat,
  Star,
  CreditCard,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/stores/cart-store'
import { formatCurrency } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  recommendations?: RecommendedItem[]
}

interface RecommendedItem {
  id: string
  name: string
  reason: string
  price: number
  discount_price: number | null
  description: string | null
  category: string
  image_url?: string | null
}

interface AIRecommendationProps {
  storeId: string
  outletId?: string
  storeSlug: string
  outletSlug?: string
  theme?: {
    primaryColor?: string
  }
  onOpenChange?: (isOpen: boolean) => void
}

// Parse markdown bold (**text**) to React elements
function parseMarkdownBold(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-semibold">{part.slice(2, -2)}</strong>
    }
    return part
  })
}

const QUICK_PROMPTS = [
  { label: 'Rendah kalori', prompt: 'Saya cari makanan yang rendah kalori' },
  { label: 'Pedas', prompt: 'Rekomendasikan menu yang pedas' },
  { label: 'Vegetarian', prompt: 'Ada menu vegetarian apa?' },
  { label: 'Best seller', prompt: 'Apa menu yang paling populer?' },
]

export function AIRecommendation({
  storeId,
  outletId,
  storeSlug,
  outletSlug,
  theme,
  onOpenChange,
}: AIRecommendationProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { addItem, items, updateQuantity, removeItem, getTotalItems, getTotalAmount } = useCartStore()

  const primaryColor = theme?.primaryColor || '#10b981'

  // Notify parent when open state changes
  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open)
    onOpenChange?.(open)
  }, [onOpenChange])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Add initial greeting when opening
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'greeting',
          role: 'assistant',
          content: 'Halo! Saya bisa membantu merekomendasikan menu yang cocok untuk kamu. Ceritakan preferensi makananmu, misalnya:\n\n• "Saya mau makanan gurih tapi rendah kalori"\n• "Rekomendasikan menu pedas"\n• "Ada makanan untuk vegetarian?"\n\nApa yang sedang kamu cari?',
        },
      ])
    }
  }, [isOpen, messages.length])

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim()
    if (!text || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Prepare conversation history (last 6 messages for context)
      const conversationHistory = messages.slice(-6).map(m => ({
        role: m.role,
        content: m.content,
      }))

      const response = await fetch('/api/customer/ai-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          storeId,
          outletId,
          conversationHistory,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        recommendations: data.recommended_items,
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = (item: RecommendedItem) => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.discount_price || item.price,
    })
  }

  const handleDecreaseQuantity = (menuItemId: string) => {
    const cartItem = items.find(i => i.menuItemId === menuItemId)
    if (cartItem) {
      if (cartItem.quantity <= 1) {
        removeItem(cartItem.id) // Use cart item's id, not menuItemId
      } else {
        updateQuantity(cartItem.id, cartItem.quantity - 1) // Use cart item's id
      }
    }
  }

  const handleIncreaseQuantity = (item: RecommendedItem) => {
    const cartItem = items.find(i => i.menuItemId === item.id)
    if (cartItem) {
      updateQuantity(cartItem.id, cartItem.quantity + 1) // Use cart item's id
    } else {
      handleAddToCart(item)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Floating Button - positioned above cart button (bottom-24 = 96px, above cart's bottom-6 = 24px + 60px height) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => handleOpenChange(true)}
            className="fixed bottom-[100px] right-4 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white"
            style={{ backgroundColor: primaryColor }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Sparkles className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-[10px] font-bold text-yellow-900">AI</span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => handleOpenChange(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />

            {/* Chat Panel */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col"
            >
              {/* Header */}
              <div
                className="px-4 py-3 rounded-t-3xl flex items-center justify-between"
                style={{ backgroundColor: primaryColor }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-white">
                    <h3 className="font-semibold">AI Food Assistant</h3>
                    <p className="text-xs opacity-90">Rekomendasi menu personal</p>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenChange(false)}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[50vh]">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${primaryColor}20` }}
                      >
                        <Bot className="w-4 h-4" style={{ color: primaryColor }} />
                      </div>
                    )}

                    <div className={`max-w-[85%] ${message.role === 'user' ? 'order-first' : ''}`}>
                      <div
                        className={`rounded-2xl px-4 py-2.5 ${
                          message.role === 'user'
                            ? 'text-white rounded-br-md'
                            : 'bg-gray-100 text-gray-800 rounded-bl-md'
                        }`}
                        style={message.role === 'user' ? { backgroundColor: primaryColor } : {}}
                      >
                        <p className="text-sm whitespace-pre-wrap">{parseMarkdownBold(message.content)}</p>
                      </div>

                      {/* Recommendations - Modern Menu Cards */}
                      {message.recommendations && message.recommendations.length > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-xs font-medium text-gray-600">Menu Rekomendasi</span>
                          </div>
                          <div className="space-y-3">
                            {message.recommendations.map((item) => {
                              const cartItem = items.find(i => i.menuItemId === item.id)
                              const quantityInCart = cartItem?.quantity || 0
                              return (
                                <motion.div
                                  key={item.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden"
                                >
                                  <div className="flex">
                                    {/* Menu Image */}
                                    <div className="w-24 h-24 relative flex-shrink-0 bg-gray-100">
                                      {item.image_url ? (
                                        <Image
                                          src={item.image_url}
                                          alt={item.name}
                                          fill
                                          className="object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <ChefHat className="w-8 h-8 text-gray-300" />
                                        </div>
                                      )}
                                      {item.discount_price && (
                                        <div className="absolute top-1 left-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                          PROMO
                                        </div>
                                      )}
                                    </div>

                                    {/* Menu Info */}
                                    <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                                      <div>
                                        <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">
                                          {item.name}
                                        </h4>
                                        <span
                                          className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-1"
                                          style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                                        >
                                          {item.category}
                                        </span>
                                        <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 italic">
                                          "{item.reason}"
                                        </p>
                                      </div>

                                      <div className="flex items-center justify-between mt-2 gap-2">
                                        <div className="flex-shrink-0">
                                          <span
                                            className="font-bold text-sm"
                                            style={{ color: primaryColor }}
                                          >
                                            {formatCurrency(item.discount_price || item.price)}
                                          </span>
                                          {item.discount_price && (
                                            <span className="text-gray-400 line-through text-[10px] ml-1">
                                              {formatCurrency(item.price)}
                                            </span>
                                          )}
                                        </div>
                                        {quantityInCart > 0 ? (
                                          <div
                                            className="flex items-center gap-1 rounded-full overflow-hidden"
                                            style={{ backgroundColor: primaryColor }}
                                          >
                                            <motion.button
                                              onClick={() => handleDecreaseQuantity(item.id)}
                                              className="w-7 h-7 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                                              whileTap={{ scale: 0.9 }}
                                            >
                                              <Minus className="w-3 h-3" />
                                            </motion.button>
                                            <span className="text-white text-xs font-bold min-w-[20px] text-center">
                                              {quantityInCart}
                                            </span>
                                            <motion.button
                                              onClick={() => handleIncreaseQuantity(item)}
                                              className="w-7 h-7 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                                              whileTap={{ scale: 0.9 }}
                                            >
                                              <Plus className="w-3 h-3" />
                                            </motion.button>
                                          </div>
                                        ) : (
                                          <motion.button
                                            onClick={() => handleAddToCart(item)}
                                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold text-white flex-shrink-0"
                                            style={{ backgroundColor: primaryColor }}
                                            whileTap={{ scale: 0.95 }}
                                          >
                                            <Plus className="w-3 h-3" />
                                            <span>Tambah</span>
                                          </motion.button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}20` }}
                    >
                      <Bot className="w-4 h-4" style={{ color: primaryColor }} />
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts */}
              {messages.length <= 1 && (
                <div className="px-4 pb-2">
                  <p className="text-xs text-gray-500 mb-2">Coba tanya:</p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_PROMPTS.map((prompt) => (
                      <button
                        key={prompt.label}
                        onClick={() => handleSend(prompt.prompt)}
                        disabled={isLoading}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-700 transition-colors disabled:opacity-50"
                      >
                        {prompt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Cart Summary & Checkout */}
              {getTotalItems() > 0 && (
                <div className="mx-4 mb-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">
                        {getTotalItems()} item di keranjang
                      </span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: primaryColor }}>
                      {formatCurrency(getTotalAmount())}
                    </span>
                  </div>
                  <motion.button
                    onClick={() => {
                      handleOpenChange(false)
                      const cartUrl = outletSlug
                        ? `/${storeSlug}/${outletSlug}/order/cart`
                        : `/${storeSlug}/order/cart`
                      router.push(cartUrl)
                    }}
                    className="w-full py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2"
                    style={{ backgroundColor: primaryColor }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <CreditCard className="w-4 h-4" />
                    Lanjut ke Pembayaran
                  </motion.button>
                </div>
              )}

              {/* Input */}
              <div className="p-4 pt-0 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Cari rekomendasi menu..."
                    className="flex-1 px-4 py-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isLoading}
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-3 pt-3 border-t border-gray-100">
                  <span className="text-[10px] text-gray-400">Powered by</span>
                  <a
                    href="https://savora.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] font-semibold text-orange-500 hover:text-orange-600 transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Savora AI
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
