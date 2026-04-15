import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Icons } from '../components/Icons';
import { Avatar, Card, Button } from '../components/ui';
import { Header } from '../components/layout/Header';
import { UserProfile } from '../types';
import { matchingService } from '../services/matchingService';

export function DiscoverScreen({ profile, onStartChat }: { profile: UserProfile | null, onStartChat: (targetUid: string) => void }) {
  const [potentialMatches, setPotentialMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMatches() {
      if (!profile) return;
      try {
        const matches = await matchingService.findPotentialMatches(profile.uid, profile.compatibilityTags || ['growth', 'mindset']);
        setPotentialMatches(matches);
      } catch (error) {
        console.error('Failed to load matches', error);
      } finally {
        setLoading(false);
      }
    }
    loadMatches();
  }, [profile]);

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-24 pb-40 px-6 flex flex-col items-center max-w-md mx-auto min-h-screen"
    >
      <Header profile={profile} />

      <div className="w-full mb-10 text-left">
        <motion.h2 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-5xl font-headline font-black tracking-tighter text-on-surface leading-[0.9]"
        >
          Discover<br/><span className="text-primary">Your Synergy</span>
        </motion.h2>
        <p className="text-on-surface/40 text-sm mt-6 font-medium leading-relaxed">Find mentors and partners aligned with your frequency.</p>
      </div>

      <div className="w-full space-y-8">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="w-full h-48 skeleton" />
          ))
        ) : potentialMatches.length > 0 ? (
          potentialMatches.map((match, i) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Card className="relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
                <div className="absolute top-0 right-0 bg-primary/10 px-5 py-2 rounded-bl-3xl border-l border-b border-white/5">
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.1em]">
                    {match.matchScore}% Match
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <Avatar src={match.photoURL} alt={match.displayName} size="lg" />
                  <div className="flex-1">
                    <h3 className="text-xl font-headline font-black text-on-surface tracking-tight">{match.displayName}</h3>
                    <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-1">{match.role}</p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {(match.compatibilityTags || ['Growth']).slice(0, 3).map((tag: string) => (
                        <span key={tag} className="text-[9px] bg-white/5 px-3 py-1 rounded-full text-on-surface/60 font-bold uppercase tracking-wider border border-white/5">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <Button 
                  variant="primary" 
                  size="md" 
                  className="w-full mt-8"
                  onClick={() => onStartChat(match.uid)}
                >
                  Start Synergy
                </Button>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-32 text-on-surface/20">
            <Icons.Search className="w-16 h-16 mx-auto mb-6 opacity-10" />
            <p className="font-headline font-bold uppercase tracking-widest text-xs">No matches found yet</p>
          </div>
        )}
      </div>
    </motion.main>
  );
}
