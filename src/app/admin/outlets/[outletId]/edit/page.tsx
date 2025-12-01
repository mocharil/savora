import { OutletForm } from '@/components/admin/outlet-form'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { jwtVerify } from 'jose'
import { notFound } from 'next/navigation'
import { Outlet } from '@/types/outlet'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const jwtSecret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-min-32-chars!'
)

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

async function getOutlet(outletId: string, storeId: string): Promise<Outlet | null> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const { data, error } = await supabase
    .from('outlets')
    .select('*')
    .eq('id', outletId)
    .eq('store_id', storeId)
    .single()

  if (error) {
    console.error('Error fetching outlet:', error)
    return null
  }

  return data
}

export default async function EditOutletPage({
  params
}: {
  params: Promise<{ outletId: string }>
}) {
  const { outletId } = await params
  const user = await getUserFromToken()

  if (!user?.storeId) {
    return (
      <div className="p-6">
        <p className="text-red-500">Store tidak ditemukan. Silakan login ulang.</p>
      </div>
    )
  }

  const outlet = await getOutlet(outletId, user.storeId)

  if (!outlet) {
    notFound()
  }

  return <OutletForm storeId={user.storeId} initialData={outlet} />
}
