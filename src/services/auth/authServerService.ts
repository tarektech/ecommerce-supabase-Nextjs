import { createServerSupabase } from "@/lib/supabase/server";
import { ProfileType } from "@/types";

/**
 * Server-side function to get current user with profile data
 * Used for admin authorization and server components
 *
 * @returns Promise resolving to user profile with role or null if not authenticated
 */
export const getCurrentUser = async (): Promise<ProfileType | null> => {
  try {
    const supabase = await createServerSupabase();

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return null;
    }

    // Get user profile with role information
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("profile_id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("Failed to get user profile:", profileError);
      return null;
    }

    return profile;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};
