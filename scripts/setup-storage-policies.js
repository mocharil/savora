const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupStoragePolicies() {
  console.log('Setting up storage policies...')

  // Using the REST API to execute SQL via rpc is not possible for storage policies
  // Instead, we'll use the storage admin API to check bucket status

  const { data: buckets, error: listError } = await supabase.storage.listBuckets()

  if (listError) {
    console.error('Error listing buckets:', listError)
    return
  }

  console.log('Existing buckets:', buckets.map(b => b.name))

  // Check if store-assets is public
  const storeAssets = buckets.find(b => b.name === 'store-assets')
  if (storeAssets) {
    console.log('store-assets bucket:', storeAssets)
    if (!storeAssets.public) {
      console.log('Making store-assets bucket public...')
      const { error: updateError } = await supabase.storage.updateBucket('store-assets', {
        public: true
      })
      if (updateError) {
        console.error('Error updating bucket:', updateError)
      } else {
        console.log('store-assets is now public!')
      }
    } else {
      console.log('store-assets is already public')
    }
  }

  // Check if menu-images is public
  const menuImages = buckets.find(b => b.name === 'menu-images')
  if (menuImages) {
    console.log('menu-images bucket:', menuImages)
    if (!menuImages.public) {
      console.log('Making menu-images bucket public...')
      const { error: updateError } = await supabase.storage.updateBucket('menu-images', {
        public: true
      })
      if (updateError) {
        console.error('Error updating bucket:', updateError)
      } else {
        console.log('menu-images is now public!')
      }
    } else {
      console.log('menu-images is already public')
    }
  }

  console.log('\n--- IMPORTANT ---')
  console.log('Storage policies must be set via Supabase Dashboard.')
  console.log('Go to: https://supabase.com/dashboard/project/gruraqhvvilafhkfauqp/storage/policies')
  console.log('\nFor each bucket (store-assets, menu-images), add these policies:')
  console.log('1. INSERT - authenticated - WITH CHECK: true')
  console.log('2. SELECT - public - USING: true')
  console.log('3. UPDATE - authenticated - USING: true')
  console.log('4. DELETE - authenticated - USING: true')
}

setupStoragePolicies()
