// Execute SQL file directly via Supabase
require('dotenv').config({ path: '.env.local' })
const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)
const projectRef = supabaseUrl.replace('https://', '').split('.')[0]

async function runSqlFile() {
  const sqlFilePath = process.argv[2]

  if (!sqlFilePath) {
    console.error('❌ Usage: node scripts/run-sql-file.js <sql-file-path>')
    process.exit(1)
  }

  const fullPath = path.resolve(sqlFilePath)

  if (!fs.existsSync(fullPath)) {
    console.error(`❌ File not found: ${fullPath}`)
    process.exit(1)
  }

  const sql = fs.readFileSync(fullPath, 'utf-8')

  console.log(`📄 Running SQL from: ${fullPath}\n`)

  // Try to execute via RPC
  const { data, error } = await supabase.rpc('exec_sql', { sql })

  if (error) {
    console.log('⚠️  Cannot execute SQL directly via API (exec_sql RPC not available)')
    console.log('   This is normal for hosted Supabase projects.\n')
    console.log('═══════════════════════════════════════════════════════════')
    console.log('📋 PLEASE RUN THE FOLLOWING SQL MANUALLY:')
    console.log('═══════════════════════════════════════════════════════════\n')
    console.log(`Go to: https://supabase.com/dashboard/project/${projectRef}/sql/new\n`)
    console.log('Copy and paste this SQL:\n')
    console.log('---BEGIN SQL---\n')
    console.log(sql)
    console.log('\n---END SQL---\n')
  } else {
    console.log('✅ SQL executed successfully!')
    if (data) console.log('Result:', data)
  }
}

runSqlFile().catch(console.error)
