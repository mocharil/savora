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
import { useState } from 'react'
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
  orderUrl: string
}

export function QRPageContent({ table, store, orderUrl }: QRPageContentProps) {
  const [copied, setCopied] = useState(false)

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
          className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Meja
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
              className="flex items-center gap-2 h-10 px-4 bg-[#3B82F6] text-white rounded-lg text-sm font-medium hover:bg-[#2563EB] transition-colors"
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
                <QrCode className="w-4 h-4 text-[#3B82F6]" />
                QR Code untuk Pemesanan
              </h2>
            </div>
            <div className="p-8">
              {/* Print Area */}
              <div className="print-area flex flex-col items-center gap-6 p-8 bg-[#F9FAFB] rounded-xl border-2 border-dashed border-[#E5E7EB]">
                <div className="p-4 bg-white rounded-xl shadow-admin-md">
                  <QRCodeDisplay value={orderUrl} size={280} />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-[#111827]">{store.name}</h3>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="px-3 py-1 bg-[#3B82F6]/10 text-[#3B82F6] font-semibold rounded-full">
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
                  <LinkIcon className="w-4 h-4 text-[#3B82F6]" />
                  Link Pemesanan
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                  <code className="text-xs text-[#374151] break-all">{orderUrl}</code>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-center gap-2 h-10 px-4 bg-[#F3F4F6] text-[#374151] rounded-lg text-sm font-medium hover:bg-[#E5E7EB] transition-colors"
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
            <div className="bg-[#3B82F6]/5 rounded-xl border border-[#3B82F6]/20 p-6">
              <h3 className="font-semibold text-[#111827] mb-3">Tips</h3>
              <ul className="space-y-2 text-sm text-[#6B7280]">
                <li className="flex gap-2">
                  <span className="text-[#3B82F6]">•</span>
                  Cetak QR code dan letakkan di meja pelanggan
                </li>
                <li className="flex gap-2">
                  <span className="text-[#3B82F6]">•</span>
                  Gunakan kertas stiker untuk hasil terbaik
                </li>
                <li className="flex gap-2">
                  <span className="text-[#3B82F6]">•</span>
                  Laminasi untuk menjaga keawetan
                </li>
                <li className="flex gap-2">
                  <span className="text-[#3B82F6]">•</span>
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
