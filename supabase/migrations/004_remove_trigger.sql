-- ============================================
-- REMOVE TRIGGER: We handle profile creation manually in code
-- ============================================

-- Drop trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop function
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Verify it's gone
-- You can check: SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
