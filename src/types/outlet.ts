export interface Outlet {
  id: string
  store_id: string
  name: string
  slug: string
  code: string | null
  address: string | null
  phone: string | null
  email: string | null
  is_main: boolean
  is_active: boolean
  operational_hours: OperationalHours | null
  tax_percentage: number
  service_charge_percentage: number
  settings: OutletSettings
  theme: OutletTheme
  branding: OutletBranding
  created_at: string
  updated_at: string
}

export interface OperationalHours {
  [key: string]: {
    open: string
    close: string
    isOpen: boolean
  }
}

export interface OutletSettings {
  allowTakeaway: boolean
  allowDineIn: boolean
  allowDelivery: boolean
  minimumOrderAmount: number
  estimatedPrepTime: number
  autoAcceptOrders: boolean
}

export interface OutletTheme {
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
  fontFamily: string
  logoUrl: string | null
  bannerUrl: string | null
  customCss: string | null
}

export interface OutletBranding {
  businessName: string | null
  tagline: string | null
  description: string | null
  socialLinks: Record<string, string>
  contactInfo: Record<string, string>
}

export interface OutletMenuItem {
  id: string
  outlet_id: string
  menu_item_id: string
  price: number | null
  discount_price: number | null
  is_available: boolean
  stock_quantity: number | null
  created_at: string
  updated_at: string
}

export interface UserOutlet {
  id: string
  user_id: string
  outlet_id: string
  role: 'staff' | 'manager'
  is_primary: boolean
  created_at: string
  updated_at: string
}

// Outlet menu view - joined data from menu_items and outlet_menu_items
export interface OutletMenuView {
  id: string
  store_id: string
  category_id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  global_available: boolean
  is_featured: boolean
  sort_order: number
  created_at: string
  updated_at: string
  outlet_id: string
  price: number
  discount_price: number | null
  is_available: boolean
  stock_quantity: number | null
  outlet_name: string
  outlet_slug: string
}
