const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkStoreOwner() {
  // Get store info
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id, name, owner_id')
    .eq('id', '22222222-2222-2222-2222-222222222222')
    .single()

  if (storeError) {
    console.error('Store error:', storeError)
    return
  }

  console.log('Store:')
  console.log(JSON.stringify(store, null, 2))

  // Get all profiles
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')

  if (profileError) {
    console.error('Profiles error:', profileError)
    return
  }

  console.log('\nAll Profiles:')
  profiles.forEach(p => {
    const isOwner = p.id === store.owner_id
    console.log(`${isOwner ? '>>> ' : '    '}${p.email} (${p.id}) - ${p.role}${isOwner ? ' [OWNER]' : ''}`)
  })
}

checkStoreOwner()
