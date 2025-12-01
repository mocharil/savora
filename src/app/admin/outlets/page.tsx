import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { jwtVerify } from 'jose'
import Link from 'next/link'
import {
  Plus,
  Building2,
  MapPin,
  Phone,
  Star,
  MoreVertical,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Settings,
  Palette,
  UtensilsCrossed
} from 'lucide-react'
import { Outlet } from '@/types/outlet'
import { OutletsPageClient } from './OutletsPageClient'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const jwtSecret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-min-32-chars!'
)

async function getOutlets(storeId: string): Promise<Outlet[]> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const { data, error } = await supabase
    .from('outlets')
    .select('*')
    .eq('store_id', storeId)
    .order('is_main', { ascending: false })
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching outlets:', error)
    return []
  }

  return data || []
}

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

export default async function OutletsPage() {
  const user = await getUserFromToken()

  if (!user?.storeId) {
    return (
      <div className="p-6">
        <p className="text-red-500">Store tidak ditemukan. Silakan login ulang.</p>
      </div>
    )
  }

  const outlets = await getOutlets(user.storeId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <OutletsPageClient />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Building2 className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{outlets.length}</p>
              <p className="text-sm text-gray-500">Total Outlet</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ToggleRight className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {outlets.filter(o => o.is_active).length}
              </p>
              <p className="text-sm text-gray-500">Outlet Aktif</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {outlets.filter(o => o.is_main).length}
              </p>
              <p className="text-sm text-gray-500">Outlet Pusat</p>
            </div>
          </div>
        </div>
      </div>

      {/* Outlets List */}
      {outlets.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada outlet</h3>
          <p className="text-gray-500 mb-4">Mulai dengan menambahkan outlet pertama Anda</p>
          <Link
            href="/admin/outlets/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah Outlet
          </Link>
        </div>
      ) : (
        <div data-tour="outlets-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {outlets.map((outlet) => (
            <div
              key={outlet.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${outlet.is_main ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                      <Building2 className={`w-5 h-5 ${outlet.is_main ? 'text-yellow-600' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{outlet.name}</h3>
                        {outlet.is_main && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                            Pusat
                          </span>
                        )}
                      </div>
                      {outlet.code && (
                        <p className="text-sm text-gray-500">Kode: {outlet.code}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      outlet.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {outlet.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-3">
                {outlet.address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{outlet.address}</span>
                  </div>
                )}
                {outlet.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{outlet.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>PPN: {outlet.tax_percentage}%</span>
                  <span>Service: {outlet.service_charge_percentage}%</span>
                </div>
              </div>

              {/* Actions */}
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <Link
                  href={`/admin/outlets/${outlet.id}/menu`}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  Kelola Menu
                </Link>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/admin/outlets/${outlet.id}/settings`}
                    className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Customize Appearance"
                  >
                    <Palette className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/admin/outlets/${outlet.id}/edit`}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit Outlet"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
