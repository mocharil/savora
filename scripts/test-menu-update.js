const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testMenuUpdate() {
  // Find Nasi Goreng Spesial
  const { data: menu, error: findError } = await supabase
    .from('menu_items')
    .select('*')
    .eq('name', 'Nasi Goreng Spesial')
    .single()

  if (findError) {
    console.error('Find error:', findError)
    return
  }

  console.log('Current Nasi Goreng Spesial:')
  console.log(JSON.stringify(menu, null, 2))

  // Try to update image_url using service role
  const testUrl = 'https://gruraqhvvilafhkfauqp.supabase.co/storage/v1/object/public/menu-images/22222222-2222-2222-2222-222222222222/1764051783886.png'

  const { data: updated, error: updateError } = await supabase
    .from('menu_items')
    .update({ image_url: testUrl })
    .eq('id', menu.id)
    .select()
    .single()

  if (updateError) {
    console.error('Update error:', updateError)
    return
  }

  console.log('\nUpdated Nasi Goreng Spesial:')
  console.log(JSON.stringify(updated, null, 2))
}

testMenuUpdate()
