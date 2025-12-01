"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { toast } from "sonner";
import { createPolarCheckout } from "./actions";

export default function CheckoutRedirect() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function createCheckoutSession() {
      try {
        const result = await createPolarCheckout();

        if (!result.success || !result.checkoutUrl) {
          throw new Error(result.error || "Failed to create checkout session");
        }

        // Redirect to Polar hosted checkout
        window.location.href = result.checkoutUrl;
      } catch (err) {
        console.error("Error creating checkout session:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
        setIsLoading(false);
        toast.error("Failed to start checkout. Please try again.");
      }
    }

    createCheckoutSession();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-background min-h-screen py-12">
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle>Preparing checkout...</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <LoadingSpinner />
            <p className="text-muted-foreground mt-4">
              Redirecting to secure checkout...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background min-h-screen py-12">
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle>Checkout Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-destructive">{error}</p>
            <div className="flex gap-2">
              <Button onClick={() => router.push("/cart")} variant="outline">
                Return to Cart
              </Button>
              <Button onClick={() => router.push("/")}>
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
