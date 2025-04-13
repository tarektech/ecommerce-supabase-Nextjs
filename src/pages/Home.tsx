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
    <main className="flex-1 p-4">
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {!user && (
        <div className="mb-4 p-4 bg-primary/10 rounded-md">
          <p className="text-center">
            Sign in to view our exclusive clothing and accessories!
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : displayProducts.length === 0 ? (
        <div className="text-center p-8">
          <h2 className="text-xl mb-2">No products found</h2>
          <p className="text-muted-foreground">Try a different search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayProducts.map((product) => (
            <div key={product.product_id} className="relative">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
