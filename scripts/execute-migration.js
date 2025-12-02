// Execute migration SQL directly via Supabase PostgREST
const fetch = require('node-fetch') || globalThis.fetch
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required')
  process.exit(1)
}

// Parse the project ref from URL
const projectRef = supabaseUrl.replace('https://', '').split('.')[0]

async function executeSQLViaAPI(sql) {
  // Use the Supabase Management API to execute SQL
  const url = `${supabaseUrl}/rest/v1/rpc/exec_sql`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`
      },
      body: JSON.stringify({ sql })
    })

    if (response.ok) {
      return { success: true, data: await response.json() }
    } else {
      const error = await response.text()
      return { success: false, error }
    }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

async function runMigration() {
  console.log('🔄 Executing multitenancy migration...\n')
  console.log('Project URL:', supabaseUrl)
  console.log('Project Ref:', projectRef, '\n')

  // Migration statements to execute individually
  const migrations = [
    {
      name: 'Add settings column to stores',
      sql: `ALTER TABLE stores ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{"businessType":"restaurant","currency":"IDR","timezone":"Asia/Jakarta","language":"id","onboardingCompleted":false,"onboardingStep":0}'::jsonb`
    },
    {
      name: 'Add settings column to outlets',
      sql: `ALTER TABLE outlets ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{"allowTakeaway":true,"allowDineIn":true,"allowDelivery":false,"minimumOrderAmount":0,"estimatedPrepTime":15,"autoAcceptOrders":false}'::jsonb`
    },
    {
      name: 'Add theme column to outlets',
      sql: `ALTER TABLE outlets ADD COLUMN IF NOT EXISTS theme JSONB DEFAULT '{"primaryColor":"#10b981","secondaryColor":"#059669","backgroundColor":"#ffffff","textColor":"#1f2937","fontFamily":"Inter","logoUrl":null,"bannerUrl":null,"customCss":null}'::jsonb`
    },
    {
      name: 'Add branding column to outlets',
      sql: `ALTER TABLE outlets ADD COLUMN IF NOT EXISTS branding JSONB DEFAULT '{"businessName":null,"tagline":null,"description":null,"socialLinks":{},"contactInfo":{}}'::jsonb`
    },
    {
      name: 'Create user_outlets table',
      sql: `CREATE TABLE IF NOT EXISTS user_outlets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        role VARCHAR(50) DEFAULT 'staff',
        is_primary BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, outlet_id)
      )`
    },
    {
      name: 'Create outlet_menu_view',
      sql: `CREATE OR REPLACE VIEW outlet_menu_view AS
        SELECT
          mi.id,
          mi.store_id,
          mi.category_id,
          mi.name,
          mi.slug,
          mi.description,
          mi.image_url,
          mi.is_available AS global_available,
          mi.is_featured,
          mi.sort_order,
          mi.created_at,
          mi.updated_at,
          o.id AS outlet_id,
          COALESCE(omi.price, mi.price) AS price,
          COALESCE(omi.discount_price, mi.discount_price) AS discount_price,
          COALESCE(omi.is_available, mi.is_available) AS is_available,
          omi.stock_quantity,
          o.name AS outlet_name,
          o.slug AS outlet_slug
        FROM menu_items mi
        CROSS JOIN outlets o
        LEFT JOIN outlet_menu_items omi ON mi.id = omi.menu_item_id AND o.id = omi.outlet_id
        WHERE o.store_id = mi.store_id AND o.is_active = true`
    },
    {
      name: 'Create initialize_outlet_menu function',
      sql: `CREATE OR REPLACE FUNCTION initialize_outlet_menu(p_outlet_id UUID)
        RETURNS void AS $$
        DECLARE
          v_store_id UUID;
        BEGIN
          SELECT store_id INTO v_store_id FROM outlets WHERE id = p_outlet_id;
          INSERT INTO outlet_menu_items (outlet_id, menu_item_id, is_available)
          SELECT p_outlet_id, id, true
          FROM menu_items
          WHERE store_id = v_store_id
          ON CONFLICT (outlet_id, menu_item_id) DO NOTHING;
        END;
        $$ LANGUAGE plpgsql`
    }
  ]

  // Try executing via RPC first
  const testResult = await executeSQLViaAPI('SELECT 1')

  if (!testResult.success) {
    console.log('⚠️  Cannot execute SQL directly via API (exec_sql RPC not available)')
    console.log('   This is normal for hosted Supabase projects.\n')
    console.log('═══════════════════════════════════════════════════════════')
    console.log('📋 PLEASE RUN THE FOLLOWING SQL MANUALLY:')
    console.log('═══════════════════════════════════════════════════════════\n')
    console.log('Go to: https://supabase.com/dashboard/project/' + projectRef + '/sql/new\n')
    console.log('Copy and paste this SQL:\n')
    console.log('---BEGIN SQL---\n')

    migrations.forEach(m => {
      console.log(`-- ${m.name}`)
      console.log(m.sql + ';\n')
    })

    console.log('---END SQL---\n')
    return
  }

  // Execute each migration
  for (const migration of migrations) {
    console.log(`⏳ ${migration.name}...`)
    const result = await executeSQLViaAPI(migration.sql)

    if (result.success) {
      console.log(`  ✓ Done`)
    } else {
      console.log(`  ⚠️ ${result.error}`)
    }
  }

  console.log('\n✅ Migration complete!')
}

runMigration().catch(console.error)
