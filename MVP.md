📘 Hangeul Garden — Product Specification (MVP)

**Korean Learning Website – Beginner Friendly – Roadmap Lessons – Dictionary – Auto Quizzes**

---

**Document Version:** 1.0
**Last Updated:** 2025-11-23
**Status:** Ready for Development
**Target Platform:** Web (Desktop & Mobile)

---

## Table of Contents

1. [Product Summary](#-1-product-summary)
2. [MVP Features](#-2-mvp-features)
3. [Technical Stack](#-3-technical-stack)
4. [Folder Structure](#-4-folder-structure)
5. [Lesson JSON Schema](#-5-lesson-json-schema)
6. [Dictionary Table Schema](#-6-dictionary-table-schema-supabase)
7. [Quiz JSON Schema](#-7-quiz-json-schema-auto-generated)
8. [Quiz Types](#-8-quiz-types)
9. [API Endpoints](#-9-api-endpoints-nextjs-api-routes)
10. [Design System](#-10-hangeul-garden-design-system)
11. [Database Tables](#-11-user-data-saved-in-supabase)
12. [Development Roadmap](#-12-development-roadmap)
13. [Future Expansion](#-13-future-expansion-post-mvp)
14. [Summary for LLMs](#-14-summary-statement-for-llms)

---

## 🌱 1. Product Summary

**Hangeul Garden** is a beginner-friendly Korean language learning website designed to make learning Korean fun, accessible, and effective.

### Key Features:

- 📚 **Roadmap-style progressive lessons** - Structured learning path from basics to conversation
- 📖 **Auto-generated dictionary** - Built automatically from all lesson content
- 🎯 **Training exercises** - Flashcards, translation practice, and matching games
- ✏️ **Auto-generated quizzes** - Dynamic quizzes created from your lessons
- 💬 **Clickable words** - Instant translations on hover/click
- 🔐 **Google login** - Save progress and track learning
- 🌸 **"Hangeul Garden" aesthetic** - Cute, soft pastel design for a calming experience

### Technical Approach:

All lesson content is stored in JSON files and automatically parsed to generate:
- Dictionary entries with romanization
- Quiz questions (multiple types)
- Training materials

### Target Audience:

Beginners learning Korean for:
- Travel and tourism
- Food and dining
- Greetings and basic conversation
- Cultural appreciation
- K-drama/K-pop interest

## 🌿 2. MVP Features

### 2.1 Lessons

- Lessons stored as JSON files in `/content/lessons`
- Each lesson contains:
  - Title
  - Objectives (learning goals)
  - Vocabulary list
  - Example sentences
  - Explanations
  - Unlock requirement (optional, not enforced in MVP)
- Lessons page lists all available lessons
- Free navigation (no lesson locking in MVP)

### 2.2 Dictionary

- Auto-generated from lesson vocabulary + sentences
- Stored in Supabase `dictionary` table
- Clickable words in lessons show tooltip with:
  - Korean word (Hangeul)
  - English meaning
  - Romanization (Revised Romanization standard)
- Dictionary page with:
  - Search functionality
  - Filters by word type
  - Sort options

### 2.3 Quizzes (Auto-generated)

**Quiz Types:**

- Translate word (Korean → English)
- Translate word (English → Korean)
- Translate sentence (both directions)
- Card matching (word ↔ definition)

**Features:**

- Auto-generated from dictionary + lesson vocabulary
- Quiz results saved to Supabase
- Progress tracking per user

### 2.4 Training Section

- **Flashcards** - Spaced repetition style review
- **Word translation practice** - Korean ↔ English
- **Sentence translation practice** - Context-based learning
- **Matching cards** - Memory game style matching

### 2.5 User System

- **Authentication:** Google Auth via Supabase
- **User data saved:**
  - Completed lessons
  - Words learned (with accuracy stats)
  - Quiz results and scores
  - Progress tracking

### 2.6 UI Style ("Hangeul Garden")

- Pastel color palette (soft, calming)
- Rounded shapes and borders
- Sprout/flower icon accents
- Calming Korean garden aesthetic
- Mobile-friendly responsive design

## 🌸 3. Technical Stack

### Frontend

- **Next.js** (App Router) - React framework
- **React 18+** - UI library
- **ShadCN UI** - Component library
- **TailwindCSS** - Utility-first CSS

### Backend & Database

- **Supabase** - Backend-as-a-Service
  - Authentication (Google OAuth)
  - PostgreSQL database
  - Row Level Security (RLS) enabled
  - RESTful API auto-generated
  - Real-time subscriptions (optional)

### Hosting & Deployment

- **Vercel** - Frontend hosting (free tier)
- **Supabase Cloud** - Database hosting (free tier)

### Content Storage

- JSON lesson files stored in repository at `/content/lessons`
- Version controlled alongside codebase
- Easy to edit and maintain

## 🌼 4. Folder Structure

```
/app
  /lessons
    page.tsx              # Lessons list page
    /[id]/page.tsx        # Individual lesson page
  /dictionary
    page.tsx              # Dictionary browser page
  /training
    /flashcards/page.tsx  # Flashcard practice
    /matching/page.tsx    # Matching game
    /translation/page.tsx # Translation practice
  /quiz
    page.tsx              # Quiz interface
  /api
    /sync-dictionary/route.ts  # Sync lessons to dictionary
    /generate-quiz/route.ts    # Generate quiz questions

/components
  LessonRenderer.tsx      # Renders lesson content
  WordTooltip.tsx         # Shows word translations on hover
  QuizEngine.tsx          # Quiz question renderer
  Flashcard.tsx           # Flashcard component
  MatchingGame.tsx        # Matching game logic
  DictionarySearch.tsx    # Dictionary search UI

/content
  /lessons
    lesson1.json          # Lesson data files
    lesson2.json
    lesson3.json

/lib
  parseLesson.ts          # Parse lesson JSON
  extractWords.ts         # Tokenize Korean text
  romanize.ts             # Korean → Romanization
  generateQuiz.ts         # Auto-generate quiz questions
  supabase.ts             # Supabase client

/types
  lesson.ts               # TypeScript types
  dictionary.ts
  quiz.ts
```

## 🌺 5. Lesson JSON Schema

Example lesson file (`/content/lessons/lesson1.json`):

```json
{
  "id": "lesson1",
  "title": "Hangul Basics",
  "prerequisite": null,
  "objectives": [
    "Learn basic Korean greetings",
    "Understand polite form"
  ],
  "vocabulary": [
    {
      "word": "안녕하세요",
      "english": "hello",
      "romanization": "annyeonghaseyo",
      "type": "phrase"
    },
    {
      "word": "학생",
      "english": "student",
      "romanization": "haksaeng",
      "type": "noun"
    }
  ],
  "sentences": [
    {
      "korean": "안녕하세요",
      "english": "Hello",
      "romanization": "annyeonghaseyo"
    },
    {
      "korean": "저는 학생이에요",
      "english": "I am a student",
      "romanization": "jeoneun haksaeng-ieyo"
    }
  ],
  "explanation": [
    "안녕하세요 is a polite greeting used any time of day.",
    "This lesson teaches basic syllable structure and greetings."
  ]
}
```

## 🌻 6. Dictionary Table Schema (Supabase)

**Table: `dictionary`**

| column | type | description |
|--------|------|-------------|
| id | uuid (PK) | Primary key |
| word | text | Korean word |
| english | text | English meaning |
| romanization | text | Romanized pronunciation (Revised Romanization) |
| type | text | noun/verb/particle/phrase/etc |
| examples | jsonb | List of example sentences |
| created_at | timestamp | Record creation timestamp |

**Auto-generation rules:**

- Extract all vocabulary entries directly from lesson JSON
- Tokenize Korean sentences to extract individual words
- If word is missing translation data, create placeholder entry:
  - `english`: "" (empty, to be filled later)
  - `romanization`: auto-generated using Revised Romanization rules
  - `type`: "unknown" (to be categorized later)

## 🌙 7. Quiz JSON Schema (Auto-generated)

Example auto-generated quiz question:

```json
{
  "id": "quiz123",
  "type": "vocab",
  "direction": "korean-to-english",
  "question": "안녕하세요",
  "answer": "hello",
  "options": ["hello", "goodbye", "teacher", "thank you"],
  "lessonId": "lesson1"
}
```

## 🍃 8. Quiz Types

### Word → English

- **Question:** Display Korean word
- **Answer:** User selects English meaning from multiple choice
- **Difficulty:** Beginner

### English → Korean

- **Question:** Display English word
- **Answer:** User selects Korean word from multiple choice OR types in Korean
- **Difficulty:** Intermediate

### Sentence Translation

- **Korean → English:** Display Korean sentence, user selects/types English translation
- **English → Korean:** Display English sentence, user selects/types Korean translation
- **Difficulty:** Intermediate to Advanced

### Matching Cards

- **Format:** Generate deck of 8-12 cards
- **Content:** Half Korean, half English definitions
- **Goal:** Match Korean words with English meanings
- **Difficulty:** Beginner to Intermediate

## 🌱 9. API Endpoints (Next.js API Routes)

### 1. POST `/api/sync-dictionary`

**Purpose:** Sync lesson content to database

**Process:**
- Reads all JSON lesson files from `/content/lessons`
- Extracts vocabulary entries
- Tokenizes Korean sentences to find new words
- Inserts/updates entries in `dictionary` table

**Returns:** `{ success: boolean, wordsAdded: number, wordsUpdated: number }`

### 2. GET `/api/generate-quiz`

**Purpose:** Generate quiz questions

**Query Parameters:**
- `type` (required): `vocab` | `sentence` | `matching`
- `lessonId` (optional): Filter by specific lesson
- `count` (optional): Number of questions (default: 10)

**Returns:** Array of quiz question objects

```json
{
  "questions": [
    {
      "id": "quiz123",
      "type": "vocab",
      "question": "안녕하세요",
      "answer": "hello",
      "options": ["hello", "goodbye", "teacher", "thank you"]
    }
  ]
}
```

## 🌷 10. Hangeul Garden Design System

### Color Palette

| Color Name | Hex Code | Usage |
|------------|----------|-------|
| Soft Pink | `#F9DDE2` | Accent, highlights, buttons |
| Mint Green | `#D8F3DC` | Success states, completed items |
| Lavender | `#E7D8F7` | Secondary accents, cards |
| Leaf Green | `#A7D477` | Progress indicators, active states |
| Earth Brown | `#A68B6A` | Text, borders, subtle accents |
| Soft White | `#FFFDF9` | Background, cards |

### Typography

- **Headers:** Nunito (Google Fonts) - friendly, rounded
- **Body:** Noto Sans KR (Google Fonts) - optimal for Korean text
- **Code/Romanization:** Monospace (system font)

### UI Accents

- Small flower/sprout icons as section dividers
- Sprout icon for progress tracking (grows with progress)
- Soft drop shadows (subtle depth)
- Rounded cards & panels (border-radius: 12-16px)
- Gentle hover animations
- Smooth transitions (ease-in-out)

## 🍑 11. User Data Saved in Supabase

**Table: `profiles`**

| column | type | description |
|--------|------|-------------|
| id | uuid (PK) | User ID (linked to auth.users) |
| email | text | User email |
| name | text | Display name |
| avatar_url | text | Profile picture URL |
| created_at | timestamp | Account creation date |

**Table: `progress`**

| column | type | description |
|--------|------|-------------|
| id | uuid (PK) | Primary key |
| user_id | uuid (FK) | References profiles.id |
| lesson_id | text | Lesson identifier |
| completed_at | timestamp | Completion timestamp |

**Table: `learned_words`**

| column | type | description |
|--------|------|-------------|
| id | uuid (PK) | Primary key |
| user_id | uuid (FK) | References profiles.id |
| word_id | uuid (FK) | References dictionary.id |
| first_seen | timestamp | First time word was encountered |
| last_seen | timestamp | Most recent encounter |
| correct_count | integer | Number of correct answers |
| wrong_count | integer | Number of incorrect answers |

**Table: `quiz_results`**

| column | type | description |
|--------|------|-------------|
| id | uuid (PK) | Primary key |
| user_id | uuid (FK) | References profiles.id |
| quiz_id | text | Quiz identifier |
| score | numeric | Quiz score (0-100) |
| completed_at | timestamp | Completion timestamp |

## 🌳 12. Development Roadmap

### Phase 0 — Project Setup ⚙️

- [ ] Initialize Next.js project with App Router
- [ ] Install and configure TailwindCSS
- [ ] Set up ShadCN UI components
- [ ] Create Supabase project
- [ ] Configure Google OAuth in Supabase
- [ ] Set up Supabase client in Next.js
- [ ] Create basic layout and navigation
- [ ] Set up TypeScript types

### Phase 1 — Lessons Engine 📚

- [ ] Create lesson JSON schema/types
- [ ] Build lesson list page (`/lessons`)
- [ ] Build individual lesson page (`/lessons/[id]`)
- [ ] Implement JSON lesson loader
- [ ] Create LessonRenderer component
- [ ] Add clickable word tooltips (WordTooltip component)
- [ ] Test with 2-3 sample lessons

### Phase 2 — Dictionary & Sync 📖

- [ ] Create `dictionary` table in Supabase
- [ ] Implement Korean tokenizer (extract words from sentences)
- [ ] Build `/api/sync-dictionary` endpoint
- [ ] Create romanization utility
- [ ] Build dictionary page with search/filter
- [ ] Test dictionary auto-generation

### Phase 3 — Quiz Engine ✏️

- [ ] Create quiz tables in Supabase
- [ ] Build `/api/generate-quiz` endpoint
- [ ] Implement quiz question generator
- [ ] Create QuizEngine component
- [ ] Build quiz UI (multiple choice, typing, matching)
- [ ] Save quiz results to database
- [ ] Display quiz history/stats

### Phase 4 — Training Section 🎯

- [ ] Build flashcard component and page
- [ ] Implement spaced repetition logic
- [ ] Create translation practice page
- [ ] Build matching game component
- [ ] Track training progress per user

### Phase 5 — Polish & Launch 🌸

- [ ] Apply Hangeul Garden theme (colors, fonts)
- [ ] Add animations and transitions
- [ ] Ensure mobile responsiveness
- [ ] Add loading states and error handling
- [ ] Performance optimization
- [ ] Deploy to Vercel
- [ ] User testing and bug fixes

## 🌸 13. Future Expansion (Post-MVP)

### Mobile App
- React Native implementation
- Shared business logic with web app
- Offline-first architecture
- Push notifications for practice reminders

### Advanced Learning Features
- **Spaced Repetition:** SM-2 algorithm for optimal retention
- **Grammar Paths:** Branching lesson paths based on user goals
- **Pronunciation Checker:** AI-powered speech evaluation
- **Conversation Practice:** AI chatbot for real-world scenarios
- **Writing Practice:** Handwriting recognition for Hangeul

### Community Features
- User-created lessons (moderated)
- Discussion forums per lesson
- Leaderboards and achievements
- Study groups and challenges

### Content Expansion
- Intermediate and advanced lessons
- Specialized vocabulary (business, medical, etc.)
- Cultural notes and context
- Video lessons with native speakers
- Audio pronunciation guides

## 🍀 14. Summary Statement for LLMs

**Hangeul Garden** is a Korean language learning web application designed for beginners.

### Core Technical Stack:
- **Frontend:** Next.js (App Router), React, TailwindCSS, ShadCN UI
- **Backend:** Supabase (PostgreSQL, Auth, RLS)
- **Hosting:** Vercel (frontend) + Supabase Cloud (backend)

### Key Architecture:
- Lessons stored as JSON files in `/content/lessons`
- Auto-parsing system generates:
  - Dictionary entries with Revised Romanization
  - Multiple quiz types (vocab, sentence, matching)
  - Training materials (flashcards, translation exercises)
- Korean word tokenization for automatic dictionary population
- Interactive word tooltips (click/hover for instant translation)

### User Features:
- Google OAuth authentication via Supabase
- Progress tracking (completed lessons, learned words, quiz scores)
- Multiple learning modes:
  - Structured lesson progression
  - Dictionary browsing with search/filter
  - Auto-generated quizzes
  - Training exercises (flashcards, translation, matching games)

### Design System:
- "Hangeul Garden" aesthetic - soft, pastel colors
- Beginner-friendly, calming interface
- Mobile-responsive design
- Nunito (headers) + Noto Sans KR (body/Korean text)

### Development Philosophy:
- Content-first approach (JSON → auto-generation)
- Progressive enhancement (MVP → advanced features)
- Free tier hosting (accessible to all)
- Open to expansion (mobile app, AI features, community)
