import { supabase } from '@/lib/supabase/client';
import { ProfileType } from '@/types';
import { toast } from 'sonner';

export async function createProfile(
  userId: string,
  profileData: Partial<ProfileType>
): Promise<ProfileType | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        ...profileData,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      toast.error('Failed to create profile');
      return null;
    }

    return data as ProfileType;
  } catch (error) {
    console.error('Error in createProfile:', error);
    toast.error('Something went wrong');
    return null;
  }
}
