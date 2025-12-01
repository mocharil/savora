-- ============================================
-- COMPLETE RLS FIX for Registration
-- ============================================

-- Clean up all existing policies
DROP POLICY IF EXISTS "Public stores are viewable by everyone" ON stores;
DROP POLICY IF EXISTS "Owners can manage their stores" ON stores;
DROP POLICY IF EXISTS "Owners can insert their own stores" ON stores;
DROP POLICY IF EXISTS "Owners can view their own stores" ON stores;
DROP POLICY IF EXISTS "Owners can update their own stores" ON stores;
DROP POLICY IF EXISTS "Owners can delete their own stores" ON stores;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Store staff can view customer profiles" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- ============================================
-- STORES POLICIES
-- ============================================

-- Allow public to view active stores
CREATE POLICY "public_can_view_active_stores" ON stores
    FOR SELECT
    USING (is_active = true);

-- Allow authenticated users to insert stores where they are the owner
CREATE POLICY "authenticated_can_insert_own_store" ON stores
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = owner_id);

-- Allow owners to view their own stores
CREATE POLICY "owner_can_view_own_store" ON stores
    FOR SELECT
    TO authenticated
    USING (auth.uid() = owner_id);

-- Allow owners to update their own stores
CREATE POLICY "owner_can_update_own_store" ON stores
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = owner_id);

-- Allow owners to delete their own stores
CREATE POLICY "owner_can_delete_own_store" ON stores
    FOR DELETE
    TO authenticated
    USING (auth.uid() = owner_id);

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Allow authenticated users to insert their own profile
CREATE POLICY "user_can_insert_own_profile" ON profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Allow users to view their own profile
CREATE POLICY "user_can_view_own_profile" ON profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "user_can_update_own_profile" ON profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Allow staff to view all profiles
CREATE POLICY "staff_can_view_profiles" ON profiles
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('owner', 'staff')
        )
    );
