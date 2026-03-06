'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  Download,
  Printer,
  Copy,
  CheckCheck,
  QrCode,
  Link as LinkIcon,
  MapPin
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { QRCodeDisplay } from '@/components/admin/qrcode-display'

interface QRPageContentProps {
  table: {
    id: string
    table_number: string
    location: string | null
    qr_code: string
  }
  store: {
    name: string
    slug: string
  }
  orderPath: string
}

export function QRPageContent({ table, store, orderPath }: QRPageContentProps) {
  const [copied, setCopied] = useState(false)
  const [orderUrl, setOrderUrl] = useState('')

  // Build full URL client-side using current domain
  useEffect(() => {
    const baseUrl = window.location.origin
    setOrderUrl(`${baseUrl}${orderPath}`)
  }, [orderPath])

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    const canvas = document.querySelector('canvas')
    if (canvas) {
      const url = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `qr-meja-${table.table_number}.png`
      link.href = url
      link.click()
    }
  }

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(orderUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <div className="space-y-6">
        {/* Back Button */}
        <Link
          href="/admin/tables"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Kembali</span>
        </Link>

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">QR Code - Meja {table.table_number}</h1>
            <p className="text-sm text-[#6B7280]">Cetak atau download QR code untuk pemesanan</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 h-10 px-4 bg-white border border-[#E5E7EB] text-[#374151] rounded-lg text-sm font-medium hover:bg-[#F9FAFB] transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 h-10 px-4 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* QR Code Card */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E7EB]">
              <h2 className="font-semibold text-[#111827] flex items-center gap-2">
                <QrCode className="w-4 h-4 text-orange-500" />
                QR Code untuk Pemesanan
              </h2>
            </div>
            <div className="p-8">
              {/* Print Area */}
              <div className="print-area flex flex-col items-center gap-6 p-8 bg-[#F9FAFB] rounded-xl border-2 border-dashed border-[#E5E7EB]">
                <div className="p-4 bg-white rounded-xl shadow-admin-md">
                  {orderUrl ? (
                    <QRCodeDisplay value={orderUrl} size={280} />
                  ) : (
                    <div className="w-[280px] h-[280px] bg-gray-100 animate-pulse rounded-lg" />
                  )}
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-[#111827]">{store.name}</h3>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="px-3 py-1 bg-orange-500/10 text-orange-500 font-semibold rounded-full">
                      Meja {table.table_number}
                    </span>
                    {table.location && (
                      <span className="flex items-center gap-1 px-3 py-1 bg-[#F3F4F6] text-[#6B7280] rounded-full text-sm">
                        <MapPin className="w-3 h-3" />
                        {table.location}
                      </span>
                    )}
                  </div>
                  <p className="mt-4 text-sm text-[#6B7280]">
                    Scan untuk memesan langsung dari meja
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="space-y-6">
            {/* Link Card */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E5E7EB]">
                <h2 className="font-semibold text-[#111827] flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-orange-500" />
                  Link Pemesanan
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                  {orderUrl ? (
                    <code className="text-xs text-[#374151] break-all">{orderUrl}</code>
                  ) : (
                    <div className="h-4 bg-gray-200 animate-pulse rounded" />
                  )}
                </div>
                <button
                  onClick={handleCopyLink}
                  disabled={!orderUrl}
                  className="w-full flex items-center justify-center gap-2 h-10 px-4 bg-[#F3F4F6] text-[#374151] rounded-lg text-sm font-medium hover:bg-[#E5E7EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {copied ? (
                    <>
                      <CheckCheck className="w-4 h-4 text-[#10B981]" />
                      <span className="text-[#10B981]">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Salin Link
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Tips Card */}
            <div className="bg-orange-500/5 rounded-xl border border-orange-500/20 p-6">
              <h3 className="font-semibold text-[#111827] mb-3">Tips</h3>
              <ul className="space-y-2 text-sm text-[#6B7280]">
                <li className="flex gap-2">
                  <span className="text-orange-500">•</span>
                  Cetak QR code dan letakkan di meja pelanggan
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-500">•</span>
                  Gunakan kertas stiker untuk hasil terbaik
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-500">•</span>
                  Laminasi untuk menjaga keawetan
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-500">•</span>
                  Pastikan QR code mudah terlihat
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Link
                href={`/admin/tables/${table.id}/edit`}
                className="flex-1 flex items-center justify-center gap-2 h-10 px-4 bg-white border border-[#E5E7EB] text-[#374151] rounded-lg text-sm font-medium hover:bg-[#F9FAFB] transition-colors"
              >
                Edit Meja
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            border: none !important;
            background: white !important;
          }
        }
      `}</style>
    </>
  )
}
