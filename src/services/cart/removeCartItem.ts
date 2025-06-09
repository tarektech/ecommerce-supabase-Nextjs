import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export async function removeCartItem(cartItemId: number) {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    if (error) {
      console.error('Error removing cart item:', error);
      toast.error('Failed to remove item');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in removeCartItem:', error);
    toast.error('Something went wrong');
    return false;
  }
}
