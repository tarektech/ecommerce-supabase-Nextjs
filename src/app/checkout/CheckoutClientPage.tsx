"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ShippingForm } from "@/components/checkout/ShippingForm";
import { PaymentForm } from "@/components/checkout/PaymentForm";
import { ConfirmationStep } from "@/components/checkout/ConfirmationStep";
import { StepIndicator } from "@/components/checkout/StepIndicator";
import { useSidebar } from "@/context/SidebarContext";
import { useCheckout } from "@/context/CheckoutContext";

interface CheckoutClientPageProps {
  username: string | null;
  email: string | null;
}

export default function CheckoutClientPage({
  username,
  email,
}: CheckoutClientPageProps) {
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
    expiryDate: string,
  ) => {
    savePaymentInfo({
      cardholderName,
      lastFourDigits,
      expiryDate,
    });
  };

  return (
    <div className="bg-background min-h-screen py-12">
      <Card>
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
          <CardDescription>Complete your purchase</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-8">
            <div className="relative mb-8 flex items-center justify-between">
              <StepIndicator
                step={1}
                label="Shipping"
                isActive={currentStep === "shipping"}
                isCompleted={
                  currentStep === "payment" || currentStep === "confirmation"
                }
              />
              <div className="bg-border absolute top-4 right-[20%] left-[20%] -z-10 h-0.5" />
              <StepIndicator
                step={2}
                label="Payment"
                isActive={currentStep === "payment"}
                isCompleted={currentStep === "confirmation"}
              />
              <div className="bg-border absolute top-4 right-[20%] left-[60%] -z-10 h-0.5" />
              <StepIndicator
                step={3}
                label="Confirmation"
                isActive={currentStep === "confirmation"}
                isCompleted={false}
              />
            </div>
          </div>

          {currentStep === "shipping" && (
            <ShippingForm
              username={username}
              email={email}
              onSubmit={saveShippingAddress}
            />
          )}
          {currentStep === "payment" && shippingAddress && (
            <PaymentForm
              onBack={() => setCurrentStep("shipping")}
              onSubmit={handlePaymentSubmit}
            />
          )}
          {currentStep === "confirmation" && (
            <ConfirmationStep
              email={email}
              onReturnHome={() => router.push("/")}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
