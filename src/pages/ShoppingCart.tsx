import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Minus, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import ShoppingSkeleton from '@/components/ShoppingSkeleton';

export default function ShoppingCart() {
  const { cartItems, removeFromCart, updateQuantity, subtotal, isLoading } =
    useCart();
  const { user } = useAuth();

  // Show a loader while fetching cart data
  if (isLoading) {
    return <ShoppingSkeleton />;
  }

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center mb-6">
          <Link to="/" className="flex items-center text-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shopping
          </Link>
          <h1 className="text-3xl font-bold ml-4">Your Shopping Cart</h1>
        </div>
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Please Log In</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">You need to be logged in to view your cart.</p>
            <Link to="/sign-in">
              <Button className="w-full">Log In</Button>
            </Link>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Link to="/" className="flex items-center text-primary">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Shopping
        </Link>
        <h1 className="text-3xl font-bold ml-4">Your Shopping Cart</h1>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center p-8">
          <h2 className="text-xl mb-4">Your cart is empty</h2>
          <Link to="/">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {cartItems.map((item) => (
              <Card key={item.product_id} className="mb-4">
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-1/4 p-4">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                  <CardContent className="flex-1 p-4">
                    <CardTitle className="text-xl mb-2">{item.title}</CardTitle>
                    <p className="text-muted-foreground mb-2">
                      {item.description}
                    </p>
                    <p className="font-bold text-lg">
                      ${item.price.toFixed(2)}
                    </p>

                    <div className="flex items-center mt-4">
                      <Button
                        type="button"
                        className="h-9 w-9 rounded-md p-0 border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          updateQuantity(item.product_id, -1);
                        }}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="mx-3">{item.quantity}</span>
                      <Button
                        type="button"
                        className="h-9 w-9 rounded-md p-0 border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          updateQuantity(item.product_id, 1);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        className="ml-4 text-destructive hover:bg-accent hover:text-accent-foreground cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          removeFromCart(item.product_id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>

          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>$5.99</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-4 border-t">
                    <span>Total</span>
                    <span>${(subtotal + 5.99).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link to="/checkout">
                  <Button className="w-full cursor-pointer">
                    Proceed to Checkout
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
