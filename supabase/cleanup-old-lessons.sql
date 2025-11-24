-- Clean up old lesson IDs
-- This removes the old lesson1, lesson2, lesson3 entries after migration to 1.0, 1.1, 1.2

-- First, migrate any progress from old IDs to new IDs
UPDATE progress SET lesson_id = '1.0' WHERE lesson_id = 'lesson1';
UPDATE progress SET lesson_id = '1.1' WHERE lesson_id = 'lesson2';
UPDATE progress SET lesson_id = '1.2' WHERE lesson_id = 'lesson3';

-- Update learned_words to reference new lesson IDs in the dictionary
UPDATE dictionary
SET lessons = ARRAY(
  SELECT CASE
    WHEN unnest = 'lesson1' THEN '1.0'
    WHEN unnest = 'lesson2' THEN '1.1'
    WHEN unnest = 'lesson3' THEN '1.2'
    ELSE unnest
  END
  FROM unnest(lessons)
)
WHERE 'lesson1' = ANY(lessons) OR 'lesson2' = ANY(lessons) OR 'lesson3' = ANY(lessons);

-- Now delete the old lesson entries
DELETE FROM lessons WHERE id IN ('lesson1', 'lesson2', 'lesson3');
