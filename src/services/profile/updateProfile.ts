import { supabase } from '@/lib/supabase/client';
import { ProfileType } from '@/types';
import { toast } from 'sonner';

export async function updateProfile(
  userId: string,
  updates: Partial<ProfileType>
): Promise<ProfileType | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      return null;
    }

    toast.success('Profile updated successfully');
    return data as ProfileType;
  } catch (error) {
    console.error('Error in updateProfile:', error);
    toast.error('Something went wrong');
    return null;
  }
}
