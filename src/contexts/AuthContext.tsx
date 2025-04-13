"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { User, onAuthStateChanged, UserCredential } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { authService, AuthError } from "@/lib/auth.service";

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  error: AuthError | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleAuthOperation = useCallback(
    async (operation: () => Promise<UserCredential | void>) => {
      clearError();
      try {
        await operation();
      } catch (err) {
        setError(err as AuthError);
        // Re-throw the error if needed by the caller, though often UI just needs the state
        // throw err; 
      }
    },
    [clearError]
  );

  const loginWithEmail = useCallback(
    (email: string, password: string) =>
      handleAuthOperation(() => authService.signInWithEmail(email, password)),
    [handleAuthOperation]
  );

  const signupWithEmail = useCallback(
    (email: string, password: string) =>
      handleAuthOperation(() => authService.signUpWithEmail(email, password)),
    [handleAuthOperation]
  );

  const loginWithGoogle = useCallback(
    () => handleAuthOperation(() => authService.signInWithGoogle()),
    [handleAuthOperation]
  );

  const logout = useCallback(
    () => handleAuthOperation(() => authService.signOut()),
    [handleAuthOperation]
  );

  const value = {
    user,
    loading,
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    logout,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Specific hooks for convenience
export const useUser = () => {
  const { user, loading } = useAuth();
  return { user, loading };
};

export const useLogin = () => {
  const { loginWithEmail, loginWithGoogle, error, clearError } = useAuth();
  return { loginWithEmail, loginWithGoogle, loginError: error, clearLoginError: clearError };
};

export const useSignup = () => {
    const { signupWithEmail, error, clearError } = useAuth();
    return { signupWithEmail, signupError: error, clearSignupError: clearError };
};

export const useLogout = () => {
  const { logout, error, clearError } = useAuth();
  return { logout, logoutError: error, clearLogoutError: clearError };
};
