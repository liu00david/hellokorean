-- Create admins table to manage admin users
-- This replaces hardcoded email checks with database-backed admin roles

-- ============================================
-- 1. Create admins table
-- ============================================
CREATE TABLE IF NOT EXISTS admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on admins table
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Allow anyone to check if a user is admin (read-only)
CREATE POLICY "Anyone can read admins"
ON admins FOR SELECT
TO public
USING (true);

-- Only service role can modify admins (managed via migrations)
CREATE POLICY "Only service role can modify admins"
ON admins FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 2. Add initial admin user
-- ============================================
-- Add your admin user by email
-- Replace with: INSERT INTO admins (user_id) VALUES ((SELECT id FROM auth.users WHERE email = 'your-email@gmail.com'));
-- Or add by UUID if you know it: INSERT INTO admins (user_id) VALUES ('your-user-uuid');

-- Example for liu00david@gmail.com:
INSERT INTO admins (user_id)
SELECT id FROM auth.users WHERE email = 'liu00david@gmail.com'
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- 3. Drop old admin function and create new one
-- ============================================
-- Drop the old email-based function if it exists
DROP FUNCTION IF EXISTS is_admin(TEXT);

-- Create new UUID-based function
CREATE OR REPLACE FUNCTION is_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins WHERE user_id = check_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. Add helpful comments
-- ============================================
COMMENT ON TABLE admins IS 'Stores admin user IDs for access control';
COMMENT ON FUNCTION is_admin IS 'Checks if a user ID exists in the admins table';

-- ============================================
-- 5. Verification query
-- ============================================
-- Uncomment to verify the admin was added:
-- SELECT u.email, a.created_at
-- FROM admins a
-- JOIN auth.users u ON a.user_id = u.id;
