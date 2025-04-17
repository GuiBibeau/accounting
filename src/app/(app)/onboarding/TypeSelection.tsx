"use client";

import React from 'react';
import { Button } from '@/components/ui/button';

interface TypeSelectionProps {
  onSelectType: (type: 'freelancer' | 'company') => void;
}

export default function TypeSelection({ onSelectType }: TypeSelectionProps) {
  return (
    <div className="mx-auto max-w-lg p-4 md:p-6 text-center">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
        Get Started
      </h1>
      <p className="text-xl text-muted-foreground mb-8">
        Are you a freelancer or registering a company?
      </p>

      <div className="space-y-4">
        <div className="w-full">
          <Button
            onClick={() => onSelectType('freelancer')}
            className="w-full"
            size="lg"
          >
            I&apos;m a Freelancer
          </Button>
        </div>
        <div className="w-full">
          <Button
            onClick={() => onSelectType('company')}
            className="w-full"
            size="lg"
          >
            I have a Company
          </Button>
        </div>
      </div>
    </div>
  );
}
