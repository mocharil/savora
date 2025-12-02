// Script to check stores in database
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkStores() {
  console.log('Checking stores in database...\n')

  const { data: stores, error } = await supabase
    .from('stores')
    .select('id, name, slug, is_active')

  if (error) {
    console.error('Error:', error.message)
    return
  }

  if (!stores || stores.length === 0) {
    console.log('No stores found in database.')
    console.log('\nRun: node scripts/seed-database.js')
    return
  }

  console.log('Found stores:')
  stores.forEach(store => {
    console.log(`  - ${store.name}`)
    console.log(`    Slug: ${store.slug}`)
    console.log(`    Active: ${store.is_active}`)
    console.log(`    Customer URL: http://localhost:3000/${store.slug}/order`)
    console.log('')
  })
}

checkStores()
