const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixUserPassword() {
  const email = 'arilindra21@gmail.com'
  const newPassword = 'password123' // Ganti dengan password yang Anda inginkan

  // Hash the password
  const password_hash = await bcrypt.hash(newPassword, 10)

  // Update the user
  const { data, error } = await supabase
    .from('users')
    .update({ password_hash })
    .eq('email', email)
    .select()
    .single()

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('✅ Password updated!')
  console.log(`Email: ${email}`)
  console.log(`New Password: ${newPassword}`)
}

fixUserPassword()
