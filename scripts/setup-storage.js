const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupStorage() {
  console.log('Setting up Supabase Storage buckets...\n')

  const buckets = [
    { name: 'store-assets', public: true },
    { name: 'menu-images', public: true }
  ]

  for (const bucket of buckets) {
    console.log(`Checking bucket: ${bucket.name}`)

    // Check if bucket exists
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error(`Error listing buckets:`, listError.message)
      continue
    }

    const bucketExists = existingBuckets?.some(b => b.name === bucket.name)

    if (bucketExists) {
      console.log(`  ✓ Bucket "${bucket.name}" already exists`)

      // Update bucket to be public if needed
      const { error: updateError } = await supabase.storage.updateBucket(bucket.name, {
        public: bucket.public,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
        fileSizeLimit: 5 * 1024 * 1024 // 5MB
      })

      if (updateError) {
        console.log(`  ! Could not update bucket settings: ${updateError.message}`)
      } else {
        console.log(`  ✓ Bucket settings updated (public: ${bucket.public})`)
      }
    } else {
      // Create bucket
      const { error: createError } = await supabase.storage.createBucket(bucket.name, {
        public: bucket.public,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
        fileSizeLimit: 5 * 1024 * 1024 // 5MB
      })

      if (createError) {
        console.error(`  ✗ Error creating bucket "${bucket.name}":`, createError.message)
      } else {
        console.log(`  ✓ Bucket "${bucket.name}" created successfully (public: ${bucket.public})`)
      }
    }
  }

  console.log('\n✅ Storage setup complete!')
  console.log('\nNote: Make sure your Supabase Storage RLS policies allow uploads.')
  console.log('You can add these policies in Supabase Dashboard > Storage > Policies:')
  console.log('')
  console.log('For "store-assets" bucket:')
  console.log('  - Allow authenticated users to upload: INSERT with auth.role() = \'authenticated\'')
  console.log('  - Allow public read: SELECT with true')
  console.log('')
}

setupStorage().catch(console.error)
