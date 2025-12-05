import { AIMenuCreator } from '@/components/admin/ai-menu-creator'
import { getUserFromToken } from '@/lib/tenant-context'
import { redirect } from 'next/navigation'

export default async function AIMenuCreatorPage() {
  const user = await getUserFromToken()
  if (!user || !user.storeId) {
    redirect('/login')
  }

  return <AIMenuCreator storeId={user.storeId} />
}
