import React from 'react';
import { cn } from '../../lib/utils';

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full bg-surface-container-lowest/50 border border-white/5 rounded-2xl px-6 py-4.5 text-on-surface placeholder:text-on-surface/30 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-surface-container-lowest transition-all duration-300 font-medium',
        className
      )}
      {...props}
    />
  );
}
