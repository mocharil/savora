import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { jwtVerify } from 'jose'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminHeader } from '@/components/admin/header'
import { AdminLayoutClient } from '@/components/admin/AdminLayoutClient'
import { FTUEProvider } from '@/components/admin/ftue'
import { TourProvider, TourOverlay } from '@/components/admin/tour'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// Use service role key if available, otherwise fall back to anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY &&
  process.env.SUPABASE_SERVICE_ROLE_KEY !== 'your_service_role_key'
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const tokenUser = await getUserFromToken()

  if (!tokenUser) {
    redirect('/login')
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Get user data
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', tokenUser.userId)
    .single()

  if (!user) {
    redirect('/login')
  }

  // Get store data
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('id', user.store_id)
    .single()

  // Check if onboarding is completed
  const storeSettings = (store?.settings as Record<string, unknown>) || {}
  const onboardingCompleted = storeSettings.onboardingCompleted === true

  // Check if user has any outlets (another way to determine if they completed setup)
  const { count: outletCount } = await supabase
    .from('outlets')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', user.store_id)
    .eq('is_active', true)

  // If onboarding not completed and no outlets, redirect to onboarding
  if (!onboardingCompleted && (!outletCount || outletCount === 0)) {
    redirect('/onboarding')
  }

  // Get pending order count
  const { count: pendingOrderCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', user.store_id)
    .eq('status', 'pending')

  // Get FTUE status
  const { count: menuCount } = await supabase
    .from('menu_items')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', user.store_id)

  const { count: tableCount } = await supabase
    .from('tables')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', user.store_id)
    .eq('is_active', true)

  const { count: userCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', user.store_id)
    .neq('id', user.id)

  const ftueData = {
    hasOutlet: (outletCount || 0) > 0,
    hasMenu: (menuCount || 0) > 0,
    hasTables: (tableCount || 0) > 0,
    hasUsers: (userCount || 0) > 0,
  }

  // Create a user object compatible with the header
  const userForHeader = {
    id: user.id,
    email: user.email,
    aud: 'authenticated',
    role: 'authenticated',
    created_at: user.created_at,
    updated_at: user.updated_at,
    app_metadata: {},
    user_metadata: { full_name: user.full_name },
  }

  // Create a profile object compatible with existing components
  const profileForHeader = {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    phone: null,
    avatar_url: null,
    role: user.role as 'owner' | 'staff' | 'customer',
    store_id: user.store_id,
    created_at: user.created_at,
    updated_at: user.updated_at,
    stores: store
  }

  return (
    <FTUEProvider initialData={ftueData}>
      <TourProvider autoStartFTUE={true}>
        <AdminLayoutClient
          sidebar={
            <AdminSidebar
              store={store}
              pendingOrderCount={pendingOrderCount || 0}
              userRole={user.role}
              userName={user.full_name || user.email?.split('@')[0] || 'User'}
              userEmail={user.email}
              userAvatar={null}
            />
          }
          header={<AdminHeader user={userForHeader as any} profile={profileForHeader as any} />}
        >
          {children}
        </AdminLayoutClient>
        <TourOverlay />
      </TourProvider>
    </FTUEProvider>
  )
}
