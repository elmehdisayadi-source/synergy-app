import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot,
  serverTimestamp,
  collection,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * User Profile Schema
 */
export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  role: 'user' | 'coach' | 'admin';
  coins: number;
  bio?: string;
  compatibilityTags?: string[];
  createdAt: any;
  updatedAt?: any;
}

export const userService = {
  /**
   * Fetches a user profile by UID.
   */
  async getProfile(uid: string): Promise<UserProfile | null> {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
  },

  /**
   * Creates a new user profile with a welcome bonus.
   * Uses a write batch to ensure atomicity between profile creation and transaction logging.
   */
  async createProfile(profile: Partial<UserProfile>) {
    if (!profile.uid) throw new Error("User UID is required for profile creation.");
    
    const docRef = doc(db, 'users', profile.uid);
    const welcomeBonus = 50;
    
    try {
      const batch = writeBatch(db);
      
      // Initialize profile with default values and welcome bonus
      const newProfile: UserProfile = {
        uid: profile.uid,
        displayName: profile.displayName || 'Alchemist',
        email: profile.email || '',
        photoURL: profile.photoURL || '',
        role: 'user',
        coins: welcomeBonus,
        compatibilityTags: ['growth', 'mindset'],
        createdAt: serverTimestamp(),
        ...profile, // Allow overrides if provided
      };

      batch.set(docRef, newProfile, { merge: true });

      // Log the welcome bonus transaction for audit/consistency
      const txRef = doc(collection(db, 'transactions'));
      batch.set(txRef, {
        userId: profile.uid,
        amount: welcomeBonus,
        type: 'earn',
        description: 'Welcome Bonus',
        timestamp: serverTimestamp()
      });

      await batch.commit();
    } catch (error) {
      console.error("[UserService] Failed to create profile:", error);
      throw error;
    }
  },

  /**
   * Updates an existing user profile.
   */
  async updateProfile(uid: string, data: Partial<UserProfile>) {
    const docRef = doc(db, 'users', uid);
    try {
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("[UserService] Failed to update profile:", error);
      throw error;
    }
  },

  /**
   * Subscribes to real-time profile updates.
   */
  subscribeToProfile(uid: string, callback: (profile: UserProfile) => void) {
    return onSnapshot(doc(db, 'users', uid), (doc) => {
      if (doc.exists()) {
        callback(doc.data() as UserProfile);
      }
    });
  }
};
