export type UserRole = 'user' | 'coach' | 'admin';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  role: UserRole;
  coins: number;
  bio?: string;
  compatibilityTags?: string[];
  createdAt: any;
  lastActive?: any;
}

export interface Message {
  id?: string;
  senderId: string;
  text: string;
  type: 'text' | 'voice' | 'insight';
  isLocked?: boolean;
  unlockCost?: number;
  unlockedBy?: string[];
  timestamp: any;
}

export interface ChatMetadata {
  chatId: string;
  participants: string[];
  lastMessage?: string;
  lastTimestamp?: any;
  unreadCount?: { [uid: string]: number };
  typing?: { [uid: string]: boolean };
}

export interface Transaction {
  id?: string;
  userId: string;
  amount: number;
  type: 'purchase' | 'spend' | 'earn' | 'payout';
  description: string;
  timestamp: any;
}

export interface Match {
  id?: string;
  users: string[];
  compatibilityScore: number;
  status: 'pending' | 'active' | 'ignored';
  createdAt: any;
}
