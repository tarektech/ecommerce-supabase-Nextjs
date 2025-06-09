import { supabase } from '@/lib/supabase/client';
import { ProfileType } from '@/types';
import { toast } from 'sonner';

export async function getProfile(userId: string): Promise<ProfileType | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
      toast.error('Failed to fetch profile');
      return null;
    }

    return data as ProfileType | null;
  } catch (error) {
    console.error('Error in getProfile:', error);
    toast.error('Something went wrong');
    return null;
  }
}
