import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Icons } from '../components/Icons';
import { Avatar, Card, Button } from '../components/ui';
import { Header } from '../components/layout/Header';
import { UserProfile, Transaction } from '../types';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function WalletScreen({ profile }: { profile: UserProfile | null }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!profile) return;
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', profile.uid),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    return onSnapshot(q, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Transaction[]);
    });
  }, [profile]);

  const packages = [
    { coins: '100 Coins', price: '$4.99', desc: 'Standard entry pack', icon: Icons.Coins },
    { coins: '500 Coins', price: '$19.99', desc: 'Unlock intermediate courses', icon: Icons.Sparkles, best: true, oldPrice: '$24.95' },
    { coins: '1000 Coins', price: '$34.99', desc: 'Pro-level synergy credits', icon: Icons.Diamond },
  ];

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-24 pb-32 px-6 max-w-2xl mx-auto space-y-8 min-h-screen"
    >
      <Header profile={profile} />

      <section className="relative">
        <Card className="bg-gradient-to-br from-primary-container to-surface-container p-8 relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/20 blur-[80px] rounded-full"></div>
          <div className="relative z-10">
            <p className="text-primary font-sans text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Current Balance</p>
            <div className="flex items-baseline gap-3">
              <h1 className="text-5xl font-headline font-extrabold tracking-tighter text-on-surface">{profile?.coins || 0}</h1>
              <span className="text-2xl font-headline font-bold text-primary">Coins</span>
            </div>
          </div>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-headline font-bold text-on-surface">Buy Coin Packages</h2>
        <div className="space-y-4">
          {packages.map((pkg) => (
            <Card 
              key={pkg.coins}
              className={`flex justify-between items-center cursor-pointer hover:bg-surface-container transition-all ${pkg.best ? 'border-2 border-primary/30' : ''}`}
            >
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${pkg.best ? 'bg-primary-container' : 'bg-surface-container-highest'}`}>
                  <pkg.icon className="w-8 h-8 text-primary fill-current" />
                </div>
                <div>
                  <h3 className="text-lg font-headline font-bold">{pkg.coins}</h3>
                  <p className="text-sm text-slate-400">{pkg.desc}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-headline font-extrabold text-on-surface">{pkg.price}</div>
                {pkg.oldPrice && <div className="text-[10px] text-tertiary font-bold line-through opacity-50">{pkg.oldPrice}</div>}
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-headline font-bold text-on-surface">Recent Transactions</h2>
        <div className="space-y-2">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex justify-between items-center p-4 bg-surface-container-low rounded-2xl border border-white/5">
              <div>
                <p className="text-sm font-bold">{tx.description}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">{tx.timestamp?.toDate().toLocaleDateString()}</p>
              </div>
              <span className={`font-bold ${tx.amount > 0 ? 'text-primary' : 'text-tertiary'}`}>
                {tx.amount > 0 ? '+' : ''}{tx.amount}
              </span>
            </div>
          ))}
        </div>
      </section>
    </motion.main>
  );
}
