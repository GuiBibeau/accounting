import { db } from './firebase'; // Assuming firebase setup is in firebase.ts
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  limit,
  writeBatch,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { generateText } from 'ai';
import { groq, groqSummarizationModelId } from './groq'; // Import from the new groq lib file

// --- Type Definitions ---

/**
 * Represents a chat conversation stored in Firestore.
 */
export interface Conversation {
  /** The unique Firestore document ID for the conversation. */
  id: string;
  /** The ID of the user participating in the conversation. */
  userId: string;
  /** The ID of the company associated with the conversation. */
  companyId: string;
  /** Firestore timestamp indicating when the conversation was created. */
  createdAt: Timestamp;
  /** Firestore timestamp indicating when the conversation was last updated. */
  updatedAt: Timestamp;
  /** An optional title for the conversation (user-defined or generated). */
  title?: string;
  /** An optional snippet of the last message for display purposes. */
  lastMessageSnippet?: string;
}

/**
 * Represents a single message within a conversation.
 */
export interface Message {
  /** The unique Firestore document ID for the message. */
  id: string;
  /** The role of the sender ('user' or 'assistant'). */
  role: 'user' | 'assistant';
  /** The text content of the message. */
  content: string;
  /** Firestore timestamp indicating when the message was created. */
  createdAt: Timestamp;
  /** Optional metadata associated with the message (e.g., tool usage). */
  metadata?: Record<string, unknown>;
}

// --- Helper Functions ---

/**
 * Converts a Firestore QueryDocumentSnapshot into a typed Conversation object.
 * @param snapshot - The Firestore document snapshot for a conversation.
 * @returns The typed Conversation object.
 */
function snapshotToConversation(
  snapshot: QueryDocumentSnapshot<DocumentData>
): Conversation {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    userId: data.userId,
    companyId: data.companyId,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    title: data.title,
    lastMessageSnippet: data.lastMessageSnippet,
  };
}

/**
 * Converts a Firestore QueryDocumentSnapshot into a typed Message object.
 * @param snapshot - The Firestore document snapshot for a message.
 * @returns The typed Message object.
 */
function snapshotToMessage(
  snapshot: QueryDocumentSnapshot<DocumentData>
): Message {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    role: data.role,
    content: data.content,
    createdAt: data.createdAt,
    metadata: data.metadata,
  };
}

/**
 * Generates a concise title for a conversation using Groq AI based on its initial messages.
 * @param messages - An array containing the first few messages of the conversation.
 * @returns A promise that resolves to the summarized title string, or null if generation fails, Groq is not configured, or no messages are provided.
 */
async function generateConversationTitle(
  messages: Message[]
): Promise<string | null> {
  if (!groq || messages.length === 0) {
    return null;
  }

  const promptContent = messages
    .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n');

  const prompt = `Summarize the beginning of the following conversation into a very short title (max 5 words):\n\n${promptContent}`;

  try {
    const { text } = await generateText({
      model: groq(groqSummarizationModelId),
      prompt: prompt,
      maxTokens: 15,
    });
    // Basic cleanup
    return text.replace(/["']/g, '').trim();
  } catch (error) {
    console.error('Error generating conversation title with Groq:', error);
    return null;
  }
}

// --- Conversation CRUD ---

/** Firestore collection reference for conversations. */
const conversationsCol = collection(db, 'conversations');

/**
 * Creates a new conversation document in Firestore along with its initial message using a batch write.
 * @param userId - The ID of the user initiating the conversation.
 * @param companyId - The ID of the company associated with the conversation.
 * @param initialMessageContent - The text content of the first message (typically from the user).
 * @returns A promise that resolves to the ID of the newly created conversation.
 * @throws Throws an error if the batch write operation fails.
 */
export async function createConversation(
  userId: string,
  companyId: string,
  initialMessageContent: string
): Promise<string> {
  const batch = writeBatch(db);
  const now = serverTimestamp();

  const conversationRef = doc(conversationsCol);
  batch.set(conversationRef, {
    userId,
    companyId,
    createdAt: now,
    updatedAt: now,
    title: '',
    lastMessageSnippet: initialMessageContent.substring(0, 100),
  });

  const messagesCol = collection(conversationRef, 'messages');
  const messageRef = doc(messagesCol);
  batch.set(messageRef, {
    role: 'user',
    content: initialMessageContent,
    createdAt: now,
  });

  try {
    await batch.commit();
    return conversationRef.id;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw new Error('Failed to create conversation.');
  }
}

/**
 * Retrieves a specific conversation document from Firestore by its ID.
 * @param conversationId - The unique ID of the conversation to retrieve.
 * @returns A promise that resolves to the Conversation object or null if the document doesn't exist or an error occurs.
 */
export async function getConversation(
  conversationId: string
): Promise<Conversation | null> {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    const docSnap = await getDoc(conversationRef);

    if (docSnap.exists()) {
      return snapshotToConversation(docSnap);
    } else {
      console.log('No such conversation document!');
      return null;
    }
  } catch (error) {
    console.error('Error getting conversation:', error);
    return null;
  }
}

/**
 * Retrieves all conversations associated with a specific user and company, ordered by the most recently updated.
 * If a conversation lacks a title and Groq is configured, it attempts to generate one based on the first few messages.
 * @param userId - The ID of the user whose conversations are to be listed.
 * @param companyId - The ID of the company associated with the conversations.
 * @returns A promise that resolves to an array of Conversation objects. Returns an empty array on error.
 */
export async function listConversations(
  userId: string,
  companyId: string
): Promise<Conversation[]> {
  try {
    const q = query(
      conversationsCol,
      where('userId', '==', userId),
      where('companyId', '==', companyId),
      orderBy('updatedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const conversationsPromises = querySnapshot.docs.map(
      async (docSnap): Promise<Conversation> => {
        const conversation = snapshotToConversation(docSnap);

        // Attempt title generation if missing
        if (!conversation.title && groq) {
          const messages = await listMessages(conversation.id, 3);
          const generatedTitle = await generateConversationTitle(messages);
          if (generatedTitle) {
            conversation.title = generatedTitle;
            // Optional: Persist generated title back to Firestore (fire-and-forget)
            // updateConversation(conversation.id, { title: generatedTitle }).catch(err => console.error("Failed to cache title:", err));
          }
        }
        // Provide default title if still missing
        if (!conversation.title) {
          conversation.title = 'Untitled Conversation';
        }

        return conversation;
      }
    );

    return Promise.all(conversationsPromises);
  } catch (error) {
    console.error('Error listing conversations:', error);
    return [];
  }
}

/**
 * Updates specific fields of a conversation document in Firestore.
 * Automatically updates the 'updatedAt' timestamp.
 * @param conversationId - The ID of the conversation to update.
 * @param data - An object containing the conversation fields to update (e.g., { title: 'New Title' }). Excludes read-only fields.
 * @returns A promise that resolves when the update is complete.
 * @throws Throws an error if the update operation fails.
 */
export async function updateConversation(
  conversationId: string,
  data: Partial<Omit<Conversation, 'id' | 'userId' | 'companyId' | 'createdAt'>>
): Promise<void> {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating conversation:', error);
    throw new Error('Failed to update conversation.');
  }
}

/**
 * Deletes a conversation document from Firestore.
 * **Important:** This function only deletes the main conversation document.
 * The associated 'messages' subcollection remains unless explicitly deleted,
 * typically via a Cloud Function triggered by this deletion.
 * @param conversationId - The ID of the conversation document to delete.
 * @returns A promise that resolves when the deletion is complete.
 * @throws Throws an error if the deletion operation fails.
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    await deleteDoc(conversationRef);
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw new Error('Failed to delete conversation.');
  }
}

// --- Message CRUD ---

/**
 * Adds a new message document to the 'messages' subcollection of a specific conversation.
 * Uses a batch write to also update the parent conversation's 'updatedAt' timestamp and 'lastMessageSnippet'.
 * @param conversationId - The ID of the conversation to which the message should be added.
 * @param messageData - An object containing the message details (role, content, optional metadata).
 * @returns A promise that resolves to the ID of the newly added message document.
 * @throws Throws an error if the batch write operation fails.
 */
export async function addMessage(
  conversationId: string,
  messageData: Omit<Message, 'id' | 'createdAt'>
): Promise<string> {
  const batch = writeBatch(db);
  const now = serverTimestamp();

  const conversationRef = doc(db, 'conversations', conversationId);
  const messagesCol = collection(conversationRef, 'messages');
  const messageRef = doc(messagesCol);

  batch.set(messageRef, {
    ...messageData,
    createdAt: now,
  });

  batch.update(conversationRef, {
    updatedAt: now,
    lastMessageSnippet: messageData.content.substring(0, 100),
  });

  try {
    await batch.commit();
    return messageRef.id;
  } catch (error) {
    console.error('Error adding message:', error);
    throw new Error('Failed to add message.');
  }
}

/**
 * Retrieves messages from the 'messages' subcollection of a specific conversation, ordered by creation time.
 * @param conversationId - The ID of the conversation whose messages are to be retrieved.
 * @param messageLimit - An optional maximum number of messages to retrieve.
 * @returns A promise that resolves to an array of Message objects. Returns an empty array on error.
 */
export async function listMessages(
  conversationId: string,
  messageLimit?: number
): Promise<Message[]> {
  try {
    const messagesCol = collection(
      db,
      'conversations',
      conversationId,
      'messages'
    );
    let q = query(messagesCol, orderBy('createdAt', 'asc'));

    if (messageLimit) {
      q = query(q, limit(messageLimit));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(snapshotToMessage);
  } catch (error) {
    console.error('Error listing messages:', error);
    return [];
  }
}
