import React from 'react';
import { Button } from '@/components/ui/button';

interface ConfirmationStepProps {
  email: string | null;
  onReturnHome: () => void;
}

export const ConfirmationStep = ({
  email,
  onReturnHome,
}: ConfirmationStepProps) => {
  return (
    <div className="text-center space-y-4">
      <div className="text-primary text-6xl">✓</div>
      <h2 className="text-2xl font-semibold">Thank you for your order!</h2>
      <p className="text-muted-foreground">
        We've sent a confirmation email to {email}
      </p>
      <Button onClick={onReturnHome} className="mt-4">
        Return to Home
      </Button>
    </div>
  );
};
