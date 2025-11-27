-- Optimize Progress Table RLS Performance
-- Wrap auth.uid() in subquery to prevent re-evaluation for each row

-- Drop and recreate existing progress policies with optimized auth.uid() calls

-- View own progress
DROP POLICY IF EXISTS "Users can view their own progress" ON public.progress;
CREATE POLICY "Users can view their own progress"
ON public.progress
FOR SELECT
TO authenticated
USING (user_id = (select auth.uid()));

-- Insert own progress
DROP POLICY IF EXISTS "Users can insert their own progress" ON public.progress;
CREATE POLICY "Users can insert their own progress"
ON public.progress
FOR INSERT
TO authenticated
WITH CHECK (user_id = (select auth.uid()));

-- Update own progress
DROP POLICY IF EXISTS "Users can update their own progress" ON public.progress;
CREATE POLICY "Users can update their own progress"
ON public.progress
FOR UPDATE
TO authenticated
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

-- Delete own progress
DROP POLICY IF EXISTS "Users can delete their own progress" ON public.progress;
CREATE POLICY "Users can delete their own progress"
ON public.progress
FOR DELETE
TO authenticated
USING (user_id = (select auth.uid()));
