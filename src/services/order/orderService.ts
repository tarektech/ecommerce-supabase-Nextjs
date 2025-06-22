import { AddressType } from '@/types';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface OrderItemInput {
  product_id: string;
  quantity: number;
  price: number;
}

interface CreateOrderParams {
  userId: string;
  items: OrderItemInput[];
  shippingAddress: AddressType;
  totalAmount: number;
  paymentIntentId?: string;
}

export const orderService = {
  async createOrder({
    userId,
    items,
    shippingAddress,
    totalAmount,
    paymentIntentId,
  }: CreateOrderParams) {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          user_id: userId,
          total: totalAmount,
          status: 'pending',
          payment_id: paymentIntentId,
          shipping_address_id: shippingAddress.id,
        },
      ])
      .select()
      .single();

    if (orderError) {
      toast.error('Failed to create order');
      throw orderError;
    }

    // Create order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      toast.error('Failed to create order items');
      throw itemsError;
    }

    return order;
  },

  async getOrders(userId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(
        `
        *,
        order_items (
          *,
          product:products (*)
        ),
        shipping_address:addresses!shipping_address_id (*)
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch orders');
      throw error;
    }
    return data;
  },

  async getOrderById(orderId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(
        `
        *,
        order_items (
          *,
          product:products (*)
        ),
        shipping_address:addresses!shipping_address_id (*)
      `
      )
      .eq('id', orderId)
      .single();

    if (error) {
      toast.error('Failed to fetch order');
      throw error;
    }
    return data;
  },

  async updateOrderStatus(orderId: string, status: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      toast.error('Failed to update order status');
      throw error;
    }
    return data;
  },

  async deleteOrder(orderId: string) {
    // Attempt to delete order; assuming foreign keys handle cascade for order_items
    const { error } = await supabase.from('orders').delete().eq('id', orderId);

    if (error) {
      toast.error('Failed to delete order');
      throw error;
    }
    return true;
  },
};
