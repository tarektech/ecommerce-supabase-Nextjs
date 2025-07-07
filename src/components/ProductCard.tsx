"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProductType } from "@/types";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { Star, Heart, ShoppingCart, Eye, Badge, Zap } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

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
          className={`h-3.5 w-3.5 ${
            filled
              ? "fill-yellow-400 text-yellow-400"
              : halfFilled
                ? "fill-yellow-400/50 text-yellow-400"
                : "fill-muted text-muted-foreground/30"
          }`}
        />
      );
    });
  };

  return (
    <Card
      className="group from-background/95 to-background/80 relative cursor-pointer overflow-hidden border-0 bg-gradient-to-br shadow-lg backdrop-blur-lg transition-all duration-500 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-2xl"
      onClick={handleProductClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container with Overlay */}
      <div className="from-muted/30 to-muted/10 relative aspect-[4/3] overflow-hidden bg-gradient-to-br">
        {/* Sale Badge */}
        {isOnSale && (
          <div className="absolute top-3 left-3 z-20">
            <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-red-500 to-pink-500 px-2.5 py-1.5 text-xs font-bold text-white shadow-lg">
              <Zap className="h-3 w-3" />
              SALE
            </div>
          </div>
        )}

        {/* Wishlist Button */}
        <div className="absolute top-3 right-3 z-20">
          <button
            onClick={handleWishlist}
            className={`rounded-full p-2.5 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-110 ${
              isWishlisted
                ? "bg-red-500/90 text-white shadow-red-500/25"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            <Heart
              className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`}
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
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="from-muted/50 to-muted/30 flex h-full w-full items-center justify-center bg-gradient-to-br">
            <div className="text-center">
              <Badge className="text-muted-foreground/40 mb-2 h-12 w-12" />
              <span className="text-muted-foreground/60 text-sm font-medium">
                No Image
              </span>
            </div>
          </div>
        )}

        {/* Quick Actions Overlay */}
        <div
          className={`absolute inset-0 flex items-center justify-center gap-3 bg-black/40 backdrop-blur-sm transition-all duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <Button
            size="sm"
            variant="secondary"
            onClick={handleQuickView}
            className="border-0 bg-white/90 text-black shadow-lg backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-white"
          >
            <Eye className="mr-1.5 h-4 w-4" />
            Quick View
          </Button>
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="bg-primary/90 hover:bg-primary cursor-pointer border-0 text-white shadow-lg backdrop-blur-md transition-all duration-200 hover:scale-105"
          >
            <ShoppingCart className="mr-1.5 h-4 w-4" />
            Add to Cart
          </Button>
        </div>

        {/* Stock Indicator */}
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute bottom-3 left-3">
            <div className="rounded-full bg-orange-500/90 px-2.5 py-1 text-xs font-medium text-white shadow-lg backdrop-blur-md">
              Only {product.stock} left
            </div>
          </div>
        )}
      </div>

      {/* Product Details */}
      <CardContent className="space-y-4 p-5">
        {/* Rating */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">{renderStars()}</div>
            <span className="text-muted-foreground text-xs font-medium">
              {rating.toFixed(1)} ({reviewCount})
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-xs font-medium text-green-600">In Stock</span>
          </div>
        </div>

        {/* Product Title */}
        <div>
          <h3 className="text-foreground group-hover:text-primary line-clamp-2 text-lg leading-tight font-bold transition-colors duration-200">
            {product.title}
          </h3>
          <p className="text-muted-foreground mt-1 line-clamp-2 text-sm leading-relaxed">
            {product.description ||
              "Premium quality product with exceptional features and modern design."}
          </p>
        </div>

        {/* Price Section */}
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-2">
            <span className="text-foreground text-2xl font-bold">
              ${product.price.toFixed(2)}
            </span>
            {originalPrice && (
              <span className="text-muted-foreground text-sm line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          {isOnSale && (
            <div className="rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-600 dark:bg-green-900/20">
              Save ${(originalPrice! - product.price).toFixed(2)}
            </div>
          )}
        </div>

        {/* Feature Badges */}
        <div className="flex items-center gap-2 pt-2">
          <span className="rounded-full border border-green-200/50 bg-gradient-to-r from-green-50 to-emerald-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:border-green-800/50 dark:from-green-900/20 dark:to-emerald-900/20 dark:text-green-400">
            Free Shipping
          </span>
          <span className="rounded-full border border-blue-200/50 bg-gradient-to-r from-blue-50 to-cyan-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:border-blue-800/50 dark:from-blue-900/20 dark:to-cyan-900/20 dark:text-blue-400">
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
            <ShoppingCart className="mr-2 h-4 w-4" />
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleWishlist}
            className="cursor-pointer"
          >
            <Heart
              className={`h-4 w-4 ${
                isWishlisted ? "fill-current text-red-500" : ""
              }`}
            />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
