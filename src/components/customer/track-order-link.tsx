'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ClipboardList } from 'lucide-react'

const TABLE_QR_KEY = 'savora-table-qr'

interface TrackOrderLinkProps {
  storeSlug: string
}

export function TrackOrderLink({ storeSlug }: TrackOrderLinkProps) {
  const searchParams = useSearchParams()
  const tableQrFromUrl = searchParams.get('table')
  const [tableQr, setTableQr] = useState<string | null>(null)

  useEffect(() => {
    // Prioritize URL param, fallback to localStorage
    if (tableQrFromUrl) {
      setTableQr(tableQrFromUrl)
      // Also save to localStorage
      localStorage.setItem(TABLE_QR_KEY, tableQrFromUrl)
    } else {
      // Try to get from localStorage
      const storedQr = localStorage.getItem(TABLE_QR_KEY)
      if (storedQr) {
        setTableQr(storedQr)
      }
    }
  }, [tableQrFromUrl])

  const trackUrl = tableQr
    ? `/${storeSlug}/order/track?table=${encodeURIComponent(tableQr)}`
    : `/${storeSlug}/order/track`

  return (
    <Link
      href={trackUrl}
      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors"
    >
      <ClipboardList className="w-5 h-5 text-orange-600" />
      <span className="text-sm font-medium text-orange-600 hidden sm:inline">Lacak Pesanan</span>
    </Link>
  )
}
