// Script to seed database with multitenancy dummy data
const { createClient } = require('@supabase/supabase-js')
const https = require('https')
const http = require('http')
const bcrypt = require('bcryptjs')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// IDs
const STORE_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
const OUTLET_MAIN_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01'
const OUTLET_BRANCH_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02'
let OWNER_ID = null

// Food images from Unsplash
const foodImages = {
  'nasi-goreng': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop',
  'mie-goreng': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=300&fit=crop',
  'ayam-bakar': 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&h=300&fit=crop',
  'soto-ayam': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop',
  'rendang': 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=400&h=300&fit=crop',
  'nasi-campur': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop',
  'es-teh': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop',
  'es-jeruk': 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=300&fit=crop',
  'es-campur': 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&h=300&fit=crop',
  'kopi': 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop',
  'jus-alpukat': 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&h=300&fit=crop',
  'lumpia': 'https://images.unsplash.com/photo-1548507200-f5d5765c5f06?w=400&h=300&fit=crop',
  'tahu': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
  'bakwan': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
  'pisang-goreng': 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop',
  'es-cendol': 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=400&h=300&fit=crop',
  'paket': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
  'logo': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop',
  'banner': 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&h=400&fit=crop',
}

// Helper to download and upload image
async function downloadAndUploadImage(imageUrl, fileName, bucket = 'menu-images') {
  return new Promise((resolve, reject) => {
    const protocol = imageUrl.startsWith('https') ? https : http

    protocol.get(imageUrl, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadAndUploadImage(response.headers.location, fileName, bucket)
          .then(resolve)
          .catch(reject)
        return
      }

      if (response.statusCode !== 200) {
        resolve(imageUrl)
        return
      }

      const chunks = []
      response.on('data', (chunk) => chunks.push(chunk))
      response.on('end', async () => {
        try {
          const buffer = Buffer.concat(chunks)
          const contentType = response.headers['content-type'] || 'image/jpeg'

          const { error } = await supabase.storage
            .from(bucket)
            .upload(fileName, buffer, {
              contentType,
              upsert: true
            })

          if (error) {
            resolve(imageUrl)
            return
          }

          const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName)

          resolve(publicUrl)
        } catch (err) {
          resolve(imageUrl)
        }
      })
      response.on('error', () => resolve(imageUrl))
    }).on('error', () => resolve(imageUrl))
  })
}

async function seedDatabase() {
  console.log('🌱 Starting multitenancy database seeding...\n')

  try {
    // 1. Create storage buckets
    console.log('📦 Setting up storage buckets...')
    const buckets = ['menu-images', 'store-assets']
    for (const bucket of buckets) {
      const { error } = await supabase.storage.createBucket(bucket, {
        public: true,
        fileSizeLimit: 5242880
      })
      if (error && !error.message.includes('already exists')) {
        console.log(`  ⚠️ Bucket ${bucket}: ${error.message}`)
      } else {
        console.log(`  ✓ Bucket ${bucket} ready`)
      }
    }
    console.log('✅ Storage buckets ready\n')

    // 2. Create user in custom users table
    console.log('👤 Creating tenant owner user...')
    const passwordHash = await bcrypt.hash('Admin123!', 10)

    // First check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'admin@kedaikopi.com')
      .single()

    if (existingUser) {
      OWNER_ID = existingUser.id
      console.log(`  ℹ️  User already exists: ${OWNER_ID}`)
    } else {
      const userId = 'cccccccc-cccc-cccc-cccc-cccccccccccc'
      const { error: userError } = await supabase.from('users').insert({
        id: userId,
        email: 'admin@kedaikopi.com',
        password_hash: passwordHash,
        role: 'owner',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

      if (userError && !userError.message.includes('duplicate')) {
        console.error('❌ Failed to create user:', userError.message)
        process.exit(1)
      }
      OWNER_ID = userId
      console.log(`  ✓ Created new user: ${OWNER_ID}`)
    }
    console.log(`✅ User ready: ${OWNER_ID}\n`)

    // 3. Create profile
    console.log('📝 Creating profile...')
    await supabase.from('profiles').upsert({
      id: OWNER_ID,
      email: 'admin@kedaikopi.com',
      full_name: 'Ahmad Susanto',
      role: 'owner',
      store_id: STORE_ID
    }, { onConflict: 'id' })
    console.log('✅ Profile created\n')

    // 4. Upload store images
    console.log('🖼️  Uploading store images...')
    const logoUrl = await downloadAndUploadImage(foodImages['logo'], 'kedaikopi-logo.jpg', 'store-assets')
    console.log('  ✓ Logo uploaded')
    const bannerUrl = await downloadAndUploadImage(foodImages['banner'], 'kedaikopi-banner.jpg', 'store-assets')
    console.log('  ✓ Banner uploaded')
    console.log('✅ Store images uploaded\n')

    // 5. Create Store/Tenant
    console.log('🏪 Creating store (tenant)...')
    const { error: storeError } = await supabase.from('stores').upsert({
      id: STORE_ID,
      owner_id: OWNER_ID,
      name: 'Kedai Kopi Nusantara',
      slug: 'kedai-kopi-nusantara',
      description: 'Kedai kopi modern dengan cita rasa Indonesia. Menyajikan berbagai kopi specialty dan makanan ringan yang nikmat.',
      address: 'Jl. Gatot Subroto No. 45, Jakarta Selatan',
      phone: '081234567890',
      logo_url: logoUrl,
      banner_url: bannerUrl,
      tax_percentage: 11,
      service_charge_percentage: 5,
      operational_hours: {
        monday: { open: '07:00', close: '22:00', isOpen: true },
        tuesday: { open: '07:00', close: '22:00', isOpen: true },
        wednesday: { open: '07:00', close: '22:00', isOpen: true },
        thursday: { open: '07:00', close: '22:00', isOpen: true },
        friday: { open: '07:00', close: '23:00', isOpen: true },
        saturday: { open: '08:00', close: '23:00', isOpen: true },
        sunday: { open: '08:00', close: '21:00', isOpen: true },
      },
      settings: {
        businessType: 'cafe',
        currency: 'IDR',
        timezone: 'Asia/Jakarta',
        language: 'id',
        onboardingCompleted: true,
        onboardingStep: 5
      },
      is_active: true
    }, { onConflict: 'id' })
    if (storeError) throw storeError
    console.log('✅ Store created\n')

    // 6. Create Outlets
    console.log('🏢 Creating outlets...')

    // Main outlet - Jakarta Pusat
    await supabase.from('outlets').upsert({
      id: OUTLET_MAIN_ID,
      store_id: STORE_ID,
      name: 'Kedai Kopi Pusat',
      slug: 'pusat',
      code: 'KKN-PST',
      address: 'Jl. Gatot Subroto No. 45, Jakarta Selatan 12930',
      phone: '021-5551234',
      is_main: true,
      is_active: true,
      tax_percentage: 11,
      service_charge_percentage: 5,
      settings: {
        allowTakeaway: true,
        allowDineIn: true,
        allowDelivery: true,
        minimumOrderAmount: 25000,
        estimatedPrepTime: 15,
        autoAcceptOrders: false
      },
      theme: {
        primaryColor: '#8B4513',
        secondaryColor: '#D2691E',
        backgroundColor: '#FFF8DC',
        textColor: '#1f2937',
        fontFamily: 'Poppins',
        logoUrl: logoUrl,
        bannerUrl: bannerUrl,
        customCss: null
      },
      branding: {
        businessName: 'Kedai Kopi Nusantara - Pusat',
        tagline: 'Kopi Indonesia, Rasa Dunia',
        description: 'Outlet utama kami di jantung Jakarta',
        socialLinks: { instagram: '@kedaikopinusantara' },
        contactInfo: { whatsapp: '081234567890' }
      }
    }, { onConflict: 'id' })
    console.log('  ✓ Kedai Kopi Pusat (Main)')

    // Branch outlet - Bandung
    await supabase.from('outlets').upsert({
      id: OUTLET_BRANCH_ID,
      store_id: STORE_ID,
      name: 'Kedai Kopi Bandung',
      slug: 'bandung',
      code: 'KKN-BDG',
      address: 'Jl. Braga No. 88, Bandung 40111',
      phone: '022-4231234',
      is_main: false,
      is_active: true,
      tax_percentage: 10,
      service_charge_percentage: 5,
      settings: {
        allowTakeaway: true,
        allowDineIn: true,
        allowDelivery: false,
        minimumOrderAmount: 20000,
        estimatedPrepTime: 10,
        autoAcceptOrders: true
      },
      theme: {
        primaryColor: '#2E8B57',
        secondaryColor: '#3CB371',
        backgroundColor: '#F0FFF0',
        textColor: '#1f2937',
        fontFamily: 'Inter',
        logoUrl: logoUrl,
        bannerUrl: null,
        customCss: null
      },
      branding: {
        businessName: 'Kedai Kopi Nusantara - Bandung',
        tagline: 'Ngopi di Kota Kembang',
        description: 'Cabang kami di Bandung dengan suasana sejuk',
        socialLinks: { instagram: '@kedaikopibandung' },
        contactInfo: { whatsapp: '081234567891' }
      }
    }, { onConflict: 'id' })
    console.log('  ✓ Kedai Kopi Bandung (Branch)')
    console.log('✅ Outlets created\n')

    // 7. Create Categories
    console.log('📁 Creating categories...')
    const categories = [
      { id: 'dddddddd-dddd-dddd-dddd-dddddddddd01', name: 'Kopi', slug: 'kopi', description: 'Berbagai varian kopi pilihan', sort_order: 1 },
      { id: 'dddddddd-dddd-dddd-dddd-dddddddddd02', name: 'Non-Kopi', slug: 'non-kopi', description: 'Minuman segar tanpa kafein', sort_order: 2 },
      { id: 'dddddddd-dddd-dddd-dddd-dddddddddd03', name: 'Makanan Berat', slug: 'makanan-berat', description: 'Makanan utama yang mengenyangkan', sort_order: 3 },
      { id: 'dddddddd-dddd-dddd-dddd-dddddddddd04', name: 'Snack', slug: 'snack', description: 'Camilan dan makanan ringan', sort_order: 4 },
      { id: 'dddddddd-dddd-dddd-dddd-dddddddddd05', name: 'Dessert', slug: 'dessert', description: 'Hidangan penutup manis', sort_order: 5 }
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

    // 8. Create Menu Items
    console.log('🍽️  Creating menu items...')
    const menuItems = [
      // Kopi
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', category_id: 'dddddddd-dddd-dddd-dddd-dddddddddd01', name: 'Kopi Susu Gula Aren', slug: 'kopi-susu-gula-aren', description: 'Espresso, susu segar, dan gula aren asli. Best seller!', price: 25000, is_featured: true, imageKey: 'kopi' },
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', category_id: 'dddddddd-dddd-dddd-dddd-dddddddddd01', name: 'Americano', slug: 'americano', description: 'Double shot espresso dengan air panas', price: 22000, imageKey: 'kopi' },
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee03', category_id: 'dddddddd-dddd-dddd-dddd-dddddddddd01', name: 'Cappuccino', slug: 'cappuccino', description: 'Espresso dengan steamed milk dan foam lembut', price: 28000, is_featured: true, imageKey: 'kopi' },
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee04', category_id: 'dddddddd-dddd-dddd-dddd-dddddddddd01', name: 'Latte', slug: 'latte', description: 'Espresso dengan susu steamed yang creamy', price: 28000, imageKey: 'kopi' },
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee05', category_id: 'dddddddd-dddd-dddd-dddd-dddddddddd01', name: 'V60 Single Origin', slug: 'v60-single-origin', description: 'Pour over V60 dengan biji kopi Aceh Gayo', price: 35000, imageKey: 'kopi' },

      // Non-Kopi
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee11', category_id: 'dddddddd-dddd-dddd-dddd-dddddddddd02', name: 'Matcha Latte', slug: 'matcha-latte', description: 'Green tea matcha premium dengan susu segar', price: 30000, is_featured: true, imageKey: 'es-teh' },
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee12', category_id: 'dddddddd-dddd-dddd-dddd-dddddddddd02', name: 'Coklat Panas', slug: 'coklat-panas', description: 'Premium dark chocolate dengan susu hangat', price: 25000, imageKey: 'kopi' },
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee13', category_id: 'dddddddd-dddd-dddd-dddd-dddddddddd02', name: 'Es Teh Tarik', slug: 'es-teh-tarik', description: 'Teh tarik ala Malaysia dengan susu kental', price: 18000, imageKey: 'es-teh' },
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee14', category_id: 'dddddddd-dddd-dddd-dddd-dddddddddd02', name: 'Jus Alpukat', slug: 'jus-alpukat', description: 'Alpukat segar blend dengan susu dan coklat', price: 25000, imageKey: 'jus-alpukat' },
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee15', category_id: 'dddddddd-dddd-dddd-dddd-dddddddddd02', name: 'Es Jeruk Peras', slug: 'es-jeruk-peras', description: 'Jeruk segar diperas langsung', price: 15000, imageKey: 'es-jeruk' },

      // Makanan Berat
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee21', category_id: 'dddddddd-dddd-dddd-dddd-dddddddddd03', name: 'Nasi Goreng Kedai', slug: 'nasi-goreng-kedai', description: 'Nasi goreng spesial dengan telur ceplok dan ayam suwir', price: 35000, is_featured: true, imageKey: 'nasi-goreng' },
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee22', category_id: 'dddddddd-dddd-dddd-dddd-dddddddddd03', name: 'Mie Goreng Jawa', slug: 'mie-goreng-jawa', description: 'Mie goreng dengan bumbu khas Jawa dan sayuran', price: 32000, imageKey: 'mie-goreng' },
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee23', category_id: 'dddddddd-dddd-dddd-dddd-dddddddddd03', name: 'Chicken Teriyaki Rice', slug: 'chicken-teriyaki-rice', description: 'Nasi dengan ayam teriyaki dan salad segar', price: 42000, imageKey: 'ayam-bakar' },
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee24', category_id: 'dddddddd-dddd-dddd-dddd-dddddddddd03', name: 'Soto Ayam', slug: 'soto-ayam', description: 'Soto ayam kuah bening dengan nasi dan emping', price: 30000, imageKey: 'soto-ayam' },

      // Snack
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee31', category_id: 'dddddddd-dddd-dddd-dddd-dddddddddd04', name: 'French Fries', slug: 'french-fries', description: 'Kentang goreng crispy dengan saus pilihan', price: 22000, imageKey: 'bakwan' },
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee32', category_id: 'dddddddd-dddd-dddd-dddd-dddddddddd04', name: 'Risoles Mayo', slug: 'risoles-mayo', description: 'Risoles isi ayam ragout dengan mayonaise', price: 18000, imageKey: 'lumpia' },
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee33', category_id: 'dddddddd-dddd-dddd-dddd-dddddddddd04', name: 'Tahu Crispy', slug: 'tahu-crispy', description: 'Tahu goreng crispy dengan sambal kecap', price: 15000, imageKey: 'tahu' },
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee34', category_id: 'dddddddd-dddd-dddd-dddd-dddddddddd04', name: 'Roti Bakar Coklat Keju', slug: 'roti-bakar-coklat-keju', description: 'Roti panggang dengan selai coklat dan keju leleh', price: 20000, is_featured: true, imageKey: 'pisang-goreng' },

      // Dessert
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee41', category_id: 'dddddddd-dddd-dddd-dddd-dddddddddd05', name: 'Pisang Goreng Keju', slug: 'pisang-goreng-keju', description: 'Pisang goreng crispy dengan topping keju dan coklat', price: 18000, imageKey: 'pisang-goreng' },
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee42', category_id: 'dddddddd-dddd-dddd-dddd-dddddddddd05', name: 'Es Cendol', slug: 'es-cendol', description: 'Es cendol dengan santan dan gula merah', price: 15000, imageKey: 'es-cendol' },
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee43', category_id: 'dddddddd-dddd-dddd-dddd-dddddddddd05', name: 'Affogato', slug: 'affogato', description: 'Vanilla ice cream dengan shot espresso', price: 28000, is_featured: true, imageKey: 'es-campur' }
    ]

    for (const item of menuItems) {
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
        discount_price: null,
        image_url: imageUrl,
        is_available: true,
        is_featured: item.is_featured || false,
        sort_order: 0
      }, { onConflict: 'id' })
      console.log(`  ✓ ${item.name}`)
    }
    console.log('✅ Menu items created\n')

    // 9. Initialize outlet_menu_items (with some price differences for branch)
    console.log('🔗 Setting up outlet menu items...')

    // Call the initialize function for each outlet
    await supabase.rpc('initialize_outlet_menu', { p_outlet_id: OUTLET_MAIN_ID })
    console.log('  ✓ Main outlet menu initialized')

    await supabase.rpc('initialize_outlet_menu', { p_outlet_id: OUTLET_BRANCH_ID })
    console.log('  ✓ Branch outlet menu initialized')

    // Set some different prices for Bandung outlet (slightly cheaper)
    const bandungPriceAdjustments = [
      { menu_item_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', price: 23000 }, // Kopi Susu
      { menu_item_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee21', price: 32000 }, // Nasi Goreng
      { menu_item_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee03', price: 26000 }, // Cappuccino
    ]

    for (const adj of bandungPriceAdjustments) {
      await supabase.from('outlet_menu_items')
        .update({ price: adj.price })
        .eq('outlet_id', OUTLET_BRANCH_ID)
        .eq('menu_item_id', adj.menu_item_id)
    }
    console.log('  ✓ Bandung outlet prices adjusted')
    console.log('✅ Outlet menu items configured\n')

    // 10. Create Tables for both outlets
    console.log('🪑 Creating tables...')

    // Main outlet tables
    const mainTables = [
      { id: 'ffffffff-ffff-ffff-ffff-ffffffffffff01', table_number: '1', capacity: 4, location: 'Indoor', qr_code: 'KKN-PST-T01' },
      { id: 'ffffffff-ffff-ffff-ffff-ffffffffffff02', table_number: '2', capacity: 4, location: 'Indoor', qr_code: 'KKN-PST-T02' },
      { id: 'ffffffff-ffff-ffff-ffff-ffffffffffff03', table_number: '3', capacity: 2, location: 'Indoor', qr_code: 'KKN-PST-T03' },
      { id: 'ffffffff-ffff-ffff-ffff-ffffffffffff04', table_number: '4', capacity: 6, location: 'Outdoor', qr_code: 'KKN-PST-T04' },
      { id: 'ffffffff-ffff-ffff-ffff-ffffffffffff05', table_number: '5', capacity: 4, location: 'Outdoor', qr_code: 'KKN-PST-T05' },
    ]

    for (const table of mainTables) {
      await supabase.from('tables').upsert({
        ...table,
        store_id: STORE_ID,
        outlet_id: OUTLET_MAIN_ID,
        is_active: true
      }, { onConflict: 'id' })
      console.log(`  ✓ [Pusat] Meja ${table.table_number}`)
    }

    // Branch outlet tables
    const branchTables = [
      { id: 'ffffffff-ffff-ffff-ffff-ffffffffffff11', table_number: '1', capacity: 4, location: 'Lantai 1', qr_code: 'KKN-BDG-T01' },
      { id: 'ffffffff-ffff-ffff-ffff-ffffffffffff12', table_number: '2', capacity: 4, location: 'Lantai 1', qr_code: 'KKN-BDG-T02' },
      { id: 'ffffffff-ffff-ffff-ffff-ffffffffffff13', table_number: '3', capacity: 2, location: 'Lantai 2', qr_code: 'KKN-BDG-T03' },
      { id: 'ffffffff-ffff-ffff-ffff-ffffffffffff14', table_number: '4', capacity: 6, location: 'Lantai 2', qr_code: 'KKN-BDG-T04' },
    ]

    for (const table of branchTables) {
      await supabase.from('tables').upsert({
        ...table,
        store_id: STORE_ID,
        outlet_id: OUTLET_BRANCH_ID,
        is_active: true
      }, { onConflict: 'id' })
      console.log(`  ✓ [Bandung] Meja ${table.table_number}`)
    }
    console.log('✅ Tables created\n')

    // Summary
    console.log('═══════════════════════════════════════════════════════════')
    console.log('🎉 MULTITENANCY SEEDING COMPLETED!')
    console.log('═══════════════════════════════════════════════════════════\n')

    console.log('📊 DATA SUMMARY:')
    console.log('   ├─ 1 Tenant/Store: Kedai Kopi Nusantara')
    console.log('   ├─ 2 Outlets:')
    console.log('   │   ├─ Kedai Kopi Pusat (Jakarta) - Main')
    console.log('   │   └─ Kedai Kopi Bandung - Branch')
    console.log('   ├─ 5 Categories')
    console.log('   ├─ 21 Menu Items')
    console.log('   └─ 9 Tables (5 + 4)\n')

    console.log('═══════════════════════════════════════════════════════════')
    console.log('🔐 ADMIN LOGIN:')
    console.log('═══════════════════════════════════════════════════════════')
    console.log('   URL:      http://localhost:3000/login')
    console.log('   Email:    admin@kedaikopi.com')
    console.log('   Password: Admin123!')
    console.log('')

    console.log('═══════════════════════════════════════════════════════════')
    console.log('🛒 CUSTOMER ORDER PAGES:')
    console.log('═══════════════════════════════════════════════════════════')
    console.log('')
    console.log('📍 OUTLET PUSAT (Jakarta):')
    console.log('   Menu Page: http://localhost:3000/kedai-kopi-nusantara/pusat/order')
    console.log('   With Table: http://localhost:3000/kedai-kopi-nusantara/pusat/order?table=KKN-PST-T01')
    console.log('')
    console.log('📍 OUTLET BANDUNG:')
    console.log('   Menu Page: http://localhost:3000/kedai-kopi-nusantara/bandung/order')
    console.log('   With Table: http://localhost:3000/kedai-kopi-nusantara/bandung/order?table=KKN-BDG-T01')
    console.log('')
    console.log('═══════════════════════════════════════════════════════════\n')

  } catch (error) {
    console.error('❌ Error seeding database:', error.message)
    console.error(error)
    process.exit(1)
  }
}

seedDatabase()
