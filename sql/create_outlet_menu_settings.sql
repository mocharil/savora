-- Create outlet_menu_settings table for per-outlet menu overrides
-- This allows each outlet to:
-- 1. Toggle menu item availability (ON/OFF)
-- 2. Override the price for their outlet

CREATE TABLE IF NOT EXISTS outlet_menu_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    is_available BOOLEAN DEFAULT true,
    price_override DECIMAL(12,2) DEFAULT NULL,  -- NULL means use menu_item's default price
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(outlet_id, menu_item_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_outlet_menu_settings_outlet_id ON outlet_menu_settings(outlet_id);
CREATE INDEX IF NOT EXISTS idx_outlet_menu_settings_menu_item_id ON outlet_menu_settings(menu_item_id);

-- Add comment to explain the table
COMMENT ON TABLE outlet_menu_settings IS 'Per-outlet settings for menu items. Allows outlets to toggle availability and override prices.';
COMMENT ON COLUMN outlet_menu_settings.is_available IS 'Whether this menu item is available at this outlet';
COMMENT ON COLUMN outlet_menu_settings.price_override IS 'Custom price for this outlet. NULL means use default price from menu_items table';
