"use client";

import React, { useState } from "react";
import { useSignup, useUser } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signupWithEmail, signupError, clearSignupError } = useSignup();
  const { user, loading } = useUser();
  const router = useRouter();

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    clearSignupError();
    await signupWithEmail(email, password);
    // Redirect on successful signup
    if (!signupError) {
      router.push("/"); // Redirect to home page after signup
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
      <h1>Sign Up</h1>
      <form onSubmit={handleEmailSignup}>
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
            minLength={6} // Basic Firebase password requirement
          />
        </div>
        <button type="submit">Sign Up with Email</button>
      </form>
      {signupError && <p style={{ color: "red" }}>Error: {signupError.message}</p>}
    </div>
  );
}
