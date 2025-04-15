import { useState, useCallback } from 'react';
import { getOrCreateCart, addItemToCart } from '@/services/cartService';
import { ProductType } from '@/types';

export function useCart() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addToCart = useCallback(async (productId: string, quantity: number) => {
    try {
      setLoading(true);
      setError(null);

      // Get or create active cart
      const cart = await getOrCreateCart();
      if (!cart) {
        throw new Error('Failed to get or create cart');
      }

      // Get product details to get price
      const product = (await fetch(`/api/products/${productId}`).then((res) =>
        res.json()
      )) as ProductType;

      // Add item to cart
      await addItemToCart(cart.id, productId, product.price, quantity);
    } catch (err) {
      setError('Failed to add item to cart');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    addToCart,
    loading,
    error,
  };
}
