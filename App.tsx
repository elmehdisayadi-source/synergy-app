import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { auth } from './lib/firebase';
import { Icons } from './components/Icons';
import { userService } from './services/userService';
import { UserProfile } from './types';
import { authService } from './services/authService';

// Layout
import { BottomNav, View } from './components/layout/BottomNav';

// Screens
import { OnboardingScreen, LoginScreen } from './screens/AuthScreens';
import { DiscoverScreen } from './screens/DiscoverScreen';
import { ChatScreen } from './screens/ChatScreen';
import { WalletScreen } from './screens/WalletScreen';
import { ProfileScreen } from './screens/ProfileScreen';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('splash');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let profileUnsubscribe: (() => void) | null = null;

    const authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Subscribe to real-time profile updates
        profileUnsubscribe = userService.subscribeToProfile(firebaseUser.uid, (updatedProfile) => {
          setProfile(updatedProfile);
        });
        
        // If logged in, always redirect to discover if on a guest view
        if (['splash', 'onboarding', 'login'].includes(currentView)) {
          setCurrentView('discover');
        }
      } else {
        setProfile(null);
        if (profileUnsubscribe) profileUnsubscribe();
        
        // If logged out, redirect to login unless on splash/onboarding
        if (!['splash', 'onboarding', 'login'].includes(currentView)) {
          setCurrentView('login');
        }
      }
      
      // Small delay to ensure splash is visible for at least a moment
      setTimeout(() => setLoading(false), 1000);
    });

    return () => {
      authUnsubscribe();
      if (profileUnsubscribe) profileUnsubscribe();
    };
  }, [currentView]);

  // Splash timer for guest flow
  useEffect(() => {
    if (currentView === 'splash' && !loading && !user) {
      const timer = setTimeout(() => {
        setCurrentView('onboarding');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentView, loading, user]);

  const handleGoogleLogin = async () => {
    try {
      await authService.loginWithGoogle();
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  // Always show splash while initial auth is loading
  if (loading) return <SplashView />;

  const renderView = () => {
    switch (currentView) {
      case 'splash': return <SplashView />;
      case 'onboarding': return <OnboardingScreen onNext={() => setCurrentView('login')} />;
      case 'login': return <LoginScreen onLogin={handleGoogleLogin} />;
      case 'discover': return <DiscoverScreen profile={profile} onStartChat={() => setCurrentView('chat')} />;
      case 'coaches': return <DiscoverScreen profile={profile} onStartChat={() => setCurrentView('chat')} />; // Reusing Discover for Coaches in MVP
      case 'chat': return <ChatScreen profile={profile} />;
      case 'wallet': return <WalletScreen profile={profile} />;
      case 'profile': return <ProfileScreen profile={profile} />;
      default: return <DiscoverScreen profile={profile} onStartChat={() => setCurrentView('chat')} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface overflow-x-hidden">
      <AnimatePresence mode="wait">
        {renderView()}
      </AnimatePresence>
      
      {['discover', 'coaches', 'chat', 'wallet', 'profile'].includes(currentView) && (
        <BottomNav active={currentView} onNavigate={setCurrentView} />
      )}
    </div>
  );
}

function SplashView() {
  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen bg-background"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative"
      >
        <div className="absolute -inset-8 bg-primary/20 blur-[100px] rounded-full"></div>
        <Icons.Sparkles className="w-32 h-32 text-primary relative" />
      </motion.div>
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center"
      >
        <h1 className="text-4xl font-headline font-black tracking-tighter text-on-surface">SYNERGY</h1>
        <p className="text-primary font-sans text-[10px] font-bold uppercase tracking-[0.3em] mt-2">The Social Alchemist</p>
      </motion.div>
      <div className="absolute bottom-12 w-48 h-1 bg-surface-container rounded-full overflow-hidden">
        <motion.div 
          initial={{ x: "-100%" }}
          animate={{ x: "0%" }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
          className="w-full h-full bg-primary"
        />
      </div>
    </motion.main>
  );
}
