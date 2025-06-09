import { supabase } from '@/lib/supabase/client';
import { ProductType } from '@/types';
import { toast } from 'sonner';

export async function getProductsByCategory(
  categoryId: number
): Promise<ProductType[]> {
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
}
