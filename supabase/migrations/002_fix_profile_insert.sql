-- ============================================
-- FIX: Allow profile creation during registration
-- ============================================

-- Drop the restrictive policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Store staff can view customer profiles" ON profiles;

-- Create new policies that allow registration
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow profile creation during signup" ON profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Store staff can view customer profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('owner', 'staff')
        )
    );
