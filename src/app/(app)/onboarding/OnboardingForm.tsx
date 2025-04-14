"use client";

import React, { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Fieldset, FieldGroup, Field, Label, ErrorMessage } from '@/components/ui/fieldset';
import { Heading } from '@/components/ui/heading';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import { OnboardingData, CompanyRole } from '@/lib/company';

const companyRoles: CompanyRole[] = ['solo owner', 'accountant', 'president'];

type FormDataSubset = Pick<
  OnboardingData,
  'fullName' | 'role' | 'companySize' | 'companyName' | 'companyField' | 'isFreelancer'
>;

interface OnboardingFormProps {
  formData: FormDataSubset;
  userType: 'freelancer' | 'company';
  isLoading: boolean;
  error: string | null;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  onBack: () => void;
}

export default function OnboardingForm({
  formData,
  userType,
  isLoading,
  error,
  handleChange,
  handleSubmit,
  onBack,
}: OnboardingFormProps) {
  return (
    <div className="mx-auto max-w-lg">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          disabled={isLoading}
          aria-label="Go back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <Heading level={1}>
          {userType === 'freelancer' ? 'Freelancer Information' : 'Company Details'}
        </Heading>
      </div>
      <Text className="mt-2 mb-8">
        {userType === 'freelancer'
          ? 'Please provide your details to get started.'
          : 'Please provide your company details to get started.'}
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

            {!formData.isFreelancer && (
              <Field>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={handleChange}
                  required={!formData.isFreelancer}
                  disabled={isLoading}
                />
              </Field>
            )}

            <Field>
              <Label htmlFor="companyField">
                {formData.isFreelancer ? 'Industry' : 'Field / Industry'}
              </Label>
              <Input
                id="companyField"
                name="companyField"
                type="text"
                value={formData.companyField}
                onChange={handleChange}
                required
                disabled={isLoading}
                placeholder={formData.isFreelancer
                  ? 'e.g., Web Development, Design, Consulting'
                  : 'e.g., Technology, Retail, Consulting'}
              />
            </Field>

            {!formData.isFreelancer && (
              <Field>
                <Label htmlFor="companySize">Company Size</Label>
                <Input
                  id="companySize"
                  name="companySize"
                  type="text"
                  value={formData.companySize}
                  onChange={handleChange}
                  required={!formData.isFreelancer}
                  disabled={isLoading}
                  placeholder="e.g., 1-10 employees, 50+, etc."
                />
              </Field>
            )}

            {!formData.isFreelancer && (
              <Field>
                <Label htmlFor="role">Your Role</Label>
                <Select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required={!formData.isFreelancer}
                  disabled={isLoading}
                >
                  {companyRoles.map((role) => (
                    <option key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </Select>
              </Field>
            )}

            {error && (
              <ErrorMessage>{error}</ErrorMessage>
            )}

            <div className="mt-8">
              <Button
                type="submit"
                color="indigo"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Saving...' : 'Complete Setup'}
              </Button>
            </div>
          </FieldGroup>
        </Fieldset>
      </form>
    </div>
  );
}
