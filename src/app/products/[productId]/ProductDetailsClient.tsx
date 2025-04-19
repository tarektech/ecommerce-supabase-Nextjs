'use client';
import { ProductType } from '@/types';
import { useCart } from '@/context/CartContext';

type ProductDetailsClientProps = {
  product: ProductType;
};

export default function ProductDetailsClient({
  product,
}: ProductDetailsClientProps) {
  const { addToCart } = useCart();

  const handleAddToCart = async () => {
    try {
      addToCart(product);
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8 lg:py-12 max-w-7xl">
        {/* Back button spacing */}
        <div className="h-4 md:h-0"></div>

        <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-12 xl:gap-16">
          {/* Product Image */}
          <div className="w-full -mx-4 sm:mx-0 mb-6 lg:mb-0">
            <div className="relative aspect-square sm:rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-sm">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-contain sm:object-cover"
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
          <div className="flex flex-col px-4 sm:px-0">
            {/* Title and Price Section */}
            <div className="mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-50 mb-2 sm:mb-3">
                {product.title}
              </h1>
              <p className="text-xl sm:text-2xl font-semibold text-primary">
                ${product.price.toFixed(2)}
              </p>
            </div>

            {/* Description */}
            <div className="prose prose-sm sm:prose lg:prose-lg max-w-none text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">
              <p>{product.description}</p>
            </div>

            {/* Product Details */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 sm:p-4 mb-6 sm:mb-8">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base text-gray-700 dark:text-gray-200 font-medium">
                    Availability
                  </span>
                  <span
                    className={`text-sm sm:text-base ${
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
                    <span className="text-sm sm:text-base text-gray-700 dark:text-gray-200 font-medium">
                      SKU
                    </span>
                    <span className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                      {product.sku}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Add to Cart Button - Integrated with the content flow */}
            <div className="bg-white dark:bg-gray-900 py-4 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`w-full py-3 sm:py-3 lg:py-4 px-6 sm:px-8 rounded-lg font-medium text-white text-base
                  transition-all duration-200 shadow-md hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer
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
