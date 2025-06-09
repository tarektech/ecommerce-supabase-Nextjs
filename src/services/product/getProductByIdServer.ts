import { createServerSupabase } from '@/lib/supabase/server';
import { ProductType } from '@/types';

export async function getProductByIdServer(
  id: string
): Promise<ProductType | null> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('product_id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }

    return data as ProductType;
  } catch (error) {
    console.error('Error in getProductByIdServer:', error);
    return null;
  }
}
