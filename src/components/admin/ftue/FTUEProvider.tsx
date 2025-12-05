'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface FTUEStep {
  id: string
  title: string
  description: string
  href: string
  isCompleted: boolean
  checkPath: string // API path to check completion
  isOptional?: boolean // Optional steps can be skipped
}

interface FTUEContextType {
  steps: FTUEStep[]
  currentStep: FTUEStep | null
  completedCount: number
  totalCount: number
  requiredCount: number
  requiredCompletedCount: number
  isAllCompleted: boolean
  isRequiredCompleted: boolean
  isFTUEDismissed: boolean
  refreshSteps: () => Promise<void>
  dismissFTUE: () => void
  showFTUE: () => void
}

const FTUEContext = createContext<FTUEContextType | null>(null)

export function useFTUE() {
  const context = useContext(FTUEContext)
  if (!context) {
    throw new Error('useFTUE must be used within a FTUEProvider')
  }
  return context
}

const DEFAULT_STEPS: FTUEStep[] = [
  {
    id: 'outlet',
    title: 'Buat Outlet Pertama',
    description: 'Tambahkan lokasi pertama bisnis Anda',
    href: '/admin/outlets',
    isCompleted: false,
    checkPath: '/api/admin/ftue/check-outlets',
  },
  {
    id: 'categories',
    title: 'Buat Kategori Menu',
    description: 'Kelompokkan menu dalam kategori',
    href: '/admin/menu?tab=categories',
    isCompleted: false,
    checkPath: '/api/admin/ftue/check-categories',
  },
  {
    id: 'menu',
    title: 'Tambahkan Menu',
    description: 'Buat produk yang akan dijual',
    href: '/admin/menu',
    isCompleted: false,
    checkPath: '/api/admin/ftue/check-menu',
  },
  {
    id: 'tables',
    title: 'Atur Meja & QR',
    description: 'Buat meja dan generate QR code',
    href: '/admin/tables',
    isCompleted: false,
    checkPath: '/api/admin/ftue/check-tables',
  },
  {
    id: 'users',
    title: 'Undang Staff',
    description: 'Tambahkan user untuk mengelola outlet',
    href: '/admin/users',
    isCompleted: false,
    checkPath: '/api/admin/ftue/check-users',
    isOptional: true,
  },
]

interface FTUEProviderProps {
  children: ReactNode
  initialData?: {
    hasOutlet: boolean
    hasCategories: boolean
    hasMenu: boolean
    hasTables: boolean
    hasUsers: boolean
  }
}

export function FTUEProvider({ children, initialData }: FTUEProviderProps) {
  const [steps, setSteps] = useState<FTUEStep[]>(() => {
    if (initialData) {
      return DEFAULT_STEPS.map(step => ({
        ...step,
        isCompleted:
          (step.id === 'outlet' && initialData.hasOutlet) ||
          (step.id === 'categories' && initialData.hasCategories) ||
          (step.id === 'menu' && initialData.hasMenu) ||
          (step.id === 'tables' && initialData.hasTables) ||
          (step.id === 'users' && initialData.hasUsers),
      }))
    }
    return DEFAULT_STEPS
  })
  const [isFTUEDismissed, setIsFTUEDismissed] = useState(false)

  useEffect(() => {
    // Check localStorage for dismissed state
    const dismissed = localStorage.getItem('ftue_dismissed')
    if (dismissed === 'true') {
      setIsFTUEDismissed(true)
    }
  }, [])

  const refreshSteps = async () => {
    try {
      const response = await fetch('/api/admin/ftue/status')
      if (response.ok) {
        const data = await response.json()
        setSteps(prev =>
          prev.map(step => ({
            ...step,
            isCompleted:
              (step.id === 'outlet' && data.hasOutlet) ||
              (step.id === 'categories' && data.hasCategories) ||
              (step.id === 'menu' && data.hasMenu) ||
              (step.id === 'tables' && data.hasTables) ||
              (step.id === 'users' && data.hasUsers),
          }))
        )
      }
    } catch (error) {
      console.error('Error refreshing FTUE steps:', error)
    }
  }

  const dismissFTUE = () => {
    setIsFTUEDismissed(true)
    localStorage.setItem('ftue_dismissed', 'true')
  }

  const showFTUE = () => {
    setIsFTUEDismissed(false)
    localStorage.removeItem('ftue_dismissed')
  }

  const completedCount = steps.filter(s => s.isCompleted).length
  const totalCount = steps.length
  const requiredSteps = steps.filter(s => !s.isOptional)
  const requiredCount = requiredSteps.length
  const requiredCompletedCount = requiredSteps.filter(s => s.isCompleted).length
  const isAllCompleted = completedCount === totalCount
  const isRequiredCompleted = requiredCompletedCount === requiredCount
  const currentStep = steps.find(s => !s.isCompleted) || null

  return (
    <FTUEContext.Provider
      value={{
        steps,
        currentStep,
        completedCount,
        totalCount,
        requiredCount,
        requiredCompletedCount,
        isAllCompleted,
        isRequiredCompleted,
        isFTUEDismissed,
        refreshSteps,
        dismissFTUE,
        showFTUE,
      }}
    >
      {children}
    </FTUEContext.Provider>
  )
}
