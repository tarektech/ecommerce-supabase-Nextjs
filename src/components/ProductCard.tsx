'use client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProductType } from '@/types';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { Star, Heart } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

interface ProductCardProps {
  product: ProductType;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleProductClick = () => {
    router.push(`/products/${product.product_id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  // Generate mock rating and reviews for demonstration
  const rating = 4;
  const reviewCount = Math.floor(Math.random() * 200) + 50;

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating
            ? 'fill-yellow-400 text-yellow-400 dark:fill-yellow-500 dark:text-yellow-500'
            : 'fill-muted text-muted dark:fill-muted-foreground/30 dark:text-muted-foreground/30'
        }`}
      />
    ));
  };

  return (
    <Card
      className="overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg bg-card border-border"
      onClick={handleProductClick}
    >
      <CardHeader className="p-0 relative">
        {product.image ? (
          <Image
            src={product.image || ''}
            alt={product.title}
            width={400}
            height={192}
            className="w-full h-48 object-cover"
            style={{ width: 'auto' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              if (target.nextElementSibling) {
                (target.nextElementSibling as HTMLElement).style.display =
                  'flex';
              }
            }}
          />
        ) : null}
        <div
          className="w-full h-48 bg-muted flex items-center justify-center"
          style={{ display: product.image ? 'none' : 'flex' }}
        >
          <span className="text-muted-foreground">No Image</span>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {/* Product Title */}
        <h3 className="text-xl font-bold text-card-foreground line-clamp-1">
          {product.title}
        </h3>

        {/* Product Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {product.description ||
            'High-quality product with premium features and excellent craftsmanship.'}
        </p>

        {/* Price */}
        <div className="text-2xl font-bold text-card-foreground">
          ${product.price.toFixed(2)}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3">
          <Button
            className="flex-1"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>

          <button
            onClick={handleWishlist}
            className="text-muted-foreground hover:text-primary transition-colors p-2 hover:bg-accent rounded-md"
          >
            <Heart
              className={`w-5 h-5 ${
                isWishlisted ? 'fill-primary text-primary' : ''
              }`}
            />
          </button>
        </div>

        <span className="text-sm text-muted-foreground">Wishlist</span>

        {/* Rating and Reviews */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">{renderStars()}</div>
          <span className="text-sm text-muted-foreground">
            ({reviewCount} Reviews)
          </span>
        </div>

        {/* Feature Badges */}
        <div className="flex gap-2 pt-2">
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-medium rounded-full border border-green-200 dark:border-green-800">
            Free Shipping
          </span>
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs font-medium rounded-full border border-blue-200 dark:border-blue-800">
            30-Day Returns
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
