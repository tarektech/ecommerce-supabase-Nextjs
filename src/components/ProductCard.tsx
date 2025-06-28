'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProductType } from '@/types';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { Star, Heart, ShoppingCart, Eye, Badge, Zap } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

interface ProductCardProps {
  product: ProductType;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/products/${product.product_id}`);
  };

  // Generate mock rating and reviews for demonstration
  const rating = 4.2 + Math.random() * 0.8;
  const reviewCount = Math.floor(Math.random() * 200) + 50;
  const isOnSale = Math.random() > 0.7;
  const originalPrice = isOnSale ? product.price * 1.3 : null;

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const filled = index < Math.floor(rating);
      const halfFilled = index === Math.floor(rating) && rating % 1 >= 0.5;

      return (
        <Star
          key={index}
          className={`w-3.5 h-3.5 ${
            filled
              ? 'fill-yellow-400 text-yellow-400'
              : halfFilled
              ? 'fill-yellow-400/50 text-yellow-400'
              : 'fill-muted text-muted-foreground/30'
          }`}
        />
      );
    });
  };

  return (
    <Card
      className="group relative overflow-hidden cursor-pointer border-0 bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-lg shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1"
      onClick={handleProductClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container with Overlay */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10">
        {/* Sale Badge */}
        {isOnSale && (
          <div className="absolute top-3 left-3 z-20">
            <div className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-full shadow-lg">
              <Zap className="w-3 h-3" />
              SALE
            </div>
          </div>
        )}

        {/* Wishlist Button */}
        <div className="absolute top-3 right-3 z-20">
          <button
            onClick={handleWishlist}
            className={`p-2.5 rounded-full backdrop-blur-md transition-all duration-300 shadow-lg hover:scale-110 ${
              isWishlisted
                ? 'bg-red-500/90 text-white shadow-red-500/25'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Heart
              className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`}
            />
          </button>
        </div>

        {/* Product Image */}
        {product.image ? (
          <Image
            src={product.image}
            alt={product.title}
            width={400}
            height={300}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center">
            <div className="text-center">
              <Badge className="w-12 h-12 text-muted-foreground/40 mb-2" />
              <span className="text-sm text-muted-foreground/60 font-medium">
                No Image
              </span>
            </div>
          </div>
        )}

        {/* Quick Actions Overlay */}
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center gap-3 transition-all duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Button
            size="sm"
            variant="secondary"
            onClick={handleQuickView}
            className="bg-white/90 hover:bg-white text-black border-0 shadow-lg backdrop-blur-md hover:scale-105 transition-all duration-200"
          >
            <Eye className="w-4 h-4 mr-1.5" />
            Quick View
          </Button>
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="bg-primary/90 hover:bg-primary text-white border-0 shadow-lg backdrop-blur-md hover:scale-105 transition-all duration-200 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4 mr-1.5" />
            Add to Cart
          </Button>
        </div>

        {/* Stock Indicator */}
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute bottom-3 left-3">
            <div className="bg-orange-500/90 text-white text-xs font-medium px-2.5 py-1 rounded-full shadow-lg backdrop-blur-md">
              Only {product.stock} left
            </div>
          </div>
        )}
      </div>

      {/* Product Details */}
      <CardContent className="p-5 space-y-4">
        {/* Rating */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">{renderStars()}</div>
            <span className="text-xs text-muted-foreground font-medium">
              {rating.toFixed(1)} ({reviewCount})
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-green-600 font-medium">In Stock</span>
          </div>
        </div>

        {/* Product Title */}
        <div>
          <h3 className="text-lg font-bold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-200">
            {product.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mt-1">
            {product.description ||
              'Premium quality product with exceptional features and modern design.'}
          </p>
        </div>

        {/* Price Section */}
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-foreground">
              ${product.price.toFixed(2)}
            </span>
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          {isOnSale && (
            <div className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded-full">
              Save ${(originalPrice! - product.price).toFixed(2)}
            </div>
          )}
        </div>

        {/* Feature Badges */}
        <div className="flex items-center gap-2 pt-2">
          <span className="px-2.5 py-1 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-green-700 dark:text-green-400 text-xs font-medium rounded-full border border-green-200/50 dark:border-green-800/50">
            Free Shipping
          </span>
          <span className="px-2.5 py-1 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full border border-blue-200/50 dark:border-blue-800/50">
            30-Day Returns
          </span>
        </div>

        {/* Action Buttons - Mobile Fallback */}
        <div className="flex items-center gap-3 pt-3 md:hidden">
          <Button
            className="flex-1 cursor-pointer"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleWishlist}
            className="cursor-pointer"
          >
            <Heart
              className={`w-4 h-4 ${
                isWishlisted ? 'fill-current text-red-500' : ''
              }`}
            />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
