-- Add context field to lessons table
-- This field stores introductory paragraphs/context for each lesson

ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS context TEXT[] DEFAULT '{}';

-- Update existing lessons to have empty context if null
UPDATE lessons
SET context = '{}'
WHERE context IS NULL;
