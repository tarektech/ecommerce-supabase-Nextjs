import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export async function getAddresses(userId: string) {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    toast.error('Failed to fetch addresses');
    throw error;
  }
  return data;
}
