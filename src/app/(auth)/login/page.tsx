"use client";

import React, { useState } from "react";
import { useLogin, useUser } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation"; // Use next/navigation for App Router

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loginWithEmail, loginWithGoogle, loginError, clearLoginError } = useLogin();
  const { user, loading } = useUser();
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearLoginError();
    await loginWithEmail(email, password);
    // Redirect on successful login (check if user exists after operation)
    // Note: The context state might take a moment to update.
    // A more robust solution might involve useEffect watching the user state.
    if (!loginError) { // Check if the operation itself threw an error
        // We might need a slight delay or check user state change
        router.push("/"); // Redirect to home page after login
    }
  };

  const handleGoogleLogin = async () => {
    clearLoginError();
    await loginWithGoogle();
     if (!loginError) {
        router.push("/");
    }
  };

  // Redirect if user is already logged in and not loading
  React.useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Don't render the form if loading or already logged in
  if (loading || user) {
    return <div>Loading...</div>; // Or a redirect component
  }

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleEmailLogin}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Sign In with Email</button>
      </form>
      <button onClick={handleGoogleLogin}>Sign In with Google</button>
      {loginError && <p style={{ color: "red" }}>Error: {loginError.message}</p>}
    </div>
  );
}
