-- ============================================
-- SAVORA MULTI-TENANCY SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- STEP 1: Create function for updated_at (if not exists)
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 2: Fix users table (if needed)
-- ============================================
-- Insert existing owner into users table if not exists
INSERT INTO users (id, email, password_hash, full_name, role, store_id, is_active)
VALUES (
    'afeedf30-7913-479d-b3dd-d920be98f8e1',
    'arilindra21@gmail.com',
    '$2a$10$placeholder_hash_will_reset_later',
    'Aril',
    'owner',
    '22222222-2222-2222-2222-222222222222',
    true
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 3: Fix foreign key on stores table
-- ============================================
ALTER TABLE stores DROP CONSTRAINT IF EXISTS stores_owner_id_fkey;

ALTER TABLE stores
ADD CONSTRAINT stores_owner_id_fkey
FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;

-- ============================================
-- STEP 4: Create outlets table
-- ============================================
CREATE TABLE IF NOT EXISTS outlets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    code VARCHAR(20), -- Kode outlet: "JKT01", "BDG01"
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    is_main BOOLEAN DEFAULT false, -- Outlet utama/pusat
    is_active BOOLEAN DEFAULT true,
    operational_hours JSONB DEFAULT '{"monday": {"open": "09:00", "close": "21:00", "isOpen": true}, "tuesday": {"open": "09:00", "close": "21:00", "isOpen": true}, "wednesday": {"open": "09:00", "close": "21:00", "isOpen": true}, "thursday": {"open": "09:00", "close": "21:00", "isOpen": true}, "friday": {"open": "09:00", "close": "21:00", "isOpen": true}, "saturday": {"open": "09:00", "close": "22:00", "isOpen": true}, "sunday": {"open": "09:00", "close": "22:00", "isOpen": true}}'::jsonb,
    tax_percentage DECIMAL(5,2) DEFAULT 11.00,
    service_charge_percentage DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(store_id, slug)
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_outlets_store_id ON outlets(store_id);

-- Enable RLS
ALTER TABLE outlets ENABLE ROW LEVEL SECURITY;

-- Policy for outlets
CREATE POLICY "Allow all for service role" ON outlets FOR ALL USING (true) WITH CHECK (true);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_outlets_updated_at ON outlets;
CREATE TRIGGER update_outlets_updated_at
    BEFORE UPDATE ON outlets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 5: Create outlet_menu_items table (menu per outlet with custom price)
-- ============================================
CREATE TABLE IF NOT EXISTS outlet_menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    price DECIMAL(12,2), -- Custom price for this outlet (NULL = use default from menu_items)
    discount_price DECIMAL(12,2), -- Custom discount price
    is_available BOOLEAN DEFAULT true,
    stock_quantity INTEGER, -- Optional stock tracking per outlet
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(outlet_id, menu_item_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_outlet_menu_items_outlet_id ON outlet_menu_items(outlet_id);
CREATE INDEX IF NOT EXISTS idx_outlet_menu_items_menu_item_id ON outlet_menu_items(menu_item_id);

-- Enable RLS
ALTER TABLE outlet_menu_items ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Allow all for service role" ON outlet_menu_items FOR ALL USING (true) WITH CHECK (true);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_outlet_menu_items_updated_at ON outlet_menu_items;
CREATE TRIGGER update_outlet_menu_items_updated_at
    BEFORE UPDATE ON outlet_menu_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 6: Add outlet_id to existing tables
-- ============================================

-- Add outlet_id to tables (meja)
ALTER TABLE tables ADD COLUMN IF NOT EXISTS outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_tables_outlet_id ON tables(outlet_id);

-- Add outlet_id to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_orders_outlet_id ON orders(outlet_id);

-- Add outlet_id to users (for staff assignment)
ALTER TABLE users ADD COLUMN IF NOT EXISTS outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL;

-- ============================================
-- STEP 7: Create default outlet for existing store
-- ============================================
INSERT INTO outlets (id, store_id, name, slug, code, is_main, address, phone)
SELECT
    uuid_generate_v4(),
    '22222222-2222-2222-2222-222222222222',
    'Outlet Pusat',
    'outlet-pusat',
    'PUSAT',
    true,
    s.address,
    s.phone
FROM stores s
WHERE s.id = '22222222-2222-2222-2222-222222222222'
AND NOT EXISTS (
    SELECT 1 FROM outlets WHERE store_id = '22222222-2222-2222-2222-222222222222'
);

-- ============================================
-- STEP 8: Update existing tables and orders to use the default outlet
-- ============================================
UPDATE tables
SET outlet_id = (SELECT id FROM outlets WHERE store_id = '22222222-2222-2222-2222-222222222222' AND is_main = true LIMIT 1)
WHERE store_id = '22222222-2222-2222-2222-222222222222'
AND outlet_id IS NULL;

UPDATE orders
SET outlet_id = (SELECT id FROM outlets WHERE store_id = '22222222-2222-2222-2222-222222222222' AND is_main = true LIMIT 1)
WHERE store_id = '22222222-2222-2222-2222-222222222222'
AND outlet_id IS NULL;

-- ============================================
-- STEP 9: Create view for easy menu querying per outlet
-- ============================================
CREATE OR REPLACE VIEW outlet_menu_view AS
SELECT
    o.id AS outlet_id,
    o.name AS outlet_name,
    o.store_id,
    mi.id AS menu_item_id,
    mi.name AS menu_name,
    mi.slug,
    mi.description,
    mi.image_url,
    mi.category_id,
    c.name AS category_name,
    COALESCE(omi.price, mi.price) AS price,
    COALESCE(omi.discount_price, mi.discount_price) AS discount_price,
    COALESCE(omi.is_available, mi.is_available) AS is_available,
    omi.stock_quantity
FROM outlets o
CROSS JOIN menu_items mi
LEFT JOIN outlet_menu_items omi ON omi.outlet_id = o.id AND omi.menu_item_id = mi.id
LEFT JOIN categories c ON c.id = mi.category_id
WHERE o.store_id = mi.store_id;

-- ============================================
-- DONE!
-- ============================================
SELECT 'Multi-tenancy schema created successfully!' AS status;
