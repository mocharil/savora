// Script to seed database with dummy data including images
const { createClient } = require('@supabase/supabase-js')
const https = require('https')
const http = require('http')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required in .env.local')
  console.log('\nTo get your service role key:')
  console.log('1. Go to Supabase Dashboard > Settings > API')
  console.log('2. Copy the "service_role" key (not anon key)')
  console.log('3. Add it to .env.local as SUPABASE_SERVICE_ROLE_KEY=your_key_here')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const STORE_ID = '22222222-2222-2222-2222-222222222222'
let OWNER_ID = null

// Food image URLs from Unsplash (free to use)
const foodImages = {
  // Makanan Utama
  'nasi-goreng': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop',
  'mie-goreng': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=300&fit=crop',
  'ayam-bakar': 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&h=300&fit=crop',
  'soto-ayam': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop',
  'rendang': 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=400&h=300&fit=crop',
  'nasi-campur': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop',
  // Minuman
  'es-teh': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop',
  'es-jeruk': 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=300&fit=crop',
  'es-campur': 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&h=300&fit=crop',
  'kopi': 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop',
  'jus-alpukat': 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&h=300&fit=crop',
  // Snack
  'lumpia': 'https://images.unsplash.com/photo-1548507200-f5d5765c5f06?w=400&h=300&fit=crop',
  'tahu': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
  'bakwan': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
  // Dessert
  'pisang-goreng': 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop',
  'es-cendol': 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=400&h=300&fit=crop',
  // Paket
  'paket': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
  // Store
  'logo': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop',
  'banner': 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&h=400&fit=crop',
}

// Helper to download image and upload to Supabase storage
async function downloadAndUploadImage(imageUrl, fileName, bucket = 'menu-images') {
  return new Promise((resolve, reject) => {
    const protocol = imageUrl.startsWith('https') ? https : http

    protocol.get(imageUrl, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadAndUploadImage(response.headers.location, fileName, bucket)
          .then(resolve)
          .catch(reject)
        return
      }

      if (response.statusCode !== 200) {
        resolve(null) // Return null if image fetch fails
        return
      }

      const chunks = []
      response.on('data', (chunk) => chunks.push(chunk))
      response.on('end', async () => {
        try {
          const buffer = Buffer.concat(chunks)
          const contentType = response.headers['content-type'] || 'image/jpeg'

          // Upload to Supabase storage
          const { data, error } = await supabase.storage
            .from(bucket)
            .upload(fileName, buffer, {
              contentType,
              upsert: true
            })

          if (error) {
            console.log(`    ⚠️ Storage upload failed for ${fileName}: ${error.message}`)
            resolve(imageUrl) // Fall back to original URL
            return
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName)

          resolve(publicUrl)
        } catch (err) {
          console.log(`    ⚠️ Error processing ${fileName}: ${err.message}`)
          resolve(imageUrl) // Fall back to original URL
        }
      })
      response.on('error', () => resolve(imageUrl))
    }).on('error', () => resolve(imageUrl))
  })
}

// Helper to generate random date in the past X days
function randomDate(daysAgo) {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo))
  date.setHours(Math.floor(Math.random() * 12) + 10)
  date.setMinutes(Math.floor(Math.random() * 60))
  return date.toISOString()
}

// Helper to generate specific date in the past
function specificDate(daysAgo, hour = 12) {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(hour)
  date.setMinutes(Math.floor(Math.random() * 60))
  return date.toISOString()
}

// Generate order number
function generateOrderNumber(index, date) {
  const d = new Date(date)
  const num = String(index).padStart(4, '0')
  return `ORD-${d.getFullYear()}${(d.getMonth() + 1).toString().padStart(2, '0')}${d.getDate().toString().padStart(2, '0')}-${num}`
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding with images...\n')

  try {
    // 1. Create storage buckets if they don't exist
    console.log('📦 Setting up storage buckets...')
    const buckets = ['menu-images', 'store-assets']
    for (const bucket of buckets) {
      const { error } = await supabase.storage.createBucket(bucket, {
        public: true,
        fileSizeLimit: 5242880 // 5MB
      })
      if (error && !error.message.includes('already exists')) {
        console.log(`  ⚠️ Bucket ${bucket}: ${error.message}`)
      } else {
        console.log(`  ✓ Bucket ${bucket} ready`)
      }
    }
    console.log('✅ Storage buckets ready\n')

    // 2. Create or get dummy auth user
    console.log('👤 Creating dummy user in auth.users...')
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(u => u.email === 'demo@savora.test')

    let userId
    if (existingUser) {
      userId = existingUser.id
      console.log(`  ℹ️  User already exists: ${userId}`)
    } else {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'demo@savora.test',
        password: 'Demo123!',
        email_confirm: true,
        user_metadata: { full_name: 'Demo Owner' }
      })
      if (authError) {
        console.error('❌ Failed to create auth user:', authError.message)
        process.exit(1)
      }
      userId = authData.user.id
      console.log(`  ✓ Created new user: ${userId}`)
    }
    OWNER_ID = userId
    console.log(`✅ User ID: ${userId}\n`)

    // 3. Create profile
    console.log('📝 Creating profile...')
    await supabase.from('profiles').upsert({
      id: userId,
      email: 'demo@savora.test',
      full_name: 'Demo Owner',
      role: 'owner',
      store_id: STORE_ID
    }, { onConflict: 'id' })
    console.log('✅ Profile created\n')

    // 4. Upload store images
    console.log('🖼️  Uploading store images...')
    const logoUrl = await downloadAndUploadImage(foodImages['logo'], 'store-logo.jpg', 'store-assets')
    console.log('  ✓ Logo uploaded')
    const bannerUrl = await downloadAndUploadImage(foodImages['banner'], 'store-banner.jpg', 'store-assets')
    console.log('  ✓ Banner uploaded')
    console.log('✅ Store images uploaded\n')

    // 5. Insert Store with images
    console.log('📦 Creating store...')
    const { error: storeError } = await supabase.from('stores').upsert({
      id: STORE_ID,
      owner_id: userId,
      name: 'Warung Savora',
      slug: 'warung-savora',
      description: 'Restoran dengan menu makanan Indonesia autentik yang lezat dan terjangkau. Kami menyajikan berbagai hidangan tradisional dengan cita rasa modern.',
      address: 'Jl. Sudirman No. 123, Jakarta Selatan 12930',
      phone: '081234567890',
      logo_url: logoUrl,
      banner_url: bannerUrl,
      tax_percentage: 10,
      service_charge_percentage: 5,
      operational_hours: {
        monday: { open: '10:00', close: '22:00', isOpen: true },
        tuesday: { open: '10:00', close: '22:00', isOpen: true },
        wednesday: { open: '10:00', close: '22:00', isOpen: true },
        thursday: { open: '10:00', close: '22:00', isOpen: true },
        friday: { open: '10:00', close: '23:00', isOpen: true },
        saturday: { open: '10:00', close: '23:00', isOpen: true },
        sunday: { open: '11:00', close: '21:00', isOpen: true },
      },
      is_active: true
    }, { onConflict: 'id' })
    if (storeError) throw storeError
    console.log('✅ Store created with images\n')

    // 6. Insert Categories
    console.log('📁 Creating categories...')
    const categories = [
      { id: '33333333-3333-3333-3333-333333333331', name: 'Makanan Utama', slug: 'makanan-utama', description: 'Hidangan utama yang mengenyangkan', sort_order: 1 },
      { id: '33333333-3333-3333-3333-333333333332', name: 'Minuman', slug: 'minuman', description: 'Minuman segar dan nikmat', sort_order: 2 },
      { id: '33333333-3333-3333-3333-333333333333', name: 'Snack', slug: 'snack', description: 'Camilan dan makanan ringan', sort_order: 3 },
      { id: '33333333-3333-3333-3333-333333333334', name: 'Dessert', slug: 'dessert', description: 'Hidangan penutup manis', sort_order: 4 },
      { id: '33333333-3333-3333-3333-333333333335', name: 'Paket Hemat', slug: 'paket-hemat', description: 'Paket makanan dengan harga spesial', sort_order: 5 }
    ]
    for (const cat of categories) {
      await supabase.from('categories').upsert({
        ...cat,
        store_id: STORE_ID,
        is_active: true
      }, { onConflict: 'id' })
      console.log(`  ✓ ${cat.name}`)
    }
    console.log('✅ Categories created\n')

    // 7. Insert Menu Items with images
    console.log('🍽️  Creating menu items with images...')
    const menuItems = [
      // Makanan Utama
      { id: '44444444-4444-4444-4444-444444444401', category_id: '33333333-3333-3333-3333-333333333331', name: 'Nasi Goreng Spesial', slug: 'nasi-goreng-spesial', description: 'Nasi goreng dengan telur mata sapi, ayam suwir, dan sayuran segar. Disajikan dengan kerupuk dan acar.', price: 35000, is_featured: true, imageKey: 'nasi-goreng' },
      { id: '44444444-4444-4444-4444-444444444402', category_id: '33333333-3333-3333-3333-333333333331', name: 'Mie Goreng Jawa', slug: 'mie-goreng-jawa', description: 'Mie goreng khas Jawa dengan bumbu rempah pilihan, telur, dan sayuran.', price: 30000, is_featured: true, imageKey: 'mie-goreng' },
      { id: '44444444-4444-4444-4444-444444444403', category_id: '33333333-3333-3333-3333-333333333331', name: 'Ayam Bakar Madu', slug: 'ayam-bakar-madu', description: 'Ayam kampung bakar dengan olesan madu spesial, disajikan dengan nasi putih dan lalapan.', price: 45000, is_featured: true, imageKey: 'ayam-bakar' },
      { id: '44444444-4444-4444-4444-444444444404', category_id: '33333333-3333-3333-3333-333333333331', name: 'Soto Ayam', slug: 'soto-ayam', description: 'Soto ayam kuah bening dengan rempah tradisional, dilengkapi soun, telur, dan emping.', price: 28000, imageKey: 'soto-ayam' },
      { id: '44444444-4444-4444-4444-444444444405', category_id: '33333333-3333-3333-3333-333333333331', name: 'Rendang Sapi', slug: 'rendang-sapi', description: 'Rendang daging sapi empuk dengan bumbu Padang autentik, dimasak hingga 8 jam.', price: 55000, is_featured: true, imageKey: 'rendang' },
      { id: '44444444-4444-4444-4444-444444444406', category_id: '33333333-3333-3333-3333-333333333331', name: 'Nasi Campur Bali', slug: 'nasi-campur-bali', description: 'Nasi putih dengan berbagai lauk khas Bali: ayam suwir, sate lilit, dan sambal matah.', price: 42000, imageKey: 'nasi-campur' },
      // Minuman
      { id: '44444444-4444-4444-4444-444444444411', category_id: '33333333-3333-3333-3333-333333333332', name: 'Es Teh Manis', slug: 'es-teh-manis', description: 'Teh manis dingin yang menyegarkan, dibuat dari teh pilihan.', price: 8000, imageKey: 'es-teh' },
      { id: '44444444-4444-4444-4444-444444444412', category_id: '33333333-3333-3333-3333-333333333332', name: 'Es Jeruk Peras', slug: 'es-jeruk-peras', description: 'Jus jeruk segar diperas langsung, tanpa pemanis buatan.', price: 12000, imageKey: 'es-jeruk' },
      { id: '44444444-4444-4444-4444-444444444413', category_id: '33333333-3333-3333-3333-333333333332', name: 'Es Campur', slug: 'es-campur', description: 'Es serut dengan berbagai topping: cincau, kolang-kaling, nata de coco, dan sirup.', price: 18000, is_featured: true, imageKey: 'es-campur' },
      { id: '44444444-4444-4444-4444-444444444414', category_id: '33333333-3333-3333-3333-333333333332', name: 'Kopi Susu Gula Aren', slug: 'kopi-susu-gula-aren', description: 'Kopi robusta dengan susu segar dan gula aren asli.', price: 15000, imageKey: 'kopi' },
      { id: '44444444-4444-4444-4444-444444444415', category_id: '33333333-3333-3333-3333-333333333332', name: 'Jus Alpukat', slug: 'jus-alpukat', description: 'Jus alpukat kental dengan susu kental manis dan coklat.', price: 20000, imageKey: 'jus-alpukat' },
      // Snack
      { id: '44444444-4444-4444-4444-444444444421', category_id: '33333333-3333-3333-3333-333333333333', name: 'Lumpia Goreng', slug: 'lumpia-goreng', description: 'Lumpia Semarang isi rebung dan udang, disajikan dengan saus.', price: 18000, imageKey: 'lumpia' },
      { id: '44444444-4444-4444-4444-444444444422', category_id: '33333333-3333-3333-3333-333333333333', name: 'Tahu Crispy', slug: 'tahu-crispy', description: 'Tahu goreng crispy dengan sambal kecap pedas manis.', price: 15000, imageKey: 'tahu' },
      { id: '44444444-4444-4444-4444-444444444423', category_id: '33333333-3333-3333-3333-333333333333', name: 'Bakwan Jagung', slug: 'bakwan-jagung', description: 'Bakwan jagung manis dan renyah, cocok untuk cemilan.', price: 12000, imageKey: 'bakwan' },
      // Dessert
      { id: '44444444-4444-4444-4444-444444444431', category_id: '33333333-3333-3333-3333-333333333334', name: 'Pisang Goreng Keju', slug: 'pisang-goreng-keju', description: 'Pisang goreng crispy dengan taburan keju dan coklat leleh.', price: 15000, imageKey: 'pisang-goreng' },
      { id: '44444444-4444-4444-4444-444444444432', category_id: '33333333-3333-3333-3333-333333333334', name: 'Es Cendol', slug: 'es-cendol', description: 'Es cendol Bandung dengan santan, gula merah, dan cendol pandan.', price: 12000, imageKey: 'es-cendol' },
      // Paket Hemat
      { id: '44444444-4444-4444-4444-444444444441', category_id: '33333333-3333-3333-3333-333333333335', name: 'Paket Nasi Goreng', slug: 'paket-nasi-goreng', description: 'Nasi Goreng Spesial + Es Teh Manis + Kerupuk', price: 40000, discount_price: 35000, imageKey: 'paket' },
      { id: '44444444-4444-4444-4444-444444444442', category_id: '33333333-3333-3333-3333-333333333335', name: 'Paket Ayam Bakar', slug: 'paket-ayam-bakar', description: 'Ayam Bakar Madu + Nasi Putih + Es Teh Manis + Lalapan', price: 55000, discount_price: 48000, imageKey: 'paket' }
    ]

    for (const item of menuItems) {
      // Upload menu image
      const imageUrl = await downloadAndUploadImage(
        foodImages[item.imageKey] || foodImages['paket'],
        `menu-${item.slug}.jpg`,
        'menu-images'
      )

      await supabase.from('menu_items').upsert({
        id: item.id,
        store_id: STORE_ID,
        category_id: item.category_id,
        name: item.name,
        slug: item.slug,
        description: item.description,
        price: item.price,
        discount_price: item.discount_price || null,
        image_url: imageUrl,
        is_available: true,
        is_featured: item.is_featured || false,
        sort_order: 0
      }, { onConflict: 'id' })
      console.log(`  ✓ ${item.name}`)
    }
    console.log('✅ Menu items created with images\n')

    // 8. Insert Tables
    console.log('🪑 Creating tables...')
    const tables = [
      { id: '55555555-5555-5555-5555-555555555501', table_number: '1', capacity: 4, location: 'Indoor', qr_code: 'TABLE-001-INDOOR' },
      { id: '55555555-5555-5555-5555-555555555502', table_number: '2', capacity: 4, location: 'Indoor', qr_code: 'TABLE-002-INDOOR' },
      { id: '55555555-5555-5555-5555-555555555503', table_number: '3', capacity: 2, location: 'Indoor', qr_code: 'TABLE-003-INDOOR' },
      { id: '55555555-5555-5555-5555-555555555504', table_number: '4', capacity: 6, location: 'Indoor', qr_code: 'TABLE-004-INDOOR' },
      { id: '55555555-5555-5555-5555-555555555505', table_number: '5', capacity: 4, location: 'Outdoor', qr_code: 'TABLE-005-OUTDOOR' },
      { id: '55555555-5555-5555-5555-555555555506', table_number: '6', capacity: 4, location: 'Outdoor', qr_code: 'TABLE-006-OUTDOOR' },
      { id: '55555555-5555-5555-5555-555555555507', table_number: 'VIP-1', capacity: 8, location: 'VIP Room', qr_code: 'TABLE-VIP-001' },
      { id: '55555555-5555-5555-5555-555555555508', table_number: 'VIP-2', capacity: 10, location: 'VIP Room', qr_code: 'TABLE-VIP-002' }
    ]
    for (const table of tables) {
      await supabase.from('tables').upsert({
        ...table,
        store_id: STORE_ID,
        is_active: true
      }, { onConflict: 'id' })
      console.log(`  ✓ Meja ${table.table_number} (${table.location}, ${table.capacity} orang)`)
    }
    console.log('✅ Tables created\n')

    // 9. Create Orders with realistic distribution for analytics
    console.log('📋 Creating orders for analytics (150 orders over 30 days)...')

    // Clear existing orders first
    await supabase.from('order_items').delete().eq('order_id', STORE_ID).neq('id', 'x')
    await supabase.from('orders').delete().eq('store_id', STORE_ID)

    const statusWeights = {
      completed: 60,  // 60% completed
      preparing: 10,  // 10% preparing
      ready: 10,      // 10% ready
      pending: 15,    // 15% pending (new orders)
      cancelled: 5    // 5% cancelled
    }

    function getWeightedStatus() {
      const rand = Math.random() * 100
      let cumulative = 0
      for (const [status, weight] of Object.entries(statusWeights)) {
        cumulative += weight
        if (rand < cumulative) return status
      }
      return 'completed'
    }

    // Customer names for variety
    const customerNames = [
      'Budi Santoso', 'Siti Rahayu', 'Ahmad Hidayat', 'Dewi Lestari', 'Eko Prasetyo',
      'Fitri Handayani', 'Gunawan', 'Hendra Wijaya', 'Indah Permata', 'Joko Susilo',
      'Kartika Sari', 'Lukman Hakim', 'Maya Putri', 'Nugroho', 'Oktavia',
      'Putra Pratama', 'Ratna Wulandari', 'Surya Darma', 'Tina Marlina', 'Umar Said'
    ]

    let orderIndex = 1
    const totalOrders = 150

    // Generate orders distributed over 30 days
    for (let day = 0; day < 30; day++) {
      // More orders on weekends
      const dayOfWeek = new Date(Date.now() - day * 24 * 60 * 60 * 1000).getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      const ordersPerDay = isWeekend ? Math.floor(Math.random() * 4) + 6 : Math.floor(Math.random() * 3) + 3

      for (let i = 0; i < ordersPerDay && orderIndex <= totalOrders; i++) {
        const orderId = `66666666-6666-6666-6666-66666666${String(orderIndex).padStart(4, '0')}`
        const status = day < 2 ? getWeightedStatus() : (Math.random() > 0.1 ? 'completed' : 'cancelled')
        const paymentStatus = status === 'completed' ? 'paid' : (status === 'cancelled' ? 'failed' : 'unpaid')
        const tableIdx = Math.floor(Math.random() * tables.length)

        // Peak hours: 12-14 (lunch), 18-21 (dinner)
        const hour = Math.random() > 0.5
          ? Math.floor(Math.random() * 3) + 12  // Lunch
          : Math.floor(Math.random() * 4) + 18  // Dinner
        const createdAt = specificDate(day, hour)

        // Generate order items
        const numItems = Math.floor(Math.random() * 4) + 1
        const orderItemsData = []
        let subtotal = 0

        const shuffledMenu = [...menuItems].sort(() => Math.random() - 0.5)
        for (let j = 0; j < numItems; j++) {
          const item = shuffledMenu[j]
          const quantity = Math.floor(Math.random() * 2) + 1
          const price = item.discount_price || item.price
          const itemSubtotal = price * quantity
          subtotal += itemSubtotal

          orderItemsData.push({
            id: `77777777-7777-${String(orderIndex).padStart(4, '0')}-${String(j).padStart(4, '0')}-000000000000`,
            order_id: orderId,
            menu_item_id: item.id,
            quantity,
            price,
            notes: Math.random() > 0.8 ? 'Pedas level 2' : null,
            created_at: createdAt
          })
        }

        const taxAmount = Math.round(subtotal * 0.1)
        const serviceAmount = Math.round(subtotal * 0.05)
        const totalAmount = subtotal + taxAmount + serviceAmount

        // Insert order
        await supabase.from('orders').upsert({
          id: orderId,
          store_id: STORE_ID,
          table_id: tables[tableIdx].id,
          order_number: generateOrderNumber(orderIndex, createdAt),
          customer_name: customerNames[Math.floor(Math.random() * customerNames.length)],
          customer_phone: `08${Math.floor(Math.random() * 900000000 + 100000000)}`,
          status,
          subtotal,
          tax_amount: taxAmount,
          service_charge: serviceAmount,
          total_amount: totalAmount,
          payment_status: paymentStatus,
          payment_method: paymentStatus === 'paid' ? (Math.random() > 0.3 ? 'qris' : 'cash') : null,
          notes: Math.random() > 0.9 ? 'Mohon diproses cepat' : null,
          created_at: createdAt,
          updated_at: createdAt
        }, { onConflict: 'id' })

        // Insert order items
        for (const item of orderItemsData) {
          await supabase.from('order_items').upsert(item, { onConflict: 'id' })
        }

        orderIndex++
      }

      if (day % 5 === 0) {
        console.log(`  ✓ Day ${day + 1}: ${orderIndex - 1} orders created so far...`)
      }
    }
    console.log(`✅ Orders created (${orderIndex - 1} orders)\n`)

    // 10. Summary
    console.log('🎉 Database seeding completed successfully!')
    console.log('\n📊 Summary:')
    console.log('   - 1 Store (Warung Savora) with logo & banner')
    console.log('   - 5 Categories')
    console.log('   - 18 Menu Items with images')
    console.log('   - 8 Tables')
    console.log(`   - ${orderIndex - 1} Orders with items (30 days of data)`)
    console.log('\n🔗 URLs:')
    console.log('   - Landing Page: http://localhost:3000')
    console.log('   - Admin Dashboard: http://localhost:3000/admin/dashboard')
    console.log('   - Customer Order: http://localhost:3000/warung-savora/order')
    console.log('   - QR Code URL: http://localhost:3000/warung-savora/order?table=TABLE-001-INDOOR')
    console.log('\n👤 Demo Login:')
    console.log('   - Email: demo@savora.test')
    console.log('   - Password: Demo123!')

  } catch (error) {
    console.error('❌ Error seeding database:', error.message)
    console.error(error)
    process.exit(1)
  }
}

seedDatabase()
