# Implementation Summary - Hangeul Garden Rework

## Completed Tasks

### 1. Database Schema Changes

**File:** `supabase/migration-admin-rework.sql`

Created new schema with:
- **lessons table**: Stores lesson content (previously in JSON files)
- **Helper functions**:
  - `is_admin(user_email)`: Checks if user is admin (hardcoded: liu00david@gmail.com)
  - `delete_user_completely(user_email)`: Deletes all user data
  - `clear_user_progress(user_email)`: Clears user progress but keeps profile

**Action Required:** Run this SQL file in your Supabase SQL editor.

### 2. Admin Console

**New Files:**
- `app/admin/page.tsx`: Admin interface
- `app/api/admin/sync-content/route.ts`: Syncs lessons + dictionary from JSON to database
- `app/api/admin/delete-user/route.ts`: Deletes user completely (including auth)
- `app/api/admin/clear-progress/route.ts`: Clears user progress

**Updated Files:**
- `components/Navigation.tsx`: Added admin link (only visible to liu00david@gmail.com)

**Features:**
1. Sync Content - Migrates lesson JSON files and vocabulary to database
2. Delete User - Completely removes user and auth account (requires SUPABASE_SERVICE_ROLE_KEY)
3. Clear Progress - Removes lessons, words, and quiz results for a user

**Action Required:** Add `SUPABASE_SERVICE_ROLE_KEY` to your `.env.local` file.

### 3. Dictionary Page Rework

**Updated File:** `app/dictionary/page.tsx`

**Changes:**
- Added **LEARNED** and **ALL** word tabs
- LEARNED tab shows only words from completed lessons
- ALL tab shows entire dictionary
- Removed sync button (admin-only now)
- Non-authenticated users see message on LEARNED tab

### 4. Auto-Add Lesson Words

**Existing Implementation:** `components/LessonActions.tsx` (lines 74-106)

Already implemented! When users mark a lesson as complete:
1. Lesson marked in `progress` table
2. Vocabulary words automatically added to `learned_words` table
3. Sets confidence_level to 0 for new words

### 5. Quiz Rework

**Updated Files:**
- `app/quiz/page.tsx`: Added LEARNED/ALL tabs
- `app/api/generate-quiz/route.ts`: Supports source parameter (learned/all)
- `lib/generateQuiz.ts`: Repeats questions when fewer words than quiz length

**Changes:**
- LEARNED tab: Generates quiz from user's learned words only
- ALL tab: Uses entire dictionary
- If user has 3 learned words but wants 10 questions, it cycles through the 3 words
- Minimum 4 words needed to generate quiz

### 6. Training Rework

#### Flashcards

**Updated Files:**
- `app/training/flashcards/page.tsx`: Added LEARNED/ALL tabs
- `app/api/flashcards/route.ts`: Supports source parameter

**Changes:**
- LEARNED tab: Shows SRS stats (due cards, total learned)
- ALL tab: Reviews entire dictionary
- Removed "sync flashcards" button (admin syncs via content sync)

#### Typing Practice

**Updated File:** `app/training/typing/page.tsx`

**Changes:**
- Added LEARNED/ALL tabs
- LEARNED: Practice typing learned words only
- ALL: Practice typing all dictionary words

### 7. Lesson Loading from Database

**Updated Files:**
- `lib/lessons.ts`: Changed from file system to database queries
- `app/lessons/page.tsx`: Made async to handle database queries
- `app/lessons/[id]/page.tsx`: Made async functions

**Changes:**
- Lessons now loaded from Supabase `lessons` table
- Maintains same API but uses database instead of JSON files

## Next Steps

### 1. Run Database Migration

```bash
# In Supabase SQL Editor, run:
supabase/migration-admin-rework.sql
```

### 2. Add Environment Variable

Add to `.env.local`:
```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Get this from: Supabase Dashboard → Settings → API → service_role key

### 3. Sync Content to Database

1. Sign in as admin (liu00david@gmail.com)
2. Navigate to `/admin`
3. Click "Sync Content" button
4. This will migrate all lesson JSON files and vocabulary to the database

### 4. Test the Features

**Dictionary:**
- Visit `/dictionary`
- Test LEARNED tab (should be empty initially)
- Test ALL tab (should show all words after sync)

**Lessons:**
- Complete a lesson
- Check LEARNED tab in dictionary (should now show those words)

**Quiz:**
- Try LEARNED tab with no learned words (should show error)
- Complete a lesson, try again (should work)
- Try ALL tab (should work immediately)
- Test with fewer learned words than quiz length (should repeat questions)

**Training:**
- Test flashcards with LEARNED/ALL tabs
- Test typing practice with LEARNED/ALL tabs

**Admin:**
- Test sync content (should show count of synced items)
- Test clear progress with a test user
- Test delete user with a test user (creates new test account first)

## Architecture Changes

### Before
```
Lessons: JSON files → File system
Dictionary: JSON files → Sync API → Supabase dictionary table
Learned Words: Manually synced via "sync flashcards" button
```

### After
```
Lessons: JSON files → Admin Sync → Supabase lessons table → App
Dictionary: JSON files → Admin Sync → Supabase dictionary table → App
Learned Words: Auto-added when lesson completed
Admin: Full control over content and users
```

## Files Created

1. `supabase/migration-admin-rework.sql`
2. `app/admin/page.tsx`
3. `app/api/admin/sync-content/route.ts`
4. `app/api/admin/delete-user/route.ts`
5. `app/api/admin/clear-progress/route.ts`

## Files Modified

1. `components/Navigation.tsx`
2. `app/dictionary/page.tsx`
3. `app/quiz/page.tsx`
4. `app/api/generate-quiz/route.ts`
5. `lib/generateQuiz.ts`
6. `app/training/flashcards/page.tsx`
7. `app/api/flashcards/route.ts`
8. `app/training/typing/page.tsx`
9. `lib/lessons.ts`
10. `app/lessons/page.tsx`
11. `app/lessons/[id]/page.tsx`

## Important Notes

1. **Admin Email**: Hardcoded as `liu00david@gmail.com` in:
   - `app/admin/page.tsx`
   - `app/api/admin/*` routes
   - `components/Navigation.tsx`
   - Database function `is_admin()`

2. **Content Flow**:
   - JSON files still exist for backup/editing
   - Admin syncs JSON → Database
   - App reads from Database

3. **User Flow**:
   - User completes lesson → Words auto-added to learned_words
   - User can quiz/train on LEARNED words only
   - User can also use ALL words for practice

4. **Delete vs Clear**:
   - Delete User: Removes everything including auth account (can't log in again)
   - Clear Progress: Keeps profile/auth, removes only progress data

## Troubleshooting

**Admin page shows "Access denied":**
- Make sure you're signed in as liu00david@gmail.com

**Sync content fails:**
- Check that lesson JSON files exist in `content/lessons/`
- Check Supabase connection
- Check browser console for errors

**Delete user fails:**
- Make sure `SUPABASE_SERVICE_ROLE_KEY` is set
- Check the key is correct in Supabase dashboard

**Lessons don't load:**
- Run admin sync content first
- Check `lessons` table in Supabase has data

**Quiz shows "Not enough words":**
- Complete some lessons first (LEARNED mode)
- Or use ALL mode to practice all dictionary words
