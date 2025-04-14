import { db } from './firebase';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  date?: string;
  active?: boolean;
}

/**
 * Fetches the latest 15 conversations for a given user in real-time.
 *
 * @param userId The ID of the user whose conversations to fetch.
 * @param callback A function to call with the updated list of conversations.
 *                 It receives an array of Conversation objects.
 * @returns An unsubscribe function to stop listening for updates.
 */
export const getConversations = (
  userId: string,
  callback: (conversations: Conversation[]) => void
): Unsubscribe => {
  if (!userId) {
    console.error('getConversations: userId is required.');
    callback([]);
    return () => {};
  }

  const conversationsCol = collection(db, 'conversations');
  const q = query(
    conversationsCol,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(15)
  );

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const conversationsData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const displayDate = data.createdAt?.toDate().toLocaleDateString() ?? '';
        return {
          id: doc.id,
          userId: data.userId,
          title: data.title ?? 'Untitled Conversation',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          date: displayDate,
        } as Conversation;
      });
      callback(conversationsData);
    },
    (error) => {
      console.error('Error fetching conversations:', error);
      callback([]);
    }
  );

  return unsubscribe;
};
