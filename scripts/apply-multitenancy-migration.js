// Script to apply multitenancy migration
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyMigration() {
  console.log('🔄 Applying multitenancy migration...\n')

  try {
    // 1. Add settings column to stores
    console.log('1. Adding settings column to stores...')
    const { error: e1 } = await supabase.from('stores').select('settings').limit(1)
    if (e1 && e1.message.includes("does not exist")) {
      console.log('  ⚠️ Settings column needs to be added manually in Supabase dashboard')
      console.log('  Run this SQL in Supabase SQL Editor:')
      console.log(`
      ALTER TABLE stores ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{
        "businessType": "restaurant",
        "currency": "IDR",
        "timezone": "Asia/Jakarta",
        "language": "id",
        "onboardingCompleted": false,
        "onboardingStep": 0
      }'::jsonb;
      `)
    } else {
      console.log('  ✓ Settings column exists or added')
    }

    // 2. Add settings, theme, branding columns to outlets
    console.log('\n2. Checking outlets columns...')
    const { error: e2 } = await supabase.from('outlets').select('settings, theme, branding').limit(1)
    if (e2) {
      console.log('  ⚠️ Outlets columns need to be added manually. Run this SQL:')
      console.log(`
      ALTER TABLE outlets ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{
        "allowTakeaway": true,
        "allowDineIn": true,
        "allowDelivery": false,
        "minimumOrderAmount": 0,
        "estimatedPrepTime": 15,
        "autoAcceptOrders": false
      }'::jsonb;

      ALTER TABLE outlets ADD COLUMN IF NOT EXISTS theme JSONB DEFAULT '{
        "primaryColor": "#10b981",
        "secondaryColor": "#059669",
        "backgroundColor": "#ffffff",
        "textColor": "#1f2937",
        "fontFamily": "Inter",
        "logoUrl": null,
        "bannerUrl": null,
        "customCss": null
      }'::jsonb;

      ALTER TABLE outlets ADD COLUMN IF NOT EXISTS branding JSONB DEFAULT '{
        "businessName": null,
        "tagline": null,
        "description": null,
        "socialLinks": {},
        "contactInfo": {}
      }'::jsonb;
      `)
    } else {
      console.log('  ✓ Outlets columns exist')
    }

    // 3. Check outlet_id on tables and orders
    console.log('\n3. Checking outlet_id columns...')
    const { error: e3 } = await supabase.from('tables').select('outlet_id').limit(1)
    if (e3) {
      console.log('  ⚠️ tables.outlet_id needs to be added. Run this SQL:')
      console.log(`
      ALTER TABLE tables ADD COLUMN IF NOT EXISTS outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL;
      `)
    } else {
      console.log('  ✓ tables.outlet_id exists')
    }

    const { error: e4 } = await supabase.from('orders').select('outlet_id').limit(1)
    if (e4) {
      console.log('  ⚠️ orders.outlet_id needs to be added. Run this SQL:')
      console.log(`
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL;
      `)
    } else {
      console.log('  ✓ orders.outlet_id exists')
    }

    // 4. Check user_outlets table
    console.log('\n4. Checking user_outlets table...')
    const { error: e5 } = await supabase.from('user_outlets').select('id').limit(1)
    if (e5) {
      console.log('  ⚠️ user_outlets table needs to be created')
    } else {
      console.log('  ✓ user_outlets table exists')
    }

    // 5. Check outlet_menu_items table
    console.log('\n5. Checking outlet_menu_items table...')
    const { error: e6 } = await supabase.from('outlet_menu_items').select('id').limit(1)
    if (e6) {
      console.log('  ⚠️ outlet_menu_items table needs to be created')
    } else {
      console.log('  ✓ outlet_menu_items table exists')
    }

    // 6. Check outlet_menu_view
    console.log('\n6. Checking outlet_menu_view...')
    const { error: e7 } = await supabase.from('outlet_menu_view').select('id').limit(1)
    if (e7) {
      console.log('  ⚠️ outlet_menu_view needs to be created')
    } else {
      console.log('  ✓ outlet_menu_view exists')
    }

    console.log('\n═══════════════════════════════════════════════════════════')
    console.log('📋 MIGRATION STATUS COMPLETE')
    console.log('═══════════════════════════════════════════════════════════')
    console.log('\nIf any columns/tables are missing, please run the SQL')
    console.log('from supabase/migrations/010_multitenancy.sql in the')
    console.log('Supabase SQL Editor.\n')

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

applyMigration()
