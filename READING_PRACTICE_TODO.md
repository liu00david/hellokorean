# Reading Practice Implementation - Next Steps

## ✅ Completed

1. Added `dialogue` field to lesson types
2. Created database migration to add dialogue column
3. Updated lib/lessons.ts to handle dialogues
4. Created reading practice list page (`/reading-practice`)
5. Created individual dialogue page (`/reading-practice/[id]`)
6. Added "Reading Practice" to navigation menu
7. Created dialogue guide and sample SQL

## 📋 TODO - Database Setup

1. **Run the migration:**
   ```sql
   -- In Supabase SQL Editor:
   -- Run: supabase/20251127-add-dialogue-to-lessons.sql
   ```

2. **Fix lesson order_index (if not done yet):**
   ```sql
   -- Run: supabase/20251127-fix-lesson-order-index.sql
   ```

## 📋 TODO - Create Dialogues

For each lesson, create a dialogue that uses ALL vocabulary from that lesson + previous lessons:

### Process:
1. Check lesson vocabulary in database
2. List all words from that lesson + previous lessons
3. Create natural dialogue incorporating all words
4. Format as JSON (see DIALOGUE_GUIDE.md)
5. Add to database using SQL UPDATE

### Quick Start:
```sql
-- Example for any lesson:
UPDATE lessons
SET dialogue = '{
  "title": "Your Dialogue Title",
  "messages": [
    {
      "speaker": "지수",
      "korean": "Korean text",
      "english": "English translation",
      "romanization": "romanization"
    },
    {
      "speaker": "민호",
      "korean": "Korean text",
      "english": "English translation",
      "romanization": "romanization"
    }
    ... more messages ...
  ]
}'::jsonb
WHERE id = 'LESSON_ID';
```

### Recurring Characters to Use:
- 지수 (Jisu) - Female student
- 민호 (Minho) - Male student
- 서연 (Seoyeon) - Female office worker
- 준호 (Junho) - Male office worker
- 수진 (Sujin) - Female teacher
- 동현 (Donghyeon) - Male shop owner

## 📋 TODO - Testing

After adding dialogues:
1. Visit `/reading-practice` to see the list
2. Click on a lesson to view the dialogue
3. Test audio buttons (each message should play)
4. Test romanization toggle
5. Test English translation toggle
6. Verify mobile responsive design

## 📝 Notes

- Each dialogue message displays in chat bubble format
- Messages alternate left/right
- Different colors for different speakers
- Audio icon on each message
- English translation shows below Korean (toggle-able)
- Romanization shows below Korean (toggle-able)

## 📚 Reference Files

- `DIALOGUE_GUIDE.md` - Complete guide on creating dialogues
- `supabase/sample-dialogues.sql` - Example SQL for adding dialogues
- `types/lesson.ts` - TypeScript interfaces
- `app/reading-practice/page.tsx` - List page
- `app/reading-practice/[id]/page.tsx` - Individual dialogue page

## 🎯 Goal

Have a dialogue for every lesson that:
- Covers ALL vocabulary from that lesson
- Uses vocabulary from all previous lessons (cumulative learning)
- Flows naturally like a real conversation
- Is engaging and contextually appropriate
- Features recurring characters students can get to know
