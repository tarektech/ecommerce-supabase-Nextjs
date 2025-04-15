import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProductType } from '@/types';
import { useCart } from '@/context/CartContext';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: ProductType;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleProductClick = () => {
    navigate(`/product/${product.product_id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking the add to cart button
    addToCart(product);
  };

  return (
    <Card
      className="overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
      onClick={handleProductClick}
    >
      <CardHeader className="p-0">
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-muted flex items-center justify-center">
            No Image
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg font-semibold mb-2 line-clamp-1">
          {product.title}
        </CardTitle>
        <div className="text-sm text-muted-foreground mb-2 line-clamp-2">
          {product.description || 'No description available'}
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="text-lg font-bold">${product.price.toFixed(2)}</div>
          <Button
            size="sm"
            variant="default"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            Add to Cart
          </Button>
        </div>
        {product.stock !== undefined && (
          <div className="text-xs text-muted-foreground mt-2">
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
