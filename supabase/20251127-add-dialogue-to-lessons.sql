-- Add dialogue field to lessons table for reading practice feature
-- Dialogues are text-message style conversations using vocabulary from the lesson

-- Add dialogue column as JSONB (nullable, will be populated lesson by lesson)
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS dialogue JSONB;

-- Add comment to explain the structure
COMMENT ON COLUMN lessons.dialogue IS 'Reading practice dialogue in text message format. Structure: { title: string, messages: [{ speaker: string, korean: string, english: string, romanization: string }] }';

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'lessons' AND column_name = 'dialogue';
