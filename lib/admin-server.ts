import { supabaseAdmin } from './supabase-admin';
import { User } from '@supabase/supabase-js';
import { isAdminWithClient } from './admin';

/**
 * Check if a user is an admin using the admin client
 * SERVER-SIDE ONLY - do not import in client components
 */
export async function isAdmin(userId: string): Promise<boolean> {
  return isAdminWithClient(supabaseAdmin, userId);
}

/**
 * Require admin access for API routes
 * Returns the user if they are an admin, throws error otherwise
 * SERVER-SIDE ONLY - do not import in client components
 */
export async function requireAdmin(user: User | null): Promise<User> {
  if (!user) {
    throw new Error('Unauthorized');
  }

  const isUserAdmin = await isAdmin(user.id);

  if (!isUserAdmin) {
    throw new Error('Admin access required');
  }

  return user;
}
