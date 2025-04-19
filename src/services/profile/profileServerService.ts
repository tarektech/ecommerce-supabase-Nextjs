import { supabase } from '@/lib';
import { createServerSupabase } from '@/lib/supabase/server';
import { ProfileType } from '@/types';

export const profileServerService = {
  async getProfileById(userId: string): Promise<ProfileType | null> {
    try {
      const supabase = await createServerSupabase();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('profile_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error(`Error fetching profile with id ${userId}:`, error);
      return null;
    }
  },

  async updateProfile(
    userId: string,
    profile: Partial<ProfileType>
  ): Promise<ProfileType | null> {
    try {
      // Ensure we have a valid userId
      if (!userId) {
        console.error('ProfileService - Invalid userId provided:', userId);
        return null;
      }

      // Validate email if provided
      if (profile.email !== undefined) {
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (profile.email && !emailRegex.test(profile.email)) {
          console.error(
            'ProfileService - Invalid email format:',
            profile.email
          );
          throw new Error('Invalid email format provided');
        }
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('profile_id', userId)
        .select()
        .single();

      if (error) {
        console.error('ProfileService - Update error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
        });

        // Check if it's a Row Level Security (RLS) error
        if (error.code === '42501') {
          console.error(
            'ProfileService - This appears to be an RLS policy violation. Check your database policies.'
          );
        }

        throw new Error(error.message);
      }

      return data;
    } catch (error: unknown) {
      const err = error as Error;
      console.error(`Error updating profile with id ${userId}:`, err);
      console.error('Error stack:', err.stack);
      return null;
    }
  },

  async createProfile(profile: ProfileType): Promise<ProfileType | null> {
    try {
      // Validate email if provided
      if (profile.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(profile.email)) {
          console.error(
            'ProfileService - Invalid email format in create:',
            profile.email
          );
          throw new Error('Invalid email format provided');
        }
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert(profile)
        .select()
        .single();

      if (error) {
        // Check for duplicate key violation (profile already exists)
        if (
          error.message &&
          error.message.includes(
            'duplicate key value violates unique constraint'
          )
        ) {
          console.log(
            'Profile already exists (duplicate key), this is likely due to a race condition.'
          );

          // Try to fetch the existing profile instead
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('profile_id', profile.profile_id)
            .single();

          if (existingProfile) {
            console.log('Successfully retrieved existing profile');
            return existingProfile;
          }
        }

        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error creating profile:', error);
      return null;
    }
  },
};
