-- ============================================
-- SCHEMA EXPORT QUERIES
-- Run each query separately in Supabase SQL Editor
-- Copy all outputs and paste back here - I'll format them into a schema file
-- ============================================

-- ============================================
-- QUERY 1: List all tables
-- ============================================
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================
-- QUERY 2: Get complete table definitions
-- ============================================
-- Run this for each table individually, replacing 'TABLE_NAME'
-- Example: Run for 'users', 'lessons', 'progress', etc.

SELECT
  column_name,
  data_type,
  character_maximum_length,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'TABLE_NAME'  -- Replace with actual table name
ORDER BY ordinal_position;

-- ============================================
-- QUERY 3: Get all RLS policies (formatted)
-- ============================================
SELECT
  tablename || '.' || policyname as policy,
  'FOR ' || cmd as operation,
  qual as using_clause,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- QUERY 4: Get all functions (complete definitions)
-- ============================================
SELECT pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.prokind = 'f'
ORDER BY p.proname;

-- ============================================
-- QUERY 5: Get all foreign keys
-- ============================================
SELECT
  tc.table_name || '.' || kcu.column_name as from_column,
  ccu.table_name || '.' || ccu.column_name as references,
  rc.delete_rule,
  rc.update_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- ============================================
-- EASIEST METHOD: Use Supabase CLI
-- ============================================
-- If you have Supabase CLI installed, run this in your terminal instead:
-- supabase db dump -f supabase/current-schema.sql
--
-- This will create a complete schema file automatically!
