import { supabase } from '../utils/supabase';
import { OrderType, OrderItemType } from '@/types';
import { PostgrestError } from '@supabase/supabase-js';
import { logError } from '@/utils/errorHandling';

interface OrderResponse {
  data: OrderType[] | null;
  error: PostgrestError | null;
}

export const orderService = {
  async getOrders(userId: string): Promise<OrderType[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(
          `
          *,
          order_items (
            *,
            product: product_id (
              id,
              title,
              image
            )
          )
        `
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  },

  async getOrderById(id: number): Promise<OrderType | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(
          `
          *,
          order_items (
            *,
            product: product_id (
              id,
              title,
              image
            )
          )
        `
        )
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error(`Error fetching order with id ${id}:`, error);
      return null;
    }
  },

  async createOrder(
    order: Omit<OrderType, 'id'>,
    orderItems: Omit<OrderItemType, 'id' | 'order_id'>[]
  ): Promise<OrderType | null> {
    // Start a transaction by using a single supabase call
    try {
      // Insert the order first
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert(order)
        .select()
        .single();

      if (orderError) {
        throw new Error(orderError.message);
      }

      if (!orderData) {
        throw new Error('Failed to create order');
      }

      // Insert order items with the new order ID
      const orderItemsWithOrderId = orderItems.map((item) => ({
        ...item,
        order_id: orderData.id,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsWithOrderId);

      if (itemsError) {
        throw new Error(itemsError.message);
      }

      // Return the full order with items
      return this.getOrderById(orderData.id);
    } catch (error) {
      console.error('Error creating order:', error);
      return null;
    }
  },

  async updateOrderStatus(
    id: number,
    status: string
  ): Promise<OrderType | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error(`Error updating order status for id ${id}:`, error);
      return null;
    }
  },

  async getUserOrders(userId: string): Promise<OrderResponse> {
    const { data, error } = await supabase
      .from('orders')
      .select(
        `
        id,
        total,
        status,
        created_at,
        order_items (
          id,
          quantity,
          price,
          product:product_id (
            product_id,
            title,
            image
          )
        )
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      logError('fetching user orders', error);
    }

    return { data: data as unknown as OrderType[], error };
  },
};
