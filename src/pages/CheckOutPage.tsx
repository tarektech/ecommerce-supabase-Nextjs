import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { ShippingForm } from '@/components/checkout/ShippingForm';
import { PaymentForm } from '@/components/checkout/PaymentForm';
import { ConfirmationStep } from '@/components/checkout/ConfirmationStep';
import { StepIndicator } from '@/components/checkout/StepIndicator';

type CheckoutStep = 'shipping' | 'payment' | 'confirmation';

interface ShippingAddress {
  street: string;
  city: string;
  zipCode: string;
  country: string;
}

const CheckOutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { username, email } = useProfile(user);
  const [currentStep, setCurrentStep] =
    React.useState<CheckoutStep>('shipping');
  const [shippingAddress, setShippingAddress] =
    useState<ShippingAddress | null>(null);

  const handleShippingSubmit = (address: ShippingAddress) => {
    setShippingAddress(address);
    setCurrentStep('payment');
  };

  const handlePaymentSubmit = () => {
    setCurrentStep('confirmation');
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
                onSubmit={handleShippingSubmit}
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
                onReturnHome={() => navigate('/')}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckOutPage;
