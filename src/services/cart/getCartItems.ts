import { supabase } from '@/lib/supabase/client';
import { ProductType, CartItemType } from '@/types';
import { toast } from 'sonner';

export async function getCartItems(cartId: number) {
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .select(
        `
        *,
        product:products(*)
      `
      )
      .eq('cart_id', cartId);

    if (error) {
      console.error('Error fetching cart items:', error);
      toast.error('Failed to fetch cart items');
      return [];
    }

    return data.map(
      (item: {
        id: number;
        cart_id: number;
        product_id: string;
        quantity: number;
        price: number;
        created_at: string;
        updated_at: string;
        product: ProductType;
      }) => ({
        ...item,
        product: item.product as ProductType,
      })
    ) as (CartItemType & { product: ProductType })[];
  } catch (error) {
    console.error('Error in getCartItems:', error);
    toast.error('Something went wrong');
    return [];
  }
}
