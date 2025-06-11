import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useCart } from '@/context/CartContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { useRouter } from 'next/navigation';

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
  // const router = useRouter();

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

    try {
      // Get last four digits of the card number
      const lastFourDigits = cardNumber.slice(-4);

      // Submit the payment info
      onSubmit(lastFourDigits, cardholderName, expiryDate);

      // You would implement your new payment processing logic here

      toast.success('Payment processed successfully');
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
            onChange={(e) => setCardNumber(e.target.value)}
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
              onChange={(e) => setExpiryDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cvv">CVV</Label>
            <Input
              id="cvv"
              placeholder="123"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
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
