"use client";

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { handleOnboarding, OnboardingData, CompanyRole } from '@/lib/company';
import { Button } from '@/components/ui/button';
import { Fieldset, FieldGroup, Field, Label, ErrorMessage } from '@/components/ui/fieldset'; // Added FieldGroup, removed Description
import { Heading } from '@/components/ui/heading';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Text } from '@/components/ui/text';

const companyRoles: CompanyRole[] = ['solo owner', 'accountant', 'president'];

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<Omit<OnboardingData, ''>>({
    fullName: '',
    role: 'solo owner',
    companySize: '',
    companyName: '',
    companyField: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      setError("User not authenticated. Please log in again.");
      return;
    }
    if (!formData.fullName || !formData.companyName || !formData.companySize || !formData.companyField || !formData.role) {
        setError("Please fill out all fields.");
        return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const onboardingPayload: OnboardingData = {
        ...formData,
        role: formData.role as CompanyRole,
      };
      await handleOnboarding(user, onboardingPayload);
      router.push('/dashboard');
    } catch (err) {
      console.error("Onboarding failed:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred during onboarding.");
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <Heading level={1}>Company Information</Heading>
      <Text className="mt-2 mb-8">
        Please provide some details about your company to get started.
      </Text>

      <form onSubmit={handleSubmit}>
        <Fieldset>
          <FieldGroup>
            <Field>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </Field>

            <Field>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                name="companyName"
                type="text"
                value={formData.companyName}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </Field>

            <Field>
              <Label htmlFor="companyField">Field / Industry</Label>
              <Input
                id="companyField"
                name="companyField"
                type="text"
                value={formData.companyField}
                onChange={handleChange}
                required
                disabled={isLoading}
                placeholder="e.g., Technology, Retail, Consulting"
              />
            </Field>

            <Field>
              <Label htmlFor="companySize">Company Size</Label>
              <Input
                id="companySize"
                name="companySize"
                type="text"
                value={formData.companySize}
                onChange={handleChange}
                required
                disabled={isLoading}
                placeholder="e.g., 1-10 employees, 50+, etc."
              />
            </Field>

            <Field>
              <Label htmlFor="role">Your Role</Label>
              <Select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                disabled={isLoading}
              >
                {companyRoles.map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </Select>
            </Field>

            {error && (
              <ErrorMessage>{error}</ErrorMessage>
            )}

            <div className="mt-8">
              <Button type="submit" color="indigo" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Complete Setup'}
              </Button>
            </div>
          </FieldGroup>
        </Fieldset>
      </form>
    </div>
  );
}
