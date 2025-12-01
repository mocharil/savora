-- ============================================
-- DUMMY ORDERS DATA FOR SAVORA
-- Membuat data pesanan dummy untuk testing
-- Jalankan SETELAH seed_dummy_data.sql
-- ============================================

-- Konstanta yang digunakan
-- Store ID: 22222222-2222-2222-2222-222222222222
-- Table IDs: 55555555-5555-5555-5555-55555555555X
-- Menu Items: 44444444-4444-4444-4444-44444444444X

-- ============================================
-- HAPUS DATA LAMA (Opsional - uncomment jika perlu)
-- ============================================
-- DELETE FROM order_items WHERE order_id IN (
--   SELECT id FROM orders WHERE store_id = '22222222-2222-2222-2222-222222222222'::uuid
-- );
-- DELETE FROM payments WHERE order_id IN (
--   SELECT id FROM orders WHERE store_id = '22222222-2222-2222-2222-222222222222'::uuid
-- );
-- DELETE FROM orders WHERE store_id = '22222222-2222-2222-2222-222222222222'::uuid;

-- ============================================
-- INSERT ORDERS - HARI INI (25 November 2025)
-- ============================================

-- Order 1: Completed - Pagi ini
INSERT INTO orders (id, store_id, table_id, order_number, status, payment_status, customer_name, customer_phone, notes, subtotal, tax_amount, service_charge_amount, total, created_at, updated_at, paid_at)
VALUES (
    'a0000001-0000-0000-0000-000000000001'::uuid,
    '22222222-2222-2222-2222-222222222222'::uuid,
    '55555555-5555-5555-5555-555555555551'::uuid,
    'ORD-20251125-0001',
    'completed',
    'paid',
    'Ahmad Fauzi',
    '081234567001',
    'Tidak pakai sambal',
    75000, 8250, 0, 83250,
    NOW() - INTERVAL '4 hours',
    NOW() - INTERVAL '3 hours 30 minutes',
    NOW() - INTERVAL '3 hours 30 minutes'
) ON CONFLICT (id) DO NOTHING;

-- Order 2: Completed - Pagi
INSERT INTO orders (id, store_id, table_id, order_number, status, payment_status, customer_name, customer_phone, notes, subtotal, tax_amount, service_charge_amount, total, created_at, updated_at, paid_at)
VALUES (
    'a0000001-0000-0000-0000-000000000002'::uuid,
    '22222222-2222-2222-2222-222222222222'::uuid,
    '55555555-5555-5555-5555-555555555552'::uuid,
    'ORD-20251125-0002',
    'completed',
    'paid',
    'Dewi Lestari',
    '081234567002',
    'Extra nasi',
    55000, 6050, 0, 61050,
    NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '2 hours 30 minutes',
    NOW() - INTERVAL '2 hours 30 minutes'
) ON CONFLICT (id) DO NOTHING;

-- Order 3: Ready - Sedang disiapkan untuk diambil
INSERT INTO orders (id, store_id, table_id, order_number, status, payment_status, customer_name, customer_phone, notes, subtotal, tax_amount, service_charge_amount, total, created_at, updated_at)
VALUES (
    'a0000001-0000-0000-0000-000000000003'::uuid,
    '22222222-2222-2222-2222-222222222222'::uuid,
    '55555555-5555-5555-5555-555555555553'::uuid,
    'ORD-20251125-0003',
    'ready',
    'paid',
    'Budi Hartono',
    '081234567003',
    'Pedas level 2',
    95000, 10450, 0, 105450,
    NOW() - INTERVAL '45 minutes',
    NOW() - INTERVAL '15 minutes'
) ON CONFLICT (id) DO NOTHING;

-- Order 4: Preparing - Sedang dimasak
INSERT INTO orders (id, store_id, table_id, order_number, status, payment_status, customer_name, customer_phone, notes, subtotal, tax_amount, service_charge_amount, total, created_at, updated_at)
VALUES (
    'a0000001-0000-0000-0000-000000000004'::uuid,
    '22222222-2222-2222-2222-222222222222'::uuid,
    '55555555-5555-5555-5555-555555555554'::uuid,
    'ORD-20251125-0004',
    'preparing',
    'paid',
    'Siti Aminah',
    '081234567004',
    NULL,
    65000, 7150, 0, 72150,
    NOW() - INTERVAL '25 minutes',
    NOW() - INTERVAL '20 minutes'
) ON CONFLICT (id) DO NOTHING;

-- Order 5: Confirmed - Baru dikonfirmasi
INSERT INTO orders (id, store_id, table_id, order_number, status, payment_status, customer_name, customer_phone, notes, subtotal, tax_amount, service_charge_amount, total, created_at, updated_at)
VALUES (
    'a0000001-0000-0000-0000-000000000005'::uuid,
    '22222222-2222-2222-2222-222222222222'::uuid,
    '55555555-5555-5555-5555-555555555555'::uuid,
    'ORD-20251125-0005',
    'confirmed',
    'paid',
    'Rizky Pratama',
    '081234567005',
    'Minta tisu extra',
    45000, 4950, 0, 49950,
    NOW() - INTERVAL '10 minutes',
    NOW() - INTERVAL '8 minutes'
) ON CONFLICT (id) DO NOTHING;

-- Order 6: Pending - Baru masuk
INSERT INTO orders (id, store_id, table_id, order_number, status, payment_status, customer_name, customer_phone, notes, subtotal, tax_amount, service_charge_amount, total, created_at, updated_at)
VALUES (
    'a0000001-0000-0000-0000-000000000006'::uuid,
    '22222222-2222-2222-2222-222222222222'::uuid,
    '55555555-5555-5555-5555-555555555551'::uuid,
    'ORD-20251125-0006',
    'pending',
    'unpaid',
    'Maya Indah',
    '081234567006',
    'Tunggu teman datang dulu',
    35000, 3850, 0, 38850,
    NOW() - INTERVAL '5 minutes',
    NOW() - INTERVAL '5 minutes'
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- INSERT ORDERS - KEMARIN (24 November 2025)
-- ============================================

INSERT INTO orders (id, store_id, table_id, order_number, status, payment_status, customer_name, customer_phone, notes, subtotal, tax_amount, service_charge_amount, total, created_at, updated_at, paid_at)
VALUES
    ('a0000001-0000-0000-0000-000000000007'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '55555555-5555-5555-5555-555555555551'::uuid,
    'ORD-20251124-0001', 'completed', 'paid', 'Joko Widodo', '081234567007', NULL, 125000, 13750, 0, 138750,
    NOW() - INTERVAL '1 day 6 hours', NOW() - INTERVAL '1 day 5 hours', NOW() - INTERVAL '1 day 5 hours'),

    ('a0000001-0000-0000-0000-000000000008'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '55555555-5555-5555-5555-555555555552'::uuid,
    'ORD-20251124-0002', 'completed', 'paid', 'Retno Marsudi', '081234567008', 'Vegetarian', 85000, 9350, 0, 94350,
    NOW() - INTERVAL '1 day 5 hours', NOW() - INTERVAL '1 day 4 hours', NOW() - INTERVAL '1 day 4 hours'),

    ('a0000001-0000-0000-0000-000000000009'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '55555555-5555-5555-5555-555555555553'::uuid,
    'ORD-20251124-0003', 'completed', 'paid', 'Prabowo Subiyanto', '081234567009', NULL, 155000, 17050, 0, 172050,
    NOW() - INTERVAL '1 day 3 hours', NOW() - INTERVAL '1 day 2 hours', NOW() - INTERVAL '1 day 2 hours'),

    ('a0000001-0000-0000-0000-000000000010'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '55555555-5555-5555-5555-555555555554'::uuid,
    'ORD-20251124-0004', 'completed', 'paid', 'Sri Mulyani', '081234567010', 'Level pedas max', 78000, 8580, 0, 86580,
    NOW() - INTERVAL '1 day 1 hour', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

    ('a0000001-0000-0000-0000-000000000011'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '55555555-5555-5555-5555-555555555555'::uuid,
    'ORD-20251124-0005', 'cancelled', 'refunded', 'Anies Baswedan', '081234567011', 'Dibatalkan karena lama', 45000, 4950, 0, 49950,
    NOW() - INTERVAL '1 day 4 hours', NOW() - INTERVAL '1 day 3 hours 30 minutes', NULL)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- INSERT ORDERS - 2 HARI LALU (23 November 2025)
-- ============================================

INSERT INTO orders (id, store_id, table_id, order_number, status, payment_status, customer_name, customer_phone, notes, subtotal, tax_amount, service_charge_amount, total, created_at, updated_at, paid_at)
VALUES
    ('a0000001-0000-0000-0000-000000000012'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '55555555-5555-5555-5555-555555555551'::uuid,
    'ORD-20251123-0001', 'completed', 'paid', 'Ganjar Pranowo', '081234567012', NULL, 95000, 10450, 0, 105450,
    NOW() - INTERVAL '2 days 7 hours', NOW() - INTERVAL '2 days 6 hours', NOW() - INTERVAL '2 days 6 hours'),

    ('a0000001-0000-0000-0000-000000000013'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '55555555-5555-5555-5555-555555555552'::uuid,
    'ORD-20251123-0002', 'completed', 'paid', 'Ridwan Kamil', '081234567013', 'Extra sambal', 68000, 7480, 0, 75480,
    NOW() - INTERVAL '2 days 5 hours', NOW() - INTERVAL '2 days 4 hours', NOW() - INTERVAL '2 days 4 hours'),

    ('a0000001-0000-0000-0000-000000000014'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '55555555-5555-5555-5555-555555555553'::uuid,
    'ORD-20251123-0003', 'completed', 'paid', 'Khofifah Indar', '081234567014', NULL, 112000, 12320, 0, 124320,
    NOW() - INTERVAL '2 days 3 hours', NOW() - INTERVAL '2 days 2 hours', NOW() - INTERVAL '2 days 2 hours'),

    ('a0000001-0000-0000-0000-000000000015'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '55555555-5555-5555-5555-555555555554'::uuid,
    'ORD-20251123-0004', 'completed', 'paid', 'Erick Thohir', '081234567015', 'Tidak pakai MSG', 89000, 9790, 0, 98790,
    NOW() - INTERVAL '2 days 1 hour', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- INSERT ORDERS - MINGGU LALU
-- ============================================

INSERT INTO orders (id, store_id, table_id, order_number, status, payment_status, customer_name, customer_phone, notes, subtotal, tax_amount, service_charge_amount, total, created_at, updated_at, paid_at)
VALUES
    ('a0000001-0000-0000-0000-000000000016'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '55555555-5555-5555-5555-555555555551'::uuid,
    'ORD-20251120-0001', 'completed', 'paid', 'Susi Pudjiastuti', '081234567016', NULL, 185000, 20350, 0, 205350,
    NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),

    ('a0000001-0000-0000-0000-000000000017'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '55555555-5555-5555-5555-555555555552'::uuid,
    'ORD-20251120-0002', 'completed', 'paid', 'Basuki Purnama', '081234567017', 'Takeaway', 76000, 8360, 0, 84360,
    NOW() - INTERVAL '5 days 2 hours', NOW() - INTERVAL '5 days 1 hour', NOW() - INTERVAL '5 days 1 hour'),

    ('a0000001-0000-0000-0000-000000000018'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '55555555-5555-5555-5555-555555555553'::uuid,
    'ORD-20251119-0001', 'completed', 'paid', 'Nadiem Makarim', '081234567018', NULL, 145000, 15950, 0, 160950,
    NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),

    ('a0000001-0000-0000-0000-000000000019'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '55555555-5555-5555-5555-555555555554'::uuid,
    'ORD-20251118-0001', 'completed', 'paid', 'William Tanuwijaya', '081234567019', 'Acara kantor', 320000, 35200, 0, 355200,
    NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),

    ('a0000001-0000-0000-0000-000000000020'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '55555555-5555-5555-5555-555555555555'::uuid,
    'ORD-20251118-0002', 'completed', 'paid', 'Achmad Zaky', '081234567020', NULL, 98000, 10780, 0, 108780,
    NOW() - INTERVAL '7 days 3 hours', NOW() - INTERVAL '7 days 2 hours', NOW() - INTERVAL '7 days 2 hours')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- INSERT ORDER ITEMS
-- ============================================

-- Order 1 items (Ahmad Fauzi - 75000)
INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, subtotal, notes)
VALUES
    ('b0000001-0000-0000-0000-000000000001'::uuid, 'a0000001-0000-0000-0000-000000000001'::uuid, '44444444-4444-4444-4444-444444444441'::uuid, 2, 25000, 50000, 'Tidak pakai sambal'),
    ('b0000001-0000-0000-0000-000000000002'::uuid, 'a0000001-0000-0000-0000-000000000001'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 3, 5000, 15000, NULL),
    ('b0000001-0000-0000-0000-000000000003'::uuid, 'a0000001-0000-0000-0000-000000000001'::uuid, '44444444-4444-4444-4444-444444444446'::uuid, 1, 10000, 10000, NULL)
ON CONFLICT (id) DO NOTHING;

-- Order 2 items (Dewi Lestari - 55000)
INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, subtotal, notes)
VALUES
    ('b0000001-0000-0000-0000-000000000004'::uuid, 'a0000001-0000-0000-0000-000000000002'::uuid, '44444444-4444-4444-4444-444444444443'::uuid, 1, 30000, 30000, NULL),
    ('b0000001-0000-0000-0000-000000000005'::uuid, 'a0000001-0000-0000-0000-000000000002'::uuid, '44444444-4444-4444-4444-444444444442'::uuid, 1, 20000, 20000, NULL),
    ('b0000001-0000-0000-0000-000000000006'::uuid, 'a0000001-0000-0000-0000-000000000002'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 1, 5000, 5000, NULL)
ON CONFLICT (id) DO NOTHING;

-- Order 3 items (Budi Hartono - 95000)
INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, subtotal, notes)
VALUES
    ('b0000001-0000-0000-0000-000000000007'::uuid, 'a0000001-0000-0000-0000-000000000003'::uuid, '44444444-4444-4444-4444-444444444441'::uuid, 2, 25000, 50000, 'Pedas'),
    ('b0000001-0000-0000-0000-000000000008'::uuid, 'a0000001-0000-0000-0000-000000000003'::uuid, '44444444-4444-4444-4444-444444444443'::uuid, 1, 30000, 30000, NULL),
    ('b0000001-0000-0000-0000-000000000009'::uuid, 'a0000001-0000-0000-0000-000000000003'::uuid, '44444444-4444-4444-4444-444444444445'::uuid, 1, 8000, 8000, NULL),
    ('b0000001-0000-0000-0000-000000000010'::uuid, 'a0000001-0000-0000-0000-000000000003'::uuid, '44444444-4444-4444-4444-444444444447'::uuid, 1, 12000, 12000, NULL)
ON CONFLICT (id) DO NOTHING;

-- Order 4 items (Siti Aminah - 65000)
INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, subtotal, notes)
VALUES
    ('b0000001-0000-0000-0000-000000000011'::uuid, 'a0000001-0000-0000-0000-000000000004'::uuid, '44444444-4444-4444-4444-444444444442'::uuid, 2, 20000, 40000, NULL),
    ('b0000001-0000-0000-0000-000000000012'::uuid, 'a0000001-0000-0000-0000-000000000004'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 2, 5000, 10000, NULL),
    ('b0000001-0000-0000-0000-000000000013'::uuid, 'a0000001-0000-0000-0000-000000000004'::uuid, '44444444-4444-4444-4444-444444444447'::uuid, 1, 12000, 12000, NULL),
    ('b0000001-0000-0000-0000-000000000014'::uuid, 'a0000001-0000-0000-0000-000000000004'::uuid, '44444444-4444-4444-4444-444444444448'::uuid, 1, 10000, 10000, NULL)
ON CONFLICT (id) DO NOTHING;

-- Order 5 items (Rizky Pratama - 45000)
INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, subtotal, notes)
VALUES
    ('b0000001-0000-0000-0000-000000000015'::uuid, 'a0000001-0000-0000-0000-000000000005'::uuid, '44444444-4444-4444-4444-444444444441'::uuid, 1, 25000, 25000, NULL),
    ('b0000001-0000-0000-0000-000000000016'::uuid, 'a0000001-0000-0000-0000-000000000005'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 2, 5000, 10000, 'Es banyak'),
    ('b0000001-0000-0000-0000-000000000017'::uuid, 'a0000001-0000-0000-0000-000000000005'::uuid, '44444444-4444-4444-4444-444444444448'::uuid, 1, 10000, 10000, NULL)
ON CONFLICT (id) DO NOTHING;

-- Order 6 items (Maya Indah - 35000)
INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, subtotal, notes)
VALUES
    ('b0000001-0000-0000-0000-000000000018'::uuid, 'a0000001-0000-0000-0000-000000000006'::uuid, '44444444-4444-4444-4444-444444444442'::uuid, 1, 20000, 20000, NULL),
    ('b0000001-0000-0000-0000-000000000019'::uuid, 'a0000001-0000-0000-0000-000000000006'::uuid, '44444444-4444-4444-4444-444444444445'::uuid, 1, 8000, 8000, NULL),
    ('b0000001-0000-0000-0000-000000000020'::uuid, 'a0000001-0000-0000-0000-000000000006'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 1, 5000, 5000, NULL),
    ('b0000001-0000-0000-0000-000000000021'::uuid, 'a0000001-0000-0000-0000-000000000006'::uuid, '44444444-4444-4444-4444-444444444447'::uuid, 1, 12000, 12000, NULL)
ON CONFLICT (id) DO NOTHING;

-- Order 7 items (Joko Widodo - 125000)
INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, subtotal, notes)
VALUES
    ('b0000001-0000-0000-0000-000000000022'::uuid, 'a0000001-0000-0000-0000-000000000007'::uuid, '44444444-4444-4444-4444-444444444441'::uuid, 3, 25000, 75000, NULL),
    ('b0000001-0000-0000-0000-000000000023'::uuid, 'a0000001-0000-0000-0000-000000000007'::uuid, '44444444-4444-4444-4444-444444444443'::uuid, 1, 30000, 30000, NULL),
    ('b0000001-0000-0000-0000-000000000024'::uuid, 'a0000001-0000-0000-0000-000000000007'::uuid, '44444444-4444-4444-4444-444444444446'::uuid, 2, 10000, 20000, NULL)
ON CONFLICT (id) DO NOTHING;

-- Order 8 items (Retno Marsudi - 85000)
INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, subtotal, notes)
VALUES
    ('b0000001-0000-0000-0000-000000000025'::uuid, 'a0000001-0000-0000-0000-000000000008'::uuid, '44444444-4444-4444-4444-444444444442'::uuid, 3, 20000, 60000, 'Vegetarian'),
    ('b0000001-0000-0000-0000-000000000026'::uuid, 'a0000001-0000-0000-0000-000000000008'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 3, 5000, 15000, NULL),
    ('b0000001-0000-0000-0000-000000000027'::uuid, 'a0000001-0000-0000-0000-000000000008'::uuid, '44444444-4444-4444-4444-444444444448'::uuid, 1, 10000, 10000, NULL)
ON CONFLICT (id) DO NOTHING;

-- Order 9 items (Prabowo Subiyanto - 155000)
INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, subtotal, notes)
VALUES
    ('b0000001-0000-0000-0000-000000000028'::uuid, 'a0000001-0000-0000-0000-000000000009'::uuid, '44444444-4444-4444-4444-444444444441'::uuid, 2, 25000, 50000, NULL),
    ('b0000001-0000-0000-0000-000000000029'::uuid, 'a0000001-0000-0000-0000-000000000009'::uuid, '44444444-4444-4444-4444-444444444443'::uuid, 2, 30000, 60000, NULL),
    ('b0000001-0000-0000-0000-000000000030'::uuid, 'a0000001-0000-0000-0000-000000000009'::uuid, '44444444-4444-4444-4444-444444444442'::uuid, 1, 20000, 20000, NULL),
    ('b0000001-0000-0000-0000-000000000031'::uuid, 'a0000001-0000-0000-0000-000000000009'::uuid, '44444444-4444-4444-4444-444444444445'::uuid, 2, 8000, 16000, NULL),
    ('b0000001-0000-0000-0000-000000000032'::uuid, 'a0000001-0000-0000-0000-000000000009'::uuid, '44444444-4444-4444-4444-444444444446'::uuid, 1, 10000, 10000, NULL)
ON CONFLICT (id) DO NOTHING;

-- Order 10 items (Sri Mulyani - 78000)
INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, subtotal, notes)
VALUES
    ('b0000001-0000-0000-0000-000000000033'::uuid, 'a0000001-0000-0000-0000-000000000010'::uuid, '44444444-4444-4444-4444-444444444441'::uuid, 1, 25000, 25000, 'Super pedas'),
    ('b0000001-0000-0000-0000-000000000034'::uuid, 'a0000001-0000-0000-0000-000000000010'::uuid, '44444444-4444-4444-4444-444444444443'::uuid, 1, 30000, 30000, NULL),
    ('b0000001-0000-0000-0000-000000000035'::uuid, 'a0000001-0000-0000-0000-000000000010'::uuid, '44444444-4444-4444-4444-444444444445'::uuid, 1, 8000, 8000, NULL),
    ('b0000001-0000-0000-0000-000000000036'::uuid, 'a0000001-0000-0000-0000-000000000010'::uuid, '44444444-4444-4444-4444-444444444447'::uuid, 1, 12000, 12000, NULL),
    ('b0000001-0000-0000-0000-000000000037'::uuid, 'a0000001-0000-0000-0000-000000000010'::uuid, '44444444-4444-4444-4444-444444444448'::uuid, 1, 10000, 10000, NULL)
ON CONFLICT (id) DO NOTHING;

-- Order 11 items (Anies Baswedan - cancelled - 45000)
INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, subtotal, notes)
VALUES
    ('b0000001-0000-0000-0000-000000000038'::uuid, 'a0000001-0000-0000-0000-000000000011'::uuid, '44444444-4444-4444-4444-444444444441'::uuid, 1, 25000, 25000, NULL),
    ('b0000001-0000-0000-0000-000000000039'::uuid, 'a0000001-0000-0000-0000-000000000011'::uuid, '44444444-4444-4444-4444-444444444442'::uuid, 1, 20000, 20000, NULL)
ON CONFLICT (id) DO NOTHING;

-- Order 12 items (Ganjar Pranowo - 95000)
INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, subtotal, notes)
VALUES
    ('b0000001-0000-0000-0000-000000000040'::uuid, 'a0000001-0000-0000-0000-000000000012'::uuid, '44444444-4444-4444-4444-444444444441'::uuid, 2, 25000, 50000, NULL),
    ('b0000001-0000-0000-0000-000000000041'::uuid, 'a0000001-0000-0000-0000-000000000012'::uuid, '44444444-4444-4444-4444-444444444443'::uuid, 1, 30000, 30000, NULL),
    ('b0000001-0000-0000-0000-000000000042'::uuid, 'a0000001-0000-0000-0000-000000000012'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 3, 5000, 15000, NULL)
ON CONFLICT (id) DO NOTHING;

-- Order 13 items (Ridwan Kamil - 68000)
INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, subtotal, notes)
VALUES
    ('b0000001-0000-0000-0000-000000000043'::uuid, 'a0000001-0000-0000-0000-000000000013'::uuid, '44444444-4444-4444-4444-444444444442'::uuid, 2, 20000, 40000, NULL),
    ('b0000001-0000-0000-0000-000000000044'::uuid, 'a0000001-0000-0000-0000-000000000013'::uuid, '44444444-4444-4444-4444-444444444445'::uuid, 2, 8000, 16000, NULL),
    ('b0000001-0000-0000-0000-000000000045'::uuid, 'a0000001-0000-0000-0000-000000000013'::uuid, '44444444-4444-4444-4444-444444444447'::uuid, 1, 12000, 12000, NULL)
ON CONFLICT (id) DO NOTHING;

-- Order 14 items (Khofifah Indar - 112000)
INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, subtotal, notes)
VALUES
    ('b0000001-0000-0000-0000-000000000046'::uuid, 'a0000001-0000-0000-0000-000000000014'::uuid, '44444444-4444-4444-4444-444444444441'::uuid, 2, 25000, 50000, NULL),
    ('b0000001-0000-0000-0000-000000000047'::uuid, 'a0000001-0000-0000-0000-000000000014'::uuid, '44444444-4444-4444-4444-444444444443'::uuid, 1, 30000, 30000, NULL),
    ('b0000001-0000-0000-0000-000000000048'::uuid, 'a0000001-0000-0000-0000-000000000014'::uuid, '44444444-4444-4444-4444-444444444442'::uuid, 1, 20000, 20000, NULL),
    ('b0000001-0000-0000-0000-000000000049'::uuid, 'a0000001-0000-0000-0000-000000000014'::uuid, '44444444-4444-4444-4444-444444444447'::uuid, 1, 12000, 12000, NULL)
ON CONFLICT (id) DO NOTHING;

-- Order 15 items (Erick Thohir - 89000)
INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, subtotal, notes)
VALUES
    ('b0000001-0000-0000-0000-000000000050'::uuid, 'a0000001-0000-0000-0000-000000000015'::uuid, '44444444-4444-4444-4444-444444444441'::uuid, 1, 25000, 25000, NULL),
    ('b0000001-0000-0000-0000-000000000051'::uuid, 'a0000001-0000-0000-0000-000000000015'::uuid, '44444444-4444-4444-4444-444444444443'::uuid, 1, 30000, 30000, NULL),
    ('b0000001-0000-0000-0000-000000000052'::uuid, 'a0000001-0000-0000-0000-000000000015'::uuid, '44444444-4444-4444-4444-444444444442'::uuid, 1, 20000, 20000, NULL),
    ('b0000001-0000-0000-0000-000000000053'::uuid, 'a0000001-0000-0000-0000-000000000015'::uuid, '44444444-4444-4444-4444-444444444445'::uuid, 1, 8000, 8000, NULL),
    ('b0000001-0000-0000-0000-000000000054'::uuid, 'a0000001-0000-0000-0000-000000000015'::uuid, '44444444-4444-4444-4444-444444444448'::uuid, 1, 10000, 10000, NULL)
ON CONFLICT (id) DO NOTHING;

-- Order 16 items (Susi Pudjiastuti - 185000)
INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, subtotal, notes)
VALUES
    ('b0000001-0000-0000-0000-000000000055'::uuid, 'a0000001-0000-0000-0000-000000000016'::uuid, '44444444-4444-4444-4444-444444444441'::uuid, 3, 25000, 75000, NULL),
    ('b0000001-0000-0000-0000-000000000056'::uuid, 'a0000001-0000-0000-0000-000000000016'::uuid, '44444444-4444-4444-4444-444444444443'::uuid, 2, 30000, 60000, NULL),
    ('b0000001-0000-0000-0000-000000000057'::uuid, 'a0000001-0000-0000-0000-000000000016'::uuid, '44444444-4444-4444-4444-444444444442'::uuid, 1, 20000, 20000, NULL),
    ('b0000001-0000-0000-0000-000000000058'::uuid, 'a0000001-0000-0000-0000-000000000016'::uuid, '44444444-4444-4444-4444-444444444446'::uuid, 3, 10000, 30000, NULL)
ON CONFLICT (id) DO NOTHING;

-- Order 17 items (Basuki Purnama - 76000)
INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, subtotal, notes)
VALUES
    ('b0000001-0000-0000-0000-000000000059'::uuid, 'a0000001-0000-0000-0000-000000000017'::uuid, '44444444-4444-4444-4444-444444444441'::uuid, 2, 25000, 50000, 'Takeaway'),
    ('b0000001-0000-0000-0000-000000000060'::uuid, 'a0000001-0000-0000-0000-000000000017'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 2, 5000, 10000, NULL),
    ('b0000001-0000-0000-0000-000000000061'::uuid, 'a0000001-0000-0000-0000-000000000017'::uuid, '44444444-4444-4444-4444-444444444445'::uuid, 2, 8000, 16000, NULL)
ON CONFLICT (id) DO NOTHING;

-- Order 18 items (Nadiem Makarim - 145000)
INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, subtotal, notes)
VALUES
    ('b0000001-0000-0000-0000-000000000062'::uuid, 'a0000001-0000-0000-0000-000000000018'::uuid, '44444444-4444-4444-4444-444444444441'::uuid, 2, 25000, 50000, NULL),
    ('b0000001-0000-0000-0000-000000000063'::uuid, 'a0000001-0000-0000-0000-000000000018'::uuid, '44444444-4444-4444-4444-444444444443'::uuid, 2, 30000, 60000, NULL),
    ('b0000001-0000-0000-0000-000000000064'::uuid, 'a0000001-0000-0000-0000-000000000018'::uuid, '44444444-4444-4444-4444-444444444446'::uuid, 2, 10000, 20000, NULL),
    ('b0000001-0000-0000-0000-000000000065'::uuid, 'a0000001-0000-0000-0000-000000000018'::uuid, '44444444-4444-4444-4444-444444444447'::uuid, 1, 12000, 12000, NULL),
    ('b0000001-0000-0000-0000-000000000066'::uuid, 'a0000001-0000-0000-0000-000000000018'::uuid, '44444444-4444-4444-4444-444444444448'::uuid, 1, 10000, 10000, NULL)
ON CONFLICT (id) DO NOTHING;

-- Order 19 items (William Tanuwijaya - 320000 - Acara kantor)
INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, subtotal, notes)
VALUES
    ('b0000001-0000-0000-0000-000000000067'::uuid, 'a0000001-0000-0000-0000-000000000019'::uuid, '44444444-4444-4444-4444-444444444441'::uuid, 5, 25000, 125000, 'Acara kantor'),
    ('b0000001-0000-0000-0000-000000000068'::uuid, 'a0000001-0000-0000-0000-000000000019'::uuid, '44444444-4444-4444-4444-444444444443'::uuid, 3, 30000, 90000, NULL),
    ('b0000001-0000-0000-0000-000000000069'::uuid, 'a0000001-0000-0000-0000-000000000019'::uuid, '44444444-4444-4444-4444-444444444442'::uuid, 2, 20000, 40000, NULL),
    ('b0000001-0000-0000-0000-000000000070'::uuid, 'a0000001-0000-0000-0000-000000000019'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 5, 5000, 25000, NULL),
    ('b0000001-0000-0000-0000-000000000071'::uuid, 'a0000001-0000-0000-0000-000000000019'::uuid, '44444444-4444-4444-4444-444444444446'::uuid, 4, 10000, 40000, NULL)
ON CONFLICT (id) DO NOTHING;

-- Order 20 items (Achmad Zaky - 98000)
INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, subtotal, notes)
VALUES
    ('b0000001-0000-0000-0000-000000000072'::uuid, 'a0000001-0000-0000-0000-000000000020'::uuid, '44444444-4444-4444-4444-444444444441'::uuid, 2, 25000, 50000, NULL),
    ('b0000001-0000-0000-0000-000000000073'::uuid, 'a0000001-0000-0000-0000-000000000020'::uuid, '44444444-4444-4444-4444-444444444442'::uuid, 1, 20000, 20000, NULL),
    ('b0000001-0000-0000-0000-000000000074'::uuid, 'a0000001-0000-0000-0000-000000000020'::uuid, '44444444-4444-4444-4444-444444444445'::uuid, 2, 8000, 16000, NULL),
    ('b0000001-0000-0000-0000-000000000075'::uuid, 'a0000001-0000-0000-0000-000000000020'::uuid, '44444444-4444-4444-4444-444444444447'::uuid, 1, 12000, 12000, NULL)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- INSERT PAYMENTS
-- ============================================

INSERT INTO payments (id, order_id, payment_method, payment_gateway, amount, status, paid_at, created_at)
VALUES
    ('c0000001-0000-0000-0000-000000000001'::uuid, 'a0000001-0000-0000-0000-000000000001'::uuid, 'qris', 'midtrans', 83250, 'paid', NOW() - INTERVAL '3 hours 30 minutes', NOW() - INTERVAL '4 hours'),
    ('c0000001-0000-0000-0000-000000000002'::uuid, 'a0000001-0000-0000-0000-000000000002'::uuid, 'cash', NULL, 61050, 'paid', NOW() - INTERVAL '2 hours 30 minutes', NOW() - INTERVAL '3 hours'),
    ('c0000001-0000-0000-0000-000000000003'::uuid, 'a0000001-0000-0000-0000-000000000003'::uuid, 'gopay', 'midtrans', 105450, 'paid', NOW() - INTERVAL '40 minutes', NOW() - INTERVAL '45 minutes'),
    ('c0000001-0000-0000-0000-000000000004'::uuid, 'a0000001-0000-0000-0000-000000000004'::uuid, 'qris', 'midtrans', 72150, 'paid', NOW() - INTERVAL '22 minutes', NOW() - INTERVAL '25 minutes'),
    ('c0000001-0000-0000-0000-000000000005'::uuid, 'a0000001-0000-0000-0000-000000000005'::uuid, 'dana', 'midtrans', 49950, 'paid', NOW() - INTERVAL '9 minutes', NOW() - INTERVAL '10 minutes'),
    ('c0000001-0000-0000-0000-000000000006'::uuid, 'a0000001-0000-0000-0000-000000000006'::uuid, 'qris', 'midtrans', 38850, 'pending', NULL, NOW() - INTERVAL '5 minutes'),
    ('c0000001-0000-0000-0000-000000000007'::uuid, 'a0000001-0000-0000-0000-000000000007'::uuid, 'qris', 'midtrans', 138750, 'paid', NOW() - INTERVAL '1 day 5 hours', NOW() - INTERVAL '1 day 6 hours'),
    ('c0000001-0000-0000-0000-000000000008'::uuid, 'a0000001-0000-0000-0000-000000000008'::uuid, 'cash', NULL, 94350, 'paid', NOW() - INTERVAL '1 day 4 hours', NOW() - INTERVAL '1 day 5 hours'),
    ('c0000001-0000-0000-0000-000000000009'::uuid, 'a0000001-0000-0000-0000-000000000009'::uuid, 'gopay', 'midtrans', 172050, 'paid', NOW() - INTERVAL '1 day 2 hours', NOW() - INTERVAL '1 day 3 hours'),
    ('c0000001-0000-0000-0000-000000000010'::uuid, 'a0000001-0000-0000-0000-000000000010'::uuid, 'ovo', 'midtrans', 86580, 'paid', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day 1 hour'),
    ('c0000001-0000-0000-0000-000000000011'::uuid, 'a0000001-0000-0000-0000-000000000011'::uuid, 'qris', 'midtrans', 49950, 'refunded', NULL, NOW() - INTERVAL '1 day 4 hours'),
    ('c0000001-0000-0000-0000-000000000012'::uuid, 'a0000001-0000-0000-0000-000000000012'::uuid, 'cash', NULL, 105450, 'paid', NOW() - INTERVAL '2 days 6 hours', NOW() - INTERVAL '2 days 7 hours'),
    ('c0000001-0000-0000-0000-000000000013'::uuid, 'a0000001-0000-0000-0000-000000000013'::uuid, 'qris', 'midtrans', 75480, 'paid', NOW() - INTERVAL '2 days 4 hours', NOW() - INTERVAL '2 days 5 hours'),
    ('c0000001-0000-0000-0000-000000000014'::uuid, 'a0000001-0000-0000-0000-000000000014'::uuid, 'dana', 'midtrans', 124320, 'paid', NOW() - INTERVAL '2 days 2 hours', NOW() - INTERVAL '2 days 3 hours'),
    ('c0000001-0000-0000-0000-000000000015'::uuid, 'a0000001-0000-0000-0000-000000000015'::uuid, 'gopay', 'midtrans', 98790, 'paid', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days 1 hour'),
    ('c0000001-0000-0000-0000-000000000016'::uuid, 'a0000001-0000-0000-0000-000000000016'::uuid, 'qris', 'midtrans', 205350, 'paid', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
    ('c0000001-0000-0000-0000-000000000017'::uuid, 'a0000001-0000-0000-0000-000000000017'::uuid, 'cash', NULL, 84360, 'paid', NOW() - INTERVAL '5 days 1 hour', NOW() - INTERVAL '5 days 2 hours'),
    ('c0000001-0000-0000-0000-000000000018'::uuid, 'a0000001-0000-0000-0000-000000000018'::uuid, 'shopeepay', 'midtrans', 160950, 'paid', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
    ('c0000001-0000-0000-0000-000000000019'::uuid, 'a0000001-0000-0000-0000-000000000019'::uuid, 'va_bca', 'midtrans', 355200, 'paid', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
    ('c0000001-0000-0000-0000-000000000020'::uuid, 'a0000001-0000-0000-0000-000000000020'::uuid, 'qris', 'midtrans', 108780, 'paid', NOW() - INTERVAL '7 days 2 hours', NOW() - INTERVAL '7 days 3 hours')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Count orders by status
SELECT
    status,
    COUNT(*) as count,
    SUM(total) as total_amount
FROM orders
WHERE store_id = '22222222-2222-2222-2222-222222222222'::uuid
GROUP BY status
ORDER BY
    CASE status
        WHEN 'pending' THEN 1
        WHEN 'confirmed' THEN 2
        WHEN 'preparing' THEN 3
        WHEN 'ready' THEN 4
        WHEN 'completed' THEN 5
        WHEN 'cancelled' THEN 6
    END;

-- Count orders by date
SELECT
    DATE(created_at) as order_date,
    COUNT(*) as order_count,
    SUM(total) as daily_revenue
FROM orders
WHERE store_id = '22222222-2222-2222-2222-222222222222'::uuid
GROUP BY DATE(created_at)
ORDER BY order_date DESC;

-- Summary
SELECT
    '=== DUMMY DATA SUMMARY ===' as info
UNION ALL
SELECT
    'Total Orders: ' || COUNT(*)::text
FROM orders
WHERE store_id = '22222222-2222-2222-2222-222222222222'::uuid
UNION ALL
SELECT
    'Total Order Items: ' || COUNT(*)::text
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
WHERE o.store_id = '22222222-2222-2222-2222-222222222222'::uuid
UNION ALL
SELECT
    'Total Revenue: Rp ' || TO_CHAR(COALESCE(SUM(total), 0), 'FM999,999,999')
FROM orders
WHERE store_id = '22222222-2222-2222-2222-222222222222'::uuid
AND status = 'completed'
AND payment_status = 'paid';
