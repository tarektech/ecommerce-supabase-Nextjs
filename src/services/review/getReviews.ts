import { supabase } from '@/lib/supabase/client';
import { ReviewType } from '@/types';
import { toast } from 'sonner';

export async function getReviews(productId: string): Promise<ReviewType[]> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to fetch reviews');
      return [];
    }

    return data as ReviewType[];
  } catch (error) {
    console.error('Error in getReviews:', error);
    toast.error('Something went wrong');
    return [];
  }
}
