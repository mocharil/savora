const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkMenuImages() {
  console.log('Checking menu items...\n')

  const { data: menuItems, error } = await supabase
    .from('menu_items')
    .select('id, name, image_url')
    .order('name')

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('Menu Items:')
  console.log('===========')
  menuItems.forEach(item => {
    console.log(`\n${item.name}:`)
    console.log(`  ID: ${item.id}`)
    console.log(`  Image URL: ${item.image_url || '(empty)'}`)
  })

  // Also check storage bucket
  console.log('\n\nStorage bucket contents:')
  console.log('========================')
  const { data: files, error: storageError } = await supabase.storage
    .from('menu-images')
    .list('', { limit: 100 })

  if (storageError) {
    console.error('Storage error:', storageError)
    return
  }

  if (files && files.length > 0) {
    for (const file of files) {
      if (file.name) {
        // List files in subdirectories
        const { data: subFiles } = await supabase.storage
          .from('menu-images')
          .list(file.name)

        if (subFiles) {
          subFiles.forEach(f => {
            const { data: { publicUrl } } = supabase.storage
              .from('menu-images')
              .getPublicUrl(`${file.name}/${f.name}`)
            console.log(`\n${file.name}/${f.name}`)
            console.log(`  URL: ${publicUrl}`)
          })
        }
      }
    }
  } else {
    console.log('No files found in menu-images bucket')
  }
}

checkMenuImages()
