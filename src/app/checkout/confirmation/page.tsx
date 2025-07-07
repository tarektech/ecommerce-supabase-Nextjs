"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useCheckout } from "@/context/CheckoutContext";
import { orderService } from "@/services/order/orderService";
import { addressService } from "@/services/address/addressService";
import { toast } from "sonner";
import { AddressType } from "@/types";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const checkoutId = searchParams.get("checkout_id");
  const router = useRouter();
  const { clearCart, cartItems, subtotal } = useCart();
  const { user } = useAuth();
  const { shippingAddress, resetCheckout } = useCheckout();
  const [isProcessing, setIsProcessing] = useState(true);
  const [orderCreated, setOrderCreated] = useState(false);

  useEffect(() => {
    const createOrderAndClearCart = async () => {
      if (checkoutId && user && cartItems.length > 0 && !orderCreated) {
        try {
          let addressToUse: AddressType;

          if (shippingAddress) {
            // Save the shipping address to database and use it for the order
            const savedAddress = await addressService.saveAddress({
              address: {
                id: 0, // Will be assigned by database
                user_id: user.id,
                street: shippingAddress.street,
                city: shippingAddress.city,
                state: "", // Not available in checkout context
                zip_code: shippingAddress.zipCode,
                country: shippingAddress.country,
                is_default: false,
              },
              userId: user.id,
            });
            addressToUse = savedAddress;
          } else {
            // Fallback: try to get user's existing addresses
            const existingAddresses = await addressService.getAddresses(
              user.id,
            );
            if (existingAddresses.length > 0) {
              addressToUse = existingAddresses[0]; // Use first available address
            } else {
              // Create a default address as last resort
              const defaultAddress = await addressService.saveAddress({
                address: {
                  id: 0,
                  user_id: user.id,
                  street: "Default Street (Please update)",
                  city: "Default City",
                  state: "Default State",
                  zip_code: "00000",
                  country: "US",
                  is_default: true,
                },
                userId: user.id,
              });
              addressToUse = defaultAddress;
            }
          }

          // Transform cart items to order items format
          const orderItems = cartItems.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
          }));

          // Create the order
          const order = await orderService.createOrder({
            userId: user.id,
            items: orderItems,
            shippingAddress: addressToUse,
            totalAmount: subtotal,
            paymentIntentId: checkoutId,
          });

          if (order) {
            setOrderCreated(true);
            // Clear the cart after successful order creation
            await clearCart();
            // Reset checkout context
            resetCheckout();
            toast.success("Order created successfully!");
          }
        } catch (error) {
          console.error("Error creating order:", error);
          toast.error("Failed to create order. Please contact support.");
        } finally {
          setIsProcessing(false);
        }
      } else if (checkoutId && !user) {
        // Handle case where user is not logged in
        setIsProcessing(false);
        toast.error("Please log in to complete your order.");
      } else if (checkoutId && cartItems.length === 0) {
        // Handle case where cart is empty
        setIsProcessing(false);
      } else if (checkoutId) {
        setIsProcessing(false);
      }
    };

    createOrderAndClearCart();
  }, [
    checkoutId,
    user,
    cartItems,
    subtotal,
    orderCreated,
    clearCart,
    shippingAddress,
    resetCheckout,
  ]);

  const handleContinueShopping = () => {
    router.push("/products");
  };

  const handleViewOrders = () => {
    router.push("/profile");
  };

  if (isProcessing) {
    return (
      <div className="bg-background min-h-screen py-12">
        <Card className="mx-auto max-w-lg">
          <CardHeader>
            <CardTitle>Processing your order...</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Please wait while we confirm your payment and create your order.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen py-12">
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle>Thank you for your order!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Your order has been successfully placed. You will receive a
            confirmation email shortly.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button onClick={handleViewOrders} variant="outline">
              View My Orders
            </Button>
            <Button onClick={handleContinueShopping}>Continue Shopping</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="bg-background min-h-screen py-12">
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Please wait while we load your confirmation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ConfirmationContent />
    </Suspense>
  );
}
