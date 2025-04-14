"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';

interface TypeSelectionProps {
  onSelectType: (type: 'freelancer' | 'company') => void;
}

export default function TypeSelection({ onSelectType }: TypeSelectionProps) {
  return (
    <div className="mx-auto max-w-lg">
      <Heading level={1}>Get Started</Heading>
      <Text className="mt-2 mb-8">
        Are you a freelancer or registering a company?
      </Text>

      <div className="space-y-4">
        <div className="w-full">
          <Button
            onClick={() => onSelectType('freelancer')}
            color="indigo"
            className="w-full"
          >
            I&apos;m a Freelancer
          </Button>
        </div>
        <div className="w-full">
          <Button
            onClick={() => onSelectType('company')}
            color="indigo"
            className="w-full"
          >
            I have a Company
          </Button>
        </div>
      </div>
    </div>
  );
}
