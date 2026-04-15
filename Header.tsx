import React from 'react';
import { Icons } from '../Icons';
import { Avatar } from '../ui/Avatar';
import { UserProfile } from '../../types';

interface HeaderProps {
  profile?: UserProfile | null;
  title?: string;
  showCoins?: boolean;
  showNotifications?: boolean;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export function Header({ 
  profile, 
  title = "Synergy", 
  showCoins = true, 
  showNotifications = true,
  leftElement,
  rightElement
}: HeaderProps) {
  return (
    <header className="fixed top-0 w-full z-50 glass flex justify-between items-center px-6 py-4">
      <div className="flex items-center gap-3">
        {leftElement || (
          <>
            <Avatar src={profile?.photoURL} alt={profile?.displayName} />
            <h1 className="text-2xl font-black bg-gradient-to-br from-primary to-primary-container bg-clip-text text-transparent font-headline tracking-tight">
              {title}
            </h1>
          </>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {showCoins && (
          <div className="bg-surface-container px-3 py-1 rounded-full flex items-center gap-2">
            <Icons.Coins className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold">{profile?.coins || 0}</span>
          </div>
        )}
        
        {showNotifications && (
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:opacity-80 transition-opacity">
            <Icons.Notifications className="w-5 h-5 text-primary" />
          </button>
        )}

        {rightElement}
      </div>
    </header>
  );
}
