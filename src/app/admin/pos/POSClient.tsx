'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { PageTourButton } from '@/components/admin/tour'
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CreditCard,
  Banknote,
  QrCode,
  User,
  MapPin,
  CheckCircle,
  X,
  Loader2,
  Receipt,
  ChefHat,
  AlertCircle
} from 'lucide-react'

interface Category {
  id: string
  name: string
}

interface MenuItem {
  id: string
  name: string
  price: number
  image_url: string | null
  is_available: boolean
  category_id: string
  category: { name: string } | null
}

interface Table {
  id: string
  table_number: number
  status: string
}

interface CartItem {
  menuItem: MenuItem
  quantity: number
  notes?: string
}

interface POSClientProps {
  categories: Category[]
  menuItems: MenuItem[]
  tables: Table[]
  storeId: string
}

export function POSClient({ categories, menuItems, tables, storeId }: POSClientProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerName, setCustomerName] = useState('')
  const [selectedTable, setSelectedTable] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris' | 'card'>('cash')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [warningMessage, setWarningMessage] = useState('')
  const [createdOrderNumber, setCreatedOrderNumber] = useState('')
  const [cashAmount, setCashAmount] = useState<string>('')
  const [changeAmount, setChangeAmount] = useState<number>(0)

  // Filter menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = !selectedCategory || item.category_id === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [menuItems, searchQuery, selectedCategory])

  // Group menu items by category
  const groupedItems = useMemo(() => {
    const groups: { category: Category; items: MenuItem[] }[] = []

    // If a specific category is selected, just return that
    if (selectedCategory) {
      const category = categories.find(c => c.id === selectedCategory)
      if (category) {
        groups.push({
          category,
          items: filteredItems
        })
      }
      return groups
    }

    // Group by category
    categories.forEach(category => {
      const categoryItems = filteredItems.filter(item => item.category_id === category.id)
      if (categoryItems.length > 0) {
        groups.push({
          category,
          items: categoryItems
        })
      }
    })

    // Add uncategorized items if any
    const uncategorizedItems = filteredItems.filter(item => !item.category_id || !categories.find(c => c.id === item.category_id))
    if (uncategorizedItems.length > 0) {
      groups.push({
        category: { id: 'uncategorized', name: 'Lainnya' },
        items: uncategorizedItems
      })
    }

    return groups
  }, [filteredItems, categories, selectedCategory])

  // Cart calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0)
  const tax = Math.round(subtotal * 0.11) // 11% PPN
  const total = subtotal + tax

  // Add to cart
  const addToCart = (menuItem: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(item => item.menuItem.id === menuItem.id)
      if (existing) {
        return prev.map(item =>
          item.menuItem.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { menuItem, quantity: 1 }]
    })
  }

  // Update quantity
  const updateQuantity = (menuItemId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.menuItem.id === menuItemId) {
          const newQty = item.quantity + delta
          return newQty > 0 ? { ...item, quantity: newQty } : item
        }
        return item
      }).filter(item => item.quantity > 0)
    })
  }

  // Remove from cart
  const removeFromCart = (menuItemId: string) => {
    setCart(prev => prev.filter(item => item.menuItem.id !== menuItemId))
  }

  // Clear cart
  const clearCart = () => {
    setCart([])
    setCustomerName('')
    setSelectedTable('')
    setCashAmount('')
    setChangeAmount(0)
  }

  // Handle cash amount input
  const handleCashAmountChange = (value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '')
    setCashAmount(numericValue)

    const cashNum = parseInt(numericValue) || 0
    if (cashNum >= total) {
      setChangeAmount(cashNum - total)
    } else {
      setChangeAmount(0)
    }
  }

  // Quick cash buttons
  const quickCashAmounts = [
    { label: 'Uang Pas', value: total },
    { label: 'Rp 50.000', value: 50000 },
    { label: 'Rp 100.000', value: 100000 },
    { label: 'Rp 150.000', value: 150000 },
    { label: 'Rp 200.000', value: 200000 },
  ]

  // Show warning modal
  const showWarningModal = (message: string) => {
    setWarningMessage(message)
    setShowWarning(true)
  }

  // Check if take away is selected
  const isTakeAway = selectedTable === 'takeaway'

  // Submit order
  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      showWarningModal('Keranjang masih kosong. Silakan tambahkan menu terlebih dahulu.')
      return
    }
    if (!selectedTable) {
      showWarningModal('Silakan pilih Meja atau Take Away terlebih dahulu sebelum membuat pesanan.')
      return
    }
    if (paymentMethod === 'cash' && (!cashAmount || parseInt(cashAmount) < total)) {
      showWarningModal('Jumlah uang tunai tidak mencukupi. Silakan masukkan jumlah yang benar.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/admin/pos/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId,
          tableId: isTakeAway ? null : selectedTable,
          isTakeAway,
          customerName: customerName || (isTakeAway ? 'Take Away' : 'Walk-in Customer'),
          paymentMethod,
          items: cart.map(item => ({
            menuItemId: item.menuItem.id,
            quantity: item.quantity,
            notes: item.notes || ''
          })),
          subtotal,
          tax,
          total
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create order')
      }

      const data = await response.json()
      setCreatedOrderNumber(data.orderNumber)
      setShowSuccess(true)

      // Reset after 3 seconds
      setTimeout(() => {
        setShowSuccess(false)
        clearCart()
        router.refresh()
      }, 3000)

    } catch (error) {
      console.error('Error creating order:', error)
      showWarningModal('Gagal membuat pesanan. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Warning modal
  const WarningModal = () => {
    if (!showWarning) return null
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Perhatian</h2>
          <p className="text-gray-600 mb-6">{warningMessage}</p>
          <button
            onClick={() => setShowWarning(false)}
            className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all"
          >
            Mengerti
          </button>
        </div>
      </div>
    )
  }

  // Success modal
  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pesanan Berhasil!</h2>
          <p className="text-gray-600 mb-2">
            Nomor Pesanan: <span className="font-bold text-orange-600">#{createdOrderNumber}</span>
          </p>

          {/* Show change amount for cash payment */}
          {paymentMethod === 'cash' && changeAmount > 0 && (
            <div className="my-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <p className="text-sm text-emerald-700 mb-1">Kembalian</p>
              <p className="text-3xl font-bold text-emerald-600">{formatCurrency(changeAmount)}</p>
            </div>
          )}

          <p className="text-sm text-gray-500">Pesanan akan segera diproses...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <WarningModal />
      <div className="flex h-[calc(100vh-4rem)] -m-4 md:-m-6">
      {/* Left: Menu Grid */}
      <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4" data-tour="pos-header">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Point of Sale</h1>
                <p className="text-sm text-gray-500">Kasir - Buat Pesanan Baru</p>
              </div>
            </div>
            <PageTourButton />
          </div>

          {/* Search */}
          <div className="relative" data-tour="pos-search">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 hide-scrollbar" data-tour="pos-categories">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                !selectedCategory
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Semua
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid - Grouped by Category */}
        <div className="flex-1 overflow-y-auto p-4" data-tour="pos-menu-grid">
          {groupedItems.length > 0 ? (
            <div className="space-y-6">
              {groupedItems.map(group => (
                <div key={group.category.id}>
                  {/* Category Header */}
                  <div className="sticky top-0 z-10 bg-gray-50 pb-3 -mx-4 px-4 pt-1">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-1 rounded-full bg-gradient-to-b from-orange-500 to-amber-500" />
                      <h3 className="text-base font-bold text-gray-900">{group.category.name}</h3>
                      <span className="text-xs font-medium text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">
                        {group.items.length} menu
                      </span>
                    </div>
                  </div>

                  {/* Menu Items Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {group.items.map(item => {
                      const inCart = cart.find(c => c.menuItem.id === item.id)

                      return (
                        <button
                          key={item.id}
                          onClick={() => addToCart(item)}
                          className={`group relative bg-white rounded-xl border-2 p-3 text-left transition-all hover:shadow-lg ${
                            inCart ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-100 hover:border-orange-300'
                          }`}
                        >
                          {/* Image */}
                          <div className="aspect-square rounded-lg bg-gray-100 mb-3 overflow-hidden relative">
                            {item.image_url ? (
                              <Image
                                src={item.image_url}
                                alt={item.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ChefHat className="w-8 h-8 text-gray-300" />
                              </div>
                            )}
                            {inCart && (
                              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">
                                {inCart.quantity}
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">{item.name}</p>
                          <p className="text-sm font-bold text-orange-600">{formatCurrency(item.price)}</p>

                          {/* Quick add indicator */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                            <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg">
                              <Plus className="w-5 h-5" />
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ChefHat className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500">Menu tidak ditemukan</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Cart */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col" data-tour="pos-cart">
        {/* Cart Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-gray-600" />
              <h2 className="font-semibold text-gray-900">Keranjang</h2>
              {cart.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 text-xs font-medium">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} item
                </span>
              )}
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-sm text-red-500 hover:text-red-600"
              >
                Hapus Semua
              </button>
            )}
          </div>
        </div>

        {/* Customer Info */}
        <div className="p-4 border-b border-gray-200 space-y-3" data-tour="pos-customer-info">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Nama Pelanggan</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Opsional"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Meja / Take Away *</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none bg-white"
              >
                <option value="">Pilih Meja / Take Away</option>
                <option value="takeaway" className="font-semibold text-orange-600">🥡 Take Away (Bungkus)</option>
                <optgroup label="Dine In (Makan di Tempat)">
                  {tables.map(table => (
                    <option key={table.id} value={table.id}>
                      Meja {table.table_number} {table.status === 'occupied' ? '(Terisi)' : '(Kosong)'}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
            {isTakeAway && (
              <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                <span>🥡</span> Pesanan Take Away - tidak memerlukan meja
              </p>
            )}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">Keranjang kosong</p>
              <p className="text-gray-400 text-xs mt-1">Klik menu untuk menambahkan</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.menuItem.id} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                  {/* Image */}
                  <div className="w-14 h-14 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0 relative">
                    {item.menuItem.image_url ? (
                      <Image
                        src={item.menuItem.image_url}
                        alt={item.menuItem.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ChefHat className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.menuItem.name}</p>
                    <p className="text-sm text-orange-600 font-semibold">
                      {formatCurrency(item.menuItem.price * item.quantity)}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.menuItem.id, -1)}
                        className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.menuItem.id, 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(item.menuItem.id)}
                    className="text-gray-400 hover:text-red-500 self-start"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Method - Always visible for tour, but content changes based on cart */}
        <div className="p-4 border-t border-gray-200" data-tour="pos-payment">
          <label className="text-xs font-medium text-gray-500 mb-2 block">Metode Pembayaran</label>
          {cart.length === 0 ? (
            <div className="text-center py-4 text-gray-400 text-sm">
              Tambahkan menu ke keranjang untuk memilih metode pembayaran
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'cash', label: 'Tunai', icon: Banknote },
                  { id: 'qris', label: 'QRIS', icon: QrCode },
                  { id: 'card', label: 'Kartu', icon: CreditCard },
                ].map(method => (
                  <button
                    key={method.id}
                    onClick={() => {
                      setPaymentMethod(method.id as any)
                      if (method.id !== 'cash') {
                        setCashAmount('')
                        setChangeAmount(0)
                      }
                    }}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                      paymentMethod === method.id
                        ? 'border-orange-500 bg-orange-50 text-orange-600'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <method.icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{method.label}</span>
                  </button>
                ))}
              </div>

              {/* Cash Payment Input */}
              {paymentMethod === 'cash' && (
                <div className="mt-4 space-y-3">
                  {/* Quick Amount Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {quickCashAmounts.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => {
                          setCashAmount(item.value.toString())
                          setChangeAmount(item.value >= total ? item.value - total : 0)
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          parseInt(cashAmount) === item.value
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {/* Cash Input */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Jumlah Uang Diterima</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">Rp</span>
                      <input
                        type="text"
                        value={cashAmount ? parseInt(cashAmount).toLocaleString('id-ID') : ''}
                        onChange={(e) => handleCashAmountChange(e.target.value.replace(/\./g, ''))}
                        placeholder="0"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-right text-lg font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Change Display */}
                  {parseInt(cashAmount) > 0 && (
                    <div className={`p-3 rounded-xl ${
                      parseInt(cashAmount) >= total
                        ? 'bg-emerald-50 border border-emerald-200'
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      {parseInt(cashAmount) >= total ? (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-emerald-700">Kembalian</span>
                          <span className="text-xl font-bold text-emerald-600">
                            {formatCurrency(changeAmount)}
                          </span>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-red-700">Kurang</span>
                          <span className="text-xl font-bold text-red-600">
                            {formatCurrency(total - parseInt(cashAmount))}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Totals & Checkout */}
        <div className="p-4 border-t border-gray-200 bg-gray-50" data-tour="pos-checkout">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">PPN (11%)</span>
              <span className="text-gray-900">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
              <span className="text-gray-900">Total</span>
              <span className="text-orange-600">{formatCurrency(total)}</span>
            </div>
          </div>

          <button
            onClick={handleSubmitOrder}
            disabled={cart.length === 0 || isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:from-orange-600 hover:to-amber-600 transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <Receipt className="w-5 h-5" />
                Buat Pesanan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
    </>
  )
}
