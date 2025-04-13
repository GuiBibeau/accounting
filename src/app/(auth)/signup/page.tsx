"use client";

import React, { useState } from "react";
import { useSignup, useUser } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/ui/auth-layout";
import { Divider } from "@/components/ui/divider"; // Assuming Divider component exists
import { Heading } from "@/components/ui/heading";
import { Fieldset, FieldGroup, Field, Label, ErrorMessage } from "@/components/ui/fieldset";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Text, TextLink } from "@/components/ui/text";
import { FcGoogle } from 'react-icons/fc'; // Import Google icon from react-icons

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Destructure signupWithGoogle from the updated hook
  const { signupWithEmail, signupWithGoogle, signupError, clearSignupError } = useSignup();
  const { user, loading } = useUser();
  const router = useRouter();

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    clearSignupError();
    await signupWithEmail(email, password);
    // Check for error *after* the attempt.
    if (!signupError) {
      router.push("/"); // Redirect to home page after signup
    }
  };

  // Handler for Google Sign-Up
  const handleGoogleSignup = async () => {
    clearSignupError();
    await signupWithGoogle();
    // Check for error *after* the attempt.
    // The onAuthStateChanged listener in AuthContext handles the redirect
    // No explicit redirect needed here if the listener works correctly
    // However, we might want to add a check similar to email signup just in case
    // For now, rely on the listener.
  };

  // Redirect if user is already logged in and not loading
  React.useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Don't render the form if loading or already logged in
  if (loading || user) {
    // TODO: Replace with a proper loading spinner component if available
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <AuthLayout>
      <div className="flex flex-col items-center gap-6 w-full max-w-sm">
        <Heading>Sign Up</Heading>
        <Fieldset className="w-full">
          <form onSubmit={handleEmailSignup}>
            <FieldGroup>
              <Field>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </Field>
              <Field>
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6} // Basic Firebase password requirement
                  autoComplete="new-password" // Use new-password for signup
                />
              </Field>
              {signupError && (
                <ErrorMessage>{signupError.message}</ErrorMessage>
              )}
              <Button type="submit" color="indigo" className="w-full">
                Sign Up with Email
              </Button>
            </FieldGroup>
          </form>
        </Fieldset>

        <Divider />

        {/* Google Sign Up Button */}
        <Button
          outline // Use the outline prop for secondary styling
          className="w-full flex items-center justify-center gap-2" // Added flex layout
          onClick={handleGoogleSignup}
        >
          <FcGoogle className="h-5 w-5" /> {/* Use FcGoogle icon */}
          Sign Up with Google
        </Button>

        <Text>
          Already have an account? <TextLink href="/login">Log in</TextLink>
        </Text>
      </div>
    </AuthLayout>
  );
}
