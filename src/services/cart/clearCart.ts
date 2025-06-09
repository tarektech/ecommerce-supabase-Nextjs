import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export async function clearCart(cartId: number) {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cartId);

    if (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in clearCart:', error);
    toast.error('Something went wrong');
    return false;
  }
}
