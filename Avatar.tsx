import { cn } from '../../lib/utils';

export function Avatar({ src, alt, size = 'md', className }: { src?: string, alt?: string, size?: 'sm' | 'md' | 'lg' | 'xl', className?: string }) {
  const sizes = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32',
  };

  return (
    <div className={cn('rounded-3xl overflow-hidden border-2 border-primary/10 bg-surface-container-highest flex-shrink-0 relative group transition-transform duration-300 hover:scale-105', sizes[size], className)}>
      <img 
        src={src || `https://picsum.photos/seed/${alt || 'user'}/200/200`} 
        alt={alt} 
        className="w-full h-full object-cover" 
        referrerPolicy="no-referrer" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}
