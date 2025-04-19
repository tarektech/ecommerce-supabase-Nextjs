import { supabase } from '@/lib/supabase/client';
import { ProductType } from '../../types';
import { toast } from 'sonner';

export const productService = {
  async getProducts(): Promise<ProductType[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .order('title');

      if (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to fetch products');
        return [];
      }

      return data as ProductType[];
    } catch (error) {
      console.error('Error in getProducts:', error);
      toast.error('Something went wrong');
      return [];
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
        toast.error('Failed to fetch product');
        return null;
      }

      return data as ProductType;
    } catch (error) {
      console.error('Error in getProductById:', error);
      toast.error('Something went wrong');
      return null;
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
        toast.error('Failed to fetch products');
        return [];
      }

      return data as ProductType[];
    } catch (error) {
      console.error('Error in getProductsByCategory:', error);
      toast.error('Something went wrong');
      return [];
    }
  },

  async searchProducts(query: string): Promise<ProductType[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .ilike('title', `%${query}%`)
        .order('title');

      if (error) {
        console.error('Error searching products:', error);
        toast.error('Failed to search products');
        return [];
      }

      return data as ProductType[];
    } catch (error) {
      console.error('Error in searchProducts:', error);
      toast.error('Something went wrong');
      return [];
    }
  },
};
