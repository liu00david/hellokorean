# 🌸 Hangeul Garden

A beginner-friendly Korean language learning platform built with Next.js and Supabase.

## ✨ Features

- 📚 **Interactive Lessons** - Structured learning path with progressive difficulty
- 📖 **Smart Dictionary** - Auto-generated from lesson content
- 💬 **Word Tooltips** - Hover over Korean words to see instant translations
- 🎯 **Practice & Quizzes** - Coming soon!
- 🌸 **Beautiful Design** - Calming pastel "garden" aesthetic

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works great)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/hellokorean.git
   cd hellokorean
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**

   - Go to [supabase.com](https://supabase.com) and create a new project
   - Wait for the project to initialize
   - Go to Project Settings → API
   - Copy your Project URL and anon key

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 Project Structure

```
/app                    # Next.js App Router pages
  /lessons             # Lesson pages
  /dictionary          # Dictionary browser
  /training            # Training exercises
  /quiz                # Quiz interface
  /api                 # API routes
/components            # React components
  /ui                  # ShadCN UI components
/content
  /lessons             # Lesson JSON files
/lib                   # Utility functions
/types                 # TypeScript type definitions
```

## 🎨 Design System

### Colors
- **Soft Pink** (#F9DDE2) - Accent, highlights
- **Mint Green** (#D8F3DC) - Success states
- **Lavender** (#E7D8F7) - Secondary accents
- **Leaf Green** (#A7D477) - Progress indicators
- **Earth Brown** (#A68B6A) - Text, borders
- **Soft White** (#FFFDF9) - Background

### Fonts
- **Nunito** - Headers (friendly, rounded)
- **Noto Sans KR** - Body text (optimal Korean support)

## 📝 Adding New Lessons

Create a new JSON file in `/content/lessons/`:

```json
{
  "id": "lesson4",
  "title": "Your Lesson Title",
  "prerequisite": "lesson3",
  "objectives": ["Learn X", "Understand Y"],
  "vocabulary": [
    {
      "word": "한글",
      "english": "Korean alphabet",
      "romanization": "hangeul",
      "type": "noun"
    }
  ],
  "sentences": [
    {
      "korean": "한글을 배워요",
      "english": "I'm learning Hangeul",
      "romanization": "hangeul-eul baewoyo"
    }
  ],
  "explanation": [
    "Explanation text here..."
  ]
}
```

The lesson will automatically appear in the lessons list!

## 🗄️ Database Setup (Coming Soon)

The app will use Supabase for:
- User authentication (Google OAuth)
- Dictionary storage
- Progress tracking
- Quiz results

Database setup instructions will be added as features are implemented.

## 🛠️ Tech Stack

- **Frontend:** Next.js 15 (App Router), React 18, TypeScript
- **Styling:** TailwindCSS, ShadCN UI
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Deployment:** Vercel

## 📖 Development Roadmap

- [x] Phase 0 - Project Setup
- [x] Phase 1 - Lessons Engine
- [ ] Phase 2 - Dictionary & Sync
- [ ] Phase 3 - Quiz Engine
- [ ] Phase 4 - Training Section
- [ ] Phase 5 - Polish & Launch

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🌱 Acknowledgments

Built with love for Korean language learners everywhere! 🇰🇷

---

**Happy Learning! 화이팅! (hwaiting!)**
