import { db } from './firebase';
import {
  collection,
  doc,
  setDoc,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import { addUserProfileUpdateToBatch } from './user';

export type CompanyRole = 'solo owner' | 'accountant' | 'president';

export interface OnboardingData {
  fullName: string;
  role: CompanyRole;
  companySize: string;
  companyName: string;
  companyField: string;
}

export interface Company {
  companyId: string;
  name: string;
  size: string;
  field: string;
  createdAt: Timestamp;
  createdBy: string;
}

export interface CompanyMember {
  userId: string;
  role: CompanyRole;
  joinedAt: Timestamp;
}

export interface CreateCompanyData {
  companyName: string;
  companySize: string;
  companyField: string;
}

/**
 * Creates a new company document in Firestore.
 *
 * @param data - The data required to create the company.
 * @param creatorId - The UID of the user creating the company.
 * @returns The ID of the newly created company.
 * @throws Throws an error if the Firestore operation fails.
 */
export const createCompany = async (
  data: CreateCompanyData,
  creatorId: string
): Promise<string> => {
  const companyCollectionRef = collection(db, 'companies');
  const newCompanyRef = doc(companyCollectionRef);
  const companyId = newCompanyRef.id;
  const now = serverTimestamp();

  const newCompanyData: Company = {
    companyId: companyId,
    name: data.companyName,
    size: data.companySize,
    field: data.companyField,
    createdAt: now as Timestamp,
    createdBy: creatorId,
  };

  try {
    await setDoc(newCompanyRef, newCompanyData);
    console.log(`Company ${companyId} created successfully by user ${creatorId}.`);
    return companyId;
  } catch (error) {
    console.error('Company creation failed:', error);
    throw new Error(`Failed to create company: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export interface AddMemberData {
  role: CompanyRole;
}

/**
 * Adds a user as a member to a specified company and updates their profile's currentCompanyId.
 * Uses a batched write for atomicity between member creation and user profile update.
 * Setting the user's fullName should be handled separately via user profile functions.
 *
 * @param companyId - The ID of the company to add the member to.
 * @param user - The Firebase Auth User object of the member being added.
 * @param data - The data required for the membership (role).
 * @throws Throws an error if the batch write fails.
 */
export const addCompanyMember = async (
  companyId: string,
  user: FirebaseUser,
  data: AddMemberData
): Promise<void> => {
  if (!user.uid || !user.email) {
    throw new Error('User UID and email are required to add a member.');
  }

  const batch = writeBatch(db);
  const now = serverTimestamp();

  const memberRef = doc(db, 'companies', companyId, 'members', user.uid);
  const newMemberData: CompanyMember = {
    userId: user.uid,
    role: data.role,
    joinedAt: now as Timestamp,
  };
  batch.set(memberRef, newMemberData);

  addUserProfileUpdateToBatch(batch, user, {
    currentCompanyId: companyId,
  });

  try {
    await batch.commit();
    console.log(`User ${user.uid} added successfully as member to company ${companyId}.`);
  } catch (error) {
    console.error('Adding company member failed:', error);
    throw new Error(`Failed to add company member: ${error instanceof Error ? error.message : String(error)}`);
  }
};
