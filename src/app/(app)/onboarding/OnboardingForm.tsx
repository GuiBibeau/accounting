'use client';

import React, { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OnboardingData, CompanyRole } from '@/lib/company';
import { ArrowLeft } from 'lucide-react';

const companyRoles: CompanyRole[] = ['solo owner', 'accountant', 'president'];

type FormDataSubset = Pick<
  OnboardingData,
  | 'fullName'
  | 'role'
  | 'companySize'
  | 'companyName'
  | 'companyField'
  | 'isFreelancer'
>;

interface OnboardingFormProps {
  formData: FormDataSubset;
  userType: 'freelancer' | 'company';
  isLoading: boolean;
  error: string | null;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  onBack: () => void;
}

export default function OnboardingForm({
  formData,
  userType,
  isLoading,
  error,
  handleChange,
  handleSelectChange,
  handleSubmit,
  onBack,
}: OnboardingFormProps) {
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="mx-auto max-w-lg p-4 md:p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          disabled={isLoading}
          aria-label="Go back"
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight">
          {userType === 'freelancer'
            ? 'Freelancer Information'
            : 'Company Details'}
        </h1>
      </div>
      <p className="text-muted-foreground mb-8">
        {userType === 'freelancer'
          ? 'Please provide your details to get started.'
          : 'Please provide your company details to get started.'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            required
            disabled={isLoading}
            placeholder="Your full name"
          />
        </div>

        {!formData.isFreelancer && (
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              name="companyName"
              type="text"
              value={formData.companyName}
              onChange={handleChange}
              required={!formData.isFreelancer}
              disabled={isLoading}
              placeholder="Your company's name"
            />
          </div>
        )}

        <div className="grid w-full items-center gap-1.5">
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
            placeholder={
              formData.isFreelancer
                ? 'e.g., Web Development, Design, Consulting'
                : 'e.g., Technology, Retail, Consulting'
            }
          />
        </div>

        {!formData.isFreelancer && (
          <div className="grid w-full items-center gap-1.5">
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
          </div>
        )}

        {!formData.isFreelancer && (
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="role">Your Role</Label>
            <Select
              name="role"
              value={formData.role}
              onValueChange={(value) => handleSelectChange('role', value)}
              required={!formData.isFreelancer}
              disabled={isLoading}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                {companyRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {capitalize(role)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {error && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}

        <div className="pt-4">
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Saving...' : 'Complete Setup'}
          </Button>
        </div>
      </form>
    </div>
  );
}
