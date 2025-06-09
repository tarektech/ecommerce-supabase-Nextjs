import { supabaseAuth } from '@/lib/supabase/client';

/**
 * Get the current user session
 *
 * @returns Promise resolving to the current session or null if not logged in
 */
export async function getSession() {
  try {
    const { data, error } = await supabaseAuth.getSession();

    if (error) {
      throw error;
    }

    return data.session;
  } catch (error) {
    console.error('AuthService - Error getting session:', error);
    return null;
  }
}
