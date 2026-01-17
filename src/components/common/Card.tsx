// src/components/common/Card.tsx
import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated';
}

export function Card({ className, variant = 'default', ...props }: CardProps) {
  const variantStyles = {
    default: 'bg-secondary border border-input',
    elevated: 'bg-background shadow-lg border border-border',
  };

  return (
    <div
      className={cn('rounded-lg p-6', variantStyles[variant], className)}
      {...props}
    />
  );
}
