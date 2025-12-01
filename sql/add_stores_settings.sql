-- ============================================
-- ADD SETTINGS COLUMN TO STORES TABLE
-- Run this in Supabase SQL Editor
-- ============================================

-- Add settings column to stores table
ALTER TABLE stores ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

-- Add theme column to outlets table (for customer-facing customization)
ALTER TABLE outlets ADD COLUMN IF NOT EXISTS theme JSONB DEFAULT '{
  "primaryColor": "#10b981",
  "secondaryColor": "#059669",
  "backgroundColor": "#ffffff",
  "textColor": "#1f2937",
  "fontFamily": "Inter",
  "logoUrl": null,
  "bannerUrl": null
}'::jsonb;

-- Add branding column to outlets table
ALTER TABLE outlets ADD COLUMN IF NOT EXISTS branding JSONB DEFAULT '{
  "businessName": null,
  "tagline": null,
  "description": null,
  "socialLinks": {},
  "contactInfo": {}
}'::jsonb;

-- Add settings column to outlets table
ALTER TABLE outlets ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{
  "allowTakeaway": true,
  "allowDineIn": true,
  "allowDelivery": false,
  "minimumOrderAmount": 0,
  "estimatedPrepTime": 15,
  "autoAcceptOrders": false
}'::jsonb;

-- Update existing stores to have default settings
UPDATE stores
SET settings = '{
  "businessType": "restaurant",
  "currency": "IDR",
  "timezone": "Asia/Jakarta",
  "language": "id",
  "onboardingCompleted": false,
  "onboardingStep": 0
}'::jsonb
WHERE settings IS NULL OR settings = '{}'::jsonb;

-- Create index for faster JSON queries
CREATE INDEX IF NOT EXISTS idx_stores_settings ON stores USING gin(settings);
CREATE INDEX IF NOT EXISTS idx_outlets_settings ON outlets USING gin(settings);

SELECT 'Settings columns added successfully!' AS status;
