import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/admin-server'
import { readdir, readFile } from 'fs/promises'
import { join } from 'path'

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

interface DialogueMessage {
  speaker: string
  korean: string
  english: string
  romanization: string
}

interface Dialogue {
  title: string
  messages: DialogueMessage[]
}

interface Lesson {
  id: string
  group_id: string
  version?: string
  title: string
  prerequisite?: string
  objectives: string[]
  context?: string[]
  vocabulary: LessonVocabulary[]
  sentences: LessonSentence[]
  explanation: string[]
  dialogue?: Dialogue
}

interface LessonGroup {
  id: string
  title: string
  description: string
  order_index: number
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()

    // Check authentication and admin status
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin (throws error if not)
    try {
      await requireAdmin(user)
    } catch (error) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Step 1: Sync lesson groups (use admin client to bypass RLS)
    const groupsFilePath = join(process.cwd(), 'content', 'lesson-groups.json')
    const groupsContent = await readFile(groupsFilePath, 'utf-8')
    const lessonGroups: LessonGroup[] = JSON.parse(groupsContent)

    for (const group of lessonGroups) {
      const { error: groupError } = await supabaseAdmin
        .from('lesson_groups')
        .upsert({
          id: group.id,
          title: group.title,
          description: group.description,
          order_index: group.order_index
        }, {
          onConflict: 'id'
        })

      if (groupError) {
        console.error('Error upserting lesson group:', group.id, groupError)
      }
    }

    // Step 2: Read all lesson files from content/lessons directory
    const lessonsDir = join(process.cwd(), 'content', 'lessons')
    const files = await readdir(lessonsDir)
    const lessonFiles = files.filter(file => file.endsWith('.json') && !file.includes('archive'))

    const lessons: Lesson[] = []
    const allWords: Map<string, any> = new Map()

    // First, fetch existing lessons from database to check versions
    const { data: existingLessons, error: fetchError } = await supabase
      .from('lessons')
      .select('id, version')

    if (fetchError) {
      console.error('Error fetching existing lessons:', fetchError)
    }

    // Create a map of existing lesson versions
    const existingVersions = new Map<string, string>()
    if (existingLessons) {
      existingLessons.forEach((lesson: { id: string; version?: string | null }) => {
        existingVersions.set(lesson.id, lesson.version || '')
      })
    }

    const syncStats = {
      total: 0,
      updated: 0,
      skipped: 0,
      updatedLessons: [] as string[],
      skippedLessons: [] as string[]
    }

    // Read each lesson file
    for (let i = 0; i < lessonFiles.length; i++) {
      const file = lessonFiles[i]
      const filePath = join(lessonsDir, file)
      const content = await readFile(filePath, 'utf-8')
      const lesson: Lesson = JSON.parse(content)

      lessons.push(lesson)
      syncStats.total++

      // Extract vocabulary for dictionary (always do this to keep dictionary updated)
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

    // Insert/update lessons in database (only if version changed or new)
    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i]
      const existingVersion = existingVersions.get(lesson.id)

      // Check if we need to sync this lesson
      const needsSync = !existingVersion || existingVersion !== lesson.version

      if (needsSync) {
        // Calculate order_index from lesson ID (e.g., "2.3" -> 2003)
        const [major, minor] = lesson.id.split('.').map(n => parseInt(n, 10))
        const orderIndex = (major * 1000) + minor

        const { error: lessonError } = await supabaseAdmin
          .from('lessons')
          .upsert({
            id: lesson.id,
            group_id: lesson.group_id,
            version: lesson.version,
            title: lesson.title,
            objectives: lesson.objectives,
            context: lesson.context || [],
            vocabulary: lesson.vocabulary,
            sentences: lesson.sentences,
            explanation: lesson.explanation,
            dialogue: lesson.dialogue || null,
            order_index: orderIndex
          }, {
            onConflict: 'id'
          })

        if (lessonError) {
          console.error('Error upserting lesson:', lesson.id, lessonError)
        } else {
          syncStats.updated++
          syncStats.updatedLessons.push(lesson.id)
        }
      } else {
        syncStats.skipped++
        syncStats.skippedLessons.push(lesson.id)
        console.log(`Skipped lesson ${lesson.id} - version unchanged (${lesson.version})`)
      }
    }

    // Insert/update dictionary words (only if any lessons were updated)
    const wordsArray = Array.from(allWords.values())
    let wordsSyncCount = 0

    if (syncStats.updated > 0) {
      // Only sync words if at least one lesson was updated
      // This maintains correct lesson associations across all words
      for (const word of wordsArray) {
        const { error: wordError } = await supabaseAdmin
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
        } else {
          wordsSyncCount++
        }
      }
      console.log(`Synced ${wordsSyncCount} dictionary words (lessons changed)`)
    } else {
      console.log('Skipped dictionary sync - no lesson changes detected')
    }

    return NextResponse.json({
      success: true,
      lessonsTotal: syncStats.total,
      lessonsUpdated: syncStats.updated,
      lessonsSkipped: syncStats.skipped,
      updatedLessons: syncStats.updatedLessons,
      skippedLessons: syncStats.skippedLessons,
      wordsCount: wordsSyncCount,
      wordsSyncSkipped: syncStats.updated === 0
    })
  } catch (error) {
    console.error('Error syncing content:', error)
    return NextResponse.json(
      { error: 'Failed to sync content', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
