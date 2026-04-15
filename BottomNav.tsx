import { motion } from 'motion/react';
import { Icons } from '../Icons';
import { cn } from '../../lib/utils';

export type View = 'splash' | 'onboarding' | 'login' | 'discover' | 'coaches' | 'chat' | 'wallet' | 'profile';

interface BottomNavProps {
  active: View;
  onNavigate: (view: View) => void;
}

export function BottomNav({ active, onNavigate }: BottomNavProps) {
  const items: { id: View, icon: keyof typeof Icons, label: string }[] = [
    { id: 'discover', icon: 'Discover', label: 'Discover' },
    { id: 'coaches', icon: 'Coaches', label: 'Coaches' },
    { id: 'chat', icon: 'Chat', label: 'Chat' },
    { id: 'wallet', icon: 'Wallet', label: 'Wallet' },
    { id: 'profile', icon: 'Profile', label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-6 pb-8 pt-4 bg-surface-container/40 backdrop-blur-2xl border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      {items.map((item) => {
        const Icon = Icons[item.icon];
        const isActive = active === item.id;
        return (
          <button 
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn(
              'flex flex-col items-center justify-center transition-all duration-500 relative group',
              isActive ? 'text-primary' : 'text-on-surface/40 hover:text-on-surface/70'
            )}
          >
            <div className={cn(
              'p-2.5 rounded-2xl transition-all duration-500',
              isActive ? 'bg-primary/10 shadow-[0_0_20px_rgba(255,177,193,0.1)]' : 'group-hover:bg-white/5'
            )}>
              <Icon className={cn(
                'w-6 h-6 transition-all duration-500',
                isActive ? 'fill-primary scale-110' : 'fill-none stroke-[1.5px]'
              )} />
            </div>
            <span className={cn(
              'font-sans text-[9px] font-black uppercase tracking-[0.2em] mt-2 transition-all duration-500',
              isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
            )}>
              {item.label}
            </span>
            {isActive && (
              <motion.div 
                layoutId="nav-active"
                className="absolute -bottom-2 w-1 h-1 bg-primary rounded-full shadow-[0_0_10px_#ffb1c1]"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
