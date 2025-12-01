import { getUserFromToken } from '@/lib/tenant-context'
import { redirect } from 'next/navigation'
import { CategoryForm } from '@/components/admin/category-form'

export default async function CreateCategoryPage() {
  // Get user from token
  const user = await getUserFromToken()
  if (!user || !user.storeId) {
    redirect('/login')
  }

  const storeId = user.storeId

  return <CategoryForm storeId={storeId} />
}
