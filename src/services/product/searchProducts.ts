import { supabase } from '@/lib/supabase/client';
import { ProductType } from '@/types';
import { toast } from 'sonner';

export async function searchProducts(query: string): Promise<ProductType[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
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
}
