import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export async function getOrderById(orderId: string) {
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
}
