"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useRouter, usePathname } from 'next/navigation';
import { User, onAuthStateChanged, UserCredential } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { authService, AuthError } from "@/lib/auth.service";
import { hasCompanyAssociation } from "@/lib/user";

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  needsOnboarding: boolean | null;
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
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
  const [error, setError] = useState<AuthError | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      let onboardingStatus: boolean | null = null;
      let authLoading = true;

      setUser(currentUser);
      if (currentUser) {
        try {
          const hasAssociation = await hasCompanyAssociation(currentUser.uid);
          onboardingStatus = !hasAssociation;
          setNeedsOnboarding(onboardingStatus);
        } catch (e) {
          console.error("Failed to check company association:", e);
          onboardingStatus = false;
          setNeedsOnboarding(onboardingStatus);
          setError({ code: 'check-failed', message: 'Could not verify company status.' });
        }
      } else {
        onboardingStatus = null;
        setNeedsOnboarding(onboardingStatus);
      }

      authLoading = false;
      setLoading(authLoading);

      const isAuthPage = pathname === '/login' || pathname === '/signup';
      const isOnboardingPage = pathname === '/onboarding';

      if (!authLoading) {
        if (!currentUser && !isAuthPage) {
          console.log("AuthProvider: No user, redirecting to login.");
          router.push('/login');
        } else if (currentUser) {
          if (onboardingStatus === true && !isOnboardingPage) {
            console.log("AuthProvider: Needs onboarding, redirecting to /onboarding.");
            router.push('/onboarding');
          } else if (onboardingStatus === false && isOnboardingPage) {
            console.log("AuthProvider: Onboarding complete/not needed, redirecting from onboarding to /dashboard.");
            router.push('/dashboard');
          } else if (isAuthPage) {
            const destination = onboardingStatus === true ? '/onboarding' : '/dashboard';
            console.log(`AuthProvider: User logged in on auth page, redirecting to ${destination}.`);
            router.push(destination);
          }
        }
      }

    });
    return () => unsubscribe();
  }, [pathname, router]);

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
    needsOnboarding,
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

export const useUser = () => {
  const { user, loading, needsOnboarding } = useAuth();
  return { user, loading, needsOnboarding };
};

export const useLogin = () => {
  const { loginWithEmail, loginWithGoogle, error, clearError } = useAuth();
  return { loginWithEmail, loginWithGoogle, loginError: error, clearLoginError: clearError };
};

export const useSignup = () => {
    const { signupWithEmail, loginWithGoogle, error, clearError } = useAuth();
    return { signupWithEmail, signupWithGoogle: loginWithGoogle, signupError: error, clearSignupError: clearError };
};

export const useLogout = () => {
  const { logout, error, clearError } = useAuth();
  return { logout, logoutError: error, clearLogoutError: clearError };
};
