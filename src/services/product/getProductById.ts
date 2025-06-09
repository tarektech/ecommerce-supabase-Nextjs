import { supabase } from '@/lib/supabase/client';
import { ProductType } from '@/types';
import { toast } from 'sonner';

export async function getProductById(id: string): Promise<ProductType | null> {
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
}
