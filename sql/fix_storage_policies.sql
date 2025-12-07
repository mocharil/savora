-- ============================================
-- FIX STORAGE RLS POLICIES
-- Run this in Supabase SQL Editor
-- ============================================

-- First, check if buckets exist and create them if not
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('store-assets', 'store-assets', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('menu-images', 'menu-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read store-assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload store-assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update store-assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete store-assets" ON storage.objects;

DROP POLICY IF EXISTS "Allow public read menu-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload menu-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update menu-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete menu-images" ON storage.objects;

-- Create policies for store-assets bucket
CREATE POLICY "Allow public read store-assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'store-assets');

CREATE POLICY "Allow authenticated upload store-assets" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'store-assets');

CREATE POLICY "Allow authenticated update store-assets" ON storage.objects
  FOR UPDATE USING (bucket_id = 'store-assets');

CREATE POLICY "Allow authenticated delete store-assets" ON storage.objects
  FOR DELETE USING (bucket_id = 'store-assets');

-- Create policies for menu-images bucket
CREATE POLICY "Allow public read menu-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'menu-images');

CREATE POLICY "Allow authenticated upload menu-images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'menu-images');

CREATE POLICY "Allow authenticated update menu-images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'menu-images');

CREATE POLICY "Allow authenticated delete menu-images" ON storage.objects
  FOR DELETE USING (bucket_id = 'menu-images');

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage';
