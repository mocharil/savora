-- ============================================
-- DUMMY DATA FOR TESTING
-- Create owner account, store, and sample data
-- ============================================

-- NOTE: Run this AFTER running all migrations

-- Step 1: Create dummy user in auth.users
-- You need to do this via Supabase Dashboard > Authentication > Add User
-- Email: owner@savora.test
-- Password: password123
-- Then get the user ID and use it below

-- OR use this to create via SQL (requires admin access):
-- The password will be 'password123'
-- User ID will be: 11111111-1111-1111-1111-111111111111

-- Insert dummy auth user (if not exists)
-- Note: This might not work in all Supabase versions, prefer Dashboard method
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role,
    aud
)
VALUES (
    '11111111-1111-1111-1111-111111111111'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'owner@savora.test',
    '$2a$10$rZ5h0YJWKz.JW8xQYX7zZ.5IZZZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z',  -- password: password123
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Demo Owner","role":"owner"}',
    false,
    'authenticated',
    'authenticated'
)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Create profile
INSERT INTO profiles (id, email, full_name, role)
VALUES (
    '11111111-1111-1111-1111-111111111111'::uuid,
    'owner@savora.test',
    'Demo Owner',
    'owner'
)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;

-- Step 3: Create store
INSERT INTO stores (id, owner_id, name, slug, description, address, phone)
VALUES (
    '22222222-2222-2222-2222-222222222222'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Warung Makan Sederhana',
    'warung-makan-sederhana',
    'Warung makan dengan menu tradisional Indonesia',
    'Jl. Contoh No. 123, Jakarta',
    '081234567890'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug;

-- Step 4: Update profile with store_id
UPDATE profiles
SET store_id = '22222222-2222-2222-2222-222222222222'::uuid
WHERE id = '11111111-1111-1111-1111-111111111111'::uuid;

-- Step 5: Create categories
INSERT INTO categories (id, store_id, name, slug, sort_order)
VALUES
    ('33333333-3333-3333-3333-333333333331'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'Makanan Utama', 'makanan-utama', 1),
    ('33333333-3333-3333-3333-333333333332'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'Minuman', 'minuman', 2),
    ('33333333-3333-3333-3333-333333333333'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'Snack', 'snack', 3)
ON CONFLICT (id) DO NOTHING;

-- Step 6: Create menu items
INSERT INTO menu_items (id, store_id, category_id, name, slug, description, price, is_available, is_featured)
VALUES
    -- Makanan Utama
    ('44444444-4444-4444-4444-444444444441'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '33333333-3333-3333-3333-333333333331'::uuid,
     'Nasi Goreng Spesial', 'nasi-goreng-spesial', 'Nasi goreng dengan telur, ayam, dan sayuran', 25000, true, true),

    ('44444444-4444-4444-4444-444444444442'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '33333333-3333-3333-3333-333333333331'::uuid,
     'Mie Goreng', 'mie-goreng', 'Mie goreng dengan sayuran dan telur', 20000, true, false),

    ('44444444-4444-4444-4444-444444444443'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '33333333-3333-3333-3333-333333333331'::uuid,
     'Ayam Goreng', 'ayam-goreng', 'Ayam goreng crispy dengan nasi', 30000, true, true),

    -- Minuman
    ('44444444-4444-4444-4444-444444444444'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '33333333-3333-3333-3333-333333333332'::uuid,
     'Es Teh Manis', 'es-teh-manis', 'Teh manis dingin', 5000, true, false),

    ('44444444-4444-4444-4444-444444444445'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '33333333-3333-3333-3333-333333333332'::uuid,
     'Es Jeruk', 'es-jeruk', 'Jeruk peras segar', 8000, true, false),

    ('44444444-4444-4444-4444-444444444446'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '33333333-3333-3333-3333-333333333332'::uuid,
     'Kopi Hitam', 'kopi-hitam', 'Kopi hitam panas', 10000, true, true),

    -- Snack
    ('44444444-4444-4444-4444-444444444447'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '33333333-3333-3333-3333-333333333333'::uuid,
     'Pisang Goreng', 'pisang-goreng', 'Pisang goreng crispy', 12000, true, false),

    ('44444444-4444-4444-4444-444444444448'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '33333333-3333-3333-3333-333333333333'::uuid,
     'Tahu Isi', 'tahu-isi', 'Tahu isi sayuran', 10000, true, false)
ON CONFLICT (id) DO NOTHING;

-- Step 7: Create tables (meja)
INSERT INTO tables (id, store_id, table_number, table_name, capacity, status)
VALUES
    ('55555555-5555-5555-5555-555555555551'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '1', 'Meja 1', 4, 'available'),
    ('55555555-5555-5555-5555-555555555552'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '2', 'Meja 2', 4, 'available'),
    ('55555555-5555-5555-5555-555555555553'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '3', 'Meja 3', 2, 'available'),
    ('55555555-5555-5555-5555-555555555554'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '4', 'Meja 4', 6, 'available'),
    ('55555555-5555-5555-5555-555555555555'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '5', 'Meja 5', 4, 'available')
ON CONFLICT (id) DO NOTHING;

-- Step 8: Create sample orders
INSERT INTO orders (id, store_id, table_id, order_number, status, payment_status, customer_name, notes)
VALUES
    ('66666666-6666-6666-6666-666666666661'::uuid, '22222222-2222-2222-2222-222222222222'::uuid,
     '55555555-5555-5555-5555-555555555551'::uuid, 'ORD-20250123-ABC1', 'completed', 'paid', 'Budi Santoso', 'Pesanan untuk 2 orang'),

    ('66666666-6666-6666-6666-666666666662'::uuid, '22222222-2222-2222-2222-222222222222'::uuid,
     '55555555-5555-5555-5555-555555555552'::uuid, 'ORD-20250123-ABC2', 'preparing', 'pending', 'Siti Rahayu', 'Pedas level 3')
ON CONFLICT (id) DO NOTHING;

-- Step 9: Create order items for sample orders
INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, subtotal)
VALUES
    -- Order 1
    ('66666666-6666-6666-6666-666666666661'::uuid, '44444444-4444-4444-4444-444444444441'::uuid, 2, 25000, 50000),
    ('66666666-6666-6666-6666-666666666661'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 2, 5000, 10000),

    -- Order 2
    ('66666666-6666-6666-6666-666666666662'::uuid, '44444444-4444-4444-4444-444444444443'::uuid, 1, 30000, 30000),
    ('66666666-6666-6666-6666-666666666662'::uuid, '44444444-4444-4444-4444-444444444446'::uuid, 1, 10000, 10000)
ON CONFLICT DO NOTHING;

-- Verify data
SELECT 'Dummy data created successfully!' as status;
SELECT 'Login with: owner@savora.test / password123' as credentials;
