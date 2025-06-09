import { supabase } from '@/lib/supabase/client';
import { CategoryType } from '@/types';
import { toast } from 'sonner';

export async function getCategoryById(
  id: number
): Promise<CategoryType | null> {
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
}
