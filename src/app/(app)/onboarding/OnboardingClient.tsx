"use client";

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { handleOnboarding, OnboardingData, CompanyRole } from '@/lib/company';
import TypeSelection from './TypeSelection';
import OnboardingForm from './OnboardingForm';

export default function OnboardingClient() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<'type' | 'form'>('type');
  const [userType, setUserType] = useState<'freelancer' | 'company'>('freelancer');
  const [formData, setFormData] = useState<Omit<OnboardingData, ''>>({
    fullName: '',
    role: 'solo owner',
    companySize: '',
    companyName: '',
    companyField: '',
    isFreelancer: true,
    freelancerIndustry: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeSelect = (type: 'freelancer' | 'company') => {
    setUserType(type);
    setFormData(prev => ({
      ...prev,
      isFreelancer: type === 'freelancer'
    }));
    setStep('form');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      setError("User not authenticated. Please log in again.");
      return;
    }
    
    if (!formData.fullName) {
      setError("Name is required.");
      return;
    }
    
    if (!formData.isFreelancer && (!formData.companyName || !formData.companySize || !formData.companyField)) {
      setError("Company details are required.");
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
    <>
      {step === 'type' ? (
        <TypeSelection onSelectType={handleTypeSelect} />
      ) : (
        <OnboardingForm
          formData={formData}
          userType={userType}
          isLoading={isLoading}
          error={error}
          handleChange={handleChange}
          handleSelectChange={handleSelectChange}
          handleSubmit={handleSubmit}
          onBack={() => setStep('type')}
        />
      )}
    </>
  );
}
