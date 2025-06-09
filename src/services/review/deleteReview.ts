import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export async function deleteReview(reviewId: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
      return false;
    }

    toast.success('Review deleted successfully');
    return true;
  } catch (error) {
    console.error('Error in deleteReview:', error);
    toast.error('Something went wrong');
    return false;
  }
}
