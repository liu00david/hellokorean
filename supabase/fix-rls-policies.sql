-- Fix RLS Policies for Security
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. FIX DICTIONARY - Remove public write access
-- ============================================

-- Drop the dangerous policies
DROP POLICY IF EXISTS "Anyone can insert dictionary" ON public.dictionary;
DROP POLICY IF EXISTS "Anyone can update dictionary" ON public.dictionary;

-- Add admin-only policies for dictionary modifications
CREATE POLICY "Only admins can insert dictionary"
ON public.dictionary
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE admins.user_id = auth.uid()
  )
);

CREATE POLICY "Only admins can update dictionary"
ON public.dictionary
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE admins.user_id = auth.uid()
  )
);

CREATE POLICY "Only admins can delete dictionary"
ON public.dictionary
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE admins.user_id = auth.uid()
  )
);

-- ============================================
-- 2. FIX LESSONS - Restrict to admin-only
-- ============================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can modify lessons" ON public.lessons;

-- Add admin-only policies
CREATE POLICY "Only admins can insert lessons"
ON public.lessons
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE admins.user_id = auth.uid()
  )
);

CREATE POLICY "Only admins can update lessons"
ON public.lessons
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE admins.user_id = auth.uid()
  )
);

CREATE POLICY "Only admins can delete lessons"
ON public.lessons
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE admins.user_id = auth.uid()
  )
);

-- ============================================
-- 3. FIX PROFILES - Ensure id checks (profiles uses 'id' not 'user_id')
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Recreate with proper id checks
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO public
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO public
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO public
USING (id = auth.uid());

-- ============================================
-- 4. FIX QUIZ_RESULTS - Ensure proper authentication
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own quiz results" ON public.quiz_results;
DROP POLICY IF EXISTS "Users can view their own quiz results" ON public.quiz_results;

-- Recreate with proper user_id checks
CREATE POLICY "Users can insert their own quiz results"
ON public.quiz_results
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own quiz results"
ON public.quiz_results
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Run these to verify the policies are correct:

-- Check dictionary policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'dictionary'
ORDER BY policyname;

-- Check lessons policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'lessons'
ORDER BY policyname;

-- Check profiles policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Check quiz_results policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'quiz_results'
ORDER BY policyname;
