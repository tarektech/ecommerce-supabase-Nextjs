'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { ShippingForm } from '@/components/checkout/ShippingForm';
import { PaymentForm } from '@/components/checkout/PaymentForm';
import { ConfirmationStep } from '@/components/checkout/ConfirmationStep';
import { StepIndicator } from '@/components/checkout/StepIndicator';
import { useSidebar } from '@/context/SidebarContext';
import { useCheckout, CheckoutProvider } from '@/context/CheckoutContext';

interface CheckoutClientPageProps {
  username: string | null;
  email: string | null;
}

const CheckoutContent = ({ username, email }: CheckoutClientPageProps) => {
  const router = useRouter();
  const { setHideSidebar } = useSidebar();
  const {
    currentStep,
    shippingAddress,
    setCurrentStep,
    saveShippingAddress,
    savePaymentInfo,
  } = useCheckout();

  // Hide sidebar when component mounts
  useEffect(() => {
    setHideSidebar(true);

    // Show sidebar again when component unmounts
    return () => {
      setHideSidebar(false);
    };
  }, [setHideSidebar]);

  const handlePaymentSubmit = (
    lastFourDigits: string,
    cardholderName: string,
    expiryDate: string
  ) => {
    savePaymentInfo({
      cardholderName,
      lastFourDigits,
      expiryDate,
    });
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
            <CardDescription>Complete your purchase</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-8">
              <div className="flex items-center justify-between relative mb-8">
                <StepIndicator
                  step={1}
                  label="Shipping"
                  isActive={currentStep === 'shipping'}
                  isCompleted={
                    currentStep === 'payment' || currentStep === 'confirmation'
                  }
                />
                <div className="absolute left-[20%] right-[20%] top-4 h-0.5 bg-border -z-10" />
                <StepIndicator
                  step={2}
                  label="Payment"
                  isActive={currentStep === 'payment'}
                  isCompleted={currentStep === 'confirmation'}
                />
                <div className="absolute left-[60%] right-[20%] top-4 h-0.5 bg-border -z-10" />
                <StepIndicator
                  step={3}
                  label="Confirmation"
                  isActive={currentStep === 'confirmation'}
                  isCompleted={false}
                />
              </div>
            </div>

            {currentStep === 'shipping' && (
              <ShippingForm
                username={username}
                email={email}
                onSubmit={saveShippingAddress}
              />
            )}
            {currentStep === 'payment' && shippingAddress && (
              <PaymentForm
                onBack={() => setCurrentStep('shipping')}
                onSubmit={handlePaymentSubmit}
                shippingAddress={shippingAddress}
              />
            )}
            {currentStep === 'confirmation' && (
              <ConfirmationStep
                email={email}
                onReturnHome={() => router.push('/')}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function CheckoutClientPage({
  username,
  email,
}: CheckoutClientPageProps) {
  return (
    <CheckoutProvider>
      <CheckoutContent username={username} email={email} />
    </CheckoutProvider>
  );
}
