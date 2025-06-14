import { supabase } from '@/lib/supabase/client';
import { ProductType } from '@/types';
import { toast } from 'sonner';

/**
 * Fetches all products from the database with category information
 *
 * Usage with TanStack Query:
 * ```tsx
 * import { useProducts } from '@/hooks/queries/use-products';
 *
 * function ProductsList() {
 *   const { data: products, isLoading, error } = useProducts();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error loading products</div>;
 *
 *   return (
 *     <div>
 *       {products?.map(product => (
 *         <div key={product.product_id}>{product.title}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
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
