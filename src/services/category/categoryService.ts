import { supabase } from '@/lib/supabase/client';
import { CategoryType } from '../../types';
import { toast } from 'sonner';

export const categoryService = {
  async getCategories(): Promise<CategoryType[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to fetch categories');
        return [];
      }

      return data as CategoryType[];
    } catch (error) {
      console.error('Error in getCategories:', error);
      toast.error('Something went wrong');
      return [];
    }
  },

  async getCategoryById(id: number): Promise<CategoryType | null> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching category:', error);
        toast.error('Failed to fetch category');
        return null;
      }

      return data as CategoryType;
    } catch (error) {
      console.error('Error in getCategoryById:', error);
      toast.error('Something went wrong');
      return null;
    }
  },
};
