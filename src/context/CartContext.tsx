'use client';
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from 'react';
import { ProductType } from '../types';
import * as cartService from '@/services/cart/cartService';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

// Define CartItem interface extending ProductType with quantity for UI consumption
export interface CartItem extends ProductType {
  quantity: number;
  cart_item_id?: number; // Database ID for the cart item
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: ProductType) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, amount: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCartId, setActiveCartId] = useState<number | null>(null);
  const { user } = useAuth();

  // Load cart from database when user changes
  useEffect(() => {
    async function loadCart() {
      if (!user) {
        // Clear cart if user is not logged in
        setCartItems([]);
        setSubtotal(0);
        setTotalItems(0);
        setActiveCartId(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Get or create active cart
        const cart = await cartService.getOrCreateCart();
        if (cart) {
          setActiveCartId(cart.id);

          // Get cart items
          const items = await cartService.getCartItems(cart.id);

          // Transform to CartItem format
          const formattedItems: CartItem[] = items.map((item) => ({
            ...item.product,
            quantity: item.quantity,
            cart_item_id: item.id,
          }));

          setCartItems(formattedItems);
          setSubtotal(cart.total_price);
          setTotalItems(cart.total_items);
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        toast.error('Failed to load your cart');
      } finally {
        setIsLoading(false);
      }
    }

    loadCart();
  }, [user]);

  // Calculate totals when cartItems change
  useEffect(() => {
    if (!isLoading) {
      const total = cartItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      setSubtotal(total);

      const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
      setTotalItems(itemCount);
    }
  }, [cartItems, isLoading]);

  const addToCart = async (product: ProductType) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (!activeCartId) {
      const cart = await cartService.createCart();
      if (!cart) {
        toast.error('Failed to create cart');
        return;
      }
      setActiveCartId(cart.id);
    }

    try {
      // Add item to database
      const result = await cartService.addItemToCart(
        activeCartId as number,
        product.product_id,
        product.price,
        1
      );

      if (result) {
        // Find the item in current cart items
        const existingItemIndex = cartItems.findIndex(
          (item) => item.product_id === product.product_id
        );

        if (existingItemIndex !== -1) {
          // Update existing item
          const updatedItems = [...cartItems];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + 1,
            cart_item_id: result.id,
          };
          setCartItems(updatedItems);
        } else {
          // Add new item
          setCartItems([
            ...cartItems,
            { ...product, quantity: 1, cart_item_id: result.id },
          ]);
        }

        toast.success('Added to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!activeCartId) return;

    try {
      // Find the cart item
      const itemToRemove = cartItems.find(
        (item) => item.product_id === productId
      );

      if (itemToRemove?.cart_item_id) {
        // Remove from database
        const success = await cartService.removeCartItem(
          itemToRemove.cart_item_id
        );

        if (success) {
          // Remove from local state
          setCartItems((prev) =>
            prev.filter((item) => item.product_id !== productId)
          );
          toast.success('Item removed from cart');
        }
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item from cart');
    }
  };

  const updateQuantity = async (productId: string, amount: number) => {
    if (!activeCartId) return;

    try {
      // Find the item in cart
      const itemToUpdate = cartItems.find(
        (item) => item.product_id === productId
      );

      if (!itemToUpdate || !itemToUpdate.cart_item_id) return;

      const newQuantity = itemToUpdate.quantity + amount;

      if (newQuantity <= 0) {
        // If new quantity is zero or less, remove the item
        await removeFromCart(productId);
        return;
      }

      // Update in database
      const result = await cartService.updateCartItemQuantity(
        itemToUpdate.cart_item_id,
        newQuantity
      );

      if (result) {
        // Update in local state
        setCartItems((prev) =>
          prev.map((item) =>
            item.product_id === productId
              ? { ...item, quantity: newQuantity }
              : item
          )
        );
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const clearCart = async () => {
    if (!activeCartId) return;

    try {
      const success = await cartService.clearCart(activeCartId);

      if (success) {
        setCartItems([]);
        toast.success('Cart cleared');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
