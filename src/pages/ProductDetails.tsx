import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProductType } from '@/types';
import { productService } from '@/services/productService';
import { useCart } from '@/context/CartContext';

export default function ProductDetails() {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        if (!productId) {
          setError('Product ID is missing');
          return;
        }
        const data = await productService.getProductById(productId);
        if (data) {
          setProduct(data);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        setError('Error loading product');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    if (product) {
      try {
        addToCart(product);
      } catch (err) {
        console.error('Error adding to cart:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          {error || 'Product not found'}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          The product you're looking for might have been removed or doesn't
          exist.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-7xl">
        {/* Back to top spacing for mobile */}
        <div className="h-4 md:h-0"></div>

        <div className="flex flex-col md:grid md:grid-cols-2 md:gap-8">
          {/* Product Image */}
          <div className="w-full -mx-4 md:mx-0 mb-6 md:mb-0">
            <div className="relative aspect-square md:rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-sm">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-contain md:object-cover"
                  loading="eager"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-gray-200 dark:bg-gray-700">
                  <span className="text-sm text-gray-400 dark:text-gray-500">
                    No image available
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col px-4 md:px-0">
            {/* Title and Price Section */}
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50 mb-2">
                {product.title}
              </h1>
              <p className="text-2xl font-semibold text-primary">
                ${product.price.toFixed(2)}
              </p>
            </div>

            {/* Description */}
            <div className="prose prose-sm md:prose max-w-none text-gray-600 dark:text-gray-300 mb-6">
              <p>{product.description}</p>
            </div>

            {/* Product Details */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">
                    Availability
                  </span>
                  <span
                    className={`text-sm ${
                      product.stock > 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {product.stock > 0
                      ? `In Stock (${product.stock} available)`
                      : 'Out of Stock'}
                  </span>
                </div>
                {product.sku && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">
                      SKU
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {product.sku}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Add to Cart Button - Fixed at bottom on mobile */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 md:relative md:p-0 md:bg-transparent md:border-0">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`w-full py-4 md:py-3 px-8 rounded-lg font-medium text-white text-base
                  transition-colors duration-200 shadow-lg md:shadow-none
                  ${
                    product.stock > 0
                      ? 'bg-primary hover:bg-primary/90 active:bg-primary/95 dark:hover:bg-primary/80'
                      : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                  }`}
              >
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
