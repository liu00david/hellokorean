-- Create lesson_groups table
CREATE TABLE IF NOT EXISTS lesson_groups (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add group_id to lessons table
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS group_id TEXT REFERENCES lesson_groups(id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_lessons_group_id ON lessons(group_id);

-- Enable RLS
ALTER TABLE lesson_groups ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read lesson groups
CREATE POLICY "Allow public read access to lesson_groups"
ON lesson_groups FOR SELECT
TO public
USING (true);
