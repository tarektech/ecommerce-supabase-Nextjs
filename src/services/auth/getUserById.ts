import { supabaseAuth } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

/**
 * Get user by ID from auth.users
 *
 * @param userId The user ID to fetch
 * @returns Promise resolving to the User object or null on error
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const {
      data: { user },
      error,
    } = await supabaseAuth.admin.getUserById(userId);

    if (error) {
      console.error('AuthService - Failed to get user by ID:', error);
      throw error;
    }

    return user;
  } catch (error) {
    console.error(`AuthService - Error getting user with ID ${userId}:`, error);
    return null;
  }
}
