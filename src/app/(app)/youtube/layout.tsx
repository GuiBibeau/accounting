'use client';

import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { SiteHeader } from '@/components/site-header';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { db } from '@/lib/firebase';
import { doc, getDoc, Timestamp } from 'firebase/firestore';

interface YouTubeLayoutProps {
  children: ReactNode;
}

const YouTubeLayout = ({ children }: YouTubeLayoutProps) => {
  const { user, loading: authLoading } = useAuth();
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const pathname = usePathname();

  const fetchChannelSyncTime = useCallback(async () => {
    if (!user?.uid || !user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/youtube/channel-details', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            `Failed to fetch channel details: ${response.statusText}`
        );
      }

      const { channelId } = await response.json();

      if (channelId) {
        const channelMetadataPath = `youtubeChannels/${channelId}/metadata/doc`;
        const channelDocRef = doc(db, channelMetadataPath);
        const channelDocSnap = await getDoc(channelDocRef);

        if (channelDocSnap.exists()) {
          const data = channelDocSnap.data();
          if (data.lastSyncedAt && data.lastSyncedAt instanceof Timestamp) {
            setLastSyncedAt(data.lastSyncedAt.toDate().toLocaleString());
          } else {
            setLastSyncedAt('Never');
          }
        } else {
          setLastSyncedAt('Never');
          console.warn(
            `Channel metadata document not found at ${channelMetadataPath}`
          );
        }
      } else {
        setLastSyncedAt(null); // Or 'Not Connected' if appropriate
        console.warn('Channel ID not found in API response.');
      }
    } catch (error) {
      console.error('Failed to fetch last synced time:', error);
      setLastSyncedAt('Error');
    }
  }, [user]);

  useEffect(() => {
    if (user?.uid) {
      fetchChannelSyncTime();
    } else {
      setLastSyncedAt(null);
    }
  }, [user, fetchChannelSyncTime]);

  if (authLoading) {
    return <div className="p-4 text-center">Authenticating...</div>;
  }

  if (!user) {
    return (
      <div className="p-4 text-center">
        Please log in to access YouTube features.
      </div>
    );
  }

  const tabs = [
    { name: 'Channel', href: '/youtube/channel' },
    { name: 'Future Videos', href: '/youtube/future-videos' },
    { name: 'Automations', href: '/youtube/automations' },
  ];

  // Determine the active tab value for Shadcn Tabs
  // It should match one of the hrefs or be the closest parent.
  const activeTabValue =
    tabs.find((tab) => pathname.startsWith(tab.href))?.href || pathname;

  return (
    <>
      <SiteHeader title="YouTube Management" lastSyncedAt={lastSyncedAt} />
      <div className="px-4 lg:px-6 pt-2 pb-4 border-b">
        <Tabs value={activeTabValue} className="w-full">
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.href} value={tab.href} asChild>
                <Link href={tab.href}>{tab.name}</Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <div className="flex flex-col flex-1 overflow-y-auto">{children}</div>
    </>
  );
};

export default YouTubeLayout;
