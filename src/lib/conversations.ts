import { db } from './firebase';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  getDoc,
  Timestamp,
  Unsubscribe,
  writeBatch,
  serverTimestamp,
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
 * Creates a new conversation with a generated title based on the first message.
 * 
 * @param userId - The ID of the user creating the conversation.
 * @param message - The first message in the conversation.
 * 
 * @returns A promise that resolves to the ID of the created conversation.
 */
export const createConversation = async ({
  userId,
  message,
}: {
  userId: string;
  message: string;
}) => {
  const conversationsCol = collection(db, 'conversations');
  const conversationRef = doc(conversationsCol); 

  const batch = writeBatch(db);

  const response = await fetch('/api/summarize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Error fetching summary:', errorData.error);
    throw new Error(`Failed to generate conversation title: ${errorData.error || response.statusText}`);
  }

  const { title } = await response.json();

  const conversationData = {
    userId,
    title,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  batch.set(conversationRef, conversationData);
  const messagesColRef = collection(conversationRef, 'messages');
  const firstMessageRef = doc(messagesColRef);

  const messageData = {
    role: 'user',
    content: message,
    createdAt: serverTimestamp(),
  };

  batch.set(firstMessageRef, messageData);

  await batch.commit()
  return conversationRef.id; // Return the ID
};

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

/**
 * Fetches a single conversation by ID
 * @param conversationId The ID of the conversation to fetch
 * @returns Promise resolving to the conversation or null if not found
 */
export const getConversation = async (
  conversationId: string
): Promise<Conversation | null> => {
  if (!conversationId) {
    console.error('getConversation: conversationId is required');
    return null;
  }

  try {
    const docRef = doc(db, 'conversations', conversationId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        userId: data.userId,
        title: data.title ?? 'Untitled Conversation',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      } as Conversation;
    }
    return null;
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return null;
  }
};
