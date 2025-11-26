import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/admin-server'

// Create admin client with service role key for user deletion
const getAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export async function POST(request: Request) {
  try {
    const adminClient = getAdminClient()

    // Check authentication with server client
    const { createServerClient } = await import('@/lib/supabase-server')
    const supabase = await createServerClient()
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

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Prevent admin from deleting themselves
    if (user.email === email) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    // Find user by email
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userId = profile.id

    // Delete user data from tables (in order due to foreign keys)
    await adminClient.from('learned_words').delete().eq('user_id', userId)
    await adminClient.from('quiz_results').delete().eq('user_id', userId)
    await adminClient.from('progress').delete().eq('user_id', userId)
    await adminClient.from('profiles').delete().eq('id', userId)

    // Delete from auth.users using admin client
    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(userId)

    if (deleteAuthError) {
      console.error('Error deleting auth user:', deleteAuthError)
      return NextResponse.json(
        { error: 'Failed to delete user from auth', details: deleteAuthError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `User ${email} deleted successfully`,
      userId
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
