import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  doc,
  updateDoc,
  runTransaction,
  arrayUnion,
  increment
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export interface Message {
  id?: string;
  senderId: string;
  text: string;
  type: 'text' | 'voice' | 'insight';
  isLocked?: boolean;
  unlockCost?: number;
  unlockedBy?: string[];
  timestamp: any;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: any, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const chatService = {
  /**
   * Subscribes to real-time message updates for a specific chat.
   */
  subscribeToMessages(chatId: string, callback: (messages: Message[]) => void) {
    const path = `chats/${chatId}/messages`;
    const q = query(
      collection(db, path),
      orderBy('timestamp', 'asc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      callback(messages);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  /**
   * Sends a message within a transaction to ensure data consistency.
   * Deducts coins from sender, logs transaction, saves message, and updates chat metadata.
   */
  async sendMessage(chatId: string, message: Partial<Message>) {
    const path = `chats/${chatId}/messages`;
    if (!message.senderId || !message.text) return;

    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', message.senderId!);
        const chatRef = doc(db, 'chats', chatId);
        
        const [userDoc, chatDoc] = await Promise.all([
          transaction.get(userRef),
          transaction.get(chatRef)
        ]);
        
        if (!userDoc.exists()) throw new Error("User profile not found");
        const userData = userDoc.data();
        if (userData.coins < 1) throw new Error("Insufficient coins");

        // 1. Deduct 1 coin for sending a message
        transaction.update(userRef, { 
          coins: increment(-1),
          updatedAt: serverTimestamp()
        });

        // 2. Log the coin spend transaction
        const txRef = doc(collection(db, 'transactions'));
        transaction.set(txRef, {
          userId: message.senderId,
          amount: -1,
          type: 'spend',
          description: 'Sent message',
          timestamp: serverTimestamp()
        });

        // 3. Save the message to the subcollection
        const msgRef = doc(collection(db, path));
        transaction.set(msgRef, {
          ...message,
          type: message.type || 'text',
          timestamp: serverTimestamp(),
        });

        // 4. Update chat metadata (last message, timestamp, and unread counts)
        const chatData = chatDoc.exists() ? chatDoc.data() : { participants: [message.senderId] };
        const participants = chatData.participants || [message.senderId];
        
        const updates: any = {
          lastMessage: message.text,
          lastTimestamp: serverTimestamp(),
          participants: arrayUnion(message.senderId),
        };

        // Increment unread count for all other participants
        participants.forEach((uid: string) => {
          if (uid !== message.senderId) {
            updates[`unreadCount.${uid}`] = increment(1);
          }
        });

        transaction.set(chatRef, updates, { merge: true });
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  /**
   * Resets the unread count for a specific user in a chat.
   */
  async markAsRead(chatId: string, userId: string) {
    const chatRef = doc(db, 'chats', chatId);
    try {
      await updateDoc(chatRef, {
        [`unreadCount.${userId}`]: 0
      });
    } catch (error) {
      console.error("[ChatService] Failed to mark as read:", error);
    }
  },

  async setTypingStatus(chatId: string, userId: string, isTyping: boolean) {
    const chatRef = doc(db, 'chats', chatId);
    try {
      await updateDoc(chatRef, {
        [`typing.${userId}`]: isTyping
      });
    } catch (error) {
      console.error("Failed to set typing status", error);
    }
  },

  async unlockInsight(chatId: string, messageId: string, userId: string, cost: number) {
    const msgPath = `chats/${chatId}/messages/${messageId}`;
    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', userId);
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists()) throw new Error("User profile not found");
        const userData = userDoc.data();
        if (userData.coins < cost) throw new Error("Insufficient coins");

        const msgRef = doc(db, msgPath);
        const msgDoc = await transaction.get(msgRef);
        if (!msgDoc.exists()) throw new Error("Message not found");

        // 1. Deduct coins
        transaction.update(userRef, { coins: increment(-cost) });

        // 2. Mark as unlocked
        transaction.update(msgRef, {
          unlockedBy: arrayUnion(userId)
        });

        // 3. Log transaction
        const txRef = doc(collection(db, 'transactions'));
        transaction.set(txRef, {
          userId,
          amount: -cost,
          type: 'spend',
          description: 'Unlocked premium insight',
          timestamp: serverTimestamp()
        });
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, msgPath);
    }
  }
};
