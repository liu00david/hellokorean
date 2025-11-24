import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { readdir, readFile } from 'fs/promises'
import { join } from 'path'

const ADMIN_EMAIL = 'liu00david@gmail.com'

interface LessonVocabulary {
  word: string
  english: string
  romanization: string
  type?: string
}

interface LessonSentence {
  korean: string
  english: string
  romanization: string
}

interface LessonExplanation {
  type: 'text' | 'example'
  content: string
  translation?: string
  romanization?: string
}

interface Lesson {
  id: string
  version?: string
  title: string
  prerequisite?: string
  objectives: string[]
  context?: string[]
  vocabulary: LessonVocabulary[]
  sentences: LessonSentence[]
  explanation: LessonExplanation[]
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    if (user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Read all lesson files from content/lessons directory
    const lessonsDir = join(process.cwd(), 'content', 'lessons')
    const files = await readdir(lessonsDir)
    const lessonFiles = files.filter(file => file.endsWith('.json'))

    const lessons: Lesson[] = []
    const allWords: Map<string, any> = new Map()

    // Read each lesson file
    for (let i = 0; i < lessonFiles.length; i++) {
      const file = lessonFiles[i]
      const filePath = join(lessonsDir, file)
      const content = await readFile(filePath, 'utf-8')
      const lesson: Lesson = JSON.parse(content)

      lessons.push(lesson)

      // Extract vocabulary for dictionary
      lesson.vocabulary.forEach((vocab) => {
        const key = vocab.word.toLowerCase()

        // Find example sentences from the lesson
        const examples = lesson.sentences
          .filter(s => s.korean.includes(vocab.word))
          .map(s => ({
            korean: s.korean,
            english: s.english,
            romanization: s.romanization
          }))

        if (!allWords.has(key)) {
          allWords.set(key, {
            word: vocab.word,
            english: vocab.english,
            romanization: vocab.romanization,
            type: vocab.type || 'unknown',
            examples: examples.length > 0 ? examples : null,
            lessons: [lesson.id] // Track which lessons this word appears in
          })
        } else {
          // Word already exists, add this lesson to its lessons array
          const existing = allWords.get(key)
          if (!existing.lessons.includes(lesson.id)) {
            existing.lessons.push(lesson.id)
          }
          // Merge examples
          if (examples.length > 0) {
            existing.examples = existing.examples
              ? [...existing.examples, ...examples]
              : examples
          }
        }
      })
    }

    // Insert/update lessons in database
    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i]
      const { error: lessonError } = await supabase
        .from('lessons')
        .upsert({
          id: lesson.id,
          version: lesson.version,
          title: lesson.title,
          objectives: lesson.objectives,
          context: lesson.context || [],
          vocabulary: lesson.vocabulary,
          sentences: lesson.sentences,
          explanation: lesson.explanation,
          order_index: i
        }, {
          onConflict: 'id'
        })

      if (lessonError) {
        console.error('Error upserting lesson:', lesson.id, lessonError)
      }
    }

    // Insert/update dictionary words
    const wordsArray = Array.from(allWords.values())
    for (const word of wordsArray) {
      const { error: wordError } = await supabase
        .from('dictionary')
        .upsert({
          word: word.word,
          english: word.english,
          romanization: word.romanization,
          type: word.type,
          examples: word.examples,
          lessons: word.lessons
        }, {
          onConflict: 'word'
        })

      if (wordError) {
        console.error('Error upserting word:', word.word, wordError)
      }
    }

    return NextResponse.json({
      success: true,
      lessonsCount: lessons.length,
      wordsCount: wordsArray.length
    })
  } catch (error) {
    console.error('Error syncing content:', error)
    return NextResponse.json(
      { error: 'Failed to sync content', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
