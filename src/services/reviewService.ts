import { supabase } from '../utils/supabase';
import { ReviewType } from '@/types';

export const reviewService = {
  async getProductReviews(productId: number): Promise<ReviewType[]> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(
          `
          *,
          profile: user_id (
            username,
            avatar_url
          )
        `
        )
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error(`Error fetching reviews for product ${productId}:`, error);
      return [];
    }
  },

  async getUserReviews(userId: string): Promise<ReviewType[]> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(
          `
          *,
          product: product_id (
            id,
            title,
            image
          )
        `
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error(`Error fetching reviews for user ${userId}:`, error);
      return [];
    }
  },

  async createReview(
    review: Omit<ReviewType, 'id' | 'created_at'>
  ): Promise<ReviewType | null> {
    try {
      // Check if user already reviewed this product
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('user_id', review.user_id)
        .eq('product_id', review.product_id)
        .single();

      // If user already reviewed this product, update the existing review
      if (existingReview) {
        return this.updateReview(existingReview.id, {
          rating: review.rating,
          comment: review.comment,
        });
      }

      // Otherwise, create a new review
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          ...review,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error creating review:', error);
      return null;
    }
  },

  async updateReview(
    id: number,
    review: Partial<ReviewType>
    ): Promise<ReviewType | null> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .update(review)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error(`Error updating review with id ${id}:`, error);
      return null;
    }
  },

  async deleteReview(id: number): Promise<boolean> {
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (error) {
      console.error(`Error deleting review with id ${id}:`, error);
      return false;
    }
  },
};
