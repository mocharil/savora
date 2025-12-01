import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import { Store } from 'lucide-react'

export default async function OrderLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ storeSlug: string }>
}) {
  const supabase = createAdminClient()
  const { storeSlug } = await params

  const { data: store } = await supabase
    .from('stores')
    .select('id, name, slug, logo_url')
    .eq('slug', storeSlug)
    .single()

  if (!store) {
    notFound()
  }

  const midtransClientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
  const midtransIsProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
  const snapUrl = midtransIsProduction
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js'

  return (
    <>
      {midtransClientKey && (
        <Script
          src={snapUrl}
          data-client-key={midtransClientKey}
          strategy="lazyOnload"
        />
      )}
      <div className="min-h-screen bg-[#F8F9FA]">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white shadow-savora-sm h-16">
          <div className="max-w-lg mx-auto px-4 h-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Store Logo */}
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
                {store.logo_url ? (
                  <img
                    src={store.logo_url}
                    alt={store.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Store className="w-5 h-5 text-primary" />
                )}
              </div>
              {/* Store Name */}
              <h1 className="text-lg font-bold text-[#202124]">{store.name}</h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-lg mx-auto">
          {children}
        </main>
      </div>
    </>
  )
}
