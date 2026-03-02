-- ============================================
-- FIX RLS: Allow registration flow to work
-- ============================================

-- Fix Stores policies - allow authenticated users to create their own store
DROP POLICY IF EXISTS "Owners can manage their stores" ON stores;

CREATE POLICY "Owners can insert their own stores" ON stores
    FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can view their own stores" ON stores
    FOR SELECT
    USING (auth.uid() = owner_id OR is_active = true);

CREATE POLICY "Owners can update their own stores" ON stores
    FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their own stores" ON stores
    FOR DELETE
    USING (auth.uid() = owner_id);

-- Fix Profiles policies - make sure authenticated users can read their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Store staff can view customer profiles" ON profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('owner', 'staff')
        )
    );
