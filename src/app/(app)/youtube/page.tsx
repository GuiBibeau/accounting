'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const YouTubeRedirectPage = () => {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Wait for auth loading to complete
    if (!loading) {
      if (user) {
        // If user is authenticated, redirect to the default channel subtab
        router.replace('/youtube/channel');
      } else {
        // If user is not authenticated, you might want to redirect to login
        // or show a message. For now, this page will be shown by the layout
        // if the user is not logged in, so no explicit redirect here is needed
        // for the unauthenticated case. The layout handles showing a login prompt.
      }
    }
  }, [user, loading, router]);

  // Optionally, show a loading state or a blank page while redirecting
  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  // If not loading and no user, the layout will show "Please log in..."
  // If not loading and user exists, redirect will happen.
  // This component can return null or a minimal loader as it's transitional.
  return null;
};

export default YouTubeRedirectPage;
