// @ts-nocheck
import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import {
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Receipt,
  Banknote,
  RefreshCw,
  Phone,
  ChevronDown,
  UtensilsCrossed
} from 'lucide-react'
import { OrderStatusTracker } from '@/components/customer/order-status-tracker'
import Image from 'next/image'

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'

const statusConfig: Record<OrderStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Menunggu Konfirmasi', color: 'text-[#FDCB6E]', bgColor: 'bg-[#FDCB6E]/10' },
  confirmed: { label: 'Dikonfirmasi', color: 'text-[#0984E3]', bgColor: 'bg-[#0984E3]/10' },
  preparing: { label: 'Sedang Diproses', color: 'text-primary', bgColor: 'bg-primary/10' },
  ready: { label: 'Siap Disajikan', color: 'text-[#00B894]', bgColor: 'bg-[#00B894]/10' },
  completed: { label: 'Selesai', color: 'text-[#00B894]', bgColor: 'bg-[#00B894]/10' },
  cancelled: { label: 'Dibatalkan', color: 'text-[#E74C3C]', bgColor: 'bg-[#E74C3C]/10' },
}

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ storeSlug: string; orderId: string }>
}) {
  const supabase = createAdminClient()
  const { storeSlug, orderId } = await params

  const { data: store } = await supabase
    .from('stores')
    .select('id, name, slug')
    .eq('slug', storeSlug)
    .single()

  if (!store) {
    notFound()
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select(`
      *,
      table:tables(table_number, location),
      order_items(
        id,
        quantity,
        unit_price,
        notes,
        menu_item:menu_items(name, image_url)
      )
    `)
    .eq('id', orderId)
    .eq('store_id', store.id)
    .single()

  if (orderError) {
    console.error('Order fetch error:', orderError)
  }

  if (!order) {
    notFound()
  }

  const status = order.status as OrderStatus
  const statusInfo = statusConfig[status]

  return (
    <div className="pb-32">
      {/* Success Header */}
      <div className="gradient-savora-primary px-4 pt-8 pb-12 rounded-b-[32px]">
        <div className="text-center text-white">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Pesanan Berhasil!</h1>
          <p className="text-white/80">Pesanan Anda telah diterima dan sedang diproses</p>
        </div>
      </div>

      {/* Order Info Card - Overlapping */}
      <div className="px-4 -mt-6 space-y-4">
        <div className="bg-white rounded-2xl shadow-savora-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-[#9AA0A6]">Nomor Pesanan</p>
              <p className="text-2xl font-bold text-[#202124]">#{order.order_number}</p>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${statusInfo.color} ${statusInfo.bgColor}`}>
              {statusInfo.label}
            </span>
          </div>

          <div className="space-y-3 pt-4 border-t border-[#F1F3F4]">
            {order.table && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#0984E3]/10 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-[#0984E3]" />
                </div>
                <div>
                  <p className="text-xs text-[#9AA0A6]">Lokasi Meja</p>
                  <p className="text-sm font-medium text-[#202124]">
                    Meja {order.table.table_number}
                    {order.table.location && ` - ${order.table.location}`}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#FDCB6E]/20 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-[#E55A2B]" />
              </div>
              <div>
                <p className="text-xs text-[#9AA0A6]">Waktu Pemesanan</p>
                <p className="text-sm font-medium text-[#202124]">
                  {new Date(order.created_at).toLocaleString('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Estimated Time */}
        {status !== 'completed' && status !== 'cancelled' && (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-[#5F6368]">Estimasi Waktu</p>
              <p className="text-lg font-bold text-primary">15-20 menit</p>
            </div>
          </div>
        )}

        {/* Order Status Timeline */}
        <OrderStatusTracker orderId={order.id} initialStatus={status} />

        {/* Order Details */}
        <div className="bg-white rounded-2xl shadow-savora-card overflow-hidden">
          <div className="px-4 py-4 flex items-center gap-3 border-b border-[#F1F3F4]">
            <Receipt className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-[#202124]">Detail Pesanan</h3>
          </div>

          <div className="divide-y divide-[#F1F3F4]">
            {order.order_items?.map((item: any) => (
              <div key={item.id} className="px-4 py-3 flex gap-3">
                <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                  {item.menu_item?.image_url ? (
                    <Image
                      src={item.menu_item.image_url}
                      alt={item.menu_item?.name || ''}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#F1F3F4] flex items-center justify-center">
                      <UtensilsCrossed className="w-5 h-5 text-[#BDC1C6]" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[#202124] line-clamp-1">{item.menu_item?.name}</p>
                  {item.notes && (
                    <p className="text-xs text-[#9AA0A6] italic mt-0.5 line-clamp-1">{item.notes}</p>
                  )}
                  <p className="text-xs text-[#5F6368] mt-1">
                    {formatCurrency(item.unit_price)} x {item.quantity}
                  </p>
                </div>
                <p className="font-semibold text-sm text-[#202124]">
                  {formatCurrency(item.unit_price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="px-4 py-4 bg-[#F8F9FA] flex justify-between items-center">
            <span className="font-bold text-[#202124]">Total</span>
            <span className="text-xl font-bold text-primary">{formatCurrency(order.total)}</span>
          </div>
        </div>

        {/* Customer Notes */}
        {order.customer_notes && (
          <div className="bg-white rounded-2xl shadow-savora-card p-4">
            <p className="text-sm font-semibold text-[#202124] mb-2">Catatan Anda</p>
            <p className="text-sm text-[#5F6368] italic">{order.customer_notes}</p>
          </div>
        )}

        {/* Payment Info */}
        <div className="bg-[#0984E3]/5 border border-[#0984E3]/20 rounded-2xl p-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0984E3]/10 flex items-center justify-center flex-shrink-0">
              <Banknote className="w-5 h-5 text-[#0984E3]" />
            </div>
            <div>
              <p className="font-semibold text-[#0984E3]">Pembayaran di Kasir</p>
              <p className="text-sm text-[#5F6368] mt-1">
                Silakan lakukan pembayaran di kasir setelah pesanan siap.
              </p>
              <p className="text-sm font-bold text-[#202124] mt-2">
                Total: {formatCurrency(order.total)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-savora-bottom z-50">
        <div className="max-w-lg mx-auto p-4 flex gap-3">
          <Link
            href={`/${storeSlug}/order`}
            className="flex-1 h-14 rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
          >
            <RefreshCw className="w-5 h-5" />
            Pesan Lagi
          </Link>
        </div>
      </div>
    </div>
  )
}
