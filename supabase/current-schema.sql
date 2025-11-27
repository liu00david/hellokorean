-- ============================================
-- CURRENT DATABASE SCHEMA
-- Auto-generated from Supabase on 2025-11-27
-- ============================================

-- ============================================
-- TABLES
-- ============================================
-- 1. admins
-- 2. dictionary
-- 3. learned_words
-- 4. lesson_groups
-- 5. lessons
-- 6. profiles
-- 7. progress
-- 8. quiz_results

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function: handle_new_user
-- Trigger function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$function$;

-- Function: delete_user_completely
-- Admin function to completely delete a user and all their data
CREATE OR REPLACE FUNCTION public.delete_user_completely(user_email text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  user_uuid UUID;
  result JSONB;
BEGIN
  -- Find user by email
  SELECT id INTO user_uuid
  FROM profiles
  WHERE email = user_email;

  IF user_uuid IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'User not found'
    );
  END IF;

  -- Delete user data (cascade will handle related records)
  DELETE FROM learned_words WHERE user_id = user_uuid;
  DELETE FROM quiz_results WHERE user_id = user_uuid;
  DELETE FROM progress WHERE user_id = user_uuid;
  DELETE FROM profiles WHERE id = user_uuid;

  -- Note: Deleting from auth.users requires service role key
  -- This will be handled in the API layer with admin client

  RETURN jsonb_build_object(
    'success', true,
    'message', 'User data deleted',
    'user_id', user_uuid
  );
END;
$function$;

-- Function: clear_user_progress
-- Admin function to clear all progress for a user
CREATE OR REPLACE FUNCTION public.clear_user_progress(user_email text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  user_uuid UUID;
  deleted_progress INTEGER;
  deleted_learned INTEGER;
  deleted_quizzes INTEGER;
BEGIN
  -- Find user by email
  SELECT id INTO user_uuid
  FROM profiles
  WHERE email = user_email;

  IF user_uuid IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'User not found'
    );
  END IF;

  -- Clear progress data
  DELETE FROM learned_words WHERE user_id = user_uuid;
  GET DIAGNOSTICS deleted_learned = ROW_COUNT;

  DELETE FROM quiz_results WHERE user_id = user_uuid;
  GET DIAGNOSTICS deleted_quizzes = ROW_COUNT;

  DELETE FROM progress WHERE user_id = user_uuid;
  GET DIAGNOSTICS deleted_progress = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Progress cleared',
    'deleted_lessons', deleted_progress,
    'deleted_words', deleted_learned,
    'deleted_quizzes', deleted_quizzes
  );
END;
$function$;

-- Function: update_lessons_updated_at
-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_lessons_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Function: is_admin
-- Check if a user is an admin (SECURE - has search_path set)
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins WHERE user_id = check_user_id
  );
END;
$function$;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Table: admins
-- ✅ OPTIMIZED (uses subquery for auth.uid())
CREATE POLICY "Only service role can modify admins"
ON admins FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can check their own admin status"
ON admins FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- Table: dictionary
-- ✅ OPTIMIZED (uses subquery for auth.uid())
CREATE POLICY "Anyone can view dictionary"
ON dictionary FOR SELECT
TO public
USING (true);

CREATE POLICY "Only admins can insert dictionary"
ON dictionary FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Only admins can update dictionary"
ON dictionary FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Only admins can delete dictionary"
ON dictionary FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.user_id = (SELECT auth.uid())
  )
);

-- Table: learned_words
-- ✅ OPTIMIZED (uses subquery for auth.uid())
CREATE POLICY "Users can view their own learned words"
ON learned_words FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert their own learned words"
ON learned_words FOR INSERT
TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own learned words"
ON learned_words FOR UPDATE
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own learned words"
ON learned_words FOR DELETE
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- Table: lesson_groups
CREATE POLICY "Allow public read access to lesson_groups"
ON lesson_groups FOR SELECT
TO public
USING (true);

-- Table: lessons
-- ✅ OPTIMIZED (uses subquery for auth.uid())
CREATE POLICY "Anyone can read lessons"
ON lessons FOR SELECT
TO public
USING (true);

CREATE POLICY "Only admins can insert lessons"
ON lessons FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Only admins can update lessons"
ON lessons FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Only admins can delete lessons"
ON lessons FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.user_id = (SELECT auth.uid())
  )
);

-- Table: profiles
-- ✅ OPTIMIZED (uses subquery for auth.uid())
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
TO public
USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
TO public
WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO public
USING (id = (SELECT auth.uid()))
WITH CHECK (id = (SELECT auth.uid()));

-- Table: progress
-- ✅ OPTIMIZED (uses subquery for auth.uid())
CREATE POLICY "Users can view their own progress"
ON progress FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert their own progress"
ON progress FOR INSERT
TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own progress"
ON progress FOR UPDATE
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own progress"
ON progress FOR DELETE
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- Table: quiz_results
-- ✅ OPTIMIZED (uses subquery for auth.uid())
CREATE POLICY "Users can view their own quiz results"
ON quiz_results FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert their own quiz results"
ON quiz_results FOR INSERT
TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

-- ============================================
-- NOTES
-- ============================================
-- ✅ All RLS policies are optimized with (SELECT auth.uid()) subqueries
-- ✅ is_admin function has search_path set
-- ⚠️  The following SECURITY DEFINER functions still need search_path fixes:
--    - handle_new_user
--    - delete_user_completely
--    - clear_user_progress
