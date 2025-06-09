import { supabase } from '@/lib/supabase/client';
import { CategoryType } from '@/types';
import { toast } from 'sonner';

export async function getCategories(): Promise<CategoryType[]> {
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
}
