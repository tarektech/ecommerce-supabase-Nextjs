'use client';

import { Input } from '@/components/ui/input';
import { ProductCard } from '@/components/ProductCard';
import { useAuth } from '@/context/AuthContext';
import { useProducts } from '@/hooks/useProducts';

export default function ClientProducts() {
  const { user } = useAuth();
  const { displayProducts, loading, searchTerm, setSearchTerm } =
    useProducts(user);

  return (
    <>
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
    </>
  );
}
