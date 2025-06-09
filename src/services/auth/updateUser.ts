import { supabaseAuth } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

/**
 * Update user information in auth.users table
 * This updates the Supabase Auth user record, not just the custom profile
 *
 * @param data Object containing user data to update (email, password, etc.)
 * @returns Promise resolving to the updated user or null on error
 */
export async function updateUser(data: {
  email?: string;
}): Promise<User | null> {
  try {
    const { data: user, error } = await supabaseAuth.updateUser(data);

    if (error) {
      console.error('AuthService - Failed to update user:', error);
      throw error;
    }

    return user.user;
  } catch (error) {
    console.error('AuthService - Error updating user:', error);
    return null;
  }
}
