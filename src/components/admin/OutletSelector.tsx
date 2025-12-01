'use client'

import { useEffect, useState } from 'react'
import { useOutletStore } from '@/stores/outlet-store'
import { Building2, ChevronDown, Check, Star } from 'lucide-react'

export function OutletSelector() {
  const {
    currentOutletId,
    outlets,
    isLoading,
    setCurrentOutlet,
    getCurrentOutlet,
    initialize,
  } = useOutletStore()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    initialize()
  }, [initialize])

  const currentOutlet = getCurrentOutlet()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.outlet-selector')) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!mounted) {
    return (
      <div className="h-10 w-48 bg-gray-100 rounded-lg animate-pulse" />
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        <span className="text-sm text-gray-500">Loading outlets...</span>
      </div>
    )
  }

  if (outlets.length === 0) {
    return null
  }

  // Don't show selector if only one outlet
  if (outlets.length === 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
        <Building2 className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">{outlets[0].name}</span>
      </div>
    )
  }

  return (
    <div className="relative outlet-selector">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors ${
          isOpen ? 'ring-2 ring-emerald-500 border-emerald-500' : 'border-gray-200'
        }`}
      >
        <Building2 className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700 max-w-[150px] truncate">
          {currentOutlet?.name || 'Select Outlet'}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider px-2">
              Switch Outlet
            </p>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {outlets.map((outlet) => (
              <button
                key={outlet.id}
                onClick={() => {
                  setCurrentOutlet(outlet.id)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                  outlet.id === currentOutletId ? 'bg-emerald-50' : ''
                }`}
              >
                <div className={`p-1.5 rounded-lg ${
                  outlet.is_main ? 'bg-yellow-100' : 'bg-gray-100'
                }`}>
                  <Building2 className={`w-4 h-4 ${
                    outlet.is_main ? 'text-yellow-600' : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {outlet.name}
                    </span>
                    {outlet.is_main && (
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                </div>
                {outlet.id === currentOutletId && (
                  <Check className="w-4 h-4 text-emerald-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
