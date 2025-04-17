'use client';

import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { AppError, catchAsyncError } from '@/lib/errors';

const auth = getAuth(app);

/**
 * Button component that initiates YouTube account connection.
 * Handles Firebase authentication and redirects to Google OAuth URL.
 * 
 * @returns {JSX.Element} Button with loading state and error handling
 */
export function ConnectYouTubeButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  /**
   * Handles the YouTube connection flow:
   * 1. Gets current user's Firebase ID token
   * 2. Fetches Google OAuth URL from API
   * 3. Redirects user to authorization URL
   */
  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);

    const user = auth.currentUser;

    if (!user) {
      setError(new AppError('You must be logged in to connect your YouTube account.'));
      setIsLoading(false);
      return;
    }

    const result = await catchAsyncError(async () => {
      const idToken = await user.getIdToken(true);
      const response = await fetch('/api/auth/youtube/get-auth-url', {
        method: 'GET',
        headers: { Authorization: `Bearer ${idToken}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const { authorizationUrl } = await response.json();
      if (!authorizationUrl) {
        throw new Error('Authorization URL not received from server.');
      }

      window.open(authorizationUrl, '_blank');
    });

    if (result instanceof AppError) {
      setError(result);
    }
    setIsLoading(false);
  };

  return (
    <div>
      <Button onClick={handleConnect} disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          'Connect YouTube Account'
        )}
      </Button>
      {error && <p className="mt-2 text-sm text-red-600">{error.message}</p>}
    </div>
  );
}
