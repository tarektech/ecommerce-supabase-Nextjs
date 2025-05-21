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
   * Delete avatars for a specific user from storage
   *
   * @param userId User ID whose avatars should be deleted
   * @param currentAvatarUrl Optional current avatar URL to preserve
   * @returns Promise resolving to true if successful, false otherwise
   */
  async deleteUserAvatars(
    userId: string,
    currentAvatarUrl?: string
  ): Promise<boolean> {
    try {
      if (!userId) {
        console.error('Invalid userId for avatar deletion');
        return false;
      }

      // Determine which bucket the current avatar is in (if any)
      let currentBucket = null;
      let currentPath = null;

      if (currentAvatarUrl) {
        const bucketNames = [
          'default',
          'avatars',
          'images',
          'public',
          'storage',
        ];
        for (const bucket of bucketNames) {
          if (currentAvatarUrl.includes(`/${bucket}/`)) {
            currentBucket = bucket;
            // Extract the path from the URL (everything after bucket name)
            const urlParts = currentAvatarUrl.split(`/${bucket}/`);
            if (urlParts.length > 1) {
              currentPath = urlParts[1];
            }
            break;
          }
        }
      }

      // List of bucket names to try
      const bucketNames = ['default', 'avatars', 'images', 'public', 'storage'];
      let successCount = 0;

      // Try to list and delete files from each bucket
      for (const bucketName of bucketNames) {
        try {
          // List all files in the user's folder
          const { data: files, error: listError } = await supabase.storage
            .from(bucketName)
            .list(userId);

          if (listError) {
            console.log(
              `Error listing files in bucket "${bucketName}":`,
              listError
            );
            continue;
          }

          if (!files || files.length === 0) {
            continue;
          }

          // Get file paths to delete (excluding current avatar if it's in this bucket)
          const filesToDelete = files
            .map((file) => `${userId}/${file.name}`)
            .filter((path) => {
              // Skip the current avatar if it's in this bucket
              if (
                bucketName === currentBucket &&
                currentPath &&
                currentPath.includes(path)
              ) {
                return false;
              }
              return true;
            });

          if (filesToDelete.length > 0) {
            // Delete the files
            const { error: deleteError } = await supabase.storage
              .from(bucketName)
              .remove(filesToDelete);

            if (deleteError) {
              console.log(
                `Error deleting files from bucket "${bucketName}":`,
                deleteError
              );
            } else {
              successCount += filesToDelete.length;
            }
          }
        } catch (error) {
          console.log(`Error processing bucket "${bucketName}":`, error);
        }
      }

      return successCount > 0;
    } catch (error) {
      console.error('Error in deleteUserAvatars:', error);
      return false;
    }
  },

  /**
   * Upload avatar image to Supabase Storage
   *
   * @param userId User ID to associate with the avatar
   * @param file File to upload
   * @param currentAvatarUrl Optional current avatar URL to replace
   * @returns Promise resolving to public URL of the uploaded avatar
   */
  async uploadAvatar(
    userId: string,
    file: File,
    currentAvatarUrl?: string
  ): Promise<string | null> {
    try {
      if (!userId || !file) {
        console.error('Invalid userId or file for avatar upload');
        return null;
      }

      // Get file extension and create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()
        .toString(36)
        .substring(2, 15)}.${fileExt}`;

      // Store in user-specific folder to enforce ownership through RLS policies
      // Format: userId/avatar-filename.ext
      const filePath = `${userId}/${fileName}`;

      // List of bucket names to try in order
      const bucketNames = ['default', 'avatars', 'images', 'public', 'storage'];
      let uploadError = null;
      let uploadedPath = null;
      let bucketUsed = null;

      // Try to upload to each bucket until one works
      for (const bucketName of bucketNames) {
        try {
          const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true,
            });

          if (!error) {
            // Upload succeeded
            uploadedPath = data?.path || filePath;
            bucketUsed = bucketName;
            break; // Exit the loop if upload is successful
          } else {
            uploadError = error;
            console.log(`Failed to upload to bucket "${bucketName}":`, error);
          }
        } catch (error) {
          console.log(`Error trying bucket "${bucketName}":`, error);
          // Continue to next bucket
        }
      }

      // If no bucket worked
      if (!bucketUsed) {
        console.error(
          'All bucket upload attempts failed. Last error:',
          uploadError
        );
        throw new Error(
          'Failed to upload image. Storage is not properly configured.'
        );
      }

      // Get the public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from(bucketUsed)
        .getPublicUrl(uploadedPath || filePath);

      if (!publicUrlData?.publicUrl) {
        throw new Error('Failed to get public URL for uploaded image');
      }

      console.log(`Successfully uploaded to bucket "${bucketUsed}"`);

      // Delete previous avatars after successful upload
      // We don't need to wait for this to complete or handle errors
      this.deleteUserAvatars(userId, publicUrlData.publicUrl)
        .then((success) => {
          if (success) {
            console.log('Previous avatars cleaned up successfully');
          }
        })
        .catch((err) => {
          console.error('Failed to clean up previous avatars:', err);
        });

      // Return the public URL
      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error in uploadAvatar:', error);
      toast.error('Failed to upload avatar');
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
