

import { supabase } from '@/utils/supabase';
import { ProductType } from '@/types';

export const productService = {
  async getProducts(): Promise<ProductType[]> {
    try {
      const { data, error } = await supabase.from('products').select('*');

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  async getProductById(productId: string): Promise<ProductType | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('product_id', productId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error(`Error fetching product with id ${productId}:`, error);
      return null;
    }
  },

  async getProductsByCategory(categoryId: number): Promise<ProductType[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryId);

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error(
        `Error fetching products for category ${categoryId}:`,
        error
      );
      return [];
    }
  },

  async searchProducts(query: string): Promise<ProductType[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`);

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error(`Error searching products with query ${query}:`, error);
      return [];
    }
  },
};
