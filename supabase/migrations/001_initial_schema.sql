-- ============================================
-- SAVORA DATABASE SCHEMA
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUM TYPES
-- ============================================

CREATE TYPE user_role AS ENUM ('owner', 'staff', 'customer');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('unpaid', 'pending', 'paid', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('qris', 'gopay', 'ovo', 'dana', 'shopeepay', 'va_bca', 'va_bni', 'va_mandiri', 'cash');
CREATE TYPE table_status AS ENUM ('available', 'occupied');

-- ============================================
-- TABLES
-- ============================================

-- Stores table
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    address TEXT,
    phone VARCHAR(20),
    logo_url TEXT,
    banner_url TEXT,
    tax_percentage DECIMAL(5,2) DEFAULT 11.00,
    service_charge_percentage DECIMAL(5,2) DEFAULT 0.00,
    operational_hours JSONB DEFAULT '{"monday": {"open": "09:00", "close": "21:00"}, "tuesday": {"open": "09:00", "close": "21:00"}, "wednesday": {"open": "09:00", "close": "21:00"}, "thursday": {"open": "09:00", "close": "21:00"}, "friday": {"open": "09:00", "close": "21:00"}, "saturday": {"open": "09:00", "close": "22:00"}, "sunday": {"open": "09:00", "close": "22:00"}}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    avatar_url TEXT,
    role user_role DEFAULT 'customer',
    store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(store_id, slug)
);

-- Menu items table
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    discount_price DECIMAL(12,2),
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(store_id, slug)
);

-- Tables (meja) table
CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    table_number VARCHAR(50) NOT NULL,
    table_name VARCHAR(100),
    capacity INTEGER DEFAULT 4,
    qr_code_url TEXT,
    status table_status DEFAULT 'available',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(store_id, table_number)
);

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    status order_status DEFAULT 'pending',
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    service_charge_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    notes TEXT,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    payment_status payment_status DEFAULT 'unpaid',
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    payment_method payment_method NOT NULL,
    payment_gateway VARCHAR(50) DEFAULT 'midtrans',
    transaction_id VARCHAR(255),
    external_id VARCHAR(255),
    amount DECIMAL(12,2) NOT NULL,
    status payment_status DEFAULT 'pending',
    payment_url TEXT,
    qr_code_url TEXT,
    va_number VARCHAR(50),
    expiry_time TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    raw_response JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_stores_owner ON stores(owner_id);
CREATE INDEX idx_stores_slug ON stores(slug);
CREATE INDEX idx_profiles_store ON profiles(store_id);
CREATE INDEX idx_categories_store ON categories(store_id);
CREATE INDEX idx_menu_items_store ON menu_items(store_id);
CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_tables_store ON tables(store_id);
CREATE INDEX idx_orders_store ON orders(store_id);
CREATE INDEX idx_orders_table ON orders(table_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_payments_order ON payments(order_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate order totals
CREATE OR REPLACE FUNCTION calculate_order_totals()
RETURNS TRIGGER AS $$
DECLARE
    v_subtotal DECIMAL(12,2);
    v_tax_percentage DECIMAL(5,2);
    v_service_percentage DECIMAL(5,2);
    v_tax_amount DECIMAL(12,2);
    v_service_amount DECIMAL(12,2);
    v_total DECIMAL(12,2);
BEGIN
    -- Get subtotal from order items
    SELECT COALESCE(SUM(subtotal), 0) INTO v_subtotal
    FROM order_items WHERE order_id = COALESCE(NEW.order_id, OLD.order_id);

    -- Get tax and service percentages from store
    SELECT
        COALESCE(s.tax_percentage, 11),
        COALESCE(s.service_charge_percentage, 0)
    INTO v_tax_percentage, v_service_percentage
    FROM orders o
    JOIN stores s ON o.store_id = s.id
    WHERE o.id = COALESCE(NEW.order_id, OLD.order_id);

    -- Calculate amounts
    v_tax_amount := v_subtotal * (v_tax_percentage / 100);
    v_service_amount := v_subtotal * (v_service_percentage / 100);
    v_total := v_subtotal + v_tax_amount + v_service_amount;

    -- Update order
    UPDATE orders SET
        subtotal = v_subtotal,
        tax_amount = v_tax_amount,
        service_charge_amount = v_service_amount,
        total = v_total,
        updated_at = NOW()
    WHERE id = COALESCE(NEW.order_id, OLD.order_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- Updated at triggers
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tables_updated_at BEFORE UPDATE ON tables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Order totals calculation trigger
CREATE TRIGGER calculate_order_totals_on_item_change
    AFTER INSERT OR UPDATE OR DELETE ON order_items
    FOR EACH ROW EXECUTE FUNCTION calculate_order_totals();

-- New user trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Stores policies
CREATE POLICY "Public stores are viewable by everyone" ON stores
    FOR SELECT USING (is_active = true);

CREATE POLICY "Owners can manage their stores" ON stores
    FOR ALL USING (auth.uid() = owner_id);

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Store staff can view customer profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('owner', 'staff')
        )
    );

-- Categories policies
CREATE POLICY "Categories viewable by everyone" ON categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Store owners can manage categories" ON categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM stores
            WHERE stores.id = categories.store_id
            AND stores.owner_id = auth.uid()
        )
    );

-- Menu items policies
CREATE POLICY "Menu items viewable by everyone" ON menu_items
    FOR SELECT USING (is_available = true);

CREATE POLICY "Store owners can manage menu items" ON menu_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM stores
            WHERE stores.id = menu_items.store_id
            AND stores.owner_id = auth.uid()
        )
    );

-- Tables policies
CREATE POLICY "Tables viewable by everyone" ON tables
    FOR SELECT USING (is_active = true);

CREATE POLICY "Store owners can manage tables" ON tables
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM stores
            WHERE stores.id = tables.store_id
            AND stores.owner_id = auth.uid()
        )
    );

-- Orders policies
CREATE POLICY "Customers can view own orders" ON orders
    FOR SELECT USING (
        customer_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM stores
            WHERE stores.id = orders.store_id
            AND stores.owner_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can create orders" ON orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Store owners can update orders" ON orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM stores
            WHERE stores.id = orders.store_id
            AND stores.owner_id = auth.uid()
        )
    );

-- Order items policies
CREATE POLICY "Order items follow order access" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND (
                orders.customer_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM stores
                    WHERE stores.id = orders.store_id
                    AND stores.owner_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Anyone can create order items" ON order_items
    FOR INSERT WITH CHECK (true);

-- Payments policies
CREATE POLICY "Payment access follows order access" ON payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = payments.order_id
            AND (
                orders.customer_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM stores
                    WHERE stores.id = orders.store_id
                    AND stores.owner_id = auth.uid()
                )
            )
        )
    );

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Run these in Supabase Dashboard > Storage

-- Create buckets:
-- 1. store-logos (public)
-- 2. store-banners (public)
-- 3. menu-images (public)
-- 4. category-images (public)
-- 5. qr-codes (public)

-- Storage policies are set via Dashboard
