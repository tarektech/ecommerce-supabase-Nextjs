import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export async function updateOrderStatus(orderId: string, status: string) {
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
}
