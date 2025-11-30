# Project Conventions

## Database Migrations

All new database migration files in `supabase/` should follow this naming format:

```bash
$(date +%Y%m%d)-purpose.sql
```

The date prefix is auto-generated using `date +%Y%m%d` command. Example usage:

```bash
# Create a new migration file with today's date
touch supabase/$(date +%Y%m%d)-add-new-feature.sql
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

## Lesson Content Structure

Lesson files in `content/lessons/*.json` follow this structure:

### Required Fields
- `id`: Lesson identifier (e.g., `"3.0"`)
- `group_id`: Group identifier (e.g., `"3"`)
- `version`: Semantic version (e.g., `"2.1.1"`)
- `title`: Lesson title
- `objectives`: Array of learning objectives
- `vocabulary`: Array of vocabulary items
- `sentences`: Array of example sentences
- `explanation`: Array of explanation strings

### Optional Fields
- `context`: Array of context strings
- `dialogue`: Object containing reading practice dialogue
  - `title`: Dialogue title (e.g., `"Lunch Plans with Basic Verbs"`)
  - `messages`: Array of dialogue messages
    - `speaker`: Speaker name
    - `korean`: Korean text
    - `english`: English translation
    - `romanization`: Romanized text

### Versioning

Whenever lesson content is updated in `content/lessons/*.json`, always bump the patch version number:

```
2.0.1 → 2.0.2
3.1.5 → 3.1.6
```

This triggers the sync mechanism to update the database. The version format is:
- **Major.Minor.Patch** (e.g., `2.0.1`)
- Increment patch version for any content changes (vocabulary, dialogue, explanation, etc.)

After updating versions, sync content via the admin panel to apply changes to the database.
