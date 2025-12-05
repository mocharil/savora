// @ts-nocheck
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { jwtVerify } from 'jose'
import { ProfileForm } from '@/components/admin/profile-form'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY &&
  process.env.SUPABASE_SERVICE_ROLE_KEY !== 'your_service_role_key'
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  console.error('CRITICAL: JWT_SECRET environment variable is not set')
}
const jwtSecret = new TextEncoder().encode(JWT_SECRET || '')

async function getUserFromToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, jwtSecret)
    return payload as { userId: string; email: string; role: string; storeId: string }
  } catch {
    return null
  }
}

export default async function ProfilePage() {
  const tokenUser = await getUserFromToken()

  if (!tokenUser) {
    redirect('/login')
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Get full user data
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, full_name, phone, role, created_at')
    .eq('id', tokenUser.userId)
    .single()

  if (error || !user) {
    console.error('Profile page - User not found:', error)
    redirect('/login')
  }

  return <ProfileForm user={user} />
}
