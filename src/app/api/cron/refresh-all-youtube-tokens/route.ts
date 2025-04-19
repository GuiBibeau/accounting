import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { YouTubeCredentials } from '@/lib/youtube'; // Import correct interface
import { decrypt } from '@/lib/encryption'; // Import decrypt function

export const runtime = 'edge';

/**
 * Generates the Firestore path for a user's YouTube credentials.
 * @param userId - The ID of the user.
 * @returns The Firestore document path string.
 */
const getCredentialsPath = (userId: string): string =>
  `users/${userId}/integrations/youtube`;

/**
 * Vercel Cron Job endpoint (GET).
 * Fetches all users, retrieves their encrypted YouTube refresh tokens,
 * decrypts them, and triggers a background job (`/api/cron/refresh-single-youtube-token`)
 * for each valid token using `waitUntil`.
 * Requires a `CRON_SECRET` bearer token for authorization.
 * @param request - The incoming NextRequest.
 * @returns A NextResponse indicating success or failure.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  let triggeredJobs = 0;
  const refreshPromises: Promise<void>[] = [];

  try {
    const usersSnapshot = await adminDb.collection('users').select().get();

    if (usersSnapshot.empty) {
      console.log('No users found in the users collection.');
      return NextResponse.json({ success: true, message: 'No users found.' });
    }

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const credsPath = getCredentialsPath(userId);

      try {
        const credsDoc = await adminDb.doc(credsPath).get();

        if (credsDoc.exists) {
          const credentials = credsDoc.data() as YouTubeCredentials;

          if (credentials.encryptedRefreshToken) {
            const refreshToken = decrypt(credentials.encryptedRefreshToken);

            if (refreshToken) {
              const refreshUrl = new URL(
                '/api/cron/refresh-single-youtube-token',
                request.nextUrl.origin
              );

              const promise = fetch(refreshUrl.toString(), {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${process.env.CRON_SECRET}`,
                },
                body: JSON.stringify({ userId, refreshToken }),
              })
              .then(async (res) => {
                  if (!res.ok) {
                      const errorBody = await res.text();
                      console.error(`Failed to trigger refresh for user ${userId}: ${res.status} ${res.statusText}`, errorBody);
                  } else {
                      console.log(`Successfully triggered refresh job for user ${userId}`);
                      triggeredJobs++;
                  }
              })
              .catch((error) => {
                  console.error(`Error triggering refresh fetch for user ${userId}:`, error);
              });

              const RequestContext = (globalThis as unknown as { [key: symbol]: { get(): { waitUntil?: (promise: Promise<unknown>) => void } | undefined } | undefined })[Symbol.for('@next/request-context')];
              const contextValue = RequestContext?.get();
              const waitUntil = contextValue?.waitUntil;

              if (waitUntil) {
                  waitUntil(promise);
              } else {
                  console.warn(`waitUntil not available for user ${userId}. Refresh trigger might delay response.`);
                  refreshPromises.push(promise);
              }
            } else {
              console.warn(`Decryption failed or refresh token empty for user ${userId}`);
            }
          }
        }
      } catch (credError) {
        console.error(`Error fetching/processing credentials for user ${userId}:`, credError);
      }
    }

    if (refreshPromises.length > 0) {
        await Promise.all(refreshPromises);
    }

    console.log(`Attempted to trigger refresh jobs for relevant users. Successfully triggered: ${triggeredJobs}.`);
    return NextResponse.json({ success: true, triggeredJobs: triggeredJobs });

  } catch (error: unknown) {
    console.error('Error in refresh-all-youtube-tokens cron job:', error);
    if (error instanceof Error) {
        return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
