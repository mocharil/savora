// @ts-nocheck
import { createAdminClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  CreditCard,
  Receipt,
  Printer,
  MoreVertical,
  CheckCircle,
  ChefHat,
  Bell,
  CheckCheck,
  UtensilsCrossed,
  MessageSquare
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { getUserFromToken } from '@/lib/tenant-context'
import { OrderStatusUpdate } from '@/components/admin/order-status-update'
import { PaymentStatusUpdate } from '@/components/admin/payment-status-update'

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'
type PaymentStatus = 'pending' | 'paid' | 'failed'

const statusConfig: Record<OrderStatus, {
  label: string
  bgColor: string
  textColor: string
  icon: React.ReactNode
}> = {
  pending: {
    label: 'Menunggu Konfirmasi',
    bgColor: 'bg-[#F59E0B]/10',
    textColor: 'text-[#F59E0B]',
    icon: <Clock className="w-4 h-4" />
  },
  confirmed: {
    label: 'Dikonfirmasi',
    bgColor: 'bg-orange-500/10',
    textColor: 'text-orange-500',
    icon: <CheckCircle className="w-4 h-4" />
  },
  preparing: {
    label: 'Sedang Diproses',
    bgColor: 'bg-[#8B5CF6]/10',
    textColor: 'text-[#8B5CF6]',
    icon: <ChefHat className="w-4 h-4" />
  },
  ready: {
    label: 'Siap Disajikan',
    bgColor: 'bg-[#10B981]/10',
    textColor: 'text-[#10B981]',
    icon: <Bell className="w-4 h-4" />
  },
  completed: {
    label: 'Selesai',
    bgColor: 'bg-[#6B7280]/10',
    textColor: 'text-[#6B7280]',
    icon: <CheckCheck className="w-4 h-4" />
  },
  cancelled: {
    label: 'Dibatalkan',
    bgColor: 'bg-[#EF4444]/10',
    textColor: 'text-[#EF4444]',
    icon: <Clock className="w-4 h-4" />
  },
}

const timelineSteps = [
  { status: 'pending', label: 'Pesanan Diterima', icon: <Clock className="w-4 h-4" /> },
  { status: 'confirmed', label: 'Dikonfirmasi', icon: <CheckCircle className="w-4 h-4" /> },
  { status: 'preparing', label: 'Diproses', icon: <ChefHat className="w-4 h-4" /> },
  { status: 'ready', label: 'Siap', icon: <Bell className="w-4 h-4" /> },
  { status: 'completed', label: 'Selesai', icon: <CheckCheck className="w-4 h-4" /> },
]

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const supabase = createAdminClient()
  const { orderId } = await params

  // Get user from token
  const user = await getUserFromToken()
  if (!user || !user.storeId) {
    redirect('/login')
  }

  const storeId = user.storeId

  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      table:tables(table_number, location),
      order_items(
        id,
        quantity,
        unit_price,
        notes,
        menu_item:menu_items(name, description, image_url)
      ),
      payment:payments(
        payment_method,
        status,
        amount,
        paid_at
      )
    `)
    .eq('id', orderId)
    .eq('store_id', storeId)
    .single()

  if (!order) {
    notFound()
  }

  const status = order.status as OrderStatus
  const statusInfo = statusConfig[status]
  const paymentStatus = (order.payment?.status || order.payment_status || 'pending') as PaymentStatus
  const currentStepIndex = timelineSteps.findIndex(s => s.status === status)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/orders"
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#111827]">
                Pesanan #{order.order_number}
              </h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                {statusInfo.icon}
                {statusInfo.label}
              </span>
            </div>
            <p className="text-sm text-[#6B7280] mt-1">
              {new Date(order.created_at).toLocaleString('id-ID', {
                dateStyle: 'long',
                timeStyle: 'short',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 h-10 px-4 bg-white border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] transition-colors">
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button className="flex items-center justify-center w-10 h-10 bg-white border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-[#F9FAFB] transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Order Timeline */}
      {status !== 'cancelled' && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <div className="flex items-center justify-between">
            {timelineSteps.map((step, index) => {
              const isCompleted = index < currentStepIndex
              const isCurrent = index === currentStepIndex
              const isLast = index === timelineSteps.length - 1

              return (
                <div key={step.status} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-[#10B981] text-white'
                          : isCurrent
                          ? 'bg-orange-500 text-white'
                          : 'bg-[#F3F4F6] text-[#9CA3AF]'
                      }`}
                    >
                      {step.icon}
                    </div>
                    <span className={`mt-2 text-xs font-medium ${
                      isCompleted || isCurrent ? 'text-[#111827]' : 'text-[#9CA3AF]'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {!isLast && (
                    <div className={`flex-1 h-1 mx-4 rounded-full ${
                      isCompleted ? 'bg-[#10B981]' : 'bg-[#E5E7EB]'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-[#E5E7EB]">
              <Receipt className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold text-[#111827]">Item Pesanan</h3>
            </div>

            <div className="divide-y divide-[#F3F4F6]">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="flex gap-4 p-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#F3F4F6] flex-shrink-0">
                    {item.menu_item?.image_url ? (
                      <Image
                        src={item.menu_item.image_url}
                        alt={item.menu_item?.name || ''}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UtensilsCrossed className="w-6 h-6 text-[#D1D5DB]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-[#111827]">{item.menu_item?.name}</h4>
                    {item.notes && (
                      <p className="text-sm text-[#F59E0B] mt-1 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {item.notes}
                      </p>
                    )}
                    <p className="text-sm text-[#6B7280] mt-1">
                      {formatCurrency(item.unit_price)} x {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#111827]">
                      {formatCurrency(item.unit_price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="px-6 py-4 bg-[#F9FAFB] border-t border-[#E5E7EB]">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">Subtotal</span>
                  <span className="text-[#111827]">{formatCurrency(order.subtotal || order.total)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-[#E5E7EB]">
                  <span className="text-[#111827]">Total</span>
                  <span className="text-orange-500">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Notes */}
          {order.customer_notes && (
            <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
              <div className="flex items-center gap-2 px-6 py-4 border-b border-[#E5E7EB]">
                <MessageSquare className="w-5 h-5 text-orange-500" />
                <h3 className="font-semibold text-[#111827]">Catatan Pelanggan</h3>
              </div>
              <div className="p-6">
                <p className="text-[#6B7280] italic">{order.customer_notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Update Status Card */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E7EB]">
              <h3 className="font-semibold text-[#111827]">Update Status</h3>
            </div>
            <div className="p-6">
              <OrderStatusUpdate orderId={order.id} currentStatus={status} />
            </div>
          </div>

          {/* Order Info */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E7EB]">
              <h3 className="font-semibold text-[#111827]">Info Pesanan</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-[#6B7280]">Lokasi Meja</p>
                  <p className="text-sm font-medium text-[#111827]">
                    Meja {order.table?.table_number || '-'}
                    {order.table?.location && ` (${order.table.location})`}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-[#F59E0B]" />
                </div>
                <div>
                  <p className="text-xs text-[#6B7280]">Waktu Pesanan</p>
                  <p className="text-sm font-medium text-[#111827]">
                    {new Date(order.created_at).toLocaleString('id-ID', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
              </div>

              {order.customer_name && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-[#8B5CF6]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280]">Nama Pelanggan</p>
                    <p className="text-sm font-medium text-[#111827]">
                      {order.customer_name}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E7EB]">
              <h3 className="font-semibold text-[#111827]">Pembayaran</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#6B7280]">Status</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  paymentStatus === 'paid'
                    ? 'bg-[#10B981]/10 text-[#10B981]'
                    : paymentStatus === 'failed'
                    ? 'bg-[#EF4444]/10 text-[#EF4444]'
                    : 'bg-[#F59E0B]/10 text-[#F59E0B]'
                }`}>
                  {paymentStatus === 'paid' ? 'Lunas' : paymentStatus === 'failed' ? 'Gagal' : 'Belum Bayar'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-[#6B7280]">Metode</span>
                <span className="text-sm font-medium text-[#111827] capitalize">
                  {order.payment?.payment_method || order.payment_method || 'Cash'}
                </span>
              </div>

              {order.payment?.paid_at && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6B7280]">Dibayar</span>
                  <span className="text-sm font-medium text-[#111827]">
                    {new Date(order.payment.paid_at).toLocaleString('id-ID', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
              )}

              <div className="pt-4 border-t border-[#E5E7EB]">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-[#111827]">Total</span>
                  <span className="text-lg font-bold text-orange-500">
                    {formatCurrency(order.total)}
                  </span>
                </div>

                {/* Payment Action Button */}
                <PaymentStatusUpdate
                  orderId={order.id}
                  currentStatus={paymentStatus}
                  total={order.total}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
