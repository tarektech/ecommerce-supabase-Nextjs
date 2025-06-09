import { supabase } from '@/lib/supabase/client';
import { CartItemType } from '@/types';
import { toast } from 'sonner';
import { removeCartItem } from './removeCartItem';

export async function updateCartItemQuantity(
  cartItemId: number,
  quantity: number
) {
  try {
    if (quantity <= 0) {
      // If quantity is 0 or less, remove the item
      return await removeCartItem(cartItemId);
    }

    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq('id', cartItemId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating cart item quantity:', error);
      toast.error('Failed to update quantity');
      return null;
    }

    return data as CartItemType;
  } catch (error) {
    console.error('Error in updateCartItemQuantity:', error);
    toast.error('Something went wrong');
    return null;
  }
}
