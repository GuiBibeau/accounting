import {
  Auth,
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { auth } from "./firebase";

export interface AuthError {
  code: string;
  message: string;
}

interface FirebaseError extends Error {
  code: string;
}

export class AuthService {
  private auth: Auth;

  constructor() {
    this.auth = auth;
  }

  async signUpWithEmail(email: string, password: string): Promise<UserCredential> {
    try {
      return await createUserWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async signInWithEmail(email: string, password: string): Promise<UserCredential> {
    try {
      return await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async signInWithGoogle(): Promise<UserCredential> {
    try {
      const provider = new GoogleAuthProvider();
      return await signInWithPopup(this.auth, provider);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  private handleAuthError(error: unknown): AuthError {
    if (error instanceof Error) {
      const firebaseError = error as FirebaseError;
      return {
        code: firebaseError.code || 'auth/unknown-error',
        message: error.message || 'An unknown authentication error occurred'
      };
    }
    return {
      code: 'auth/unknown-error',
      message: 'An unknown authentication error occurred'
    };
  }
}

export const authService = new AuthService();