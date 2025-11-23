-- Fix RLS policies for learned_words table
-- Run this in Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own learned words" ON learned_words;
DROP POLICY IF EXISTS "Users can insert their own learned words" ON learned_words;
DROP POLICY IF EXISTS "Users can update their own learned words" ON learned_words;
DROP POLICY IF EXISTS "Users can delete their own learned words" ON learned_words;

-- Recreate policies with correct permissions
CREATE POLICY "Users can view their own learned words"
  ON learned_words FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learned words"
  ON learned_words FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learned words"
  ON learned_words FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own learned words"
  ON learned_words FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
