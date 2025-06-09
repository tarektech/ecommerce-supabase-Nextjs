import { supabase } from '@/lib/supabase/client';
import { ReviewType } from '@/types';
import { toast } from 'sonner';

interface CreateReviewParams {
  productId: string;
  userId: string;
  rating: number;
  comment?: string;
}

export async function createReview({
  productId,
  userId,
  rating,
  comment,
}: CreateReviewParams): Promise<ReviewType | null> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        product_id: productId,
        user_id: userId,
        rating,
        comment: comment || '',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating review:', error);
      toast.error('Failed to create review');
      return null;
    }

    toast.success('Review created successfully');
    return data as ReviewType;
  } catch (error) {
    console.error('Error in createReview:', error);
    toast.error('Something went wrong');
    return null;
  }
}
