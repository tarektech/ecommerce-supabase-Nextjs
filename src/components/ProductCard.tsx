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
          className={`h-3 w-3 ${
            filled
              ? "fill-primary text-primary"
              : halfFilled
                ? "fill-primary/50 text-primary"
                : "fill-muted text-muted-foreground/30"
          }`}
        />
      );
    });
  };

  return (
    <Card
      className="group border-border/60 bg-card/60 hover:border-primary/20 hover:shadow-primary/5 relative cursor-pointer overflow-hidden backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
      onClick={handleProductClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        {/* Sale Badge */}
        {isOnSale && (
          <div className="absolute top-2 left-2 z-20">
            <div className="bg-destructive text-destructive-foreground flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold shadow-sm">
              <Zap className="h-3 w-3" />
              SALE
            </div>
          </div>
        )}

        {/* Wishlist Button */}
        <div className="absolute top-2 right-2 z-20">
          <button
            onClick={handleWishlist}
            className={`rounded-full p-1.5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:scale-110 ${
              isWishlisted
                ? "bg-destructive/90 text-destructive-foreground"
                : "bg-background/80 text-muted-foreground hover:bg-background/90 hover:text-foreground"
            }`}
          >
            <Heart
              className={`h-3.5 w-3.5 ${isWishlisted ? "fill-current" : ""}`}
            />
          </button>
        </div>

        {/* Product Image */}
        {product.image ? (
          <Image
            src={product.image}
            alt={product.title}
            width={300}
            height={300}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="bg-muted/50 flex h-full w-full items-center justify-center">
            <div className="text-center">
              <Badge className="text-muted-foreground/40 mb-2 h-8 w-8" />
              <span className="text-muted-foreground/60 text-xs font-medium">
                No Image
              </span>
            </div>
          </div>
        )}

        {/* Quick Actions Overlay */}
        <div
          className={`bg-background/80 absolute inset-0 flex items-center justify-center gap-2 backdrop-blur-sm transition-all duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <Button
            size="sm"
            variant="secondary"
            onClick={handleQuickView}
            className="h-8 text-xs shadow-sm"
          >
            <Eye className="mr-1 h-3 w-3" />
            View
          </Button>
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="h-8 cursor-pointer text-xs shadow-sm"
          >
            <ShoppingCart className="mr-1 h-3 w-3" />
            Add
          </Button>
        </div>

        {/* Stock Indicator */}
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute bottom-2 left-2">
            <div className="bg-accent text-accent-foreground rounded-md px-2 py-1 text-xs font-medium">
              {product.stock} left
            </div>
          </div>
        )}
      </div>

      {/* Product Details */}
      <CardContent className="space-y-2 p-3">
        {/* Rating & Stock */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5">{renderStars()}</div>
            <span className="text-muted-foreground text-xs">
              {rating.toFixed(1)} ({reviewCount})
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="bg-primary h-1 w-1 rounded-full"></div>
            <span className="text-primary text-xs font-medium">In Stock</span>
          </div>
        </div>

        {/* Product Title */}
        <div>
          <h3 className="text-foreground group-hover:text-primary line-clamp-1 text-sm font-semibold transition-colors duration-200">
            {product.title}
          </h3>
          <p className="text-muted-foreground line-clamp-2 text-xs">
            {product.description ||
              "Premium quality product with exceptional features."}
          </p>
        </div>

        {/* Price Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-foreground text-lg font-bold">
              ${product.price.toFixed(2)}
            </span>
            {originalPrice && (
              <span className="text-muted-foreground text-xs line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          {isOnSale && (
            <div className="bg-primary/10 text-primary rounded-md px-1.5 py-0.5 text-xs font-medium">
              Save ${(originalPrice! - product.price).toFixed(0)}
            </div>
          )}
        </div>

        {/* Feature Badges */}
        <div className="flex items-center gap-1">
          <span className="bg-primary/10 text-primary rounded-md px-1.5 py-0.5 text-xs font-medium">
            Free Ship
          </span>
          <span className="bg-secondary/80 text-secondary-foreground rounded-md px-1.5 py-0.5 text-xs font-medium">
            30-Day
          </span>
        </div>

        {/* Mobile Action Button */}
        <div className="pt-1 sm:hidden">
          <Button
            className="h-8 w-full cursor-pointer text-xs"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="mr-1.5 h-3 w-3" />
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
