import { supabase } from '@/lib/supabase/client';
import { ReviewType } from '@/types';
import { toast } from 'sonner';

export async function updateReview(
  reviewId: number,
  updates: Partial<ReviewType>
): Promise<ReviewType | null> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', reviewId)
      .select()
      .single();

    if (error) {
      console.error('Error updating review:', error);
      toast.error('Failed to update review');
      return null;
    }

    toast.success('Review updated successfully');
    return data as ReviewType;
  } catch (error) {
    console.error('Error in updateReview:', error);
    toast.error('Something went wrong');
    return null;
  }
}
