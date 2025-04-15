import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { ProductType } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { ProductCard } from '@/components/ProductCard';
import { productService } from '@/services/productService';

export default function Home() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    // Fetch data from Supabase
    const fetchProducts = async () => {
      try {
        const data = await productService.getProducts();
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        (product) =>
          product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.description?.toLowerCase() || '').includes(
            searchTerm.toLowerCase()
          )
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  // Filter products based on user authentication
  const displayProducts = user
    ? filteredProducts
    : filteredProducts.filter(
        (product) =>
          !['clothing', 'accessories'].includes(
            product.category_id?.toString() || ''
          )
      );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4">
        <div className="py-4 space-y-4">
          {/* Search Input */}
          <div className="max-w-md mx-auto w-full">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Sign in notice */}
          {!user && (
            <div className="bg-primary/10 rounded-lg p-4">
              <p className="text-center text-sm">
                Sign in to view our exclusive clothing and accessories!
              </p>
            </div>
          )}

          {/* Products grid */}
          <div className="py-4">
            {loading ? (
              <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : displayProducts.length === 0 ? (
              <div className="text-center py-8">
                <h2 className="text-lg font-medium">No products found</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Try a different search term
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {displayProducts.map((product) => (
                  <div key={product.product_id}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
