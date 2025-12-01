import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { OutletThemeProvider } from '@/components/customer/OutletThemeProvider'
import type { Outlet, OutletTheme, OutletBranding } from '@/types/outlet'

interface Props {
  children: React.ReactNode
  params: Promise<{
    storeSlug: string
    outletSlug: string
  }>
}

async function getOutletData(storeSlug: string, outletSlug: string) {
  const supabase = createAdminClient()

  // Fetch store
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id, name, slug, logo_url, description')
    .eq('slug', storeSlug)
    .eq('is_active', true)
    .single()

  if (storeError || !store) {
    return null
  }

  // Fetch outlet with theme (use any to bypass type checking for new columns)
  const { data: outlet, error: outletError } = await (supabase as any)
    .from('outlets')
    .select('*')
    .eq('store_id', store.id)
    .eq('slug', outletSlug)
    .eq('is_active', true)
    .single()

  if (outletError || !outlet) {
    return null
  }

  return { store, outlet: outlet as Outlet }
}

export default async function OutletLayout({ children, params }: Props) {
  const { storeSlug, outletSlug } = await params
  const data = await getOutletData(storeSlug, outletSlug)

  if (!data) {
    notFound()
  }

  const { store, outlet } = data
  const theme = (outlet.theme || {}) as OutletTheme
  const branding = (outlet.branding || {}) as OutletBranding

  return (
    <OutletThemeProvider
      theme={theme}
      branding={branding}
      storeName={store.name}
      outletName={outlet.name}
      storeSlug={storeSlug}
      outletSlug={outletSlug}
    >
      <div className="min-h-screen outlet-theme">
        {/* Header with branding */}
        <header
          className="sticky top-0 z-50 border-b shadow-sm"
          style={{ backgroundColor: theme.primaryColor || '#10b981' }}
        >
          <div className="max-w-lg mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              {(theme.logoUrl || store.logo_url) && (
                <img
                  src={theme.logoUrl || store.logo_url || ''}
                  alt={store.name}
                  className="w-10 h-10 rounded-full object-cover bg-white"
                />
              )}
              <div className="text-white">
                <h1 className="font-bold text-lg">
                  {branding.businessName || store.name}
                </h1>
                <p className="text-sm opacity-90">{outlet.name}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main
          className="max-w-lg mx-auto min-h-[calc(100vh-64px)]"
          style={{ backgroundColor: theme.backgroundColor || '#ffffff' }}
        >
          {children}
        </main>
      </div>
    </OutletThemeProvider>
  )
}

export async function generateMetadata({ params }: Props) {
  const { storeSlug, outletSlug } = await params
  const data = await getOutletData(storeSlug, outletSlug)

  if (!data) {
    return { title: 'Not Found' }
  }

  const { store, outlet } = data
  const branding = (outlet.branding || {}) as OutletBranding

  return {
    title: `${branding.businessName || store.name} - ${outlet.name}`,
    description: branding.description || store.description || `Order from ${store.name}`,
  }
}
