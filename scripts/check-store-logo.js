const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkStoreLogo() {
  const { data: stores, error } = await supabase
    .from('stores')
    .select('id, name, slug, logo_url, banner_url')

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('Stores in database:')
  stores.forEach(store => {
    console.log(`\nStore: ${store.name} (${store.slug})`)
    console.log(`  ID: ${store.id}`)
    console.log(`  Logo URL: ${store.logo_url || '(not set)'}`)
    console.log(`  Banner URL: ${store.banner_url || '(not set)'}`)
  })
}

checkStoreLogo()
