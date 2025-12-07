-- ============================================
-- REMOVE OUTLET DEPENDENCY FROM TABLES
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop the unique constraint that requires outlet_id
ALTER TABLE tables DROP CONSTRAINT IF EXISTS tables_outlet_id_table_number_key;

-- Add new unique constraint per store instead of per outlet (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'tables_store_id_table_number_key'
    ) THEN
        ALTER TABLE tables ADD CONSTRAINT tables_store_id_table_number_key UNIQUE(store_id, table_number);
    END IF;
END $$;

-- Make outlet_id nullable
ALTER TABLE tables ALTER COLUMN outlet_id DROP NOT NULL;

-- Verify the changes
SELECT column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_name = 'tables'
ORDER BY ordinal_position;
