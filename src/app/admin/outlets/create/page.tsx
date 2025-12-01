import { OutletForm } from '@/components/admin/outlet-form'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

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

export default async function CreateOutletPage() {
  const user = await getUserFromToken()

  if (!user?.storeId) {
    return (
      <div className="p-6">
        <p className="text-red-500">Store tidak ditemukan. Silakan login ulang.</p>
      </div>
    )
  }

  return <OutletForm storeId={user.storeId} />
}
