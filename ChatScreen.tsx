import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Icons } from '../components/Icons';
import { Avatar, Button, Input } from '../components/ui';
import { Header } from '../components/layout/Header';
import { UserProfile, Message } from '../types';
import { chatService } from '../services/chatService';

export function ChatScreen({ profile }: { profile: UserProfile | null }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatId = 'demo-chat-id'; // In a real app, this would be dynamic based on selection

  useEffect(() => {
    if (!profile) return;
    const unsubscribe = chatService.subscribeToMessages(chatId, (msgs) => {
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [chatId, profile?.uid]); // Only re-subscribe if UID changes

  const handleSend = async () => {
    if (!inputText.trim() || !profile || isSending) return;
    
    setIsSending(true);
    setError(null);
    try {
      await chatService.sendMessage(chatId, {
        senderId: profile.uid,
        text: inputText,
        type: 'text'
      });
      setInputText('');
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.message.includes('Insufficient coins') ? 'Insufficient coins' : 'Failed to send message');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsSending(false);
    }
  };

  const handleUnlock = async (msgId: string, cost: number) => {
    if (!profile) return;
    setError(null);
    try {
      await chatService.unlockInsight(chatId, msgId, profile.uid, cost);
    } catch (err: any) {
      console.error('Failed to unlock insight:', err);
      setError(err.message.includes('Insufficient coins') ? 'Insufficient coins' : 'Failed to unlock');
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-24 pb-40 px-6 flex flex-col gap-6 max-w-2xl mx-auto min-h-screen"
    >
      <Header 
        profile={profile}
        showNotifications={false}
        leftElement={
          <div className="flex items-center gap-3">
            <Avatar src="https://picsum.photos/seed/coach-sarah/100/100" alt="Sarah" />
            <div>
              <h1 className="text-primary font-headline text-xl font-bold tracking-tight">Coach Sarah</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-tertiary"></div>
                <span className="text-slate-400 text-[10px] font-medium">Active now</span>
              </div>
            </div>
          </div>
        }
        rightElement={<Icons.More className="w-5 h-5 text-slate-400" />}
      />

      {error && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] bg-tertiary text-on-tertiary px-6 py-2 rounded-full text-xs font-bold shadow-lg animate-bounce">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {messages.map((msg, i) => {
          const isMe = msg.senderId === profile?.uid;
          const isLocked = msg.isLocked && !msg.unlockedBy?.includes(profile?.uid || '');

          return (
            <div key={i} className={`flex flex-col gap-2 max-w-[85%] ${isMe ? 'self-end' : 'self-start'}`}>
              <div className={`p-4 shadow-sm ${isMe ? 'bg-gradient-to-br from-primary to-primary-container text-white rounded-tl-2xl rounded-bl-2xl rounded-br-2xl' : 'bg-surface-container-low text-on-surface rounded-tr-2xl rounded-br-2xl rounded-bl-2xl'}`}>
                {isLocked ? (
                  <div className="flex flex-col items-center gap-3 py-2">
                    <Icons.Lock className="w-6 h-6 text-primary" />
                    <p className="text-xs text-center opacity-80">Premium insight locked</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleUnlock(msg.id!, msg.unlockCost || 5)}
                    >
                      Unlock for {msg.unlockCost || 5} Coins
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                )}
              </div>
              <span className={`text-[10px] text-slate-500 font-medium ${isMe ? 'text-right mr-2' : 'ml-2'}`}>
                {msg.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Sending...'}
              </span>
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-24 left-0 w-full px-6 pb-8 pt-4 bg-gradient-to-t from-background via-background to-transparent z-40">
        <div className="max-w-2xl mx-auto bg-surface-container/80 backdrop-blur-2xl rounded-2xl p-2 flex items-center gap-2 shadow-2xl border border-white/5">
          <button className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-primary transition-colors">
            <Icons.Add className="w-6 h-6" />
          </button>
          <Input 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none py-3 px-2"
          />
          <div className="flex items-center gap-1">
            <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary transition-colors">
              <Icons.Mic className="w-6 h-6" />
            </button>
            <button 
              onClick={handleSend}
              className="w-12 h-12 bg-gradient-to-br from-primary to-primary-container rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform"
            >
              <Icons.Send className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </motion.main>
  );
}
