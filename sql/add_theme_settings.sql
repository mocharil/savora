-- Add theme_settings column to stores table
-- This column stores JSON data for customer-facing theme customization

ALTER TABLE stores
ADD COLUMN IF NOT EXISTS theme_settings JSONB DEFAULT '{
  "primary_color": "#f97316",
  "secondary_color": "#ef4444",
  "accent_color": "#10b981",
  "text_color": "#1f2937",
  "background_color": "#ffffff"
}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN stores.theme_settings IS 'JSON object containing theme colors for customer-facing pages';
