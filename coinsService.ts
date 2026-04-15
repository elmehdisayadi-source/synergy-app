import { 
  doc, 
  runTransaction, 
  serverTimestamp, 
  collection, 
  increment 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Constants for coin-related costs across the app.
 */
export const COIN_COSTS = {
  SEND_MESSAGE: 1,
  UNLOCK_MESSAGE: 5,
};

export const coinsService = {
  /**
   * Securely deducts coins from a user's balance.
   * Uses a Firestore transaction to ensure the balance never drops below zero.
   * 
   * @param userId - The UID of the user.
   * @param amount - The number of coins to deduct.
   * @param description - A brief description for the transaction log.
   */
  async deductCoins(userId: string, amount: number, description: string) {
    const userRef = doc(db, 'users', userId);
    
    try {
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists()) {
          throw new Error("User profile not found.");
        }

        const currentCoins = userDoc.data().coins || 0;

        // Prevent negative balance
        if (currentCoins < amount) {
          throw new Error("Insufficient coins. Please top up your wallet.");
        }

        // 1. Update user balance atomically
        transaction.update(userRef, {
          coins: increment(-amount),
          updatedAt: serverTimestamp()
        });

        // 2. Create a transaction record for audit and history
        const txRef = doc(collection(db, 'transactions'));
        transaction.set(txRef, {
          userId,
          amount: -amount,
          type: 'spend',
          description,
          timestamp: serverTimestamp()
        });
      });
    } catch (error) {
      console.error("[CoinsService] Deduction failed:", error);
      throw error;
    }
  },

  /**
   * Adds coins to a user's balance (e.g., via purchase, reward, or bonus).
   * 
   * @param userId - The UID of the user.
   * @param amount - The number of coins to add.
   * @param description - A brief description for the transaction log.
   */
  async addCoins(userId: string, amount: number, description: string) {
    const userRef = doc(db, 'users', userId);
    
    try {
      await runTransaction(db, async (transaction) => {
        // 1. Update user balance atomically
        transaction.update(userRef, {
          coins: increment(amount),
          updatedAt: serverTimestamp()
        });

        // 2. Create a transaction record
        const txRef = doc(collection(db, 'transactions'));
        transaction.set(txRef, {
          userId,
          amount,
          type: 'earn',
          description,
          timestamp: serverTimestamp()
        });
      });
    } catch (error) {
      console.error("[CoinsService] Addition failed:", error);
      throw error;
    }
  },

  /**
   * Helper to check if a user can afford a specific cost.
   * Useful for pre-flight UI checks.
   */
  async canAfford(userId: string, amount: number): Promise<boolean> {
    const userRef = doc(db, 'users', userId);
    const userDoc = await (await import('firebase/firestore')).getDoc(userRef);
    
    if (!userDoc.exists()) return false;
    return (userDoc.data().coins || 0) >= amount;
  }
};
