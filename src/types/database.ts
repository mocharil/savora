export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'owner' | 'staff' | 'customer'
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'
export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded'
export type PaymentMethod = 'qris' | 'gopay' | 'ovo' | 'dana' | 'shopeepay' | 'va_bca' | 'va_bni' | 'va_mandiri' | 'cash' | 'midtrans'
export type TableStatus = 'available' | 'occupied' | 'reserved' | 'needs_cleaning'

export interface Database {
  public: {
    Tables: {
      stores: {
        Row: {
          id: string
          owner_id: string
          name: string
          slug: string
          description: string | null
          address: string | null
          phone: string | null
          logo_url: string | null
          banner_url: string | null
          tax_percentage: number
          service_charge_percentage: number
          operational_hours: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          slug: string
          description?: string | null
          address?: string | null
          phone?: string | null
          logo_url?: string | null
          banner_url?: string | null
          tax_percentage?: number
          service_charge_percentage?: number
          operational_hours?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          slug?: string
          description?: string | null
          address?: string | null
          phone?: string | null
          logo_url?: string | null
          banner_url?: string | null
          tax_percentage?: number
          service_charge_percentage?: number
          operational_hours?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          role: UserRole
          store_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: UserRole
          store_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: UserRole
          store_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          store_id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          id: string
          store_id: string
          category_id: string
          name: string
          slug: string
          description: string | null
          price: number
          discount_price: number | null
          image_url: string | null
          is_available: boolean
          is_featured: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          category_id: string
          name: string
          slug: string
          description?: string | null
          price: number
          discount_price?: number | null
          image_url?: string | null
          is_available?: boolean
          is_featured?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          category_id?: string
          name?: string
          slug?: string
          description?: string | null
          price?: number
          discount_price?: number | null
          image_url?: string | null
          is_available?: boolean
          is_featured?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      tables: {
        Row: {
          id: string
          store_id: string
          table_number: string
          table_name: string | null
          capacity: number
          qr_code: string | null
          status: TableStatus
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          table_number: string
          table_name?: string | null
          capacity?: number
          qr_code?: string | null
          status?: TableStatus
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          table_number?: string
          table_name?: string | null
          capacity?: number
          qr_code?: string | null
          status?: TableStatus
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          store_id: string
          table_id: string | null
          customer_id: string | null
          order_number: string
          status: OrderStatus
          subtotal: number
          tax_amount: number
          service_charge_amount: number
          discount_amount: number
          total: number
          notes: string | null
          customer_name: string | null
          customer_phone: string | null
          payment_status: PaymentStatus
          paid_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          table_id?: string | null
          customer_id?: string | null
          order_number: string
          status?: OrderStatus
          subtotal?: number
          tax_amount?: number
          service_charge_amount?: number
          discount_amount?: number
          total?: number
          notes?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          payment_status?: PaymentStatus
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          table_id?: string | null
          customer_id?: string | null
          order_number?: string
          status?: OrderStatus
          subtotal?: number
          tax_amount?: number
          service_charge_amount?: number
          discount_amount?: number
          total?: number
          notes?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          payment_status?: PaymentStatus
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          menu_item_id: string
          quantity: number
          unit_price: number
          subtotal: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          menu_item_id: string
          quantity?: number
          unit_price: number
          subtotal: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          menu_item_id?: string
          quantity?: number
          unit_price?: number
          subtotal?: number
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          id: string
          order_id: string
          payment_method: PaymentMethod
          payment_gateway: string
          transaction_id: string | null
          external_id: string | null
          amount: number
          status: PaymentStatus
          payment_url: string | null
          qr_code_url: string | null
          va_number: string | null
          expiry_time: string | null
          paid_at: string | null
          raw_response: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          payment_method: PaymentMethod
          payment_gateway?: string
          transaction_id?: string | null
          external_id?: string | null
          amount: number
          status?: PaymentStatus
          payment_url?: string | null
          qr_code_url?: string | null
          va_number?: string | null
          expiry_time?: string | null
          paid_at?: string | null
          raw_response?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          payment_method?: PaymentMethod
          payment_gateway?: string
          transaction_id?: string | null
          external_id?: string | null
          amount?: number
          status?: PaymentStatus
          payment_url?: string | null
          qr_code_url?: string | null
          va_number?: string | null
          expiry_time?: string | null
          paid_at?: string | null
          raw_response?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: UserRole
      order_status: OrderStatus
      payment_status: PaymentStatus
      payment_method: PaymentMethod
      table_status: TableStatus
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Store = Database['public']['Tables']['stores']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type MenuItem = Database['public']['Tables']['menu_items']['Row']
export type Table = Database['public']['Tables']['tables']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']

// Extended types with relations
export type MenuItemWithCategory = MenuItem & {
  category: Category
}

export type OrderWithItems = Order & {
  order_items: (OrderItem & {
    menu_item: MenuItem
  })[]
  table: Table | null
  payments: Payment[]
}

export type CategoryWithItems = Category & {
  menu_items: MenuItem[]
}

// Tenant (Store) Settings
export interface TenantSettings {
  businessType: string
  currency: string
  timezone: string
  language: string
  onboardingCompleted: boolean
  onboardingStep: number
}

// Store with settings
export type StoreWithSettings = Store & {
  settings: TenantSettings
}

// Context for current session
export interface TenantContext {
  storeId: string
  storeSlug: string
  outletId: string
  outletSlug: string
  userId?: string
  userRole?: string
}
