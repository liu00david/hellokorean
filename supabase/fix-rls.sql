-- Fix Row Level Security for Dictionary
-- Run this in Supabase SQL Editor to allow API to sync dictionary

-- Drop existing insert/update policies for dictionary
DROP POLICY IF EXISTS "Authenticated users can insert dictionary" ON dictionary;
DROP POLICY IF EXISTS "Authenticated users can update dictionary" ON dictionary;

-- Allow anyone (including API routes) to insert/update dictionary
-- This is safe because dictionary is public content synced from lesson files
CREATE POLICY "Anyone can insert dictionary"
  ON dictionary FOR INSERT
  TO PUBLIC
  WITH CHECK (true);

CREATE POLICY "Anyone can update dictionary"
  ON dictionary FOR UPDATE
  TO PUBLIC
  USING (true);
