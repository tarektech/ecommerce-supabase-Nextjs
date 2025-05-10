'use client';

import { motion, AnimatePresence } from 'framer-motion';
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto w-full"
      >
        <Input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </motion.div>

      {/* Sign in notice */}
      <AnimatePresence>
        {!user && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-primary/10 rounded-lg p-4 overflow-hidden"
          >
            <p className="text-center text-sm">
              Sign in to view our exclusive clothing and accessories!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products grid */}
      <div className="py-4">
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
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"
              />
            </motion.div>
          ) : displayProducts.length === 0 ? (
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
                {displayProducts.map((product, index) => (
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
    </>
  );
}
