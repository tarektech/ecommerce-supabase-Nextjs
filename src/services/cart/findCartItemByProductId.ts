import { supabase } from '@/lib/supabase/client';
import { CartItemType } from '@/types';
import { toast } from 'sonner';

export async function findCartItemByProductId(
  cartId: number,
  productId: string
) {
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cartId)
      .eq('product_id', productId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error finding cart item:', error);
      toast.error('Failed to find cart item');
      return null;
    }

    return data as CartItemType | null;
  } catch (error) {
    console.error('Error in findCartItemByProductId:', error);
    toast.error('Something went wrong');
    return null;
  }
}
