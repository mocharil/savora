-- User Management Schema Update
-- Role hierarchy: tenant_admin > outlet_admin > staff

-- 1. Migrate existing 'owner' role to 'tenant_admin'
UPDATE users SET role = 'tenant_admin' WHERE role = 'owner';

-- 2. Update users table to use new role system
-- Roles: 'tenant_admin', 'outlet_admin', 'staff'
ALTER TABLE users
  ALTER COLUMN role SET DEFAULT 'staff';

-- Add comment to clarify roles
COMMENT ON COLUMN users.role IS 'User role: tenant_admin (store owner), outlet_admin (manages specific outlets), staff (limited access)';

-- 2. Update user_outlets table for outlet assignments
-- This table links users to specific outlets they can access
ALTER TABLE user_outlets
  ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{"canManageMenu": true, "canManageOrders": true, "canManageTables": true, "canViewAnalytics": false}'::jsonb;

COMMENT ON TABLE user_outlets IS 'Links users to outlets they can access. tenant_admin has implicit access to all outlets.';
COMMENT ON COLUMN user_outlets.role IS 'Role within this outlet: outlet_admin or staff';
COMMENT ON COLUMN user_outlets.permissions IS 'Specific permissions for staff: canManageMenu, canManageOrders, canManageTables, canViewAnalytics';

-- 3. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_outlets_user_id ON user_outlets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_outlets_outlet_id ON user_outlets(outlet_id);

-- 4. Create function to check if user has access to outlet
CREATE OR REPLACE FUNCTION user_has_outlet_access(p_user_id UUID, p_outlet_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_role VARCHAR(50);
  v_user_store_id UUID;
  v_outlet_store_id UUID;
BEGIN
  -- Get user's role and store
  SELECT role, store_id INTO v_user_role, v_user_store_id
  FROM users WHERE id = p_user_id;

  -- Get outlet's store
  SELECT store_id INTO v_outlet_store_id
  FROM outlets WHERE id = p_outlet_id;

  -- tenant_admin has access to all outlets in their store
  IF v_user_role = 'tenant_admin' AND v_user_store_id = v_outlet_store_id THEN
    RETURN TRUE;
  END IF;

  -- Check user_outlets assignment
  RETURN EXISTS (
    SELECT 1 FROM user_outlets
    WHERE user_id = p_user_id AND outlet_id = p_outlet_id
  );
END;
$$ LANGUAGE plpgsql;

-- 5. Create view for easy user-outlet access lookup
CREATE OR REPLACE VIEW user_outlet_access AS
SELECT
  u.id AS user_id,
  u.email,
  u.name AS user_name,
  u.role AS user_role,
  u.store_id,
  o.id AS outlet_id,
  o.name AS outlet_name,
  o.slug AS outlet_slug,
  CASE
    WHEN u.role = 'tenant_admin' THEN 'tenant_admin'
    ELSE COALESCE(uo.role, 'no_access')
  END AS outlet_role,
  CASE
    WHEN u.role = 'tenant_admin' THEN '{"canManageMenu": true, "canManageOrders": true, "canManageTables": true, "canViewAnalytics": true, "canManageUsers": true}'::jsonb
    ELSE COALESCE(uo.permissions, '{}'::jsonb)
  END AS permissions
FROM users u
CROSS JOIN outlets o
LEFT JOIN user_outlets uo ON u.id = uo.user_id AND o.id = uo.outlet_id
WHERE u.store_id = o.store_id;
