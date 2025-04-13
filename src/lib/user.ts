import { db } from './firebase';
import { doc, serverTimestamp, Timestamp, WriteBatch, setDoc } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';

export interface UserProfile {
  uid: string;
  email: string | null;
  fullName?: string;
  createdAt: Timestamp;
  currentCompanyId?: string;
  updatedAt?: Timestamp;
}

/**
 * Prepares the data for creating or updating a user profile document.
 * Does not perform the write itself, allowing it to be part of a batch.
 *
 * @param batch - The Firestore WriteBatch to add the operation to.
 * @param user - The Firebase Auth User object.
 * @param details - Object containing details like currentCompanyId.
 */
export const addUserProfileUpdateToBatch = (
  batch: WriteBatch,
  user: FirebaseUser,
  details: { currentCompanyId: string }
): void => {
  if (!user.uid || !user.email) {
    throw new Error('User UID and email are required for profile update.');
  }

  const userRef = doc(db, 'users', user.uid);
  const now = serverTimestamp();

  const userProfileData: Partial<UserProfile> = {
    currentCompanyId: details.currentCompanyId,
    updatedAt: now as Timestamp,
  };

  batch.set(userRef, userProfileData, { merge: true });
};

/**
 * Optional: Creates or updates a user profile document directly (not part of a batch).
 * Use this primarily for setting the currentCompanyId outside a batch.
 *
 * @param user - The Firebase Auth User object.
 * @param details - Object containing details like currentCompanyId.
 */
export const upsertUserProfile = async (
    user: FirebaseUser,
    details: { currentCompanyId: string }
): Promise<void> => {
    if (!user.uid || !user.email) {
        throw new Error('User UID and email are required for profile update.');
    }
    const userRef = doc(db, 'users', user.uid);
    const now = serverTimestamp();
    const userProfileData: Partial<UserProfile> = {
        currentCompanyId: details.currentCompanyId,
        updatedAt: now as Timestamp,
    };
    await setDoc(userRef, userProfileData, { merge: true });
}
