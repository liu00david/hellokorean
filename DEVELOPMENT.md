# Development Notes

## Database Migrations

### Migration File Naming Convention

**Format:** `YYYYMMDD-purpose.sql`

**Examples:**
- `20251126-add-lesson-groups.sql`
- `20251126-cleanup-old-lessons.sql`

**Location:** `/supabase/`

### Running Migrations

1. Go to **Supabase Dashboard** → SQL Editor
2. Copy the contents of the migration file
3. Paste and click **Run**
4. Verify the migration succeeded

### Current Migration Files

- `20251126-add-lesson-groups.sql` - Creates lesson_groups table and adds group_id to lessons
- `20251126-cleanup-old-lessons.sql` - Removes old lesson data from previous structure

## Content Management

### Adding New Lessons

1. Create JSON file in `content/lessons/` with format `X.Y.json`
   - X = group number (1, 2, 3...)
   - Y = sub-lesson number (0, 1, 2...)
2. Include required fields: `id`, `group_id`, `version`, `title`, `objectives`, `context`, `vocabulary`, `sentences`, `explanation`
3. Go to `/admin` and click "Sync Content from Files"

### Lesson Version Management

- Increment `version` field when updating lesson content
- Sync will only update lessons with changed versions
- Format: `"version": "1.0.0"`

## Architecture

### Lesson Structure

```
Lesson Groups (1, 2, 3...)
  └─ Sub-Lessons (1.0, 1.1, 1.2...)
      └─ Content (vocabulary, sentences, explanations)
```

### Navigation Flow

- `/lessons` → Lesson groups with progress %
- `/lessons/1` → Sub-lessons in group 1
- `/lessons/1.0` → Lesson 1.0 content

### Audio Features

- Uses Web Speech API (browser TTS)
- Korean locale: `ko-KR`
- No external dependencies or API costs
- Speaker icons (🔊) on vocabulary words, sentences, dictionary entries

## Admin Management

### Admin Permissions

Admins are managed via the `admins` table in the database. Admin status is checked at both the frontend (via AuthProvider) and backend (via API routes) levels.

**Security Features:**
- No hardcoded emails in code
- Admin status stored in database
- Checked on every protected route
- RLS policies ensure only service role can modify admins table

### Adding a New Admin

To grant admin access to a user, run this SQL in Supabase Dashboard → SQL Editor:

```sql
-- Add admin by email
INSERT INTO admins (user_id)
SELECT id FROM auth.users WHERE email = 'user@example.com'
ON CONFLICT (user_id) DO NOTHING;
```

Or if you know the user's UUID:

```sql
-- Add admin by UUID
INSERT INTO admins (user_id) VALUES ('user-uuid-here')
ON CONFLICT (user_id) DO NOTHING;
```

### Removing an Admin

```sql
-- Remove admin by email
DELETE FROM admins
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user@example.com');
```

### Listing All Admins

```sql
SELECT u.email, a.created_at
FROM admins a
JOIN auth.users u ON a.user_id = u.id;
```

## Common Tasks

### Clearing User Progress

Use admin panel at `/admin`:
- Enter user email
- Click "Clear Progress" to reset all progress/quizzes/learned words

### Syncing Content

Admin panel at `/admin`:
- Click "Sync Content from Files"
- Syncs lesson groups, lessons, and dictionary
- Only updates lessons with changed versions

## Troubleshooting

### Build Errors

```bash
npm run build
```

Common fixes:
- Check TypeScript types match database schema
- Ensure all imports are correct
- Verify environment variables are set

### Auth Issues

If login redirects to wrong URL:
- Check Supabase Dashboard → Authentication → URL Configuration
- Add localhost URLs to Redirect URLs list
- Site URL should match deployment URL
