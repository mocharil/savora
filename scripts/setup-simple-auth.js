const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupSimpleAuth() {
  console.log('Setting up simple auth system...\n')

  // Check if users table exists by trying to query it
  const { data: existingUsers, error: checkError } = await supabase
    .from('users')
    .select('id')
    .limit(1)

  if (checkError && checkError.code === '42P01') {
    console.log('Users table does not exist. Please create it in Supabase Dashboard.')
    console.log('\nRun this SQL in Supabase SQL Editor:\n')
    console.log(`
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'owner',
    store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for service role" ON users
    FOR ALL USING (true) WITH CHECK (true);
    `)
    return
  }

  console.log('✅ Users table exists!')

  // Create a test user (your account)
  const email = 'arilindra21@gmail.com'
  const password = 'password123' // You can change this
  const password_hash = await bcrypt.hash(password, 10)

  // Check if user exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (existingUser) {
    console.log(`User ${email} already exists`)
  } else {
    // Get store id
    const { data: store } = await supabase
      .from('stores')
      .select('id')
      .eq('id', '22222222-2222-2222-2222-222222222222')
      .single()

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        email,
        password_hash,
        full_name: 'Aril',
        role: 'owner',
        store_id: store?.id || null
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating user:', insertError)
    } else {
      console.log(`✅ Created user: ${email}`)
      console.log(`   Password: ${password}`)

      // Update store owner_id
      if (store) {
        await supabase
          .from('stores')
          .update({ owner_id: newUser.id })
          .eq('id', store.id)
        console.log(`✅ Updated store owner`)
      }
    }
  }

  console.log('\n✅ Setup complete!')
  console.log('\nYou can now login with:')
  console.log(`   Email: ${email}`)
  console.log(`   Password: password123`)
}

setupSimpleAuth()
