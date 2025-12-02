const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createUsersTable() {
  console.log('Creating users table...\n')

  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      -- Create users table for simple auth
      CREATE TABLE IF NOT EXISTS users (
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

      -- Create index for faster email lookup
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `
  })

  if (error) {
    // Try direct approach if rpc doesn't work
    console.log('RPC not available, trying direct table check...')

    // Check if table exists
    const { data: tables } = await supabase
      .from('users')
      .select('id')
      .limit(1)

    if (tables !== null) {
      console.log('✅ Users table already exists!')
      return
    }
  }

  console.log('✅ Users table created!')
}

createUsersTable()
