import React from 'react';
import { cn } from '../../lib/utils';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export function Button({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  children, 
  ...props 
}: ButtonProps) {
  const variants = {
    primary: 'bg-primary text-on-primary shadow-[0_0_20px_rgba(255,177,193,0.3)] hover:shadow-[0_0_30px_rgba(255,177,193,0.5)] active:scale-[0.98]',
    secondary: 'glass text-on-surface hover:bg-surface-container-high active:scale-[0.98]',
    outline: 'border border-primary/30 bg-transparent text-primary hover:bg-primary/10 active:scale-[0.98]',
    ghost: 'bg-transparent text-on-surface/50 hover:text-primary hover:bg-primary/5 active:scale-[0.98]',
  };

  const sizes = {
    sm: 'px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em]',
    md: 'px-6 py-3.5 text-xs font-black uppercase tracking-[0.2em]',
    lg: 'px-8 py-5 text-sm font-black uppercase tracking-[0.2em]',
  };

  return (
    <button
      className={cn(
        'rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-40 disabled:pointer-events-none select-none',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : children}
    </button>
  );
}
