"use client";

import React, { useState } from "react";
import { useLogin, useUser } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/ui/auth-layout";
import { Heading } from "@/components/ui/heading";
import { Fieldset, FieldGroup, Field, Label, ErrorMessage } from "@/components/ui/fieldset";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Text, TextLink } from "@/components/ui/text";
import { Divider } from "@/components/ui/divider"; // Import Divider
import { FcGoogle } from 'react-icons/fc'; // Import Google icon from react-icons

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
    // Check for error *after* the attempt. Assumes loginError state updates.
    // A more robust check might involve checking the user state directly after a short delay or via useEffect.
    if (!loginError) {
      router.push("/"); // Redirect to home page after login
    }
  };

  const handleGoogleLogin = async () => {
    clearLoginError();
    await loginWithGoogle();
    // Check for error *after* the attempt.
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
    // TODO: Replace with a proper loading spinner component if available
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <AuthLayout>
      <div className="flex flex-col items-center gap-6 w-full max-w-sm">
        <Heading>Login</Heading>
        <Fieldset className="w-full">
          <form onSubmit={handleEmailLogin}>
            <FieldGroup>
              <Field>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  name="email" // Add name attribute for accessibility/forms
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email" // Add autocomplete
                />
              </Field>
              <Field>
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  id="password"
                  name="password" // Add name attribute
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password" // Add autocomplete
                />
              </Field>
              {loginError && <ErrorMessage>{loginError.message}</ErrorMessage>}
              <Button type="submit" color="indigo" className="w-full">
                Sign In with Email
              </Button>
            </FieldGroup>
          </form>
          <Divider className="my-6" /> {/* Add a divider */}
          <Button outline onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-2">
            <FcGoogle className="h-5 w-5" /> {/* Use FcGoogle icon */}
            Sign In with Google
          </Button>
        </Fieldset>

        <Text>
          Don&apos;t have an account?{' '}
          <TextLink href="/signup">Sign up</TextLink>
        </Text>
      </div>
    </AuthLayout>
  );
}
