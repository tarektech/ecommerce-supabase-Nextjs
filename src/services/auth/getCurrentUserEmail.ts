import { supabaseAuth } from '@/lib/supabase/client';

/**
 * Get current authenticated user's email
 *
 * @returns Promise resolving to the user's email or null if not found/logged in
 */
export async function getCurrentUserEmail(): Promise<string | null> {
  try {
    const {
      data: { user },
      error,
    } = await supabaseAuth.getUser();

    if (error) {
      console.error('AuthService - Failed to get current user:', error);
      throw error;
    }

    return user?.email || null;
  } catch (error) {
    console.error('AuthService - Error getting current user email:', error);
    return null;
  }
}
