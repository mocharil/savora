-- ============================================
-- QUICK DUMMY SETUP
-- Jalankan ini SETELAH membuat user di Dashboard
-- ============================================

-- LANGKAH:
-- 1. Buat user di Dashboard > Authentication > Add user
--    Email: owner@savora.test
--    Password: password123
--    ✅ Auto Confirm User
-- 2. Copy User ID yang muncul
-- 3. Ganti 'USER_ID_ANDA_DI_SINI' di bawah dengan ID tersebut
-- 4. Run script ini

-- ============================================
-- CONFIGURATION - GANTI INI!
-- ============================================
DO $$
DECLARE
    v_user_id UUID := 'USER_ID_ANDA_DI_SINI'::uuid;  -- <-- GANTI INI!
    v_store_id UUID;
    v_category_makanan UUID;
    v_category_minuman UUID;
    v_category_snack UUID;
BEGIN
    -- Create profile
    INSERT INTO profiles (id, email, full_name, role)
    VALUES (
        v_user_id,
        'owner@savora.test',
        'Demo Owner',
        'owner'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role;

    -- Create store
    INSERT INTO stores (owner_id, name, slug, description, address, phone)
    VALUES (
        v_user_id,
        'Warung Makan Sederhana',
        'warung-makan-sederhana',
        'Warung makan dengan menu tradisional Indonesia',
        'Jl. Contoh No. 123, Jakarta',
        '081234567890'
    )
    RETURNING id INTO v_store_id;

    -- Update profile with store_id
    UPDATE profiles
    SET store_id = v_store_id
    WHERE id = v_user_id;

    -- Create categories
    INSERT INTO categories (store_id, name, slug, sort_order)
    VALUES (v_store_id, 'Makanan Utama', 'makanan-utama', 1)
    RETURNING id INTO v_category_makanan;

    INSERT INTO categories (store_id, name, slug, sort_order)
    VALUES (v_store_id, 'Minuman', 'minuman', 2)
    RETURNING id INTO v_category_minuman;

    INSERT INTO categories (store_id, name, slug, sort_order)
    VALUES (v_store_id, 'Snack', 'snack', 3)
    RETURNING id INTO v_category_snack;

    -- Create menu items
    INSERT INTO menu_items (store_id, category_id, name, slug, description, price, is_available, is_featured)
    VALUES
        -- Makanan Utama
        (v_store_id, v_category_makanan, 'Nasi Goreng Spesial', 'nasi-goreng-spesial',
         'Nasi goreng dengan telur, ayam, dan sayuran', 25000, true, true),
        (v_store_id, v_category_makanan, 'Mie Goreng', 'mie-goreng',
         'Mie goreng dengan sayuran dan telur', 20000, true, false),
        (v_store_id, v_category_makanan, 'Ayam Goreng', 'ayam-goreng',
         'Ayam goreng crispy dengan nasi', 30000, true, true),

        -- Minuman
        (v_store_id, v_category_minuman, 'Es Teh Manis', 'es-teh-manis',
         'Teh manis dingin', 5000, true, false),
        (v_store_id, v_category_minuman, 'Es Jeruk', 'es-jeruk',
         'Jeruk peras segar', 8000, true, false),
        (v_store_id, v_category_minuman, 'Kopi Hitam', 'kopi-hitam',
         'Kopi hitam panas', 10000, true, true),

        -- Snack
        (v_store_id, v_category_snack, 'Pisang Goreng', 'pisang-goreng',
         'Pisang goreng crispy', 12000, true, false),
        (v_store_id, v_category_snack, 'Tahu Isi', 'tahu-isi',
         'Tahu isi sayuran', 10000, true, false);

    -- Create tables
    INSERT INTO tables (store_id, table_number, table_name, capacity, status)
    VALUES
        (v_store_id, '1', 'Meja 1', 4, 'available'),
        (v_store_id, '2', 'Meja 2', 4, 'available'),
        (v_store_id, '3', 'Meja 3', 2, 'available'),
        (v_store_id, '4', 'Meja 4', 6, 'available'),
        (v_store_id, '5', 'Meja 5', 4, 'available');

    RAISE NOTICE 'Setup complete! Store ID: %', v_store_id;
    RAISE NOTICE 'Login dengan: owner@savora.test / password123';
END $$;
