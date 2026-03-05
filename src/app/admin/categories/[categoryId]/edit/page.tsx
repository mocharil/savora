import { createClient } from '@/lib/supabase/server'
import { getUserFromToken } from '@/lib/tenant-context'
import { CategoryForm } from '@/components/admin/category-form'
import { notFound, redirect } from 'next/navigation'

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>
}) {
  const supabase = await createClient()
  const { categoryId } = await params

  // Get user from token
  const user = await getUserFromToken()
  if (!user || !user.storeId) {
    redirect('/login')
  }

  const storeId = user.storeId

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('id', categoryId)
    .eq('store_id', storeId)
    .single()

  if (!category) {
    notFound()
  }

  return <CategoryForm storeId={storeId} initialData={category} />
}
