import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export async function getOrders(userId: string) {
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
}
