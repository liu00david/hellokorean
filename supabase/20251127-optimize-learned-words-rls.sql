-- Optimize Learned Words Table RLS Performance
-- Wrap auth.uid() in subquery to prevent re-evaluation for each row

-- Drop and recreate existing learned_words policies with optimized auth.uid() calls

-- View own learned words
DROP POLICY IF EXISTS "Users can view their own learned words" ON public.learned_words;
CREATE POLICY "Users can view their own learned words"
ON public.learned_words
FOR SELECT
TO authenticated
USING (user_id = (select auth.uid()));

-- Insert own learned words
DROP POLICY IF EXISTS "Users can insert their own learned words" ON public.learned_words;
CREATE POLICY "Users can insert their own learned words"
ON public.learned_words
FOR INSERT
TO authenticated
WITH CHECK (user_id = (select auth.uid()));

-- Update own learned words
DROP POLICY IF EXISTS "Users can update their own learned words" ON public.learned_words;
CREATE POLICY "Users can update their own learned words"
ON public.learned_words
FOR UPDATE
TO authenticated
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

-- Delete own learned words
DROP POLICY IF EXISTS "Users can delete their own learned words" ON public.learned_words;
CREATE POLICY "Users can delete their own learned words"
ON public.learned_words
FOR DELETE
TO authenticated
USING (user_id = (select auth.uid()));
