-- Clean up old lessons that were replaced with new hierarchical structure
-- This removes lessons that don't have a valid group_id or are outdated

-- Step 1: Delete progress entries for old lessons
DELETE FROM progress
WHERE lesson_id NOT IN ('1.0', '1.1', '1.2', '1.3', '2.0', '2.1');

-- Step 2: Delete old lessons that don't match our new structure
DELETE FROM lessons
WHERE id NOT IN ('1.0', '1.1', '1.2', '1.3', '2.0', '2.1');

-- Step 3: Clean up dictionary - remove lesson references to deleted lessons
UPDATE dictionary
SET lessons = (
  SELECT array_agg(lesson_id)
  FROM unnest(lessons) AS lesson_id
  WHERE lesson_id IN ('1.0', '1.1', '1.2', '1.3', '2.0', '2.1')
)
WHERE lessons IS NOT NULL;

-- Step 4: Remove dictionary entries with no lesson associations
DELETE FROM dictionary
WHERE lessons IS NULL OR array_length(lessons, 1) IS NULL OR array_length(lessons, 1) = 0;

-- Verify cleanup
SELECT 'Remaining lessons:' as info;
SELECT id, title, group_id FROM lessons ORDER BY id;

SELECT 'Dictionary entries count:' as info;
SELECT COUNT(*) as total_words FROM dictionary;
