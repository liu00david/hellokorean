-- Migration for Admin Console Rework
-- This migration adds:
-- 1. Lessons table to store lesson content in database
-- 2. Admin role checking
-- 3. RLS policies for admin operations

-- ============================================
-- 1. Create lessons table
-- ============================================
CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  prerequisite TEXT,
  objectives TEXT[] NOT NULL DEFAULT '{}',
  vocabulary JSONB NOT NULL DEFAULT '[]',
  sentences JSONB NOT NULL DEFAULT '[]',
  explanation JSONB NOT NULL DEFAULT '[]',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index for ordering lessons
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(order_index);

-- ============================================
-- 2. Enable RLS on lessons table
-- ============================================
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Everyone can read lessons
CREATE POLICY "Anyone can read lessons"
  ON lessons FOR SELECT
  TO public
  USING (true);

-- Only authenticated users can insert/update/delete (admin check in application layer)
CREATE POLICY "Authenticated users can modify lessons"
  ON lessons FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 3. Create function to check if user is admin
-- ============================================
CREATE OR REPLACE FUNCTION is_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Hardcoded admin email
  RETURN user_email = 'liu00david@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. Create function to delete user completely
-- ============================================
CREATE OR REPLACE FUNCTION delete_user_completely(user_email TEXT)
RETURNS JSONB AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. Create function to clear user progress
-- ============================================
CREATE OR REPLACE FUNCTION clear_user_progress(user_email TEXT)
RETURNS JSONB AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. Update trigger for lessons
-- ============================================
CREATE OR REPLACE FUNCTION update_lessons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_lessons_updated_at();

-- ============================================
-- 7. Add helpful comments
-- ============================================
COMMENT ON TABLE lessons IS 'Stores all lesson content moved from JSON files';
COMMENT ON FUNCTION is_admin IS 'Checks if user email matches hardcoded admin';
COMMENT ON FUNCTION delete_user_completely IS 'Deletes all user data from database (auth deletion handled in API)';
COMMENT ON FUNCTION clear_user_progress IS 'Clears user progress but keeps profile';
