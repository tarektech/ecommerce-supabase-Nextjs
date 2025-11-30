"use client";
import React from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import ShippingForm from "@/components/checkout/ShippingForm";
import PaymentForm from "@/components/checkout/PaymentForm";
import { ConfirmationStep } from "@/components/checkout/ConfirmationStep";
import { StepIndicator } from "@/components/checkout/StepIndicator";
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
  const { currentStep, shippingAddress, saveShippingAddress } = useCheckout();

  return (
    <div className="bg-background min-h-screen py-12">
      <Card className="mx-auto max-w-2xl">
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
              username={username || ""}
              email={email || ""}
              onSubmit={(data) =>
                saveShippingAddress({
                  street: data.street_address,
                  city: data.city,
                  zipCode: data.postal_code,
                  country: data.country,
                })
              }
            />
          )}
          {currentStep === "payment" && shippingAddress && <PaymentForm />}
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
