// Simple seed script that works without all multitenancy columns
// Run migration first for full features, or use this for basic data
const { createClient } = require('@supabase/supabase-js')
const https = require('https')
const http = require('http')
const bcrypt = require('bcryptjs')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// IDs
const STORE_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
const OUTLET_MAIN_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01'
const OUTLET_BRANCH_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02'
let OWNER_ID = null

// Food images
const foodImages = {
  'kopi': 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop',
  'nasi-goreng': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop',
  'mie-goreng': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=300&fit=crop',
  'ayam-bakar': 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&h=300&fit=crop',
  'soto': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop',
  'es-teh': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop',
  'jus': 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&h=300&fit=crop',
  'snack': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
  'dessert': 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop',
  'logo': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop',
  'banner': 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&h=400&fit=crop',
}

async function downloadAndUploadImage(imageUrl, fileName, bucket = 'menu-images') {
  return new Promise((resolve) => {
    const protocol = imageUrl.startsWith('https') ? https : http
    protocol.get(imageUrl, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadAndUploadImage(response.headers.location, fileName, bucket).then(resolve)
        return
      }
      if (response.statusCode !== 200) { resolve(imageUrl); return }
      const chunks = []
      response.on('data', (chunk) => chunks.push(chunk))
      response.on('end', async () => {
        try {
          const buffer = Buffer.concat(chunks)
          const { error } = await supabase.storage.from(bucket).upload(fileName, buffer, {
            contentType: response.headers['content-type'] || 'image/jpeg',
            upsert: true
          })
          if (error) { resolve(imageUrl); return }
          const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName)
          resolve(publicUrl)
        } catch { resolve(imageUrl) }
      })
      response.on('error', () => resolve(imageUrl))
    }).on('error', () => resolve(imageUrl))
  })
}

async function seed() {
  console.log('🌱 Starting database seeding...\n')

  try {
    // 1. Storage buckets
    console.log('📦 Setting up storage...')
    for (const bucket of ['menu-images', 'store-assets']) {
      await supabase.storage.createBucket(bucket, { public: true, fileSizeLimit: 5242880 })
    }
    console.log('✅ Storage ready\n')

    // 2. Create user
    console.log('👤 Creating user...')
    const passwordHash = await bcrypt.hash('Admin123!', 10)
    const { data: existingUser } = await supabase.from('users').select('id').eq('email', 'admin@kedaikopi.com').single()

    if (existingUser) {
      OWNER_ID = existingUser.id
      console.log('  ℹ️ User exists:', OWNER_ID)
    } else {
      OWNER_ID = 'cccccccc-cccc-cccc-cccc-cccccccccccc'
      await supabase.from('users').insert({
        id: OWNER_ID,
        email: 'admin@kedaikopi.com',
        password_hash: passwordHash,
        role: 'owner',
        is_active: true
      })
      console.log('  ✓ Created user:', OWNER_ID)
    }
    console.log('✅ User ready\n')

    // 3. Profile
    console.log('📝 Creating profile...')
    await supabase.from('profiles').upsert({
      id: OWNER_ID,
      email: 'admin@kedaikopi.com',
      full_name: 'Ahmad Susanto',
      role: 'owner',
      store_id: STORE_ID
    }, { onConflict: 'id' })
    console.log('✅ Profile created\n')

    // 4. Images
    console.log('🖼️ Uploading images...')
    const logoUrl = await downloadAndUploadImage(foodImages['logo'], 'kedaikopi-logo.jpg', 'store-assets')
    const bannerUrl = await downloadAndUploadImage(foodImages['banner'], 'kedaikopi-banner.jpg', 'store-assets')
    console.log('✅ Images uploaded\n')

    // 5. Store (without settings column)
    console.log('🏪 Creating store...')
    await supabase.from('stores').upsert({
      id: STORE_ID,
      owner_id: OWNER_ID,
      name: 'Kedai Kopi Nusantara',
      slug: 'kedai-kopi-nusantara',
      description: 'Kedai kopi modern dengan cita rasa Indonesia',
      address: 'Jl. Gatot Subroto No. 45, Jakarta Selatan',
      phone: '081234567890',
      logo_url: logoUrl,
      banner_url: bannerUrl,
      tax_percentage: 11,
      service_charge_percentage: 5,
      is_active: true
    }, { onConflict: 'id' })
    console.log('✅ Store created\n')

    // 6. Outlets (basic columns only)
    console.log('🏢 Creating outlets...')
    await supabase.from('outlets').upsert({
      id: OUTLET_MAIN_ID,
      store_id: STORE_ID,
      name: 'Kedai Kopi Pusat',
      slug: 'pusat',
      code: 'KKN-PST',
      address: 'Jl. Gatot Subroto No. 45, Jakarta Selatan',
      phone: '021-5551234',
      is_main: true,
      is_active: true,
      tax_percentage: 11,
      service_charge_percentage: 5
    }, { onConflict: 'id' })
    console.log('  ✓ Kedai Kopi Pusat')

    await supabase.from('outlets').upsert({
      id: OUTLET_BRANCH_ID,
      store_id: STORE_ID,
      name: 'Kedai Kopi Bandung',
      slug: 'bandung',
      code: 'KKN-BDG',
      address: 'Jl. Braga No. 88, Bandung',
      phone: '022-4231234',
      is_main: false,
      is_active: true,
      tax_percentage: 10,
      service_charge_percentage: 5
    }, { onConflict: 'id' })
    console.log('  ✓ Kedai Kopi Bandung')
    console.log('✅ Outlets created\n')

    // 7. Categories
    console.log('📁 Creating categories...')
    const categories = [
      { id: 'dddddddd-dddd-dddd-dddd-dddddddddd01', name: 'Kopi', slug: 'kopi', sort_order: 1 },
      { id: 'dddddddd-dddd-dddd-dddd-dddddddddd02', name: 'Non-Kopi', slug: 'non-kopi', sort_order: 2 },
      { id: 'dddddddd-dddd-dddd-dddd-dddddddddd03', name: 'Makanan', slug: 'makanan', sort_order: 3 },
      { id: 'dddddddd-dddd-dddd-dddd-dddddddddd04', name: 'Snack', slug: 'snack', sort_order: 4 },
      { id: 'dddddddd-dddd-dddd-dddd-dddddddddd05', name: 'Dessert', slug: 'dessert', sort_order: 5 }
    ]
    for (const cat of categories) {
      await supabase.from('categories').upsert({ ...cat, store_id: STORE_ID, is_active: true }, { onConflict: 'id' })
      console.log(`  ✓ ${cat.name}`)
    }
    console.log('✅ Categories created\n')

    // 8. Menu Items
    console.log('🍽️ Creating menu items...')
    const menuItems = [
      // Kopi
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', category_id: 'dddddddd-dddd-dddd-dddd-dddddddddd01', name: 'Kopi Susu Gula Aren', slug: 'kopi-susu-gula-aren', description: 'Espresso dengan susu segar dan gula aren asli. Best seller!', price: 25000, is_featured: true, img: 'kopi' },
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', category_id: 'dddddddd-dddd-dddd-dddd-dddddddddd01', name: 'Americano', slug: 'americano', description: 'Double shot espresso dengan air panas', price: 22000, img: 'kopi' },
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee03', category_id: 'dddddddd-dddd-dddd-dddd-dddddddddd01', name: 'Cappuccino', slug: 'cappuccino', description: 'Espresso dengan steamed milk dan foam lembut', price: 28000, is_featured: true, img: 'kopi' },
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee04', category_id: 'dddddddd-dddd-dddd-dddd-dddddddddd01', name: 'Latte', slug: 'latte', description: 'Espresso dengan susu steamed yang creamy', price: 28000, img: 'kopi' },
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee05', category_id: 'dddddddd-dddd-dddd-dddd-dddddddddd01', name: 'V60 Single Origin', slug: 'v60-single-origin', description: 'Pour over dengan biji kopi Aceh Gayo', price: 35000, img: 'kopi' },
      // Non-Kopi
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee11', category_id: 'dddddddd-dddd-dddd-dddd-dddddddddd02', name: 'Matcha Latte', slug: 'matcha-latte', description: 'Green tea matcha premium dengan susu', price: 30000, is_featured: true, img: 'es-teh' },
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee12', category_id: 'dddddddd-dddd-dddd-dddd-dddddddddd02', name: 'Coklat Panas', slug: 'coklat-panas', description: 'Dark chocolate dengan susu hangat', price: 25000, img: 'kopi' },
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee13', category_id: 'dddddddd-dddd-dddd-dddd-dddddddddd02', name: 'Es Teh Tarik', slug: 'es-teh-tarik', description: 'Teh tarik dengan susu kental', price: 18000, img: 'es-teh' },
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee14', category_id: 'dddddddd-dddd-dddd-dddd-dddddddddd02', name: 'Jus Alpukat', slug: 'jus-alpukat', description: 'Alpukat blend dengan susu dan coklat', price: 25000, img: 'jus' },
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee15', category_id: 'dddddddd-dddd-dddd-dddd-dddddddddd02', name: 'Es Jeruk', slug: 'es-jeruk', description: 'Jeruk segar diperas langsung', price: 15000, img: 'jus' },
      // Makanan
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee21', category_id: 'dddddddd-dddd-dddd-dddd-dddddddddd03', name: 'Nasi Goreng Kedai', slug: 'nasi-goreng-kedai', description: 'Nasi goreng dengan telur dan ayam suwir', price: 35000, is_featured: true, img: 'nasi-goreng' },
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee22', category_id: 'dddddddd-dddd-dddd-dddd-dddddddddd03', name: 'Mie Goreng Jawa', slug: 'mie-goreng-jawa', description: 'Mie goreng bumbu khas Jawa', price: 32000, img: 'mie-goreng' },
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee23', category_id: 'dddddddd-dddd-dddd-dddd-dddddddddd03', name: 'Ayam Teriyaki Rice', slug: 'ayam-teriyaki', description: 'Nasi dengan ayam teriyaki dan salad', price: 42000, img: 'ayam-bakar' },
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee24', category_id: 'dddddddd-dddd-dddd-dddd-dddddddddd03', name: 'Soto Ayam', slug: 'soto-ayam', description: 'Soto ayam dengan nasi dan emping', price: 30000, img: 'soto' },
      // Snack
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee31', category_id: 'dddddddd-dddd-dddd-dddd-dddddddddd04', name: 'French Fries', slug: 'french-fries', description: 'Kentang goreng crispy', price: 22000, img: 'snack' },
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee32', category_id: 'dddddddd-dddd-dddd-dddd-dddddddddd04', name: 'Risoles Mayo', slug: 'risoles-mayo', description: 'Risoles isi ragout dengan mayo', price: 18000, img: 'snack' },
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee33', category_id: 'dddddddd-dddd-dddd-dddd-dddddddddd04', name: 'Roti Bakar', slug: 'roti-bakar', description: 'Roti panggang coklat keju', price: 20000, is_featured: true, img: 'snack' },
      // Dessert
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee41', category_id: 'dddddddd-dddd-dddd-dddd-dddddddddd05', name: 'Pisang Goreng Keju', slug: 'pisang-goreng-keju', description: 'Pisang goreng dengan topping keju', price: 18000, img: 'dessert' },
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee42', category_id: 'dddddddd-dddd-dddd-dddd-dddddddddd05', name: 'Es Cendol', slug: 'es-cendol', description: 'Cendol santan gula merah', price: 15000, img: 'dessert' },
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee43', category_id: 'dddddddd-dddd-dddd-dddd-dddddddddd05', name: 'Affogato', slug: 'affogato', description: 'Ice cream dengan shot espresso', price: 28000, is_featured: true, img: 'dessert' }
    ]

    for (const item of menuItems) {
      const imageUrl = await downloadAndUploadImage(foodImages[item.img] || foodImages['kopi'], `menu-${item.slug}.jpg`, 'menu-images')
      await supabase.from('menu_items').upsert({
        id: item.id,
        store_id: STORE_ID,
        category_id: item.category_id,
        name: item.name,
        slug: item.slug,
        description: item.description,
        price: item.price,
        image_url: imageUrl,
        is_available: true,
        is_featured: item.is_featured || false,
        sort_order: 0
      }, { onConflict: 'id' })
      console.log(`  ✓ ${item.name}`)
    }
    console.log('✅ Menu items created\n')

    // 9. Initialize outlet_menu_items
    console.log('🔗 Setting up outlet menus...')
    try {
      // Try calling the function if it exists
      await supabase.rpc('initialize_outlet_menu', { p_outlet_id: OUTLET_MAIN_ID })
      await supabase.rpc('initialize_outlet_menu', { p_outlet_id: OUTLET_BRANCH_ID })
      console.log('  ✓ Outlet menus initialized via function')
    } catch {
      // Manually insert
      console.log('  ℹ️ Function not available, inserting manually...')
      for (const item of menuItems) {
        await supabase.from('outlet_menu_items').upsert([
          { outlet_id: OUTLET_MAIN_ID, menu_item_id: item.id, is_available: true },
          { outlet_id: OUTLET_BRANCH_ID, menu_item_id: item.id, is_available: true }
        ], { onConflict: 'outlet_id,menu_item_id' })
      }
      console.log('  ✓ Outlet menus inserted manually')
    }
    console.log('✅ Outlet menus ready\n')

    // 10. Tables
    console.log('🪑 Creating tables...')
    const tables = [
      // Main outlet
      { id: 'ffffffff-ffff-ffff-ffff-ffffffffffff01', outlet_id: OUTLET_MAIN_ID, table_number: '1', capacity: 4, location: 'Indoor', qr_code: 'KKN-PST-T01' },
      { id: 'ffffffff-ffff-ffff-ffff-ffffffffffff02', outlet_id: OUTLET_MAIN_ID, table_number: '2', capacity: 4, location: 'Indoor', qr_code: 'KKN-PST-T02' },
      { id: 'ffffffff-ffff-ffff-ffff-ffffffffffff03', outlet_id: OUTLET_MAIN_ID, table_number: '3', capacity: 2, location: 'Outdoor', qr_code: 'KKN-PST-T03' },
      { id: 'ffffffff-ffff-ffff-ffff-ffffffffffff04', outlet_id: OUTLET_MAIN_ID, table_number: '4', capacity: 6, location: 'Outdoor', qr_code: 'KKN-PST-T04' },
      // Branch outlet
      { id: 'ffffffff-ffff-ffff-ffff-ffffffffffff11', outlet_id: OUTLET_BRANCH_ID, table_number: '1', capacity: 4, location: 'Lt 1', qr_code: 'KKN-BDG-T01' },
      { id: 'ffffffff-ffff-ffff-ffff-ffffffffffff12', outlet_id: OUTLET_BRANCH_ID, table_number: '2', capacity: 4, location: 'Lt 1', qr_code: 'KKN-BDG-T02' },
      { id: 'ffffffff-ffff-ffff-ffff-ffffffffffff13', outlet_id: OUTLET_BRANCH_ID, table_number: '3', capacity: 2, location: 'Lt 2', qr_code: 'KKN-BDG-T03' },
    ]

    for (const table of tables) {
      await supabase.from('tables').upsert({
        ...table,
        store_id: STORE_ID,
        is_active: true
      }, { onConflict: 'id' })
    }
    console.log('  ✓ 4 tables for Pusat, 3 tables for Bandung')
    console.log('✅ Tables created\n')

    // Summary
    console.log('═══════════════════════════════════════════════════════════════════')
    console.log('                    🎉 SEEDING COMPLETED!')
    console.log('═══════════════════════════════════════════════════════════════════\n')

    console.log('📊 DATA CREATED:')
    console.log('   • 1 Store/Tenant: Kedai Kopi Nusantara')
    console.log('   • 2 Outlets: Pusat (Jakarta) & Bandung')
    console.log('   • 5 Categories')
    console.log('   • 20 Menu Items')
    console.log('   • 7 Tables\n')

    console.log('═══════════════════════════════════════════════════════════════════')
    console.log('                       🔐 ADMIN LOGIN')
    console.log('═══════════════════════════════════════════════════════════════════')
    console.log('   URL:      http://localhost:3000/login')
    console.log('   Email:    admin@kedaikopi.com')
    console.log('   Password: Admin123!\n')

    console.log('═══════════════════════════════════════════════════════════════════')
    console.log('                    🛒 CUSTOMER ORDER PAGES')
    console.log('═══════════════════════════════════════════════════════════════════\n')
    console.log('📍 OUTLET PUSAT (Jakarta):')
    console.log('   http://localhost:3000/kedai-kopi-nusantara/pusat/order')
    console.log('   http://localhost:3000/kedai-kopi-nusantara/pusat/order?table=KKN-PST-T01\n')
    console.log('📍 OUTLET BANDUNG:')
    console.log('   http://localhost:3000/kedai-kopi-nusantara/bandung/order')
    console.log('   http://localhost:3000/kedai-kopi-nusantara/bandung/order?table=KKN-BDG-T01\n')
    console.log('═══════════════════════════════════════════════════════════════════\n')

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error)
    process.exit(1)
  }
}

seed()
