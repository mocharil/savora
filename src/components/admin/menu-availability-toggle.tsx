'use client'

import { useState } from 'react'
import { ToggleLeft, ToggleRight, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface MenuAvailabilityToggleProps {
  menuId: string
  initialAvailability: boolean
  menuName: string
  variant?: 'absolute' | 'inline'
}

export function MenuAvailabilityToggle({
  menuId,
  initialAvailability,
  menuName,
  variant = 'absolute'
}: MenuAvailabilityToggleProps) {
  const router = useRouter()
  const [isAvailable, setIsAvailable] = useState(initialAvailability)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsLoading(true)
    const newAvailability = !isAvailable

    try {
      const response = await fetch(`/api/admin/menu/${menuId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: newAvailability })
      })

      if (response.ok) {
        setIsAvailable(newAvailability)
        router.refresh()
      } else {
        console.error('Failed to update availability')
      }
    } catch (error) {
      console.error('Error updating availability:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (variant === 'inline') {
    return (
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors disabled:opacity-50 ${
          isAvailable
            ? 'bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20'
            : 'bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20'
        }`}
        title={isAvailable ? 'Klik untuk tidak tersediakan' : 'Klik untuk tersediakan'}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : isAvailable ? (
          <ToggleRight className="w-3.5 h-3.5" />
        ) : (
          <ToggleLeft className="w-3.5 h-3.5" />
        )}
        {isAvailable ? 'Tersedia' : 'Tidak Tersedia'}
      </button>
    )
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`absolute top-3 right-3 p-1.5 rounded-full shadow-md transition-colors disabled:opacity-50 ${
        isAvailable
          ? 'bg-[#10B981] text-white hover:bg-[#059669]'
          : 'bg-[#EF4444] text-white hover:bg-[#DC2626]'
      }`}
      title={isAvailable ? 'Klik untuk tidak tersediakan' : 'Klik untuk tersediakan'}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : isAvailable ? (
        <ToggleRight className="w-5 h-5" />
      ) : (
        <ToggleLeft className="w-5 h-5" />
      )}
    </button>
  )
}
