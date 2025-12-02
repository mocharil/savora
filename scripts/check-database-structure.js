const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkDatabaseStructure() {
  console.log('='.repeat(60))
  console.log('CHECKING DATABASE STRUCTURE')
  console.log('='.repeat(60))

  // 1. Check all tables
  console.log('\n📋 TABLES:')
  const { data: tables, error: tablesError } = await supabase
    .rpc('get_tables_info')
    .select('*')

  if (tablesError) {
    // Try alternative method
    const { data: tableList } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')

    if (tableList) {
      tableList.forEach(t => console.log(`  - ${t.table_name}`))
    }
  }

  // 2. Check users table structure
  console.log('\n📋 USERS TABLE:')
  const { data: usersData, error: usersError } = await supabase
    .from('users')
    .select('*')
    .limit(1)

  if (usersError) {
    console.log('  Error:', usersError.message)
  } else {
    console.log('  ✅ Users table exists')
    if (usersData && usersData[0]) {
      console.log('  Columns:', Object.keys(usersData[0]).join(', '))
    }
  }

  // 3. Check stores table structure
  console.log('\n📋 STORES TABLE:')
  const { data: storesData, error: storesError } = await supabase
    .from('stores')
    .select('*')
    .limit(1)

  if (storesError) {
    console.log('  Error:', storesError.message)
  } else {
    console.log('  ✅ Stores table exists')
    if (storesData && storesData[0]) {
      console.log('  Columns:', Object.keys(storesData[0]).join(', '))
      console.log('  Sample data:', JSON.stringify(storesData[0], null, 2))
    }
  }

  // 4. Check profiles table structure
  console.log('\n📋 PROFILES TABLE:')
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)

  if (profilesError) {
    console.log('  Error:', profilesError.message)
  } else {
    console.log('  ✅ Profiles table exists')
    if (profilesData && profilesData[0]) {
      console.log('  Columns:', Object.keys(profilesData[0]).join(', '))
    }
  }

  // 5. Test inserting into users (without store_id)
  console.log('\n📋 TEST INSERT USER:')
  const testEmail = 'test-' + Date.now() + '@test.com'
  const { data: testUser, error: insertUserError } = await supabase
    .from('users')
    .insert({
      email: testEmail,
      password_hash: 'test_hash',
      full_name: 'Test User',
      role: 'owner'
    })
    .select()
    .single()

  if (insertUserError) {
    console.log('  ❌ Insert user error:', insertUserError.message)
  } else {
    console.log('  ✅ User created:', testUser.id)

    // 6. Test inserting store with owner_id
    console.log('\n📋 TEST INSERT STORE:')
    const { data: testStore, error: insertStoreError } = await supabase
      .from('stores')
      .insert({
        name: 'Test Store',
        slug: 'test-store-' + Date.now(),
        owner_id: testUser.id
      })
      .select()
      .single()

    if (insertStoreError) {
      console.log('  ❌ Insert store error:', insertStoreError.message)
      console.log('  Details:', insertStoreError.details)
      console.log('  Hint:', insertStoreError.hint)
    } else {
      console.log('  ✅ Store created:', testStore.id)

      // Cleanup
      await supabase.from('stores').delete().eq('id', testStore.id)
      console.log('  🧹 Test store deleted')
    }

    // Cleanup user
    await supabase.from('users').delete().eq('id', testUser.id)
    console.log('  🧹 Test user deleted')
  }

  // 7. Check foreign keys on stores table
  console.log('\n📋 CHECKING STORES FOREIGN KEYS:')
  const { data: fkData, error: fkError } = await supabase.rpc('exec_sql', {
    query: `
      SELECT
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'stores';
    `
  })

  if (fkError) {
    console.log('  Could not check foreign keys via RPC')
  } else {
    console.log('  Foreign keys:', fkData)
  }

  console.log('\n' + '='.repeat(60))
  console.log('CHECK COMPLETE')
  console.log('='.repeat(60))
}

checkDatabaseStructure()
