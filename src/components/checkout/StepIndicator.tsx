import React from 'react';

interface StepIndicatorProps {
  step: number;
  label: string;
  isActive: boolean;
  isCompleted: boolean;
}

export const StepIndicator = ({
  step,
  label,
  isActive,
  isCompleted,
}: StepIndicatorProps) => (
  <div className="flex items-center">
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center ${
        isActive || isCompleted
          ? 'bg-primary text-primary-foreground'
          : 'bg-secondary text-secondary-foreground'
      }`}
    >
      {step}
    </div>
    <span className="ml-2 text-sm whitespace-nowrap">{label}</span>
  </div>
);
