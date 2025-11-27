-- Debug query: Check current lesson order_index values
-- Run this in Supabase SQL Editor to see the current state

SELECT
  id,
  title,
  order_index,
  group_id
FROM lessons
ORDER BY order_index ASC;

-- This will show if order_index is set correctly or not
