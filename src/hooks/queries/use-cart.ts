import {
  getOrCreateCart,
  addItemToCart,
  removeCartItem,
  updateCartItemQuantity,
  getCartItems,
} from '@/services/cart/cartService';
import { CartItemType, ProductType } from '@/types';
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';

// Query Keys
export const cartKeys = {
  all: ['cart'] as const,
  items: () => [...cartKeys.all, 'items'] as const,
  item: (id: number) => [...cartKeys.items(), id] as const,
};

// Get cart items
export function useCartItems(
  cartId: number | undefined,
  options?: UseQueryOptions<(CartItemType & { product: ProductType })[]>
) {
  return useQuery({
    queryKey: cartKeys.items(),
    queryFn: () => (cartId ? getCartItems(cartId) : Promise.resolve([])),
    enabled: !!cartId,
    ...options,
  });
}

// Add item to cart
export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
      price,
    }: {
      productId: string;
      quantity: number;
      price: number;
    }) => {
      // Get or create active cart
      const cart = await getOrCreateCart();
      if (!cart) {
        throw new Error('Failed to get or create cart');
      }

      // Add item to cart
      await addItemToCart(cart.id, productId, price, quantity);

      return cart.id;
    },
    onSuccess: () => {
      // Invalidate cart items query to trigger refetch
      queryClient.invalidateQueries({ queryKey: cartKeys.items() });
    },
  });
}

// Remove item from cart
export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ cartItemId }: { cartItemId: number }) => {
      await removeCartItem(cartItemId);
      return cartItemId;
    },
    onSuccess: () => {
      // Invalidate cart items query to trigger refetch
      queryClient.invalidateQueries({ queryKey: cartKeys.items() });
    },
  });
}

// Update cart item quantity
export function useUpdateCartItemQuantity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      cartItemId,
      quantity,
    }: {
      cartItemId: number;
      quantity: number;
    }) => {
      await updateCartItemQuantity(cartItemId, quantity);
      return cartItemId;
    },
    onSuccess: () => {
      // Invalidate cart items query to trigger refetch
      queryClient.invalidateQueries({ queryKey: cartKeys.items() });
    },
  });
}
