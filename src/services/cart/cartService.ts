import { supabase } from '@/lib/supabase/client';
import { ProductType, CartItemType, CartType, CartStatus } from '../../types';
import { toast } from 'sonner';
import { getClientUser } from '@/lib/supabase/clientUtils';

// Get the active cart for the current user
export async function getActiveCart() {
  try {
    const user = await getClientUser();
    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from('carts')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching cart:', error);
      toast.error('Failed to fetch cart');
      return null;
    }

    return data as CartType | null;
  } catch (error) {
    console.error('Error in getActiveCart:', error);
    toast.error('Something went wrong');
    return null;
  }
}

// Create a new cart for the current user
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

// Get or create an active cart
export async function getOrCreateCart() {
  const cart = await getActiveCart();
  if (cart) {
    return cart;
  }
  return await createCart();
}

// Get cart items with product details
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

// Add item to cart
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

// Update cart item quantity
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

// Remove item from cart
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

// Clear all items from cart
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

// Find cart item by product ID
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
