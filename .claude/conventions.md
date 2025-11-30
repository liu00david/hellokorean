# Project Conventions

## Database Migrations

All new database migration files in `supabase/` should follow this naming format:

```
YYYYMMDD-purpose.sql
```

Examples:
- `20251126-add-admins-table.sql`
- `20251126-add-lesson-groups.sql`
- `20251127-update-user-permissions.sql`

## Database Security

All `SECURITY DEFINER` functions must have a fixed `search_path` to prevent search_path manipulation attacks:

```sql
CREATE OR REPLACE FUNCTION function_name()
RETURNS type AS $$
BEGIN
  -- function body
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;  -- Always set this for SECURITY DEFINER functions
```

## Lesson Content Versioning

Whenever lesson content is updated in `content/lessons/*.json`, always bump the minor version number:

```
2.0.1 → 2.0.2
3.1.5 → 3.1.6
```

This triggers the sync mechanism to update the database. The version format is:
- **Major.Minor.Patch** (e.g., `2.0.1`)
- Increment patch version for any content changes (vocabulary, dialogue, explanation, etc.)

After updating versions, sync content via the admin panel to apply changes to the database.
