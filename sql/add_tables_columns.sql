-- ============================================
-- ADD MISSING COLUMNS TO TABLES TABLE
-- Run this in Supabase SQL Editor
-- ============================================

-- Add location column
ALTER TABLE tables ADD COLUMN IF NOT EXISTS location TEXT;

-- Add qr_code column (for storing QR code identifier)
ALTER TABLE tables ADD COLUMN IF NOT EXISTS qr_code TEXT;

-- Verify columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'tables'
ORDER BY ordinal_position;
