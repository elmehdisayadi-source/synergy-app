import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs,
  limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Match {
  users: string[];
  compatibilityScore: number;
  goals: string[];
  status: 'pending' | 'active' | 'ignored';
}

export const matchingService = {
  /**
   * Fetches and ranks potential matches based on shared interests and a random synergy boost.
   * 
   * @param userId - The current user's UID to exclude from results.
   * @param userInterests - Array of interest tags from the current user's profile.
   */
  async findPotentialMatches(userId: string, userInterests: string[]) {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      return snapshot.docs
        .map(doc => {
          const data = doc.data();
          const otherInterests = data.compatibilityTags || [];
          
          // Base score calculation
          let score = 0;
          
          // 1. Interest Alignment: +50 if any interest matches
          const hasCommonInterest = userInterests.some(interest => 
            otherInterests.includes(interest)
          );
          if (hasCommonInterest) score += 50;
          
          // 2. Synergy Boost: Randomly add up to 50 points to keep the feed dynamic
          const randomBoost = Math.floor(Math.random() * 51);
          score += randomBoost;
          
          return { 
            id: doc.id, 
            ...data, 
            matchScore: score 
          };
        })
        // Exclude the current user from their own discover feed
        .filter(user => user.id !== userId)
        // Sort by highest match score first
        .sort((a, b) => b.matchScore - a.matchScore);
    } catch (error) {
      console.error("[MatchingService] Error fetching potential matches:", error);
      throw error;
    }
  },

  async createMatch(user1: string, user2: string, score: number) {
    await addDoc(collection(db, 'matches'), {
      users: [user1, user2],
      compatibilityScore: score,
      status: 'pending',
      createdAt: serverTimestamp()
    });
  }
};
