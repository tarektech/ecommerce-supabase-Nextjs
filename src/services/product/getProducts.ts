import { supabase } from '@/lib/supabase/client';
import { ProductType } from '@/types';
import { toast } from 'sonner';

export async function getProducts(): Promise<ProductType[]> {
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
}
