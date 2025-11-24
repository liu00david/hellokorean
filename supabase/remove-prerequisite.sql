-- Remove prerequisite column from lessons table
ALTER TABLE lessons DROP COLUMN IF EXISTS prerequisite;
