'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { ProductCard } from '@/components/ProductCard';
import { useAuth } from '@/context/AuthContext';
import { ProductType } from '@/types';
import { productService } from '@/services/product/productService';
import { useRouter } from 'next/navigation';

interface CategoryPageProps {
  categoryName: string;
  categoryId: number;
}

export default function CategoryPage({
  categoryName,
  categoryId,
}: CategoryPageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Client-side authentication check (backup)
  useEffect(() => {
    // If not logged in and trying to access restricted categories (Clothing or Accessories)
    if (
      !user &&
      (categoryName === 'Clothing' || categoryName === 'Accessories')
    ) {
      router.push('/signin');
    }
  }, [user, categoryName, router]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getProductsByCategory(categoryId);
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error(`Error fetching ${categoryName} products:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, categoryName]);

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

  // If not authenticated and trying to access a restricted category, don't render the content
  if (
    !user &&
    (categoryName === 'Clothing' || categoryName === 'Accessories')
  ) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4">
        <div className="py-4 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-3xl font-bold mb-4">{categoryName}</h1>
          </motion.div>

          {/* Search Input */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto w-full"
          >
            <Input
              type="text"
              placeholder={`Search ${categoryName.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </motion.div>

          <div className="mt-6">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-center items-center min-h-[200px]"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"
                  />
                </motion.div>
              ) : filteredProducts.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8"
                >
                  <h2 className="text-lg font-medium">No products found</h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try a different search term
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="products"
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <AnimatePresence>
                    {filteredProducts.map((product, index) => (
                      <motion.div
                        key={product.product_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{
                          duration: 0.3,
                          delay: index * 0.1,
                        }}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
