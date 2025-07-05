import { supabase } from '@/lib/supabase/client';
import { ProductType } from '../../types';
// import { handleCommonErrors } from '@/utils/errorHandling';

export const productService = {
  async getProducts(): Promise<ProductType[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .order('title');

      if (error) {
        console.error('Error fetching products:', error);
        throw new Error(`Failed to fetch products: ${error.message}`);
      }

      return data as ProductType[];
    } catch (error) {
      // Re-throw to let the calling component handle the error
      throw error instanceof Error
        ? error
        : new Error('Failed to fetch products');
    }
  },

  async getProductById(id: string): Promise<ProductType | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('product_id', id)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        if (error.code === 'PGRST116') {
          // No rows returned - product not found
          return null;
        }
        throw new Error(`Failed to fetch product: ${error.message}`);
      }

      return data as ProductType;
    } catch (error) {
      // Re-throw to let the calling component handle the error
      throw error instanceof Error
        ? error
        : new Error('Failed to fetch product');
    }
  },

  async getProductsByCategory(categoryId: number): Promise<ProductType[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('category_id', categoryId)
        .order('title');

      if (error) {
        console.error('Error fetching products by category:', error);
        throw new Error(
          `Failed to fetch products by category: ${error.message}`
        );
      }

      return data as ProductType[];
    } catch (error) {
      // Re-throw to let the calling component handle the error
      throw error instanceof Error
        ? error
        : new Error('Failed to fetch products by category');
    }
  },
};
