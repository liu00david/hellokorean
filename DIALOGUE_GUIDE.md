# Dialogue Creation Guide

This guide explains how to create reading practice dialogues for each lesson.

## Overview

Each lesson should have ONE dialogue that:
- Uses **ALL vocabulary** from that lesson
- Uses **ALL vocabulary** from previous lessons (cumulative)
- Flows naturally like a real text conversation
- Features recurring characters with Korean names

## Recurring Characters

Use these characters throughout all dialogues:
- **지수 (Jisu)** - Female student
- **민호 (Minho)** - Male student
- **서연 (Seoyeon)** - Female office worker
- **준호 (Junho)** - Male office worker
- **수진 (Sujin)** - Female teacher
- **동현 (Donghyeon)** - Male shop owner

Mix and match characters based on the lesson context.

## Dialogue Structure

```json
{
  "title": "Descriptive Title",
  "messages": [
    {
      "speaker": "Character Name",
      "korean": "Korean text",
      "english": "English translation",
      "romanization": "romanized text"
    }
  ]
}
```

## Steps to Create a Dialogue

### 1. Identify Vocabulary

List ALL words from:
- Current lesson's vocabulary
- ALL previous lessons' vocabulary

### 2. Create Natural Context

Choose a setting that allows natural use of the vocabulary:
- Meeting someone
- Shopping
- At a restaurant
- At school
- At work
- Daily routine

### 3. Write the Dialogue

- Start with a greeting
- Build conversation naturally
- Incorporate ALL vocabulary words
- End with a natural conclusion
- Keep it realistic (6-15 messages typically)

### 4. Format as JSON

Follow the structure exactly as shown above.

### 5. Add to Database

Run SQL to update the lesson:

```sql
UPDATE lessons
SET dialogue = '{
  "title": "Your Title",
  "messages": [
    {
      "speaker": "지수",
      "korean": "안녕하세요!",
      "english": "Hello!",
      "romanization": "annyeonghaseyo!"
    },
    ...more messages...
  ]
}'::jsonb
WHERE id = 'LESSON_ID';
```

## Tips

### Good Dialogue
- Natural flow
- Uses all vocabulary organically
- Has clear beginning and end
- Appropriate length (not too short, not too long)
- Matches lesson theme

### Bad Dialogue
- Forced vocabulary usage
- Disconnected sentences
- Missing vocabulary words
- Too short or too long
- Unnatural conversation

## Example Process

**Lesson 1.0 Vocabulary:**
- 가다 (to go)
- 오다 (to come)
- 학교 (school)
- 집 (home)

**Previous Lessons:**
- 안녕하세요 (hello)
- 네 (yes)
- 아니요 (no)

**Context:** Planning to meet

```json
{
  "title": "Planning to Meet",
  "messages": [
    {
      "speaker": "민호",
      "korean": "지수야, 안녕!",
      "english": "Jisu, hello!",
      "romanization": "jisuya, annyeong!"
    },
    {
      "speaker": "지수",
      "korean": "안녕하세요!",
      "english": "Hello!",
      "romanization": "annyeonghaseyo!"
    },
    {
      "speaker": "민호",
      "korean": "내일 학교에 가요?",
      "english": "Are you going to school tomorrow?",
      "romanization": "naeil hakgyoe gayo?"
    },
    {
      "speaker": "지수",
      "korean": "네, 학교에 가요.",
      "english": "Yes, I'm going to school.",
      "romanization": "ne, hakgyoe gayo."
    },
    {
      "speaker": "민호",
      "korean": "집에 언제 와요?",
      "english": "When are you coming home?",
      "romanization": "jibe eonje wayo?"
    },
    {
      "speaker": "지수",
      "korean": "4시에 집에 와요.",
      "english": "I'm coming home at 4 o'clock.",
      "romanization": "4sie jibe wayo."
    }
  ]
}
```

## Validation Checklist

Before adding a dialogue, verify:
- [ ] All lesson vocabulary is used
- [ ] Previous vocabulary is incorporated
- [ ] Conversation flows naturally
- [ ] Has clear start and end
- [ ] Korean, English, and romanization all match
- [ ] Speaker names are Korean
- [ ] JSON is valid
- [ ] Title is descriptive

## Need Help?

If you're unsure about a word or phrase:
1. Check the lesson's vocabulary list
2. If needed, add the word to the lesson's vocabulary
3. Make sure it's in the dictionary table
4. Then use it in the dialogue
