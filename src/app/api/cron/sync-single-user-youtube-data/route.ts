import { NextRequest, NextResponse } from 'next/server';
import { syncYoutubeData } from '@/lib/youtube';
import { adminDb } from '@/lib/firebase-admin';

/**
 * Generates the Firestore path for a user's YouTube credentials.
 * @param userId - The ID of the user.
 * @returns The Firestore document path string.
 */
const getCredentialsPath = (userId: string): string =>
  `users/${userId}/integrations/youtube`;

/**
 * Vercel Cron Job Helper endpoint (POST).
 * Receives a userId and triggers the YouTube data synchronization process
 * for that specific user by calling `syncYoutubeData`.
 * Requires a `CRON_SECRET` bearer token for authorization.
 * @param request - The incoming NextRequest.
 * @returns A NextResponse indicating success or failure for the specific user sync.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn(
      'Unauthorized attempt to access sync-single-user-youtube-data'
    );
    return new NextResponse('Unauthorized', { status: 401 });
  }

  let userId: string | undefined;

  try {
    const body = await request.json();
    userId = body.userId;

    if (!userId || typeof userId !== 'string') {
      console.error('Missing or invalid userId in request body');
      return NextResponse.json(
        { success: false, error: 'Missing or invalid userId' },
        { status: 400 }
      );
    }

    console.log(`Received request to sync YouTube data for user: ${userId}`);

    const userDoc = await adminDb.doc(`users/${userId}`).get();
    if (!userDoc.exists) {
      console.error(`User ${userId} not found in Firestore.`);
      return NextResponse.json(
        { success: false, error: `User ${userId} not found` },
        { status: 404 }
      );
    }

    const credsPath = getCredentialsPath(userId);
    const credsDocSnapshot = await adminDb.doc(credsPath).get();

    if (!credsDocSnapshot.exists) {
      console.log(
        `No YouTube integration found for user ${userId}. Skipping sync.`
      );
      return NextResponse.json({
        success: true,
        message: `No YouTube integration found for user ${userId}. Sync skipped.`,
      });
    }

    await syncYoutubeData(userId);

    console.log(`Successfully completed YouTube data sync for user: ${userId}`);
    return NextResponse.json({
      success: true,
      message: `Sync completed for user ${userId}`,
    });
  } catch (error: unknown) {
    console.error(`Error syncing YouTube data for user ${userId}:`, error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      {
        success: false,
        error: `Sync failed for user ${userId}: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
