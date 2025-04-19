'use client';

import { createClientSupabase, supabase } from '@/lib/supabase/client';
import { ProfileType } from '@/types';
import { toast } from 'sonner';
import { getClientUser } from '@/lib/supabase/clientUtils';

export const profileService = {
  /**
   * Get profile by user ID
   *
   * @param userId User ID to fetch profile for
   * @returns Promise resolving to profile data or null
   */
  async getProfileById(userId: string): Promise<ProfileType | null> {
    try {
      const supabase = createClientSupabase();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('profile_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to fetch profile');
        return null;
      }

      return data as ProfileType;
    } catch (error) {
      console.error('Error in getProfileById:', error);
      toast.error('Something went wrong');
      return null;
    }
  },

  /**
   * Get current user's profile
   *
   * @returns Promise resolving to profile data or null
   */
  async getCurrentProfile(): Promise<ProfileType | null> {
    try {
      const user = await getClientUser();
      if (!user) {
        return null;
      }

      return await this.getProfileById(user.id);
    } catch (error) {
      console.error('Error in getCurrentProfile:', error);
      toast.error('Something went wrong');
      return null;
    }
  },

  /**
   * Update profile data
   *
   * @param userId User ID to update profile for
   * @param data Profile data to update
   * @returns Promise resolving to updated profile data or null
   */
  async updateProfile(
    userId: string,
    data: Partial<ProfileType>
  ): Promise<ProfileType | null> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select('*')
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        toast.error('Failed to update profile');
        return null;
      }

      return profile as ProfileType;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      toast.error('Something went wrong');
      return null;
    }
  },

  /**
   * Update current user's profile
   *
   * @param data Profile data to update
   * @returns Promise resolving to updated profile data or null
   */
  async updateCurrentProfile(
    data: Partial<ProfileType>
  ): Promise<ProfileType | null> {
    try {
      const user = await getClientUser();
      if (!user) {
        return null;
      }

      return await this.updateProfile(user.id, data);
    } catch (error) {
      console.error('Error in updateCurrentProfile:', error);
      toast.error('Something went wrong');
      return null;
    }
  },

  /**
   * Delete profile data
   *
   * @param userId User ID to delete profile for
   * @returns Promise resolving to true if successful, false otherwise
   */
  async deleteProfile(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Error deleting profile:', error);
        toast.error('Failed to delete profile');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteProfile:', error);
      toast.error('Something went wrong');
      return false;
    }
  },

  /**
   * Delete current user's profile
   *
   * @returns Promise resolving to true if successful, false otherwise
   */
  async deleteCurrentProfile(): Promise<boolean> {
    try {
      const user = await getClientUser();
      if (!user) {
        return false;
      }

      return await this.deleteProfile(user.id);
    } catch (error) {
      console.error('Error in deleteCurrentProfile:', error);
      toast.error('Something went wrong');
      return false;
    }
  },
};
