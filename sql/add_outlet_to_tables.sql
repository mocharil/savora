-- ============================================
-- ADD OUTLET_ID TO TABLES
-- Run this in Supabase SQL Editor
-- ============================================

-- Add outlet_id column to tables
ALTER TABLE tables ADD COLUMN IF NOT EXISTS outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tables_outlet_id ON tables(outlet_id);

-- Update unique constraint to be per outlet instead of per store
-- First drop the old constraint
ALTER TABLE tables DROP CONSTRAINT IF EXISTS tables_store_id_table_number_key;

-- Add new unique constraint per outlet
ALTER TABLE tables ADD CONSTRAINT tables_outlet_id_table_number_key UNIQUE(outlet_id, table_number);

-- Verify
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'tables'
ORDER BY ordinal_position;
