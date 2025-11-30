"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useCheckout } from "@/context/CheckoutContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function PaymentForm() {
  const { cartItems } = useCart();
  const { shippingAddress, setPolarCheckout } = useCheckout();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createPolarCheckout = async () => {
    if (!shippingAddress) {
      toast.error("Shipping address is required");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Prepare checkout data
      const checkoutData = {
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
        })),
        shippingAddress: {
          street: shippingAddress.street,
          city: shippingAddress.city,
          zipCode: shippingAddress.zipCode,
          country: shippingAddress.country,
        },
        customerEmail: user?.email || undefined,
      };

      // Call our API to create Polar checkout session
      const response = await fetch("/api/polar/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(checkoutData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create checkout session");
      }

      const data = await response.json();

      // Save checkout info to context
      setPolarCheckout(data.checkoutId, data.checkoutUrl);
      setCheckoutUrl(data.checkoutUrl);
    } catch (err) {
      console.error("Error creating checkout:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create checkout";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate total
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Order Summary</h3>

            <div className="space-y-2">
              {cartItems.map((item) => (
                <div
                  key={item.product_id}
                  className="flex justify-between text-sm"
                >
                  <span>
                    {item.title} x {item.quantity}
                  </span>
                  <span className="font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-base font-semibold">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {!checkoutUrl ? (
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Click the button below to proceed to secure payment powered by
            Polar.
          </p>
          <Button
            onClick={createPolarCheckout}
            disabled={isLoading || cartItems.length === 0}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating checkout session...
              </>
            ) : (
              "Proceed to Payment"
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            You will be redirected to Polar&apos;s secure checkout page.
          </p>
          <Button
            onClick={() => {
              window.location.href = checkoutUrl;
            }}
            className="w-full"
            size="lg"
          >
            Continue to Polar Checkout
          </Button>
        </div>
      )}

      <div className="text-muted-foreground bg-muted rounded-lg p-4 text-xs">
        <p className="font-medium">Secure Payment</p>
        <p className="mt-1">
          Your payment is processed securely by Polar. We never store your
          complete card details.
        </p>
      </div>
    </div>
  );
}
