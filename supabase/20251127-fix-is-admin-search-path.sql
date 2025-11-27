-- Fix security issue: Add search_path to is_admin function
-- This prevents search_path manipulation attacks on SECURITY DEFINER functions

CREATE OR REPLACE FUNCTION is_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins WHERE user_id = check_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

COMMENT ON FUNCTION is_admin IS 'Checks if a user ID exists in the admins table (with secure search_path)';
