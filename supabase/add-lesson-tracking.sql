-- Add lesson tracking to dictionary
-- This allows filtering words by which lesson they appear in

-- Add lessons array to dictionary table (stores lesson IDs where this word appears)
ALTER TABLE dictionary
ADD COLUMN IF NOT EXISTS lessons TEXT[] DEFAULT '{}';

-- Add version to lessons table
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS version TEXT;

-- Create index for faster lesson filtering
CREATE INDEX IF NOT EXISTS idx_dictionary_lessons ON dictionary USING GIN (lessons);

-- Add comment
COMMENT ON COLUMN dictionary.lessons IS 'Array of lesson IDs where this word appears';
COMMENT ON COLUMN lessons.version IS 'Semantic version of the lesson (e.g., 0.0.1)';
