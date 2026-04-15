import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { userService } from './userService';

/**
 * Optimized: Initialize GoogleAuthProvider once outside the function 
 * to prevent unnecessary re-instantiation on every login attempt.
 */
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const authService = {
  /**
   * Handles Google Login and ensures a corresponding user profile exists in Firestore.
   * Prevents duplicate creation and provides safe fallbacks for missing Auth data.
   */
  async loginWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const { uid, displayName, email, photoURL } = result.user;

      // Reliability: Check if profile already exists to prevent duplicate creation/overwrites
      const existingProfile = await userService.getProfile(uid);
      
      if (!existingProfile) {
        // Create new profile with safe fallbacks for all required fields
        await userService.createProfile({
          uid,
          displayName: displayName || 'Alchemist',
          email: email || '',
          photoURL: photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'User')}&background=random&color=fff`,
        });
      }
      
      return result.user;
    } catch (error: any) {
      // Improved Error Handling: Log clean, actionable errors for developers
      const errorCode = error.code || 'unknown';
      const errorMessage = error.message || 'An unexpected error occurred during login.';
      
      console.error(`[AuthService] Google Login Failed (${errorCode}): ${errorMessage}`);
      
      // User-friendly feedback
      if (errorCode !== 'auth/popup-closed-by-user') {
        alert('Login failed. Please check your connection and try again.');
      }
      
      throw error;
    }
  },

  /**
   * Signs out the current user and clears local state.
   */
  async logout() {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error(`[AuthService] Logout Error: ${error.message}`);
      throw error;
    }
  }
};
