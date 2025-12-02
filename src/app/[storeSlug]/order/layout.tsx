import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import { Store, Sparkles, ClipboardList } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

// Generate dynamic metadata including favicon per store
export async function generateMetadata({
  params,
}: {
  params: Promise<{ storeSlug: string }>
}): Promise<Metadata> {
  const supabase = createAdminClient()
  const { storeSlug } = await params

  const { data: store } = await supabase
    .from('stores')
    .select('name, logo_url, description')
    .eq('slug', storeSlug)
    .single()

  if (!store) {
    return {
      title: 'Menu - Savora',
    }
  }

  const defaultIcon = '/savora_logo.png'
  const storeIcon = store.logo_url || defaultIcon

  return {
    title: `${store.name} - Pesan Sekarang`,
    description: store.description || `Pesan makanan dan minuman dari ${store.name}`,
    icons: {
      icon: [
        { url: storeIcon, type: 'image/png' },
      ],
      apple: [
        { url: storeIcon, type: 'image/png' },
      ],
    },
    openGraph: {
      title: `${store.name} - Pesan Sekarang`,
      description: store.description || `Pesan makanan dan minuman dari ${store.name}`,
      images: store.logo_url ? [{ url: store.logo_url }] : undefined,
    },
  }
}

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
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50/30">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-orange-100/50">
          <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Store Logo */}
              <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 p-0.5 shadow-lg shadow-orange-200">
                <div className="w-full h-full rounded-[10px] bg-white flex items-center justify-center overflow-hidden">
                  {store.logo_url ? (
                    <img
                      src={store.logo_url}
                      alt={store.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Store className="w-5 h-5 text-orange-500" />
                  )}
                </div>
              </div>
              {/* Store Name */}
              <div>
                <h1 className="text-lg font-bold text-gray-900">{store.name}</h1>
                <div className="flex items-center gap-1 text-xs text-orange-600">
                  <Sparkles className="w-3 h-3" />
                  <span>Pesan dengan mudah</span>
                </div>
              </div>
            </div>
            {/* Track Order Button */}
            <Link
              href={`/${storeSlug}/order/track`}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors"
            >
              <ClipboardList className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-600 hidden sm:inline">Lacak Pesanan</span>
            </Link>
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
