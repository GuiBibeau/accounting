import { db } from './firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  Unsubscribe,
  Timestamp,
  addDoc,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  serverTimestamp,
} from 'firebase/firestore';
import { Message as VercelMessage } from '@ai-sdk/ui-utils';

/**
 * Represents the message structure as stored in Firestore.
 * This is the internal format used for database persistence.
 */
interface FirestoreMessage {
  role: 'user' | 'assistant';
  content: string;
  createdAt: Timestamp;
}

/**
 * Firestore data converter that translates between Vercel AI SDK Message format
 * and our Firestore message structure.
 * 
 * This converter handles:
 * - Converting Vercel Message objects to Firestore documents when saving
 * - Converting Firestore documents to Vercel Message objects when reading
 * - Type safety between the two formats
 * - Automatic timestamp handling
 * 
 * @type {FirestoreDataConverter<VercelMessage, FirestoreMessage>}
 */
const messageConverter: FirestoreDataConverter<VercelMessage, FirestoreMessage> = {
  /**
   * Converts a Vercel AI SDK Message to a Firestore document.
   * @param {VercelMessage} message - The Vercel message to convert
   * @returns {FirestoreMessage} The Firestore document data
   * 
   * Note: Only 'user' and 'assistant' roles are supported for storage.
   * Other roles will be converted to 'assistant' with a warning.
   * The createdAt timestamp is handled automatically by Firestore.
   */
  toFirestore(message: VercelMessage): FirestoreMessage {
    if (message.role !== 'user' && message.role !== 'assistant') {
      console.warn(`Attempted to save message with unsupported role: ${message.role}. Storing as 'assistant'.`);
    }
    const roleToSave = (message.role === 'user' || message.role === 'assistant') ? message.role : 'assistant';

    return {
      role: roleToSave,
      content: message.content,
    } as FirestoreMessage;
  },
  /**
   * Converts a Firestore document to a Vercel AI SDK Message.
   * @param {QueryDocumentSnapshot<FirestoreMessage>} snapshot - The Firestore document snapshot
   * @param {SnapshotOptions} [options] - Optional snapshot options
   * @returns {VercelMessage} The converted Vercel message
   * 
   * Handles:
   * - Converting Firestore Timestamp to JavaScript Date
   * - Adding the document ID as message ID
   * - Ensuring valid message roles
   */
  fromFirestore(
    snapshot: QueryDocumentSnapshot<FirestoreMessage>,
    options?: SnapshotOptions
  ): VercelMessage {
    const data = snapshot.data(options);
    const role = (data.role === 'user' || data.role === 'assistant') ? data.role : 'assistant';

    return {
      id: snapshot.id,
      role: role,
      content: data.content,
      createdAt: data.createdAt?.toDate(),
    };
  },
};

/**
 * Saves a new message to Firestore using the VercelMessage format
 * @param conversationId The ID of the conversation
 * @param message The VercelMessage object to save (excluding id/createdAt)
 * @returns Promise that resolves when message is saved
 */
export const saveMessage = async (
  conversationId: string,
  message: Omit<VercelMessage, 'id' | 'createdAt'>
): Promise<void> => {
  if (!conversationId) {
    throw new Error('saveMessage: conversationId is required');
  }
  if (message.role !== 'user' && message.role !== 'assistant') {
     console.warn(`saveMessage: Attempting to save message with unsupported role '${message.role}'. Skipping save.`);
     return;
  }

  const messagesCol = collection(
    db,
    'conversations',
    conversationId,
    'messages'
  )

  const messageData = {
    role: message.role,
    content: message.content,
    createdAt: serverTimestamp(),
  }
  

  await addDoc(messagesCol, messageData);
};

/**
 * Fetches messages for a specific conversation in real-time as VercelMessages
 * @param conversationId The ID of the conversation to fetch messages for
 * @param callback Function to call with the VercelMessage array when data changes
 * @returns Unsubscribe function to stop listening
 */
export const getMessages = (
  conversationId: string,
  callback: (messages: VercelMessage[]) => void
): Unsubscribe => {
  if (!conversationId) {
    console.error('getMessages: conversationId is required');
    callback([]);
    return () => {};
  }

  const messagesCol = collection(
    db,
    'conversations',
    conversationId,
    'messages'
  ).withConverter(messageConverter);

  const q = query(messagesCol, orderBy('createdAt', 'asc'));

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const messages = querySnapshot.docs.map((doc) => doc.data());
      callback(messages);
    },
    (error) => {
      console.error('Error fetching messages:', error);
      callback([]);
    }
  );

  return unsubscribe;
};
