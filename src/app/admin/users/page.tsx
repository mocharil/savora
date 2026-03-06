// @ts-nocheck
import { getUserFromToken } from '@/lib/tenant-context'
import { redirect } from 'next/navigation'
import { UserManagement } from '@/components/admin/user-management'

export default async function UsersPage() {
  const user = await getUserFromToken()
  if (!user || !user.storeId) {
    redirect('/login')
  }

  // Only tenant_admin can access this page
  if (user.role !== 'tenant_admin') {
    redirect('/admin/dashboard')
  }

  return <UserManagement currentUserId={user.userId} />
}
