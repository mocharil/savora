import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface OutletInfo {
  id: string
  name: string
  slug: string
  is_main: boolean
}

interface OutletStore {
  currentOutletId: string | null
  outlets: OutletInfo[]
  isLoading: boolean

  // Actions
  setCurrentOutlet: (outletId: string) => void
  setOutlets: (outlets: OutletInfo[]) => void
  setLoading: (loading: boolean) => void
  getCurrentOutlet: () => OutletInfo | null

  // Initialize from API
  initialize: () => Promise<void>
}

export const useOutletStore = create<OutletStore>()(
  persist(
    (set, get) => ({
      currentOutletId: null,
      outlets: [],
      isLoading: false,

      setCurrentOutlet: (outletId) => {
        set({ currentOutletId: outletId })

        // Also set a cookie for server-side access
        if (typeof document !== 'undefined') {
          document.cookie = `current_outlet=${outletId}; path=/; max-age=31536000`
        }
      },

      setOutlets: (outlets) => {
        set({ outlets })

        // If no current outlet selected, select the main one
        const state = get()
        if (!state.currentOutletId && outlets.length > 0) {
          const mainOutlet = outlets.find(o => o.is_main) || outlets[0]
          get().setCurrentOutlet(mainOutlet.id)
        }
      },

      setLoading: (loading) => set({ isLoading: loading }),

      getCurrentOutlet: () => {
        const { currentOutletId, outlets } = get()
        return outlets.find(o => o.id === currentOutletId) || null
      },

      initialize: async () => {
        const state = get()
        if (state.outlets.length > 0) return // Already initialized

        set({ isLoading: true })

        try {
          const response = await fetch('/api/outlets')
          if (response.ok) {
            const data = await response.json()
            const outlets: OutletInfo[] = (data.outlets || []).map((o: Record<string, unknown>) => ({
              id: o.id,
              name: o.name,
              slug: o.slug,
              is_main: o.is_main,
            }))

            set({ outlets })

            // Set default outlet if not set
            if (!state.currentOutletId && outlets.length > 0) {
              const mainOutlet = outlets.find(o => o.is_main) || outlets[0]
              get().setCurrentOutlet(mainOutlet.id)
            }
          }
        } catch (error) {
          console.error('Failed to fetch outlets:', error)
        } finally {
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'savora-outlet',
      partialize: (state) => ({
        currentOutletId: state.currentOutletId,
      }),
    }
  )
)
