'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react'
import { usePathname } from 'next/navigation'
import { TourConfig, TourStep, getTourById, ALL_TOURS, getTourTargetPath } from './tour-config'

interface TourState {
  isActive: boolean
  currentTour: TourConfig | null
  currentStepIndex: number
  completedTours: string[]
  seenTours: string[]
}

interface TourContextType {
  // State
  isActive: boolean
  currentTour: TourConfig | null
  currentStep: TourStep | null
  currentStepIndex: number
  totalSteps: number
  completedTours: string[]
  hasCompletedFTUE: boolean
  pendingTour: string | null

  // Actions
  startTour: (tourId: string) => void
  nextStep: () => void
  prevStep: () => void
  skipTour: () => void
  endTour: () => void
  resetFTUE: () => void
  markTourSeen: (tourId: string) => void
  hasTourBeenSeen: (tourId: string) => boolean
  setPendingTour: (tourId: string | null) => void
}

const TourContext = createContext<TourContextType | null>(null)

const STORAGE_KEY = 'savora_tour_state'

interface StoredTourState {
  completedTours: string[]
  seenTours: string[]
  hasCompletedFTUE: boolean
}

function loadStoredState(): StoredTourState {
  if (typeof window === 'undefined') {
    return { completedTours: [], seenTours: [], hasCompletedFTUE: false }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load tour state:', e)
  }

  return { completedTours: [], seenTours: [], hasCompletedFTUE: false }
}

function saveStoredState(state: StoredTourState) {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('Failed to save tour state:', e)
  }
}

interface TourProviderProps {
  children: ReactNode
  autoStartFTUE?: boolean
}

export function TourProvider({ children, autoStartFTUE = true }: TourProviderProps) {
  const pathname = usePathname()
  const [state, setState] = useState<TourState>({
    isActive: false,
    currentTour: null,
    currentStepIndex: 0,
    completedTours: [],
    seenTours: [],
  })
  const [hasCompletedFTUE, setHasCompletedFTUE] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [pendingTour, setPendingTourState] = useState<string | null>(null)

  // Load stored state on mount
  useEffect(() => {
    const stored = loadStoredState()
    setState(prev => ({
      ...prev,
      completedTours: stored.completedTours,
      seenTours: stored.seenTours,
    }))
    setHasCompletedFTUE(stored.hasCompletedFTUE)
    setIsInitialized(true)
  }, [])

  // Auto-start FTUE for new users
  useEffect(() => {
    if (isInitialized && autoStartFTUE && !hasCompletedFTUE && !state.isActive) {
      // Delay to let the page render first
      const timer = setTimeout(() => {
        startTour('ftue_main')
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [isInitialized, autoStartFTUE, hasCompletedFTUE, state.isActive])

  // Handle pending tour after navigation
  useEffect(() => {
    if (!pendingTour || !isInitialized) return

    const targetPath = getTourTargetPath(pendingTour)
    const tourIdToStart = pendingTour // Capture the tour ID before clearing

    // Check if we're on the correct page
    if (!targetPath || !pathname.includes(targetPath)) return

    // Start the tour after a small delay to let the page render
    const timer = setTimeout(() => {
      const tour = getTourById(tourIdToStart)
      if (tour) {
        // Clear pending and start tour in one batch
        setPendingTourState(null)
        setState(prev => ({
          ...prev,
          isActive: true,
          currentTour: tour,
          currentStepIndex: 0,
        }))
      }
    }, 800)

    return () => clearTimeout(timer)
  }, [pathname, pendingTour, isInitialized])

  const setPendingTour = useCallback((tourId: string | null) => {
    setPendingTourState(tourId)
  }, [])

  const startTour = useCallback((tourId: string) => {
    const tour = getTourById(tourId)
    if (!tour) {
      console.error(`Tour not found: ${tourId}`)
      return
    }

    setState(prev => ({
      ...prev,
      isActive: true,
      currentTour: tour,
      currentStepIndex: 0,
    }))
  }, [])

  const nextStep = useCallback(() => {
    setState(prev => {
      if (!prev.currentTour) return prev

      const nextIndex = prev.currentStepIndex + 1

      // Tour completed
      if (nextIndex >= prev.currentTour.steps.length) {
        const newCompletedTours = [...prev.completedTours]
        const newSeenTours = [...prev.seenTours]

        if (!newCompletedTours.includes(prev.currentTour.id)) {
          newCompletedTours.push(prev.currentTour.id)
        }
        if (!newSeenTours.includes(prev.currentTour.id)) {
          newSeenTours.push(prev.currentTour.id)
        }

        const isFTUE = prev.currentTour.id === 'ftue_main'

        // Save state
        saveStoredState({
          completedTours: newCompletedTours,
          seenTours: newSeenTours,
          hasCompletedFTUE: isFTUE ? true : hasCompletedFTUE,
        })

        if (isFTUE) {
          setHasCompletedFTUE(true)
        }

        return {
          ...prev,
          isActive: false,
          currentTour: null,
          currentStepIndex: 0,
          completedTours: newCompletedTours,
          seenTours: newSeenTours,
        }
      }

      return {
        ...prev,
        currentStepIndex: nextIndex,
      }
    })
  }, [hasCompletedFTUE])

  const prevStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStepIndex: Math.max(0, prev.currentStepIndex - 1),
    }))
  }, [])

  const skipTour = useCallback(() => {
    setState(prev => {
      if (!prev.currentTour) return prev

      const newSeenTours = [...prev.seenTours]
      if (!newSeenTours.includes(prev.currentTour.id)) {
        newSeenTours.push(prev.currentTour.id)
      }

      const isFTUE = prev.currentTour.id === 'ftue_main'

      // Save state - mark as seen but not completed
      saveStoredState({
        completedTours: prev.completedTours,
        seenTours: newSeenTours,
        hasCompletedFTUE: isFTUE ? true : hasCompletedFTUE,
      })

      if (isFTUE) {
        setHasCompletedFTUE(true)
      }

      return {
        ...prev,
        isActive: false,
        currentTour: null,
        currentStepIndex: 0,
        seenTours: newSeenTours,
      }
    })
  }, [hasCompletedFTUE])

  const endTour = useCallback(() => {
    setState(prev => ({
      ...prev,
      isActive: false,
      currentTour: null,
      currentStepIndex: 0,
    }))
  }, [])

  const resetFTUE = useCallback(() => {
    setHasCompletedFTUE(false)
    setState(prev => ({
      ...prev,
      completedTours: prev.completedTours.filter(id => id !== 'ftue_main'),
      seenTours: prev.seenTours.filter(id => id !== 'ftue_main'),
    }))
    saveStoredState({
      completedTours: state.completedTours.filter(id => id !== 'ftue_main'),
      seenTours: state.seenTours.filter(id => id !== 'ftue_main'),
      hasCompletedFTUE: false,
    })
  }, [state.completedTours, state.seenTours])

  const markTourSeen = useCallback((tourId: string) => {
    setState(prev => {
      if (prev.seenTours.includes(tourId)) return prev

      const newSeenTours = [...prev.seenTours, tourId]
      saveStoredState({
        completedTours: prev.completedTours,
        seenTours: newSeenTours,
        hasCompletedFTUE,
      })

      return {
        ...prev,
        seenTours: newSeenTours,
      }
    })
  }, [hasCompletedFTUE])

  const hasTourBeenSeen = useCallback((tourId: string) => {
    return state.seenTours.includes(tourId)
  }, [state.seenTours])

  const currentStep = state.currentTour?.steps[state.currentStepIndex] || null
  const totalSteps = state.currentTour?.steps.length || 0

  return (
    <TourContext.Provider
      value={{
        isActive: state.isActive,
        currentTour: state.currentTour,
        currentStep,
        currentStepIndex: state.currentStepIndex,
        totalSteps,
        completedTours: state.completedTours,
        hasCompletedFTUE,
        pendingTour,
        startTour,
        nextStep,
        prevStep,
        skipTour,
        endTour,
        resetFTUE,
        markTourSeen,
        hasTourBeenSeen,
        setPendingTour,
      }}
    >
      {children}
    </TourContext.Provider>
  )
}

export function useTour() {
  const context = useContext(TourContext)
  if (!context) {
    throw new Error('useTour must be used within a TourProvider')
  }
  return context
}

// Optional hook that doesn't throw
export function useTourOptional() {
  return useContext(TourContext)
}
