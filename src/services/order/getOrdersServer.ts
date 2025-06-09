import { createServerSupabase } from '@/lib/supabase/server';
import { OrderType } from '@/types';

export async function getOrdersServer(userId: string): Promise<OrderType[]> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from('orders')
      .select(
        `
        *,
        order_items (
          *,
          product:products(*)
        ),
        address:addresses(*)
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return [];
    }

    return data as OrderType[];
  } catch (error) {
    console.error('Error in getOrders:', error);
    return [];
  }
}
