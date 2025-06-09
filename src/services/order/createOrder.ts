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

export async function createOrder({
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
}
