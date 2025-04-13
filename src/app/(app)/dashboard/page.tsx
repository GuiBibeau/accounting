"use client";

import React from 'react';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { useUser } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user, loading } = useUser();

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div>
      <Heading level={1}>Dashboard</Heading>
      <Text className="mt-4">
        Welcome back{user?.displayName || user?.email ? `, ${user.displayName || user.email}` : ''}!
      </Text>

    </div>
  );
}
