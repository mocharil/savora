// @ts-nocheck
import { createAdminClient } from '@/lib/supabase/server'
import { getUserFromToken } from '@/lib/tenant-context'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/admin/profile-form'

export default async function ProfilePage() {
  // Get user from token
  const tokenUser = await getUserFromToken()
  if (!tokenUser || !tokenUser.storeId) {
    redirect('/login')
  }

  const supabase = createAdminClient()

  // Get full user data
  const { data: user } = await supabase
    .from('users')
    .select('id, email, full_name, phone, role, created_at')
    .eq('id', tokenUser.userId)
    .single()

  if (!user) {
    redirect('/login')
  }

  return <ProfileForm user={user} />
}
