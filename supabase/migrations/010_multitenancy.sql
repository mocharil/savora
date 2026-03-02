-- =============================================
-- MULTITENANCY MIGRATION
-- Version: 010
-- Description: Add multitenancy support with tenant-outlet hierarchy
-- =============================================

-- 1. Add settings, theme, and branding columns to outlets table
ALTER TABLE outlets ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{
  "allowTakeaway": true,
  "allowDineIn": true,
  "allowDelivery": false,
  "minimumOrderAmount": 0,
  "estimatedPrepTime": 15,
  "autoAcceptOrders": false
}'::jsonb;

ALTER TABLE outlets ADD COLUMN IF NOT EXISTS theme JSONB DEFAULT '{
  "primaryColor": "#10b981",
  "secondaryColor": "#059669",
  "backgroundColor": "#ffffff",
  "textColor": "#1f2937",
  "fontFamily": "Inter",
  "logoUrl": null,
  "bannerUrl": null,
  "customCss": null
}'::jsonb;

ALTER TABLE outlets ADD COLUMN IF NOT EXISTS branding JSONB DEFAULT '{
  "businessName": null,
  "tagline": null,
  "description": null,
  "socialLinks": {},
  "contactInfo": {}
}'::jsonb;

-- 2. Add settings column to stores table for onboarding tracking
ALTER TABLE stores ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{
  "businessType": "restaurant",
  "currency": "IDR",
  "timezone": "Asia/Jakarta",
  "language": "id",
  "onboardingCompleted": false,
  "onboardingStep": 0
}'::jsonb;

-- 3. Ensure outlet_id is properly linked to tables and orders
ALTER TABLE tables ADD COLUMN IF NOT EXISTS outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL;

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_outlets_store_id ON outlets(store_id);
CREATE INDEX IF NOT EXISTS idx_outlets_slug ON outlets(slug);
CREATE INDEX IF NOT EXISTS idx_outlets_is_active ON outlets(is_active);
CREATE INDEX IF NOT EXISTS idx_tables_outlet_id ON tables(outlet_id);
CREATE INDEX IF NOT EXISTS idx_orders_outlet_id ON orders(outlet_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_store_id ON menu_items(store_id);
CREATE INDEX IF NOT EXISTS idx_categories_store_id ON categories(store_id);

-- 5. Create composite unique constraint for store+outlet slug
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'outlets_store_slug_unique'
  ) THEN
    ALTER TABLE outlets ADD CONSTRAINT outlets_store_slug_unique UNIQUE(store_id, slug);
  END IF;
END $$;

-- 6. Create user-outlet assignment table for outlet-level staff
CREATE TABLE IF NOT EXISTS user_outlets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'staff',
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, outlet_id)
);

CREATE INDEX IF NOT EXISTS idx_user_outlets_user_id ON user_outlets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_outlets_outlet_id ON user_outlets(outlet_id);

-- 7. Create outlet_menu_items table if not exists
CREATE TABLE IF NOT EXISTS outlet_menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  price DECIMAL(12,2) DEFAULT NULL,
  discount_price DECIMAL(12,2) DEFAULT NULL,
  is_available BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(outlet_id, menu_item_id)
);

CREATE INDEX IF NOT EXISTS idx_outlet_menu_items_outlet_id ON outlet_menu_items(outlet_id);
CREATE INDEX IF NOT EXISTS idx_outlet_menu_items_menu_item_id ON outlet_menu_items(menu_item_id);

-- 8. Create view for outlet-aware menu items
DROP VIEW IF EXISTS outlet_menu_view;
CREATE VIEW outlet_menu_view AS
SELECT
  mi.id,
  mi.store_id,
  mi.category_id,
  mi.name,
  mi.slug,
  mi.description,
  mi.image_url,
  mi.is_available AS global_available,
  mi.is_featured,
  mi.sort_order,
  mi.created_at,
  mi.updated_at,
  o.id AS outlet_id,
  COALESCE(omi.price, mi.price) AS price,
  COALESCE(omi.discount_price, mi.discount_price) AS discount_price,
  COALESCE(omi.is_available, mi.is_available) AS is_available,
  omi.stock_quantity,
  o.name AS outlet_name,
  o.slug AS outlet_slug
FROM menu_items mi
CROSS JOIN outlets o
LEFT JOIN outlet_menu_items omi ON mi.id = omi.menu_item_id AND o.id = omi.outlet_id
WHERE o.store_id = mi.store_id AND o.is_active = true;

-- 9. Function to initialize outlet with default menu items
CREATE OR REPLACE FUNCTION initialize_outlet_menu(p_outlet_id UUID)
RETURNS void AS $$
DECLARE
  v_store_id UUID;
BEGIN
  -- Get store_id from outlet
  SELECT store_id INTO v_store_id FROM outlets WHERE id = p_outlet_id;

  -- Insert all store's menu items into outlet_menu_items with NULL overrides (uses default)
  INSERT INTO outlet_menu_items (outlet_id, menu_item_id, is_available)
  SELECT p_outlet_id, id, true
  FROM menu_items
  WHERE store_id = v_store_id
  ON CONFLICT (outlet_id, menu_item_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- 10. Trigger to auto-create outlet_menu_items when new menu item is created
CREATE OR REPLACE FUNCTION sync_menu_to_outlets()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO outlet_menu_items (outlet_id, menu_item_id, is_available)
  SELECT id, NEW.id, true
  FROM outlets
  WHERE store_id = NEW.store_id AND is_active = true
  ON CONFLICT (outlet_id, menu_item_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_menu_to_outlets ON menu_items;
CREATE TRIGGER trigger_sync_menu_to_outlets
  AFTER INSERT ON menu_items
  FOR EACH ROW
  EXECUTE FUNCTION sync_menu_to_outlets();

-- 11. Trigger to initialize menu when new outlet is created
CREATE OR REPLACE FUNCTION on_outlet_created()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM initialize_outlet_menu(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_on_outlet_created ON outlets;
CREATE TRIGGER trigger_on_outlet_created
  AFTER INSERT ON outlets
  FOR EACH ROW
  EXECUTE FUNCTION on_outlet_created();

-- 12. Updated_at trigger for user_outlets
CREATE OR REPLACE FUNCTION update_user_outlets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_outlets_updated_at ON user_outlets;
CREATE TRIGGER trigger_user_outlets_updated_at
  BEFORE UPDATE ON user_outlets
  FOR EACH ROW
  EXECUTE FUNCTION update_user_outlets_updated_at();

-- 13. Updated_at trigger for outlet_menu_items
CREATE OR REPLACE FUNCTION update_outlet_menu_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_outlet_menu_items_updated_at ON outlet_menu_items;
CREATE TRIGGER trigger_outlet_menu_items_updated_at
  BEFORE UPDATE ON outlet_menu_items
  FOR EACH ROW
  EXECUTE FUNCTION update_outlet_menu_items_updated_at();

-- =============================================
-- DATA MIGRATION: Create default outlets for existing stores
-- =============================================

-- Create a default outlet for each store that doesn't have one
INSERT INTO outlets (store_id, name, slug, code, is_main, is_active, tax_percentage, service_charge_percentage)
SELECT
  s.id,
  'Main Outlet',
  'main',
  'MAIN',
  true,
  true,
  s.tax_percentage,
  s.service_charge_percentage
FROM stores s
WHERE NOT EXISTS (
  SELECT 1 FROM outlets o WHERE o.store_id = s.id
);

-- Assign existing tables to main outlet
UPDATE tables t
SET outlet_id = (
  SELECT o.id FROM outlets o
  WHERE o.store_id = t.store_id AND o.is_main = true
  LIMIT 1
)
WHERE t.outlet_id IS NULL;

-- Assign existing orders to main outlet
UPDATE orders o
SET outlet_id = (
  SELECT out.id FROM outlets out
  WHERE out.store_id = o.store_id AND out.is_main = true
  LIMIT 1
)
WHERE o.outlet_id IS NULL;

-- Initialize outlet_menu_items for all existing outlets
DO $$
DECLARE
  outlet_record RECORD;
BEGIN
  FOR outlet_record IN SELECT id FROM outlets WHERE is_active = true LOOP
    PERFORM initialize_outlet_menu(outlet_record.id);
  END LOOP;
END $$;

-- =============================================
-- COMMENTS
-- =============================================
COMMENT ON TABLE user_outlets IS 'Associates users with specific outlets they can manage';
COMMENT ON TABLE outlet_menu_items IS 'Stores outlet-specific menu item pricing and availability overrides';
COMMENT ON VIEW outlet_menu_view IS 'Provides outlet-specific menu items with pricing (uses outlet override or falls back to default)';
COMMENT ON FUNCTION initialize_outlet_menu IS 'Initializes outlet_menu_items for a new outlet with all store menu items';
COMMENT ON FUNCTION sync_menu_to_outlets IS 'Automatically adds new menu items to all active outlets';
