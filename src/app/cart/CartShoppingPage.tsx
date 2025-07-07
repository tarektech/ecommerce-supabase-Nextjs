"use client";

import Link from "next/link";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Minus, Plus, Trash2, ArrowLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";
import ShoppingSkeleton from "@/components/ShoppingSkeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

export default function CartShoppingPage() {
  const { cartItems, removeFromCart, updateQuantity, subtotal, isLoading } =
    useCart();
  const { user } = useAuth();

  if (isLoading) {
    return <ShoppingSkeleton />;
  }

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-6 flex items-center">
          <Link href="/" className="text-primary flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shopping
          </Link>
          <h1 className="ml-4 text-3xl font-bold">Your Shopping Cart</h1>
        </div>
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle>Please Log In</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">You need to be logged in to view your cart.</p>
            <Link href="/signin">
              <Button className="w-full">Log In</Button>
            </Link>
          </CardContent>
          <CardFooter>
            <p className="text-muted-foreground text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline">
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
      <div className="mb-6 flex items-center">
        <Link href="/" className="text-primary flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shopping
        </Link>
        <h1 className="ml-4 text-3xl font-bold">Your Shopping Cart</h1>
      </div>

      {cartItems.length === 0 ? (
        <div className="p-8 text-center">
          <h2 className="mb-4 text-xl">Your cart is empty</h2>
          <Link href="/">
            <Button className="cursor-pointer">Continue Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            {cartItems.map((item) => (
              <Card key={item.product_id} className="mb-4">
                <div className="flex flex-col sm:flex-row">
                  <div className="p-4 sm:w-1/4">
                    <Image
                      src={item.image || ""}
                      alt={item.title}
                      width={100}
                      height={100}
                      className="h-auto w-full object-cover"
                    />
                  </div>
                  <CardContent className="flex-1 p-4">
                    <CardTitle className="mb-2 text-xl">{item.title}</CardTitle>
                    <p className="text-muted-foreground mb-2">
                      {item.description}
                    </p>
                    <p className="text-lg font-bold">
                      ${item.price.toFixed(2)}
                    </p>

                    <div className="mt-4 flex items-center">
                      <Button
                        type="button"
                        className="border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9 cursor-pointer rounded-md border p-0 shadow-xs"
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
                        className="border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9 cursor-pointer rounded-md border p-0 shadow-xs"
                        onClick={(e) => {
                          e.preventDefault();
                          updateQuantity(item.product_id, 1);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        className="text-destructive hover:bg-accent hover:text-accent-foreground ml-4 cursor-pointer"
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
                  <div className="flex justify-between border-t pt-4 text-lg font-bold">
                    <span>Total</span>
                    <span>${(subtotal + 5.99).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/checkout">
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
