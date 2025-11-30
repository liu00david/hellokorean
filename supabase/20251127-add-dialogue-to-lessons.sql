-- Add dialogue field to lessons table
-- This field stores dialogue data for reading practice

ALTER TABLE lessons ADD COLUMN IF NOT EXISTS dialogue JSONB;

-- Add comment for documentation
COMMENT ON COLUMN lessons.dialogue IS 'Optional dialogue data for reading practice, contains title and messages array';
