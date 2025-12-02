const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updateStoreOwner() {
  const yourUserId = 'afeedf30-7913-479d-b3dd-d920be98f8e1' // arilindra21@gmail.com
  const storeId = '22222222-2222-2222-2222-222222222222'

  // Update store owner
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .update({ owner_id: yourUserId })
    .eq('id', storeId)
    .select()
    .single()

  if (storeError) {
    console.error('Store update error:', storeError)
    return
  }

  console.log('Store updated:')
  console.log(JSON.stringify(store, null, 2))

  // Also update profile to link store_id
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .update({ store_id: storeId })
    .eq('id', yourUserId)
    .select()
    .single()

  if (profileError) {
    console.error('Profile update error:', profileError)
    return
  }

  console.log('\nProfile updated:')
  console.log(JSON.stringify(profile, null, 2))

  console.log('\n✅ Done! You can now login with arilindra21@gmail.com and manage the store.')
}

updateStoreOwner()
