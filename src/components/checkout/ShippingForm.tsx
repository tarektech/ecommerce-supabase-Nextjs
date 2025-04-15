import React, { useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ShippingFormProps {
  username: string | null;
  email: string | null;
  onSubmit: (shippingAddress: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  }) => void;
}

export const ShippingForm = ({
  username,
  email,
  onSubmit,
}: ShippingFormProps) => {
  const addressRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const postalCodeRef = useRef<HTMLInputElement>(null);
  const countryRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (
      !addressRef.current?.value ||
      !cityRef.current?.value ||
      !postalCodeRef.current?.value ||
      !countryRef.current?.value
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate postal code format
    if (!/^\d{5}(-\d{4})?$/.test(postalCodeRef.current.value)) {
      toast.error('Invalid postal code format (e.g., 12345 or 12345-6789)');
      return;
    }

    onSubmit({
      street: addressRef.current.value,
      city: cityRef.current.value,
      zipCode: postalCodeRef.current.value,
      country: countryRef.current.value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            type="text"
            id="fullName"
            defaultValue={username || ''}
            disabled={true}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            defaultValue={email || ''}
            disabled={true}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Street Address</Label>
          <Input
            type="text"
            id="address"
            ref={addressRef}
            placeholder="123 Main St, Apt 4B"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              type="text"
              id="city"
              ref={cityRef}
              placeholder="New York"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input
              type="text"
              id="postalCode"
              ref={postalCodeRef}
              placeholder="12345"
              maxLength={5}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            type="text"
            id="country"
            ref={countryRef}
            placeholder="United States"
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full">
        Continue to Payment
      </Button>
    </form>
  );
};
