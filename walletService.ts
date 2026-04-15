import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  getDocs 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Transaction } from '../types';

export const walletService = {
  /**
   * Subscribes to real-time transaction history for a specific user.
   * 
   * @param userId - The UID of the user.
   * @param limitCount - Maximum number of recent transactions to fetch.
   * @param callback - Function called with the list of transactions.
   */
  subscribeToTransactions(
    userId: string, 
    limitCount: number = 20, 
    callback: (transactions: Transaction[]) => void
  ) {
    const transactionsRef = collection(db, 'transactions');
    const q = query(
      transactionsRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    return onSnapshot(q, (snapshot) => {
      const transactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      callback(transactions);
    }, (error) => {
      console.error("[WalletService] Subscription failed:", error);
    });
  },

  /**
   * Fetches a one-time snapshot of recent transactions.
   * 
   * @param userId - The UID of the user.
   * @param limitCount - Maximum number of transactions to fetch.
   */
  async getRecentTransactions(userId: string, limitCount: number = 10): Promise<Transaction[]> {
    const transactionsRef = collection(db, 'transactions');
    const q = query(
      transactionsRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    try {
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
    } catch (error) {
      console.error("[WalletService] Failed to fetch transactions:", error);
      throw error;
    }
  },

  /**
   * Calculates the total earned vs spent for a user (optional utility).
   * 
   * @param userId - The UID of the user.
   */
  async getWalletStats(userId: string) {
    const transactions = await this.getRecentTransactions(userId, 100);
    
    return transactions.reduce((stats, tx) => {
      if (tx.amount > 0) {
        stats.totalEarned += tx.amount;
      } else {
        stats.totalSpent += Math.abs(tx.amount);
      }
      return stats;
    }, { totalEarned: 0, totalSpent: 0 });
  }
};
