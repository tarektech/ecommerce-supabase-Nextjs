'use client';
import { ProductType } from '@/types';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import { Heart, Minus, Plus, Check, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProductComments } from '@/components/ProductComments';

type ProductDetailsClientProps = {
  product: ProductType;
};

export default function ProductDetailsClient({
  product,
}: ProductDetailsClientProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedType, setSelectedType] = useState('Ground');
  const [selectedSize, setSelectedSize] = useState('12oz');
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

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

  // Mock rating data - you can replace with actual rating from your product data
  const rating = 4.8;
  const reviewCount = 146;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8 lg:py-12 max-w-7xl">
        <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-12 xl:gap-16">
          {/* Product Image */}
          <div className="w-full mb-6 lg:mb-0">
            <Card className="overflow-hidden border-border bg-card">
              <div className="relative aspect-square">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-contain p-4"
                    loading="eager"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-muted">
                    <span className="text-sm text-muted-foreground">
                      No image available
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            {/* Brand Badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-foreground text-background px-2 py-1 text-xs font-bold rounded-sm">
                  BRAND
                </div>
                <span className="text-sm text-muted-foreground">
                  premium brand
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFavorited(!isFavorited)}
                className={`cursor-pointer ${
                  isFavorited
                    ? 'text-red-500 hover:text-red-600'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Heart
                  className="w-5 h-5"
                  fill={isFavorited ? 'currentColor' : 'none'}
                />
              </Button>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              {product.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-muted'
                    }`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                ({reviewCount})
              </span>
            </div>

            {/* Price */}
            <div className="text-3xl font-bold text-foreground mb-4">
              ${product.price.toFixed(2)}
            </div>

            {/* Shipping Info */}
            <div className="flex items-center gap-2 mb-2">
              <Truck className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Shipping calculated at checkout
              </span>
            </div>
            <Button
              variant="link"
              className="justify-start p-0 h-auto text-sm mb-6 cursor-pointer"
            >
              Add address
            </Button>

            {/* Product Options */}
            <Card className="mb-6">
              <CardContent className="p-4 space-y-4">
                {/* Type */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="border border-input rounded-md px-3 py-2 bg-background text-foreground text-sm min-w-[120px] focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="Ground">Ground</option>
                    <option value="Whole Bean">Whole Bean</option>
                    <option value="Instant">Instant</option>
                  </select>
                </div>

                {/* Size */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    Size
                  </label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="border border-input rounded-md px-3 py-2 bg-background text-foreground text-sm min-w-[120px] focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="8oz">8oz</option>
                    <option value="12oz">12oz</option>
                    <option value="16oz">16oz</option>
                    <option value="2lbs">2lbs</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Quantity */}
            <div className="mb-6">
              <label className="text-sm font-medium text-foreground block mb-2">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center font-medium text-foreground">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={incrementQuantity}
                  disabled={quantity >= product.stock}
                  className="cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mb-8">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                size="lg"
                className={`w-full cursor-pointer ${
                  isAddedToCart
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : ''
                }`}
              >
                {isAddedToCart ? (
                  <>
                    <Check className="w-4 h-4" />
                    Added to cart
                  </>
                ) : product.stock > 0 ? (
                  'Add to cart'
                ) : (
                  'Out of Stock'
                )}
              </Button>

              <Button
                variant="secondary"
                size="lg"
                disabled={product.stock === 0}
                className="w-full cursor-pointer"
              >
                Buy now
              </Button>
            </div>

            {/* Availability */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    Availability
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      product.stock > 0 ? 'text-green-600' : 'text-destructive'
                    }`}
                  >
                    {product.stock > 0
                      ? `In Stock (${product.stock} available)`
                      : 'Out of Stock'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Description
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-16">
          <ProductComments productId={product.product_id} />
        </div>
      </div>
    </div>
  );
}
