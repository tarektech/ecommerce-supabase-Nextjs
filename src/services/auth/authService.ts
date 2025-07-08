import { supabaseAuth } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

export const authService = {
  /**
   * Update user information in auth.users table
   * This updates the Supabase Auth user record, not just the custom profile
   *
   * @param data Object containing user data to update (email, password, etc.)
   * @returns Promise resolving to the updated user or null on error
   */
  async updateUser(data: { email?: string }): Promise<User | null> {
    try {
      const { data: user, error } = await supabaseAuth.updateUser(data);

      if (error) {
        console.error("AuthService - Failed to update user:", error);
        throw error;
      }

      return user.user;
    } catch (error) {
      console.error("AuthService - Error updating user:", error);
      return null;
    }
  },

  /**
   * Get the current user session
   *
   * @returns Promise resolving to the current session or null if not logged in
   */
  async getSession() {
    try {
      const { data, error } = await supabaseAuth.getSession();

      if (error) {
        throw error;
      }

      return data.session;
    } catch (error) {
      console.error("AuthService - Error getting session:", error);
      return null;
    }
  },

  /**
   * Get user by ID from auth.users
   *
   * @param userId The user ID to fetch
   * @returns Promise resolving to the User object or null on error
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      const {
        data: { user },
        error,
      } = await supabaseAuth.admin.getUserById(userId);

      if (error) {
        console.error("AuthService - Failed to get user by ID:", error);
        throw error;
      }

      return user;
    } catch (error) {
      console.error(
        `AuthService - Error getting user with ID ${userId}:`,
        error,
      );
      return null;
    }
  },

  /**
   * Get current authenticated user's email
   *
   * @returns Promise resolving to the user's email or null if not found/logged in
   */
  async getCurrentUserEmail(): Promise<string | null> {
    try {
      const {
        data: { user },
        error,
      } = await supabaseAuth.getUser();

      if (error) {
        console.error("AuthService - Failed to get current user:", error);
        throw error;
      }

      return user?.email || null;
    } catch (error) {
      console.error("AuthService - Error getting current user email:", error);
      return null;
    }
  },
};
