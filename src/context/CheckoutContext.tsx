'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of shipping address
export interface ShippingAddress {
  street: string;
  city: string;
  zipCode: string;
  country: string;
}

// Define the shape of payment info (with limited card details for security)
export interface PaymentInfo {
  cardholderName: string;
  lastFourDigits: string;
  expiryDate: string;
}

// Define the checkout step type
export type CheckoutStep = 'shipping' | 'payment' | 'confirmation';

// Define context type
interface CheckoutContextType {
  currentStep: CheckoutStep;
  shippingAddress: ShippingAddress | null;
  paymentInfo: PaymentInfo | null;
  polarCheckoutId: string | null;
  polarCheckoutUrl: string | null;
  setCurrentStep: (step: CheckoutStep) => void;
  saveShippingAddress: (address: ShippingAddress) => void;
  savePaymentInfo: (info: PaymentInfo) => void;
  setPolarCheckout: (checkoutId: string, checkoutUrl: string) => void;
  resetCheckout: () => void;
}

// Create the context
const CheckoutContext = createContext<CheckoutContextType | undefined>(
  undefined
);

// Create provider component
export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [shippingAddress, setShippingAddress] =
    useState<ShippingAddress | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [polarCheckoutId, setPolarCheckoutIdState] = useState<string | null>(null);
  const [polarCheckoutUrl, setPolarCheckoutUrlState] = useState<string | null>(null);

  // Save shipping address
  const saveShippingAddress = (address: ShippingAddress) => {
    setShippingAddress(address);
    setCurrentStep('payment');
  };

  // Save payment info (only store necessary details, no full card numbers)
  const savePaymentInfo = (info: PaymentInfo) => {
    setPaymentInfo(info);
    setCurrentStep('confirmation');
  };

  // Save Polar checkout information
  const setPolarCheckout = (checkoutId: string, checkoutUrl: string) => {
    setPolarCheckoutIdState(checkoutId);
    setPolarCheckoutUrlState(checkoutUrl);
  };

  // Reset checkout data
  const resetCheckout = () => {
    setCurrentStep('shipping');
    setShippingAddress(null);
    setPaymentInfo(null);
    setPolarCheckoutIdState(null);
    setPolarCheckoutUrlState(null);
  };

  return (
    <CheckoutContext.Provider
      value={{
        currentStep,
        shippingAddress,
        paymentInfo,
        polarCheckoutId,
        polarCheckoutUrl,
        setCurrentStep,
        saveShippingAddress,
        savePaymentInfo,
        setPolarCheckout,
        resetCheckout,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

// Custom hook to use the checkout context
export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
}
