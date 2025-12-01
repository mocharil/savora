-- ============================================
-- FIX FOREIGN KEYS FOR SIMPLE AUTH
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Drop existing foreign key on stores.owner_id
ALTER TABLE stores DROP CONSTRAINT IF EXISTS stores_owner_id_fkey;

-- 2. Add new foreign key to our users table
ALTER TABLE stores
ADD CONSTRAINT stores_owner_id_fkey
FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;

-- 3. Also need to handle profiles table if it references auth.users
-- For now, we can keep profiles for Supabase Auth compatibility
-- or we can ignore it since we're using our own users table

-- 4. Verify the change
SELECT
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'stores'
    AND tc.table_schema = 'public';
