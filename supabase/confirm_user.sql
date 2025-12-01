-- ============================================
-- CONFIRM USER MANUALLY
-- ============================================

-- Cek user yang ada
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
WHERE email = 'owner@savora.test';

-- Jika email_confirmed_at adalah NULL, jalankan ini untuk confirm user:
UPDATE auth.users
SET
    email_confirmed_at = NOW(),
    confirmed_at = NOW(),
    email_change_confirm_status = 0
WHERE email = 'owner@savora.test';

-- Verify
SELECT id, email, email_confirmed_at, confirmed_at
FROM auth.users
WHERE email = 'owner@savora.test';
