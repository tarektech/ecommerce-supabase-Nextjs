import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export async function deleteAddress(addressId: string) {
  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', addressId);

  if (error) {
    toast.error('Failed to delete address');
    throw error;
  }
  return true;
}
