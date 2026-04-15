import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, getDocFromServer, doc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase (Singleton pattern)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize services
export const auth = getAuth();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

/**
 * Verifies Firebase connectivity and configuration on startup.
 * This helps catch API key or network issues early.
 */
(async function verifyFirebase() {
  try {
    await getDocFromServer(doc(db, '_internal_', 'connectivity'));
  } catch (error: any) {
    if (error.code === 'invalid-argument') {
      console.error('Firebase: Invalid configuration. Check your API keys.');
    } else if (error.message?.includes('offline')) {
      console.warn('Firebase: Working in offline mode.');
    }
  }
})();
