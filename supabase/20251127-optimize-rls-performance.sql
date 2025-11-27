-- Optimize RLS Policy Performance
-- Wrap auth.uid() in subqueries to prevent re-evaluation for each row
-- This significantly improves query performance at scale

-- ============================================
-- 1. OPTIMIZE DICTIONARY POLICIES
-- ============================================

DROP POLICY IF EXISTS "Only admins can insert dictionary" ON public.dictionary;
DROP POLICY IF EXISTS "Only admins can update dictionary" ON public.dictionary;
DROP POLICY IF EXISTS "Only admins can delete dictionary" ON public.dictionary;

CREATE POLICY "Only admins can insert dictionary"
ON public.dictionary
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE admins.user_id = (select auth.uid())
  )
);

CREATE POLICY "Only admins can update dictionary"
ON public.dictionary
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE admins.user_id = (select auth.uid())
  )
);

CREATE POLICY "Only admins can delete dictionary"
ON public.dictionary
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE admins.user_id = (select auth.uid())
  )
);

-- ============================================
-- 2. OPTIMIZE LESSONS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Only admins can insert lessons" ON public.lessons;
DROP POLICY IF EXISTS "Only admins can update lessons" ON public.lessons;
DROP POLICY IF EXISTS "Only admins can delete lessons" ON public.lessons;

CREATE POLICY "Only admins can insert lessons"
ON public.lessons
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE admins.user_id = (select auth.uid())
  )
);

CREATE POLICY "Only admins can update lessons"
ON public.lessons
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE admins.user_id = (select auth.uid())
  )
);

CREATE POLICY "Only admins can delete lessons"
ON public.lessons
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE admins.user_id = (select auth.uid())
  )
);

-- ============================================
-- 3. OPTIMIZE PROFILES POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO public
WITH CHECK (id = (select auth.uid()));

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO public
USING (id = (select auth.uid()))
WITH CHECK (id = (select auth.uid()));

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO public
USING (id = (select auth.uid()));

-- ============================================
-- 4. OPTIMIZE QUIZ_RESULTS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can insert their own quiz results" ON public.quiz_results;
DROP POLICY IF EXISTS "Users can view their own quiz results" ON public.quiz_results;

CREATE POLICY "Users can insert their own quiz results"
ON public.quiz_results
FOR INSERT
TO authenticated
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can view their own quiz results"
ON public.quiz_results
FOR SELECT
TO authenticated
USING (user_id = (select auth.uid()));

-- ============================================
-- 5. OPTIMIZE ADMINS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can check their own admin status" ON public.admins;

CREATE POLICY "Users can check their own admin status"
ON public.admins
FOR SELECT
TO authenticated
USING (user_id = (select auth.uid()));

-- ============================================
-- 6. OPTIMIZE PROGRESS POLICIES (if not already optimized)
-- ============================================
-- Note: Add progress table policies here if they exist and need optimization
-- Example:
-- DROP POLICY IF EXISTS "Users can view their own progress" ON public.progress;
-- CREATE POLICY "Users can view their own progress"
-- ON public.progress
-- FOR SELECT
-- TO authenticated
-- USING (user_id = (select auth.uid()));
