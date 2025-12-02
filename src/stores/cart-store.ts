import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  menuItemId: string
  name: string
  price: number
  quantity: number
  notes?: string
  image_url?: string
}

interface CartStore {
  items: CartItem[]
  storeId: string | null
  storeSlug: string | null
  outletId: string | null
  outletSlug: string | null
  tableId: string | null

  // Actions
  setContext: (context: {
    storeId: string
    storeSlug: string
    outletId?: string | null
    outletSlug?: string | null
    tableId?: string | null
  }) => void
  addItem: (item: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  updateNotes: (id: string, notes: string) => void
  clearCart: () => void
  setTableId: (tableId: string | null) => void

  // Computed
  getTotalItems: () => number
  getTotalAmount: () => number
  getCartUrl: () => string
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      storeId: null,
      storeSlug: null,
      outletId: null,
      outletSlug: null,
      tableId: null,

      setContext: (context) => {
        const currentStoreId = get().storeId
        const currentOutletId = get().outletId

        // Clear cart if switching to different store or outlet
        const isNewStore = currentStoreId && currentStoreId !== context.storeId
        const isNewOutlet = context.outletId && currentOutletId && currentOutletId !== context.outletId

        if (isNewStore || isNewOutlet) {
          set({
            items: [],
            storeId: context.storeId,
            storeSlug: context.storeSlug,
            outletId: context.outletId || null,
            outletSlug: context.outletSlug || null,
            tableId: context.tableId || null,
          })
        } else {
          set({
            storeId: context.storeId,
            storeSlug: context.storeSlug,
            outletId: context.outletId || get().outletId,
            outletSlug: context.outletSlug || get().outletSlug,
            tableId: context.tableId || get().tableId,
          })
        }
      },

      addItem: (item) => {
        const items = get().items
        const existingItem = items.find((i) => i.menuItemId === item.menuItemId)

        if (existingItem) {
          set({
            items: items.map((i) =>
              i.menuItemId === item.menuItemId
                ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                : i
            ),
          })
        } else {
          set({
            items: [
              ...items,
              {
                ...item,
                id: crypto.randomUUID(),
                quantity: item.quantity || 1,
              },
            ],
          })
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) })
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        })
      },

      updateNotes: (id, notes) => {
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, notes } : i
          ),
        })
      },

      clearCart: () => set({
        items: [],
        tableId: null,
      }),

      setTableId: (tableId) => set({ tableId }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalAmount: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        )
      },

      getCartUrl: () => {
        const { storeSlug, outletSlug } = get()
        if (storeSlug && outletSlug) {
          return `/${storeSlug}/${outletSlug}/order/cart`
        }
        return '/cart'
      },
    }),
    {
      name: 'savora-cart',
      partialize: (state) => ({
        items: state.items,
        storeId: state.storeId,
        storeSlug: state.storeSlug,
        outletId: state.outletId,
        outletSlug: state.outletSlug,
        tableId: state.tableId,
      }),
    }
  )
)
