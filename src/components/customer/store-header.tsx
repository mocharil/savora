'use client'

import Image from 'next/image'
import { MapPin, Phone, Clock, Globe } from 'lucide-react'

interface StoreInfo {
  name: string
  description?: string | null
  address?: string | null
  phone?: string | null
  logo_url?: string | null
  banner_url?: string | null
  operational_hours?: Record<string, { open: string; close: string; isOpen: boolean }>
}

interface StoreHeaderProps {
  store: StoreInfo
}

const dayNames: Record<string, string> = {
  sunday: 'Minggu',
  monday: 'Senin',
  tuesday: 'Selasa',
  wednesday: 'Rabu',
  thursday: 'Kamis',
  friday: 'Jumat',
  saturday: 'Sabtu',
}

function getCurrentDayStatus(operationalHours?: Record<string, { open: string; close: string; isOpen: boolean }>) {
  if (!operationalHours) return null

  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const now = new Date()
  const currentDay = days[now.getDay()]
  const todayHours = operationalHours[currentDay]

  if (!todayHours || !todayHours.isOpen) {
    return { isOpen: false, text: 'Tutup hari ini' }
  }

  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  if (currentTime >= todayHours.open && currentTime <= todayHours.close) {
    return { isOpen: true, text: `Buka sampai ${todayHours.close}` }
  } else if (currentTime < todayHours.open) {
    return { isOpen: false, text: `Buka pukul ${todayHours.open}` }
  } else {
    return { isOpen: false, text: 'Sudah tutup' }
  }
}

export function StoreHeader({ store }: StoreHeaderProps) {
  const operationalStatus = getCurrentDayStatus(store.operational_hours)

  return (
    <div className="relative">
      {/* Banner */}
      <div className="relative h-36 sm:h-44 bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 overflow-hidden">
        {store.banner_url ? (
          <Image
            src={store.banner_url}
            alt={store.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Store Info Card */}
      <div className="relative px-4 -mt-10 pb-2">
        <div className="bg-white rounded-2xl shadow-xl shadow-orange-100/50 p-4 border border-orange-50">
          <div className="flex gap-4">
            {/* Logo */}
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-orange-100 to-orange-50 flex-shrink-0 ring-4 ring-white shadow-lg -mt-8">
              {store.logo_url ? (
                <Image
                  src={store.logo_url}
                  alt={store.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-orange-500">
                    {store.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-gray-900 truncate">{store.name}</h1>

              {store.description && (
                <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{store.description}</p>
              )}

              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                {/* Operational Status */}
                {operationalStatus && (
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${operationalStatus.isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className={`text-xs font-medium ${operationalStatus.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                      {operationalStatus.text}
                    </span>
                  </div>
                )}

                {/* Phone */}
                {store.phone && (
                  <a
                    href={`tel:${store.phone}`}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-orange-600 transition-colors"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{store.phone}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Address */}
          {store.address && (
            <div className="mt-3 pt-3 border-t border-orange-100">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600 line-clamp-2">{store.address}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
