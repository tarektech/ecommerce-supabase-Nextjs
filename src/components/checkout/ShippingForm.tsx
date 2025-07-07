import React, { useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate postal code format
    if (!/^\d{5}(-\d{4})?$/.test(postalCodeRef.current.value)) {
      toast.error("Invalid postal code format (e.g., 12345 or 12345-6789)");
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
    <div className="mx-auto w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-900/30 p-6 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="fullName"
              className="text-sm font-medium text-zinc-200"
            >
              Full Name
            </Label>
            <Input
              type="text"
              id="fullName"
              value={username || ""}
              disabled
              required
              className="border-zinc-700 bg-zinc-800/50 text-zinc-200 placeholder:text-zinc-500 focus:border-orange-500 focus:ring-orange-500"
            />
            <p className="text-muted-foreground text-xs">
              {username || "No username available"}
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-zinc-200"
            >
              Email
            </Label>
            <Input
              type="email"
              id="email"
              value={email || ""}
              disabled
              required
              className="border-zinc-700 bg-zinc-800/50 text-zinc-200 placeholder:text-zinc-500 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="address"
              className="text-sm font-medium text-zinc-200"
            >
              Street Address
            </Label>
            <Input
              type="text"
              id="address"
              ref={addressRef}
              placeholder="123 Main St, Apt 4B"
              required
              className="border-zinc-700 bg-zinc-800/50 text-zinc-200 placeholder:text-zinc-500 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="city"
                className="text-sm font-medium text-zinc-200"
              >
                City
              </Label>
              <Input
                type="text"
                id="city"
                ref={cityRef}
                placeholder="New York"
                required
                className="border-zinc-700 bg-zinc-800/50 text-zinc-200 placeholder:text-zinc-500 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="postalCode"
                className="text-sm font-medium text-zinc-200"
              >
                Postal Code
              </Label>
              <Input
                type="text"
                id="postalCode"
                ref={postalCodeRef}
                placeholder="12345"
                maxLength={5}
                required
                className="border-zinc-700 bg-zinc-800/50 text-zinc-200 placeholder:text-zinc-500 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="country"
              className="text-sm font-medium text-zinc-200"
            >
              Country
            </Label>
            <Input
              type="text"
              id="country"
              ref={countryRef}
              placeholder="United States"
              required
              className="border-zinc-700 bg-zinc-800/50 text-zinc-200 placeholder:text-zinc-500 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="mt-6 w-full cursor-pointer rounded-md bg-orange-500 px-4 py-2 font-medium text-white transition-colors hover:bg-orange-600"
        >
          Continue to Payment
        </Button>
      </form>
    </div>
  );
};
