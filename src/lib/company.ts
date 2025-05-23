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
  companySize?: string;
  companyName?: string;
  companyField?: string;
  isFreelancer: boolean;
  freelancerIndustry?: string;
}

export interface Company {
  companyId: string;
  name: string;
  size: string;
  field: string;
  isFreelancer: boolean;
  freelancerName?: string;
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
    isFreelancer: false,
    createdAt: now as Timestamp,
    createdBy: creatorId,
  };

  try {
    await setDoc(newCompanyRef, newCompanyData);
    console.log(
      `Company ${companyId} created successfully by user ${creatorId}.`
    );
    return companyId;
  } catch (error) {
    console.error('Company creation failed:', error);
    throw new Error(
      `Failed to create company: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

/**
 * Handles the complete onboarding process for a new user and their company.
 * Creates the company, adds the user as the first member (with their specified role),
 * and updates the user's profile with the company ID and full name in a single batch.
 *
 * @param user - The Firebase Auth User object of the user being onboarded.
 * @param data - The onboarding data collected from the form.
 * @throws Throws an error if the batch write fails.
 */
export const handleOnboarding = async (
  user: FirebaseUser,
  data: OnboardingData
): Promise<void> => {
  if (!user.uid || !user.email) {
    throw new Error('User UID and email are required for onboarding.');
  }
  if (!data.fullName || !data.role) {
    throw new Error('Name and role are required.');
  }
  if (
    !data.isFreelancer &&
    (!data.companyName || !data.companySize || !data.companyField)
  ) {
    throw new Error('Company details are required for non-freelancers.');
  }

  const batch = writeBatch(db);
  const now = serverTimestamp();

  const companyCollectionRef = collection(db, 'companies');
  const newCompanyRef = doc(companyCollectionRef);
  const companyId = newCompanyRef.id;

  const newCompanyData: Company = {
    companyId: companyId,
    name: data.isFreelancer
      ? `Freelancer: ${data.fullName}`
      : data.companyName!,
    size: data.isFreelancer ? '1 (Freelancer)' : data.companySize!,
    field: data.isFreelancer
      ? data.freelancerIndustry || 'Freelance'
      : data.companyField!,
    isFreelancer: data.isFreelancer,
    freelancerName: data.isFreelancer ? data.fullName : undefined,
    createdAt: now as Timestamp,
    createdBy: user.uid,
  };
  batch.set(newCompanyRef, newCompanyData);

  const memberRef = doc(db, 'companies', companyId, 'members', user.uid);
  const newMemberData: CompanyMember = {
    userId: user.uid,
    role: data.role,
    joinedAt: now as Timestamp,
  };
  batch.set(memberRef, newMemberData);

  addUserProfileUpdateToBatch(batch, user, {
    currentCompanyId: companyId,
    fullName: data.fullName,
  });

  try {
    await batch.commit();
    console.log(
      `Onboarding successful for user ${user.uid}, company ${companyId} created.`
    );
  } catch (error) {
    console.error('Onboarding process failed:', error);
    throw new Error(
      `Failed during onboarding batch commit: ${error instanceof Error ? error.message : String(error)}`
    );
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
    console.log(
      `User ${user.uid} added successfully as member to company ${companyId}.`
    );
  } catch (error) {
    console.error('Adding company member failed:', error);
    throw new Error(
      `Failed to add company member: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};
