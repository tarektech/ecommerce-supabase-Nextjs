import { supabase } from '@/lib/supabase/client';
import { ProductType } from '@/types';

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
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    return data as ProductType[];
  } catch (error) {
    // Re-throw to let the calling component handle the error
    throw error instanceof Error
      ? error
      : new Error('Failed to fetch products');
  }
}
