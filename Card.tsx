import React from 'react';
import { cn } from '../../lib/utils';

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(
        'bg-surface-container-low/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/5 shadow-2xl transition-all duration-300 hover:bg-surface-container-low/60', 
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}
