import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Check if a user is an admin using a Supabase client
 * This can be used with ANY Supabase client (user's client or admin client)
 * Safe for both client-side and server-side use
 */
export async function isAdminWithClient(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    if (error) {
      // User not found in admins table
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}
