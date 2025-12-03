'use client'

import { useState } from 'react'
import { Download, Loader2, CheckCircle } from 'lucide-react'
import { PageTourButton } from '@/components/admin/tour'
import { formatCurrency } from '@/lib/utils'

export function DashboardPageClient() {
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    setExportSuccess(false)

    try {
      // Fetch dashboard data for export
      const response = await fetch('/api/admin/reports/dashboard')
      if (!response.ok) throw new Error('Failed to fetch data')

      const data = await response.json()

      // Generate CSV content
      const today = new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })

      let csvContent = 'LAPORAN DASHBOARD HARIAN\n'
      csvContent += `Tanggal: ${today}\n\n`

      // Summary section
      csvContent += 'RINGKASAN\n'
      csvContent += `Total Pendapatan Hari Ini,${data.todayRevenue || 0}\n`
      csvContent += `Total Pesanan Hari Ini,${data.todayOrderCount || 0}\n`
      csvContent += `Pesanan Selesai,${data.completedOrders || 0}\n`
      csvContent += `Pesanan Lunas,${data.paidOrders || 0}\n`
      csvContent += `Pesanan Belum Bayar,${data.unpaidOrders || 0}\n\n`

      // Status breakdown
      csvContent += 'STATUS PESANAN\n'
      csvContent += `Perlu Dikonfirmasi,${data.pendingOrders || 0}\n`
      csvContent += `Sedang Diproses,${data.preparingOrders || 0}\n`
      csvContent += `Siap Diantar,${data.readyOrders || 0}\n`
      csvContent += `Selesai,${data.completedOrders || 0}\n\n`

      // Recent orders
      if (data.recentOrders && data.recentOrders.length > 0) {
        csvContent += 'PESANAN TERBARU\n'
        csvContent += 'No Pesanan,Status,Meja,Total,Pembayaran,Waktu\n'
        data.recentOrders.forEach((order: any) => {
          csvContent += `${order.order_number},${order.status},${order.table_number || '-'},${order.total},${order.payment_status},${new Date(order.created_at).toLocaleTimeString('id-ID')}\n`
        })
      }

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `laporan-dashboard-${today.replace(/\//g, '-')}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 3000)
    } catch (error) {
      console.error('Export error:', error)
      alert('Gagal mengexport laporan. Silakan coba lagi.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-[#111827]">Dashboard</h1>
        <p className="text-sm text-[#6B7280]">Ringkasan aktivitas toko Anda</p>
      </div>
      <div className="flex items-center gap-3">
        <PageTourButton />
        <button
          onClick={handleExport}
          disabled={isExporting}
          data-tour="dashboard-export-btn"
          className={`flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-medium transition-colors ${
            exportSuccess
              ? 'bg-green-500 text-white'
              : 'bg-white border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Mengexport...
            </>
          ) : exportSuccess ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Berhasil!
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Export Laporan
            </>
          )}
        </button>
      </div>
    </div>
  )
}
