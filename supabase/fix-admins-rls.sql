-- Fix Admins Table RLS Policy
-- Only allow users to check if THEY are an admin, not view all admins

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can read admins" ON public.admins;

-- Create restricted policy: users can only check their own admin status
CREATE POLICY "Users can check their own admin status"
ON public.admins
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Verify the policy
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'admins'
ORDER BY policyname;
