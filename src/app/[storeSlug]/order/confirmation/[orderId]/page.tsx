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
  UtensilsCrossed,
  Sparkles,
  PartyPopper,
  ClipboardList
} from 'lucide-react'
import { OrderStatusTracker } from '@/components/customer/order-status-tracker'
import Image from 'next/image'

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'

const statusConfig: Record<OrderStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Menunggu Konfirmasi', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  confirmed: { label: 'Dikonfirmasi', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  preparing: { label: 'Sedang Diproses', color: 'text-orange-600', bgColor: 'bg-orange-50' },
  ready: { label: 'Siap Disajikan', color: 'text-green-600', bgColor: 'bg-green-50' },
  completed: { label: 'Selesai', color: 'text-green-600', bgColor: 'bg-green-50' },
  cancelled: { label: 'Dibatalkan', color: 'text-red-600', bgColor: 'bg-red-50' },
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
      <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 px-4 pt-8 pb-14 rounded-b-[32px] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="text-center text-white relative z-10">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl">
            <PartyPopper className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Pesanan Berhasil!</h1>
          <p className="text-white/90">Pesanan Anda telah diterima dan sedang diproses</p>
        </div>
      </div>

      {/* Order Info Card - Overlapping */}
      <div className="px-4 -mt-8 space-y-4">
        <div className="bg-white rounded-2xl shadow-xl shadow-orange-100/50 p-5 border border-orange-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Nomor Pesanan</p>
              <p className="text-2xl font-bold text-gray-900">#{order.order_number}</p>
            </div>
            <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${statusInfo.color} ${statusInfo.bgColor} border`}>
              {statusInfo.label}
            </span>
          </div>

          <div className="space-y-3 pt-4 border-t border-orange-100">
            {order.table && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Lokasi Meja</p>
                  <p className="text-sm font-semibold text-gray-900">
                    Meja {order.table.table_number}
                    {order.table.location && ` - ${order.table.location}`}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Waktu Pemesanan</p>
                <p className="text-sm font-semibold text-gray-900">
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
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-200">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Estimasi Waktu</p>
              <p className="text-xl font-bold text-orange-600">15-20 menit</p>
            </div>
          </div>
        )}

        {/* Order Status Timeline */}
        <OrderStatusTracker orderId={order.id} initialStatus={status} />

        {/* Order Details */}
        <div className="bg-white rounded-2xl shadow-md shadow-orange-100/30 overflow-hidden border border-orange-50">
          <div className="px-4 py-4 flex items-center gap-3 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-transparent">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Receipt className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-bold text-gray-900">Detail Pesanan</h3>
          </div>

          <div className="divide-y divide-orange-50">
            {order.order_items?.map((item: any) => (
              <div key={item.id} className="px-4 py-3 flex gap-3">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                  {item.menu_item?.image_url ? (
                    <Image
                      src={item.menu_item.image_url}
                      alt={item.menu_item?.name || ''}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                      <UtensilsCrossed className="w-5 h-5 text-orange-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="font-medium text-sm text-gray-900 truncate pr-2">{item.menu_item?.name}</p>
                  {item.notes && (
                    <p className="text-xs text-gray-400 italic mt-0.5 truncate pr-2">{item.notes}</p>
                  )}
                  <div className="flex items-center justify-between mt-1 gap-2">
                    <p className="text-xs text-gray-500 truncate">
                      {formatCurrency(item.unit_price)} x {item.quantity}
                    </p>
                    <p className="font-semibold text-sm text-gray-900 whitespace-nowrap flex-shrink-0">
                      {formatCurrency(item.unit_price * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="px-4 py-4 bg-gradient-to-r from-orange-50 to-red-50 flex justify-between items-center border-t border-orange-100">
            <span className="font-bold text-gray-900">Total</span>
            <span className="text-xl font-bold text-orange-600">{formatCurrency(order.total)}</span>
          </div>
        </div>

        {/* Customer Notes */}
        {order.customer_notes && (
          <div className="bg-white rounded-2xl shadow-md shadow-orange-100/30 p-4 border border-orange-50">
            <p className="text-sm font-semibold text-gray-900 mb-2">Catatan Anda</p>
            <p className="text-sm text-gray-600 italic">{order.customer_notes}</p>
          </div>
        )}

        {/* Payment Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4">
          <div className="flex gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-200">
              <Banknote className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-blue-700">Pembayaran di Kasir</p>
              <p className="text-sm text-gray-600 mt-1">
                Silakan lakukan pembayaran di kasir setelah pesanan siap.
              </p>
              <p className="text-sm font-bold text-gray-900 mt-2">
                Total: {formatCurrency(order.total)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-orange-100 z-50">
        <div className="max-w-lg mx-auto p-4 flex gap-3">
          <Link
            href={`/${storeSlug}/order/track`}
            className="h-14 px-5 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] hover:bg-orange-100"
          >
            <ClipboardList className="w-5 h-5" />
            <span className="hidden sm:inline">Lacak</span>
          </Link>
          <Link
            href={`/${storeSlug}/order`}
            className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-orange-300/50 hover:shadow-xl"
          >
            <Sparkles className="w-5 h-5" />
            Pesan Lagi
          </Link>
        </div>
      </div>
    </div>
  )
}
