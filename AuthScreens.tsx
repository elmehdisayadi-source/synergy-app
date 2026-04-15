import { motion } from 'motion/react';
import { Icons } from '../components/Icons';
import { Button } from '../components/ui';

export function OnboardingScreen({ onNext }: { onNext: () => void }) {
  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen px-8 text-center space-y-12"
    >
      <div className="relative">
        <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full"></div>
        <Icons.Sparkles className="w-24 h-24 text-primary relative animate-pulse" />
      </div>
      <div className="space-y-4">
        <h1 className="text-5xl font-headline font-black tracking-tighter leading-none">Social<br/><span className="text-primary">Alchemy</span></h1>
        <p className="text-slate-400 text-lg font-medium max-w-xs mx-auto">Transform your social frequency into pure gold through elite coaching.</p>
      </div>
      <Button size="lg" className="w-full max-w-xs" onClick={onNext}>
        Begin Transformation
      </Button>
    </motion.main>
  );
}

export function LoginScreen({ onLogin }: { onLogin: () => void }) {
  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen px-8 space-y-12"
    >
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-headline font-black tracking-tight">Welcome Back,<br/><span className="text-primary">Alchemist</span></h2>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Sign in to continue your journey</p>
      </div>
      
      <div className="w-full max-w-xs space-y-4">
        <Button variant="secondary" className="w-full py-4 flex items-center justify-center gap-4" onClick={onLogin}>
          <span className="text-xl font-black">G</span>
          Continue with Google
        </Button>
        <div className="flex items-center gap-4 py-4">
          <div className="flex-1 h-px bg-white/5"></div>
          <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-white/5"></div>
        </div>
        <div className="space-y-4 opacity-50 pointer-events-none">
          <div className="bg-surface-container-low h-14 rounded-2xl border border-white/5"></div>
          <div className="bg-surface-container-low h-14 rounded-2xl border border-white/5"></div>
          <Button className="w-full">Sign In</Button>
        </div>
      </div>
    </motion.main>
  );
}
