-- Fix lesson order_index to properly sort lessons numerically
-- This ensures lessons appear in correct order: 0.1, 0.2, 1.0, 2.0, 2.1, etc.

-- Update order_index based on proper numeric sorting of lesson IDs
-- Strategy: Convert lesson ID to a sortable number by splitting major.minor

UPDATE lessons
SET order_index = (
  -- Extract major version (before decimal) and multiply by 1000
  -- Extract minor version (after decimal) and add it
  -- This converts "2.1" -> 2001, "10.0" -> 10000, etc.
  (CAST(SPLIT_PART(id, '.', 1) AS INTEGER) * 1000) +
  (CAST(SPLIT_PART(id, '.', 2) AS INTEGER))
)
WHERE id ~ '^\d+\.\d+$';  -- Only update lessons with numeric IDs like "2.1"

-- Verify the results
SELECT id, title, order_index, group_id
FROM lessons
ORDER BY order_index ASC;
