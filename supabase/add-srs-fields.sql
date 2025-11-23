-- Add SRS (Spaced Repetition System) fields to learned_words table
-- Run this in Supabase SQL Editor

ALTER TABLE learned_words
ADD COLUMN IF NOT EXISTS confidence_level INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS next_review_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for efficient flashcard queries (due for review)
CREATE INDEX IF NOT EXISTS idx_learned_words_next_review
ON learned_words(user_id, next_review_date);

-- Comments
COMMENT ON COLUMN learned_words.confidence_level IS 'SRS confidence: 0=new, 1=hard, 2=medium, 3=good, 4=easy, 5=mastered';
COMMENT ON COLUMN learned_words.next_review_date IS 'When this word should be reviewed next (for spaced repetition)';
