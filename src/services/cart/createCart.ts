import { supabase } from '@/lib/supabase/client';
import { CartType, CartStatus } from '@/types';
import { toast } from 'sonner';
import { getClientUser } from '@/lib/supabase/clientUtils';

export async function createCart() {
  try {
    const user = await getClientUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('carts')
      .insert({
        user_id: user.id,
        status: 'active' as CartStatus,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating cart:', error);
      toast.error('Failed to create cart');
      return null;
    }

    return data as CartType;
  } catch (error) {
    console.error('Error in createCart:', error);
    toast.error('Something went wrong');
    return null;
  }
}
