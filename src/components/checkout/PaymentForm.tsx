import React, { useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useCart } from '@/context/CartContext';
import { orderService } from '@/services/order/orderService';
import { addressService } from '@/services/address/addressService';

interface PaymentFormProps {
  onBack: () => void;
  onSubmit: () => void;
  shippingAddress: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
}

export const PaymentForm = ({
  onBack,
  onSubmit,
  shippingAddress,
}: PaymentFormProps) => {
  const cardNumberRef = useRef<HTMLInputElement>(null);
  const cardHolderRef = useRef<HTMLInputElement>(null);
  const expiryDateRef = useRef<HTMLInputElement>(null);
  const cvvRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { cartItems, subtotal: cartTotal, clearCart } = useCart();

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

    try {
      // 1. Create shipping address using addressService
      const newAddress = await addressService.saveAddress({
        address: {
          id: 0,
          user_id: user.id,
          street: shippingAddress.street,
          city: shippingAddress.city,
          zip_code: shippingAddress.zipCode,
          country: shippingAddress.country,
          state: '',
          is_default: false,
        },
        userId: user.id,
      });

      if (!newAddress) {
        throw new Error('Failed to create shipping address');
      }

      // 2. Create order and order items using orderService
      const orderItems = cartItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: parseFloat(item.price.toFixed(2)),
      }));

      const order = await orderService.createOrder({
        userId: user.id,
        items: orderItems,
        shippingAddress: newAddress,
        totalAmount: cartTotal,
        paymentIntentId: `DEMO-${Date.now()}`, // In a real app, this would come from a payment processor
      });

      if (!order) {
        throw new Error('Failed to create order');
      }

      // Clear the cart after successful order
      await clearCart();

      toast.success('Order placed successfully!');
      onSubmit(); // Only call onSubmit after everything is successful
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    }
  };

  function handleExpireDate(e: React.KeyboardEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const value = input.value.replace(/\D/g, '');

    if (value.length >= 2 && !input.value.includes('/')) {
      input.value = `${value.substring(0, 2)}/${value.substring(2)}`;
    } else if (value.length >= 2) {
      const month = parseInt(value.substring(0, 2));
      if (month < 1 || month > 12) {
        input.setCustomValidity('Month must be between 01 and 12');
      } else {
        input.setCustomValidity('');
      }
    }
  }

  function handleCardNumber(e: React.KeyboardEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    // Remove non-digit characters and limit to 16 digits
    const value = input.value.replace(/\D/g, '').substring(0, 16);

    // Format card number with spaces after every 4 digits
    let formattedValue = '';
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formattedValue += ' ';
      }
      formattedValue += value[i];
    }
    input.value = formattedValue;

    // Validate card number length
    if (value.length > 0 && value.length < 16) {
      input.setCustomValidity('Card number must be 16 digits');
    } else {
      input.setCustomValidity('');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="cardNumber">Card Number</Label>
          <Input
            id="cardNumber"
            ref={cardNumberRef}
            placeholder="1234 5678 9012 3456"
            onKeyUp={handleCardNumber}
            required
          />
        </div>
        <div>
          <Label htmlFor="cardHolder">Card Holder</Label>
          <Input
            id="cardHolder"
            ref={cardHolderRef}
            placeholder="John Doe"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <Input
              id="expiryDate"
              ref={expiryDateRef}
              placeholder="MM/YY"
              onKeyUp={handleExpireDate}
              required
            />
          </div>
          <div>
            <Label htmlFor="cvv">CVV</Label>
            <Input
              id="cvv"
              ref={cvvRef}
              placeholder="123"
              maxLength={3}
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
          Place Order
        </Button>
      </div>
    </form>
  );
};
