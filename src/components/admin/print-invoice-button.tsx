'use client'

import { useState } from 'react'
import { Printer, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface OrderItem {
  id: string
  quantity: number
  unit_price: number
  notes: string | null
  menu_item: {
    name: string
    description: string | null
  } | null
}

interface PrintInvoiceButtonProps {
  order: {
    id: string
    order_number: string
    customer_name: string | null
    created_at: string
    subtotal: number | null
    total: number
    payment_status: string
    payment_method: string | null
    table: {
      table_number: string
      location: string | null
    } | null
    order_items: OrderItem[]
  }
  storeName?: string
}

export function PrintInvoiceButton({ order, storeName = 'Savora' }: PrintInvoiceButtonProps) {
  const [printing, setPrinting] = useState(false)

  const handlePrint = () => {
    setPrinting(true)

    // Create print content
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice #${order.order_number}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            padding: 20px;
            max-width: 80mm;
            margin: 0 auto;
            font-size: 12px;
            line-height: 1.4;
          }
          .header {
            text-align: center;
            padding-bottom: 15px;
            border-bottom: 2px dashed #ddd;
            margin-bottom: 15px;
          }
          .store-name {
            font-size: 20px;
            font-weight: bold;
            color: #f97316;
            margin-bottom: 5px;
          }
          .invoice-title {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
          }
          .order-number {
            font-size: 16px;
            font-weight: bold;
            background: #f3f4f6;
            padding: 8px;
            border-radius: 4px;
          }
          .info-section {
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px dashed #ddd;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          .info-label { color: #666; }
          .info-value { font-weight: 500; text-align: right; }
          .items-section { margin-bottom: 15px; }
          .items-header {
            font-weight: bold;
            padding-bottom: 8px;
            border-bottom: 1px solid #ddd;
            margin-bottom: 10px;
          }
          .item {
            padding: 8px 0;
            border-bottom: 1px dotted #eee;
          }
          .item-name { font-weight: 500; margin-bottom: 3px; }
          .item-detail {
            display: flex;
            justify-content: space-between;
            color: #666;
            font-size: 11px;
          }
          .item-note {
            font-size: 10px;
            color: #f59e0b;
            font-style: italic;
            margin-top: 3px;
          }
          .totals {
            background: #f9fafb;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 15px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          .total-final {
            font-size: 16px;
            font-weight: bold;
            padding-top: 8px;
            border-top: 2px solid #ddd;
            margin-top: 8px;
          }
          .total-final .amount { color: #f97316; }
          .payment-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 600;
          }
          .paid { background: #dcfce7; color: #16a34a; }
          .unpaid { background: #fef3c7; color: #d97706; }
          .footer {
            text-align: center;
            padding-top: 15px;
            border-top: 2px dashed #ddd;
            color: #666;
            font-size: 11px;
          }
          .footer p { margin-bottom: 5px; }
          .thank-you {
            font-size: 14px;
            font-weight: bold;
            color: #111;
            margin-bottom: 10px;
          }
          @media print {
            body { padding: 0; }
            @page { margin: 10mm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="store-name">${storeName}</div>
          <div class="invoice-title">STRUK PESANAN</div>
          <div class="order-number">#${order.order_number}</div>
        </div>

        <div class="info-section">
          <div class="info-row">
            <span class="info-label">Meja:</span>
            <span class="info-value">${order.table?.table_number || '-'}</span>
          </div>
          ${order.customer_name ? `
          <div class="info-row">
            <span class="info-label">Pelanggan:</span>
            <span class="info-value">${order.customer_name}</span>
          </div>
          ` : ''}
          <div class="info-row">
            <span class="info-label">Tanggal:</span>
            <span class="info-value">${new Date(order.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Waktu:</span>
            <span class="info-value">${new Date(order.created_at).toLocaleTimeString('id-ID', { timeStyle: 'short' })}</span>
          </div>
        </div>

        <div class="items-section">
          <div class="items-header">Item Pesanan</div>
          ${order.order_items?.map(item => `
            <div class="item">
              <div class="item-name">${item.menu_item?.name || 'Unknown Item'}</div>
              <div class="item-detail">
                <span>${item.quantity}x @ ${formatCurrency(item.unit_price)}</span>
                <span>${formatCurrency(item.unit_price * item.quantity)}</span>
              </div>
              ${item.notes ? `<div class="item-note">Catatan: ${item.notes}</div>` : ''}
            </div>
          `).join('')}
        </div>

        <div class="totals">
          <div class="total-row">
            <span>Subtotal</span>
            <span>${formatCurrency(order.subtotal || order.total)}</span>
          </div>
          <div class="total-row total-final">
            <span>TOTAL</span>
            <span class="amount">${formatCurrency(order.total)}</span>
          </div>
        </div>

        <div class="info-section" style="text-align: center;">
          <div class="info-row" style="justify-content: center; gap: 10px;">
            <span class="info-label">Metode Pembayaran:</span>
            <span class="info-value" style="text-transform: capitalize;">${order.payment_method || 'Cash'}</span>
          </div>
          <div style="margin-top: 8px;">
            <span class="payment-badge ${order.payment_status === 'paid' ? 'paid' : 'unpaid'}">
              ${order.payment_status === 'paid' ? 'LUNAS' : 'BELUM BAYAR'}
            </span>
          </div>
        </div>

        <div class="footer">
          <p class="thank-you">Terima Kasih!</p>
          <p>Powered by Savora</p>
          <p style="margin-top: 10px; font-size: 10px;">
            ${new Date().toLocaleString('id-ID')}
          </p>
        </div>
      </body>
      </html>
    `

    // Create iframe for printing
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = 'none'
    document.body.appendChild(iframe)

    const iframeDoc = iframe.contentWindow?.document
    if (iframeDoc) {
      iframeDoc.open()
      iframeDoc.write(printContent)
      iframeDoc.close()

      // Wait for content to load then print
      iframe.contentWindow?.addEventListener('load', () => {
        iframe.contentWindow?.print()
        // Remove iframe after print dialog closes
        setTimeout(() => {
          document.body.removeChild(iframe)
          setPrinting(false)
        }, 100)
      })

      // Fallback for immediate print
      setTimeout(() => {
        iframe.contentWindow?.print()
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe)
          }
          setPrinting(false)
        }, 100)
      }, 250)
    } else {
      setPrinting(false)
    }
  }

  return (
    <button
      onClick={handlePrint}
      disabled={printing}
      className="flex items-center gap-2 h-10 px-4 bg-white border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {printing ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Mencetak...
        </>
      ) : (
        <>
          <Printer className="w-4 h-4" />
          Print
        </>
      )}
    </button>
  )
}
