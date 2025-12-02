// Script to run multitenancy migration via Supabase REST API
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required')
  process.exit(1)
}

async function runSQL(sql) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ query: sql })
  })

  if (!response.ok) {
    // Try alternate method using pg_query if exec_sql doesn't exist
    return null
  }

  return await response.json()
}

async function applyMigration() {
  console.log('🔄 Applying multitenancy migration directly to Supabase...\n')

  // Read migration file
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '010_multitenancy.sql')

  if (!fs.existsSync(migrationPath)) {
    console.error('❌ Migration file not found:', migrationPath)
    process.exit(1)
  }

  const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

  console.log('📄 Migration file loaded:', migrationPath)
  console.log('📏 Size:', migrationSQL.length, 'characters\n')

  // Split into individual statements
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  console.log(`📝 Found ${statements.length} SQL statements\n`)

  console.log('═══════════════════════════════════════════════════════════')
  console.log('⚠️  IMPORTANT: Direct SQL execution via API is limited.')
  console.log('   Please run the migration manually in Supabase SQL Editor:')
  console.log('═══════════════════════════════════════════════════════════\n')

  console.log('1. Go to: https://supabase.com/dashboard')
  console.log('2. Select your project')
  console.log('3. Go to SQL Editor')
  console.log('4. Paste the content of: supabase/migrations/010_multitenancy.sql')
  console.log('5. Click "Run"\n')

  console.log('Or use Supabase CLI:')
  console.log('   npx supabase db push\n')

  // Print a condensed version of what needs to be run
  console.log('═══════════════════════════════════════════════════════════')
  console.log('📋 KEY CHANGES IN MIGRATION:')
  console.log('═══════════════════════════════════════════════════════════\n')

  console.log('1. Add columns to stores table:')
  console.log('   - settings (JSONB)\n')

  console.log('2. Add columns to outlets table:')
  console.log('   - settings (JSONB)')
  console.log('   - theme (JSONB)')
  console.log('   - branding (JSONB)\n')

  console.log('3. Create user_outlets table')
  console.log('4. Create outlet_menu_view view')
  console.log('5. Create triggers for auto-sync\n')

  // Output the simplified migration
  console.log('═══════════════════════════════════════════════════════════')
  console.log('📝 SIMPLIFIED MIGRATION SQL (copy this to Supabase SQL Editor):')
  console.log('═══════════════════════════════════════════════════════════\n')

  const simplifiedSQL = `
-- Add settings to stores
ALTER TABLE stores ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{"businessType":"restaurant","currency":"IDR","timezone":"Asia/Jakarta","language":"id","onboardingCompleted":false,"onboardingStep":0}'::jsonb;

-- Add columns to outlets
ALTER TABLE outlets ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{"allowTakeaway":true,"allowDineIn":true,"allowDelivery":false,"minimumOrderAmount":0,"estimatedPrepTime":15,"autoAcceptOrders":false}'::jsonb;
ALTER TABLE outlets ADD COLUMN IF NOT EXISTS theme JSONB DEFAULT '{"primaryColor":"#10b981","secondaryColor":"#059669","backgroundColor":"#ffffff","textColor":"#1f2937","fontFamily":"Inter","logoUrl":null,"bannerUrl":null,"customCss":null}'::jsonb;
ALTER TABLE outlets ADD COLUMN IF NOT EXISTS branding JSONB DEFAULT '{"businessName":null,"tagline":null,"description":null,"socialLinks":{},"contactInfo":{}}'::jsonb;

-- Create user_outlets table if not exists
CREATE TABLE IF NOT EXISTS user_outlets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'staff',
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, outlet_id)
);

-- Create outlet_menu_view
DROP VIEW IF EXISTS outlet_menu_view;
CREATE VIEW outlet_menu_view AS
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
WHERE o.store_id = mi.store_id AND o.is_active = true;

-- Function to initialize outlet menu
CREATE OR REPLACE FUNCTION initialize_outlet_menu(p_outlet_id UUID)
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
$$ LANGUAGE plpgsql;
`

  console.log(simplifiedSQL)
}

applyMigration()
