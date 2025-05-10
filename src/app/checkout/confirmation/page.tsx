'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const checkoutId = searchParams.get('checkout_id');
  const router = useRouter();
  const { clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    if (checkoutId) {
      // Clear the cart after successful payment
      clearCart();
      setIsProcessing(false);
    }
  }, [checkoutId, clearCart]);

  const handleContinueShopping = () => {
    router.push('/products');
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-background py-12">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Processing your order...</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Please wait while we confirm your payment.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Thank you for your order!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Your order has been successfully placed. You will receive a
            confirmation email shortly.
          </p>
          <div className="flex justify-center">
            <Button onClick={handleContinueShopping}>Continue Shopping</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
