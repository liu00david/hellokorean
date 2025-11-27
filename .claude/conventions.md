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
