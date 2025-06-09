import { supabase } from '@/lib/supabase/client';
import { CartItemType } from '@/types';
import { toast } from 'sonner';

export async function addItemToCart(
  cartId: number,
  productId: string,
  price: number,
  quantity: number = 1
) {
  try {
    // Check if the item already exists in the cart
    const { data: existingItems, error: fetchError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cartId)
      .eq('product_id', productId);

    if (fetchError) {
      console.error('Error checking existing cart item:', fetchError);
      toast.error('Failed to check cart');
      return null;
    }

    if (existingItems && existingItems.length > 0) {
      // Update existing item quantity
      const existingItem = existingItems[0];
      const newQuantity = existingItem.quantity + quantity;

      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
        .eq('id', existingItem.id)
        .select('*')
        .single();

      if (error) {
        console.error('Error updating cart item:', error);
        toast.error('Failed to update cart');
        return null;
      }

      return data as CartItemType;
    } else {
      // Insert new item
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cartId,
          product_id: productId,
          quantity,
          price,
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error adding item to cart:', error);
        toast.error('Failed to add item to cart');
        return null;
      }

      return data as CartItemType;
    }
  } catch (error) {
    console.error('Error in addItemToCart:', error);
    toast.error('Something went wrong');
    return null;
  }
}
