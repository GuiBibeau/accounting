import { db } from './firebase';
import {
  doc,
  getDoc,
  serverTimestamp,
  Timestamp,
  WriteBatch,
  setDoc,
} from 'firebase/firestore';
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
 * @param details - Object containing details like currentCompanyId and optionally fullName.
 */
export const addUserProfileUpdateToBatch = (
  batch: WriteBatch,
  user: FirebaseUser,
  details: { currentCompanyId: string; fullName?: string }
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

  if (details.fullName) {
    userProfileData.fullName = details.fullName;
  }

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
};

/**
 * Fetches a user's profile from Firestore.
 * @param uid - The user's unique ID.
 * @returns The user profile data or null if not found.
 */
export const getUserProfile = async (
  uid: string
): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', uid);
  const docSnap = await getDoc(userRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      ...data,
      createdAt:
        data.createdAt instanceof Timestamp ? data.createdAt : undefined,
      updatedAt:
        data.updatedAt instanceof Timestamp ? data.updatedAt : undefined,
    } as UserProfile;
  } else {
    console.log(`No profile found for user ${uid}`);
    return null;
  }
};

/**
 * Checks if a user has associated company information by looking at currentCompanyId.
 * @param uid - The user's unique ID.
 * @returns True if the user has a currentCompanyId, false otherwise. Returns false on error.
 */
export const hasCompanyAssociation = async (uid: string): Promise<boolean> => {
  try {
    const profile = await getUserProfile(uid);
    return !!profile?.currentCompanyId;
  } catch (error) {
    console.error(`Error checking company association for user ${uid}:`, error);
    return false;
  }
};
