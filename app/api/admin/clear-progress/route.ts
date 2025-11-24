import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const ADMIN_EMAIL = 'liu00david@gmail.com'

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

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Find user by email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userId = (profile as { id: string; email: string }).id

    // Count records before deletion (use admin client to bypass RLS)
    const { count: learnedCount } = await supabaseAdmin
      .from('learned_words')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    const { count: progressCount } = await supabaseAdmin
      .from('progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    const { count: quizCount } = await supabaseAdmin
      .from('quiz_results')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Delete progress data (use admin client to bypass RLS)
    const { error: learnedError } = await supabaseAdmin
      .from('learned_words')
      .delete()
      .eq('user_id', userId)

    if (learnedError) {
      console.error('Error deleting learned_words:', learnedError)
    }

    const { error: quizError } = await supabaseAdmin
      .from('quiz_results')
      .delete()
      .eq('user_id', userId)

    if (quizError) {
      console.error('Error deleting quiz_results:', quizError)
    }

    const { error: progressError } = await supabaseAdmin
      .from('progress')
      .delete()
      .eq('user_id', userId)

    if (progressError) {
      console.error('Error deleting progress:', progressError)
    }

    return NextResponse.json({
      success: true,
      message: `Progress cleared for ${email}`,
      deleted_lessons: progressCount || 0,
      deleted_words: learnedCount || 0,
      deleted_quizzes: quizCount || 0,
      errors: {
        learned_words: learnedError?.message,
        quiz_results: quizError?.message,
        progress: progressError?.message
      }
    })
  } catch (error) {
    console.error('Error clearing progress:', error)
    return NextResponse.json(
      { error: 'Failed to clear progress', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
