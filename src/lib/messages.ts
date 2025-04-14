import { db } from './firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  Unsubscribe,
  Timestamp,
} from 'firebase/firestore';

export interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: Timestamp;
}

/**
 * Fetches messages for a specific conversation in real-time
 * @param conversationId The ID of the conversation to fetch messages for
 * @param callback Function to call with the messages array when data changes
 * @returns Unsubscribe function to stop listening
 */
export const getMessages = (
  conversationId: string,
  callback: (messages: Message[]) => void
): Unsubscribe => {
  if (!conversationId) {
    console.error('getMessages: conversationId is required');
    callback([]);
    return () => {};
  }

  const messagesCol = collection(db, 'conversations', conversationId, 'messages');
  const q = query(messagesCol, orderBy('createdAt', 'asc'));

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const messages = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      callback(messages);
    },
    (error) => {
      console.error('Error fetching messages:', error);
      callback([]);
    }
  );

  return unsubscribe;
};
