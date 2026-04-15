import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icons } from '../components/Icons';
import { Avatar, Card, Button, Input } from '../components/ui';
import { Header } from '../components/layout/Header';
import { UserProfile } from '../types';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

export function ProfileScreen({ profile }: { profile: UserProfile | null }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    bio: profile?.bio || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateProfile = async () => {
    if (!profile) return;
    setIsSaving(true);
    try {
      await userService.updateProfile(profile.uid, formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-24 pb-32 px-6 max-w-md mx-auto min-h-screen space-y-8"
    >
      <Header 
        profile={profile} 
        title={isEditing ? "Settings" : "Profile"} 
        showCoins={false} 
        showNotifications={false}
        rightElement={
          !isEditing ? (
            <button onClick={() => authService.logout()} className="text-on-surface/40 hover:text-primary transition-colors">
              <Icons.Logout className="w-6 h-6" />
            </button>
          ) : (
            <button onClick={() => setIsEditing(false)} className="text-on-surface/40 hover:text-primary transition-colors">
              <Icons.X className="w-6 h-6" />
            </button>
          )
        }
      />

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="editing"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-2">Display Name</label>
                <Input 
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-2">Bio</label>
                <textarea 
                  className="w-full bg-surface-container-lowest/50 border border-white/5 rounded-2xl px-6 py-4.5 text-on-surface placeholder:text-on-surface/30 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-surface-container-lowest transition-all duration-300 font-medium min-h-[120px] resize-none"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about your frequency..."
                />
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <Button 
                variant="primary" 
                className="w-full" 
                onClick={handleUpdateProfile}
                isLoading={isSaving}
              >
                Save Changes
              </Button>
              <Button 
                variant="secondary" 
                className="w-full" 
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="viewing"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            <div className="flex flex-col items-center gap-4">
              <Avatar src={profile?.photoURL} alt={profile?.displayName} size="xl" className="border-4 border-primary/20 shadow-2xl" />
              <div className="text-center">
                <h2 className="text-2xl font-headline font-black tracking-tight">{profile?.displayName}</h2>
                <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mt-1">{profile?.role}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 flex flex-col items-center">
                <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-1">Balance</p>
                <div className="flex items-center gap-2">
                  <Icons.Coins className="w-5 h-5 text-primary" />
                  <span className="text-xl font-black">{profile?.coins}</span>
                </div>
              </Card>
              <Card className="p-6 flex flex-col items-center">
                <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-1">Status</p>
                <div className="flex items-center gap-2">
                  <Icons.Sparkles className="w-5 h-5 text-primary" />
                  <span className="text-xl font-black">Gold</span>
                </div>
              </Card>
            </div>

            {profile?.bio && (
              <Card className="p-6">
                <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-3">Bio</p>
                <p className="text-on-surface/60 text-sm leading-relaxed italic">"{profile.bio}"</p>
              </Card>
            )}

            <div className="space-y-4">
              <button 
                onClick={() => setIsEditing(true)}
                className="w-full glass hover:bg-surface-container-high p-5 rounded-[2rem] flex items-center justify-between transition-all duration-300 group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                    <Icons.Settings className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-bold text-sm uppercase tracking-widest">Account Settings</span>
                </div>
                <Icons.ChevronRight className="w-5 h-5 text-on-surface/20 group-hover:text-primary transition-colors" />
              </button>
              
              <button className="w-full glass hover:bg-surface-container-high p-5 rounded-[2rem] flex items-center justify-between transition-all duration-300 group">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-white/5 rounded-xl group-hover:bg-white/10 transition-colors">
                    <Icons.Shield className="w-5 h-5 text-on-surface/40" />
                  </div>
                  <span className="font-bold text-sm uppercase tracking-widest text-on-surface/60">Privacy & Safety</span>
                </div>
                <Icons.ChevronRight className="w-5 h-5 text-on-surface/20" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
