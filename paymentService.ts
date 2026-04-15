import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs,
  doc,
  updateDoc,
  increment
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export const paymentService = {
  async purchaseCoins(userId: string, amount: number, price: number) {
    // In a real app, this would be called after a successful Stripe/Apple Pay callback
    const transactionRef = collection(db, 'transactions');
    
    await addDoc(transactionRef, {
      userId,
      amount,
      type: 'purchase',
      description: `Purchased ${amount} coins for $${price}`,
      timestamp: serverTimestamp()
    });

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      coins: increment(amount)
    });
  },

  async payoutCoach(coachId: string, amount: number) {
    const transactionRef = collection(db, 'transactions');
    
    await addDoc(transactionRef, {
      userId: coachId,
      amount: -amount,
      type: 'payout',
      description: `Payout of ${amount} coins`,
      timestamp: serverTimestamp()
    });

    const userRef = doc(db, 'users', coachId);
    await updateDoc(userRef, {
      coins: increment(-amount)
    });
  }
};
