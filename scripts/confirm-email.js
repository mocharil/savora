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

async function confirmEmail() {
  const userId = 'afeedf30-7913-479d-b3dd-d920be98f8e1'

  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    email_confirm: true
  })

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('✅ Email confirmed!')
  console.log('User:', data.user.email)
  console.log('Email confirmed at:', data.user.email_confirmed_at)
}

confirmEmail()
