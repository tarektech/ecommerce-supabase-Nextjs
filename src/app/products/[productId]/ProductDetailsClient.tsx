'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Heart,
  Share2,
  ShoppingCart,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  Truck,
  Shield,
  RotateCcw,
  Check,
} from 'lucide-react';
import { ProductType } from '@/types';
import { useCart } from '@/context/CartContext';
import { useProductReviews } from '@/hooks/queries/use-reviews';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';

type ProductDetailsClientProps = {
  product: ProductType;
};

export default function ProductDetailsClient({
  product,
}: ProductDetailsClientProps) {
  const { addToCart } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  // Get reviews for this product
  const { data: reviews = [], isLoading: reviewsLoading } = useProductReviews(
    product.product_id
  );

  // Generate multiple images from the single image (mock data for demo)
  const productImages = product.image
    ? [product.image, product.image, product.image, product.image]
    : ['/placeholder-product.jpg'];

  // Calculate review stats
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 4.5;
  const reviewCount = reviews.length || 123; // fallback for demo

  const handleAddToCart = async () => {
    try {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      setIsAddedToCart(true);
      setTimeout(() => setIsAddedToCart(false), 2000);
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setSelectedImageIndex(
      (prev) => (prev - 1 + productImages.length) % productImages.length
    );
  };

  const renderStars = (rating: number, size: 'sm' | 'md' = 'md') => {
    const sizeClass = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    );
  };

  // Mock rating distribution for demo
  const ratingDistribution = [
    { stars: 5, percentage: 68 },
    { stars: 4, percentage: 20 },
    { stars: 3, percentage: 8 },
    { stars: 2, percentage: 3 },
    { stars: 1, percentage: 1 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImageIndex}
                  className="relative w-full h-full"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  {product.image ? (
                    <Image
                      src={productImages[selectedImageIndex]}
                      alt={product.title}
                      fill
                      className="object-contain p-4"
                      loading="eager"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-muted">
                      <span className="text-sm text-muted-foreground">
                        No image available
                      </span>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {productImages.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                    onClick={nextImage}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}

              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-background/80 backdrop-blur-sm cursor-pointer"
                  onClick={() => setIsFavorited(!isFavorited)}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isFavorited ? 'fill-red-500 text-red-500' : ''
                    }`}
                  />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-background/80 backdrop-blur-sm cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {productImages.map((image, index) => (
                  <motion.button
                    key={index}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors cursor-pointer ${
                      selectedImageIndex === index
                        ? 'border-primary'
                        : 'border-border'
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Image
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover"
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <motion.h1
                className="text-3xl font-bold text-foreground mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {product.title}
              </motion.h1>

              <motion.div
                className="flex items-center gap-4 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {renderStars(averageRating)}
                <span className="text-sm text-muted-foreground">
                  {averageRating.toFixed(1)} ({reviewCount.toLocaleString()}{' '}
                  reviews)
                </span>
              </motion.div>

              <motion.div
                className="flex items-center gap-3 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span className="text-3xl font-bold text-foreground">
                  ${product.price.toFixed(2)}
                </span>
                {product.stock > 0 ? (
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    In Stock ({product.stock} available)
                  </Badge>
                ) : (
                  <Badge variant="destructive">Out of Stock</Badge>
                )}
              </motion.div>
            </div>

            <motion.p
              className="text-muted-foreground leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {product.description}
            </motion.p>

            {/* Quantity and Add to Cart */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div>
                <h3 className="font-medium mb-3">Quantity</h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-border rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="px-4 py-2 min-w-[60px] text-center">
                      {quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={incrementQuantity}
                      disabled={quantity >= product.stock}
                      className="cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.stock} items available
                  </span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full cursor-pointer"
                disabled={!product.stock || product.stock === 0}
                onClick={handleAddToCart}
              >
                {isAddedToCart ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart - ${(product.price * quantity).toFixed(2)}
                  </>
                )}
              </Button>
            </motion.div>

            {/* Shipping Info */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Free Shipping</p>
                  <p className="text-xs text-muted-foreground">
                    Orders over $50
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Secure Payment</p>
                  <p className="text-xs text-muted-foreground">SSL encrypted</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">30-Day Returns</p>
                  <p className="text-xs text-muted-foreground">
                    No questions asked
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Tabs defaultValue="description" className="mb-12">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({reviewCount})</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {product.description}
                    </p>
                    {product.sku && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-sm text-muted-foreground">
                          <strong>SKU:</strong> {product.sku}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold mb-2">
                        {averageRating.toFixed(1)}
                      </div>
                      {renderStars(averageRating)}
                      <p className="text-sm text-muted-foreground mt-2">
                        Based on {reviewCount.toLocaleString()} reviews
                      </p>
                    </div>

                    <div className="space-y-3">
                      {ratingDistribution.map((item) => (
                        <div
                          key={item.stars}
                          className="flex items-center gap-3"
                        >
                          <span className="text-sm w-6">{item.stars}★</span>
                          <Progress
                            value={item.percentage}
                            className="flex-1"
                          />
                          <span className="text-sm text-muted-foreground w-10">
                            {item.percentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="lg:col-span-2 space-y-4">
                  {reviewsLoading ? (
                    <Card>
                      <CardContent className="p-6">
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : reviews.length > 0 ? (
                    reviews.map((review) => (
                      <Card key={review.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <Avatar>
                              <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-medium">
                                  {review.user_id.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">
                                  User {review.user_id.slice(0, 8)}
                                </h4>
                                {renderStars(review.rating, 'sm')}
                                {review.created_at && (
                                  <span className="text-sm text-muted-foreground">
                                    {new Date(
                                      review.created_at
                                    ).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              {review.comment && (
                                <p className="text-muted-foreground">
                                  {review.comment}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">
                          No reviews yet. Be the first to review this product!
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
