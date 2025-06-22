import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useCart } from '@/context/CartContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

interface PaymentFormProps {
  onBack: () => void;
  onSubmit: (
    lastFourDigits: string,
    cardholderName: string,
    expiryDate: string
  ) => void;
}

export const PaymentForm = ({ onBack, onSubmit }: PaymentFormProps) => {
  const { user } = useAuth();
  const { cartItems } = useCart();
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState(
    user?.user_metadata?.full_name || ''
  );
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const router = useRouter();

  // Format card number with spaces every 4 digits
  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Limit to 16 digits
    const limitedDigits = digits.slice(0, 16);
    // Add spaces every 4 digits
    return limitedDigits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  // Format expiry date as MM/YY
  const formatExpiryDate = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Limit to 4 digits
    const limitedDigits = digits.slice(0, 4);
    // Add slash after 2 digits
    if (limitedDigits.length >= 2) {
      return limitedDigits.slice(0, 2) + '/' + limitedDigits.slice(2);
    }
    return limitedDigits;
  };

  // Format CVV to numeric only
  const formatCVV = (value: string) => {
    // Remove all non-digits and limit to 4 digits
    return value.replace(/\D/g, '').slice(0, 4);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    setExpiryDate(formatted);
  };

  const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCVV(e.target.value);
    setCvv(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('You must be logged in to place an order');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Validate credit card information
    if (!cardNumber || !cardholderName || !expiryDate || !cvv) {
      toast.error('Please fill in all payment details');
      return;
    }

    // Validate card number (should be 16 digits when spaces are removed)
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    if (cleanCardNumber.length !== 16) {
      toast.error('Card number must be 16 digits');
      return;
    }

    // Validate expiry date format
    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      toast.error('Expiry date must be in MM/YY format');
      return;
    }

    // Validate CVV length
    if (cvv.length < 3 || cvv.length > 4) {
      toast.error('CVV must be 3 or 4 digits');
      return;
    }

    try {
      // Get last four digits of the card number
      const lastFourDigits = cleanCardNumber.slice(-4);

      // Submit the payment info
      onSubmit(lastFourDigits, cardholderName, expiryDate);

      // You would implement your new payment processing logic here

      toast.success('Payment processed successfully');

      // Navigate to confirmation page
      const checkoutId = `${Date.now()}`;
      router.push(`/checkout/confirmation?checkout_id=${checkoutId}`);
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cardNumber">Card Number</Label>
          <Input
            id="cardNumber"
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChange={handleCardNumberChange}
            maxLength={19} // 16 digits + 3 spaces
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cardholderName">Cardholder Name</Label>
          <Input
            id="cardholderName"
            placeholder="John Doe"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <Input
              id="expiryDate"
              placeholder="MM/YY"
              value={expiryDate}
              onChange={handleExpiryDateChange}
              maxLength={5} // MM/YY format
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cvv">CVV</Label>
            <Input
              id="cvv"
              placeholder="123"
              value={cvv}
              onChange={handleCVVChange}
              maxLength={4} // 3-4 digits
              required
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" className="cursor-pointer">
          Complete Payment
        </Button>
      </div>
    </form>
  );
};
