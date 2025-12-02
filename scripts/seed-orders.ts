/**
 * Seed dummy orders data to Supabase
 *
 * Run with: npx tsx scripts/seed-orders.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Store ID from existing seed data
const STORE_ID = '22222222-2222-2222-2222-222222222222'

// Table IDs
const TABLE_IDS = {
  table1: '55555555-5555-5555-5555-555555555551',
  table2: '55555555-5555-5555-5555-555555555552',
  table3: '55555555-5555-5555-5555-555555555553',
  table4: '55555555-5555-5555-5555-555555555554',
  table5: '55555555-5555-5555-5555-555555555555',
}

// Menu Item IDs
const MENU_IDS = {
  nasiGoreng: '44444444-4444-4444-4444-444444444441',
  mieGoreng: '44444444-4444-4444-4444-444444444442',
  ayamGoreng: '44444444-4444-4444-4444-444444444443',
  esTeh: '44444444-4444-4444-4444-444444444444',
  esJeruk: '44444444-4444-4444-4444-444444444445',
  kopiHitam: '44444444-4444-4444-4444-444444444446',
  pisangGoreng: '44444444-4444-4444-4444-444444444447',
  tahuIsi: '44444444-4444-4444-4444-444444444448',
}

// Menu prices
const MENU_PRICES: Record<string, number> = {
  [MENU_IDS.nasiGoreng]: 25000,
  [MENU_IDS.mieGoreng]: 20000,
  [MENU_IDS.ayamGoreng]: 30000,
  [MENU_IDS.esTeh]: 5000,
  [MENU_IDS.esJeruk]: 8000,
  [MENU_IDS.kopiHitam]: 10000,
  [MENU_IDS.pisangGoreng]: 12000,
  [MENU_IDS.tahuIsi]: 10000,
}

// Helper to generate order number
function generateOrderNumber(date: Date, index: number): string {
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
  return `ORD-${dateStr}-${String(index).padStart(4, '0')}`
}

// Helper to get random item from array
function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Helper to get random number in range
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Customer names
const CUSTOMER_NAMES = [
  'Ahmad Fauzi', 'Dewi Lestari', 'Budi Hartono', 'Siti Aminah', 'Rizky Pratama',
  'Maya Indah', 'Joko Susanto', 'Retno Wati', 'Agus Setiawan', 'Sri Wahyuni',
  'Eko Prasetyo', 'Linda Sari', 'Doni Kusuma', 'Ratna Dewi', 'Hendra Wijaya',
  'Fitri Handayani', 'Bambang Supriadi', 'Yuni Astuti', 'Rudi Hermawan', 'Nia Ramadhani',
  'Andi Saputra', 'Dina Marlina', 'Taufik Hidayat', 'Wulan Pertiwi', 'Fajar Nugroho',
]

// Order statuses with weights
const ORDER_STATUSES: Array<{ status: string; weight: number }> = [
  { status: 'completed', weight: 70 },
  { status: 'ready', weight: 5 },
  { status: 'preparing', weight: 5 },
  { status: 'confirmed', weight: 5 },
  { status: 'pending', weight: 10 },
  { status: 'cancelled', weight: 5 },
]

// Payment methods
const PAYMENT_METHODS = ['qris', 'gopay', 'ovo', 'dana', 'shopeepay', 'cash', 'va_bca']

function getRandomStatus(): string {
  const totalWeight = ORDER_STATUSES.reduce((sum, s) => sum + s.weight, 0)
  let random = Math.random() * totalWeight

  for (const { status, weight } of ORDER_STATUSES) {
    random -= weight
    if (random <= 0) return status
  }

  return 'completed'
}

interface OrderData {
  id: string
  store_id: string
  table_id: string
  order_number: string
  status: string
  payment_status: string
  customer_name: string
  customer_phone: string
  notes: string | null
  subtotal: number
  tax_amount: number
  service_charge_amount: number
  total: number
  created_at: string
  updated_at: string
  paid_at: string | null
}

interface OrderItemData {
  id: string
  order_id: string
  menu_item_id: string
  quantity: number
  unit_price: number
  subtotal: number
  notes: string | null
}

interface PaymentData {
  id: string
  order_id: string
  payment_method: string
  payment_gateway: string | null
  amount: number
  status: string
  paid_at: string | null
  created_at: string
}

async function seedOrders() {
  console.log('🌱 Starting to seed dummy orders...\n')

  // Check if store exists
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id, name')
    .eq('id', STORE_ID)
    .single()

  if (storeError || !store) {
    console.error('❌ Store not found. Please run seed_dummy_data.sql first.')
    process.exit(1)
  }

  console.log(`📍 Store: ${store.name}`)

  // Delete existing dummy orders (optional - comment out if you want to keep)
  console.log('\n🗑️  Cleaning up existing dummy orders...')

  const { error: deleteItemsError } = await supabase
    .from('order_items')
    .delete()
    .in('order_id',
      (await supabase
        .from('orders')
        .select('id')
        .eq('store_id', STORE_ID)
      ).data?.map(o => o.id) || []
    )

  if (deleteItemsError) {
    console.log('Note: Could not delete order items (may not exist)')
  }

  const { error: deletePaymentsError } = await supabase
    .from('payments')
    .delete()
    .in('order_id',
      (await supabase
        .from('orders')
        .select('id')
        .eq('store_id', STORE_ID)
      ).data?.map(o => o.id) || []
    )

  if (deletePaymentsError) {
    console.log('Note: Could not delete payments (may not exist)')
  }

  await supabase
    .from('orders')
    .delete()
    .eq('store_id', STORE_ID)

  // Generate orders for the last 30 days
  const orders: OrderData[] = []
  const orderItems: OrderItemData[] = []
  const payments: PaymentData[] = []

  const tableIds = Object.values(TABLE_IDS)
  const menuIds = Object.values(MENU_IDS)

  let orderIndex = 1

  // Generate orders for last 30 days
  for (let daysAgo = 0; daysAgo < 30; daysAgo++) {
    const orderDate = new Date()
    orderDate.setDate(orderDate.getDate() - daysAgo)

    // More orders on recent days, weekends
    const dayOfWeek = orderDate.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    let ordersForDay: number
    if (daysAgo === 0) {
      // Today: 3-8 orders (some in progress)
      ordersForDay = randomInt(3, 8)
    } else if (daysAgo <= 7) {
      // Last week: 5-12 orders per day
      ordersForDay = isWeekend ? randomInt(8, 15) : randomInt(5, 12)
    } else {
      // Older: 3-8 orders per day
      ordersForDay = isWeekend ? randomInt(5, 10) : randomInt(3, 8)
    }

    for (let i = 0; i < ordersForDay; i++) {
      const orderId = `order-${daysAgo.toString().padStart(2, '0')}-${i.toString().padStart(3, '0')}-${Date.now()}`
      const tableId = randomItem(tableIds)
      const customerName = randomItem(CUSTOMER_NAMES)
      const status = daysAgo === 0 && i < 3 ? randomItem(['pending', 'confirmed', 'preparing', 'ready']) : getRandomStatus()

      // Create order items (1-5 items per order)
      const itemCount = randomInt(1, 5)
      let subtotal = 0
      const usedMenuIds = new Set<string>()

      for (let j = 0; j < itemCount; j++) {
        // Get unique menu item
        let menuId = randomItem(menuIds)
        let attempts = 0
        while (usedMenuIds.has(menuId) && attempts < 10) {
          menuId = randomItem(menuIds)
          attempts++
        }
        if (usedMenuIds.has(menuId)) continue
        usedMenuIds.add(menuId)

        const quantity = randomInt(1, 3)
        const unitPrice = MENU_PRICES[menuId]
        const itemSubtotal = quantity * unitPrice

        orderItems.push({
          id: `item-${orderId}-${j}`,
          order_id: orderId,
          menu_item_id: menuId,
          quantity,
          unit_price: unitPrice,
          subtotal: itemSubtotal,
          notes: Math.random() > 0.8 ? randomItem(['Pedas', 'Tidak pedas', 'Extra sambal', 'Tanpa bawang']) : null,
        })

        subtotal += itemSubtotal
      }

      const taxAmount = Math.round(subtotal * 0.11)
      const total = subtotal + taxAmount

      // Set timestamps
      const createdAt = new Date(orderDate)
      createdAt.setHours(randomInt(8, 21), randomInt(0, 59), randomInt(0, 59))

      const updatedAt = new Date(createdAt)
      if (status !== 'pending') {
        updatedAt.setMinutes(updatedAt.getMinutes() + randomInt(5, 30))
      }

      const isCompleted = status === 'completed'
      const isCancelled = status === 'cancelled'
      const isPaid = isCompleted || ['ready', 'preparing', 'confirmed'].includes(status)

      const paidAt = isPaid && !isCancelled ? new Date(updatedAt) : null
      if (paidAt) {
        paidAt.setMinutes(paidAt.getMinutes() + randomInt(1, 10))
      }

      orders.push({
        id: orderId,
        store_id: STORE_ID,
        table_id: tableId,
        order_number: generateOrderNumber(orderDate, orderIndex),
        status,
        payment_status: isCancelled ? 'refunded' : (isPaid ? 'paid' : 'unpaid'),
        customer_name: customerName,
        customer_phone: `0812${randomInt(10000000, 99999999)}`,
        notes: Math.random() > 0.7 ? randomItem(['Makan di tempat', 'Takeaway', 'Tidak pakai es', 'Pedas level 2']) : null,
        subtotal,
        tax_amount: taxAmount,
        service_charge_amount: 0,
        total,
        created_at: createdAt.toISOString(),
        updated_at: updatedAt.toISOString(),
        paid_at: paidAt?.toISOString() || null,
      })

      // Create payment
      const paymentMethod = randomItem(PAYMENT_METHODS)
      payments.push({
        id: `payment-${orderId}`,
        order_id: orderId,
        payment_method: paymentMethod,
        payment_gateway: paymentMethod === 'cash' ? null : 'midtrans',
        amount: total,
        status: isCancelled ? 'refunded' : (isPaid ? 'paid' : 'pending'),
        paid_at: paidAt?.toISOString() || null,
        created_at: createdAt.toISOString(),
      })

      orderIndex++
    }
  }

  console.log(`\n📝 Generated ${orders.length} orders with ${orderItems.length} items`)

  // Insert orders in batches
  console.log('\n📤 Inserting orders...')
  const BATCH_SIZE = 50

  for (let i = 0; i < orders.length; i += BATCH_SIZE) {
    const batch = orders.slice(i, i + BATCH_SIZE)
    const { error } = await supabase.from('orders').insert(batch)
    if (error) {
      console.error(`Error inserting orders batch ${i / BATCH_SIZE + 1}:`, error)
    } else {
      console.log(`  ✓ Inserted orders ${i + 1}-${Math.min(i + BATCH_SIZE, orders.length)}`)
    }
  }

  // Insert order items in batches
  console.log('\n📤 Inserting order items...')
  for (let i = 0; i < orderItems.length; i += BATCH_SIZE) {
    const batch = orderItems.slice(i, i + BATCH_SIZE)
    const { error } = await supabase.from('order_items').insert(batch)
    if (error) {
      console.error(`Error inserting order items batch ${i / BATCH_SIZE + 1}:`, error)
    } else {
      console.log(`  ✓ Inserted items ${i + 1}-${Math.min(i + BATCH_SIZE, orderItems.length)}`)
    }
  }

  // Insert payments in batches
  console.log('\n📤 Inserting payments...')
  for (let i = 0; i < payments.length; i += BATCH_SIZE) {
    const batch = payments.slice(i, i + BATCH_SIZE)
    const { error } = await supabase.from('payments').insert(batch)
    if (error) {
      console.error(`Error inserting payments batch ${i / BATCH_SIZE + 1}:`, error)
    } else {
      console.log(`  ✓ Inserted payments ${i + 1}-${Math.min(i + BATCH_SIZE, payments.length)}`)
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('📊 SUMMARY')
  console.log('='.repeat(50))

  const { data: orderStats } = await supabase
    .from('orders')
    .select('status, total')
    .eq('store_id', STORE_ID)

  if (orderStats) {
    const statusCounts = orderStats.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const totalRevenue = orderStats
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + (o.total || 0), 0)

    console.log('\nOrders by status:')
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`)
    })

    console.log(`\nTotal orders: ${orderStats.length}`)
    console.log(`Total revenue (completed): Rp ${totalRevenue.toLocaleString('id-ID')}`)
  }

  console.log('\n✅ Seeding completed!')
}

// Run the seeding
seedOrders().catch(console.error)
