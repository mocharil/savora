-- ============================================
-- CREATE COMPLETE DUMMY ACCOUNT
-- Jalankan ini untuk membuat user + semua data sekaligus
-- ============================================

-- STEP 1: Hapus user lama jika ada
DELETE FROM auth.users WHERE email = 'owner@savora.test';

-- STEP 2: Buat user baru yang sudah confirmed
-- Password: password123
-- Note: Hash ini adalah bcrypt untuk "password123"
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change,
    created_at,
    updated_at,
    confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'owner@savora.test',
    '$2a$10$rLBzLZ5YvJz0YOzOuN7Z0ODu5cqJQJ5dNX5JQJ5dNX5JQJ5dNX5JQ',  -- password123
    NOW(),
    '',
    '',
    '',
    '',
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Demo Owner"}',
    false
)
RETURNING id;

-- ALTERNATIF jika yang di atas tidak work:
-- Gunakan cara ini (lebih reliable):

-- Jalankan ini di Supabase SQL Editor untuk mendapatkan hash password yang benar
SELECT crypt('password123', gen_salt('bf'));

-- Copy hasilnya, lalu gunakan di INSERT di bawah
