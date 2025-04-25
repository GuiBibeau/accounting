'use client';

import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react'; 
import { YouTubeIcon } from '@/components/icons/YouTube'; 
import { AppError, catchAsyncError } from '@/lib/errors';

const auth = getAuth(app);

type ConnectYouTubeButtonProps = {
  variant?: 'icon' | 'full';
};

/**
 * Button component that initiates YouTube account connection.
 * Handles Firebase authentication and redirects to Google OAuth URL.
 * Adapts display based on the variant prop (icon only or full text).
 *
 * @param {ConnectYouTubeButtonProps} props - Component props.
 * @param {'icon' | 'full'} [props.variant='full'] - Display variant ('icon' or 'full').
 * @returns {JSX.Element} Button with loading state and error handling.
 */
export function ConnectYouTubeButton({ variant = 'full' }: ConnectYouTubeButtonProps) {
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
    <div className="w-full">
      <Button
        onClick={handleConnect}
        disabled={isLoading}
        className={`w-full bg-red-600 hover:bg-red-700 text-white ${variant === 'icon' ? 'px-2' : ''}`}
        aria-label={variant === 'icon' ? 'Connect YouTube Account' : undefined}
      >
        {isLoading ? (
          <>
            <Loader2 className={`h-4 w-4 animate-spin ${variant === 'full' ? 'mr-2' : ''}`} />
            {variant === 'full' && 'Connecting...'}
          </>
        ) : (
          <>
            <YouTubeIcon className={`h-4 w-4 ${variant === 'full' ? 'mr-2' : ''}`} />
            {variant === 'full' && 'Connect YouTube'}
          </>
        )}
      </Button>
      {error && <p className="mt-2 text-sm text-red-600 px-2">{error.message}</p>}
    </div>
  );
}
