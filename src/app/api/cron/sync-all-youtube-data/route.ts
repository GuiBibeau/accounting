import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';


/**
 * Vercel Cron Job endpoint (GET).
 * Uses a Firestore collection group query to find all users with a YouTube integration
 * document (`users/{userId}/integrations/youtube`).
 * Triggers a background job (`/api/cron/sync-single-user-youtube-data`)
 * for each found user using `waitUntil`.
 * Requires a `CRON_SECRET` bearer token for authorization.
 *
 * NOTE: This query requires a Firestore index. See comment at the bottom.
 *
 * @param request - The incoming NextRequest.
 * @returns A NextResponse indicating success or failure.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn('Unauthorized attempt to access sync-all-youtube-data cron');
    return new NextResponse('Unauthorized', { status: 401 });
  }

  let triggeredJobs = 0;
  const syncPromises: Promise<void>[] = [];

  try {
    console.log('Starting sync-all-youtube-data cron job (collectionGroup query)...');

    const allIntegrationsSnapshot = await adminDb
      .collectionGroup('integrations')
      .select()
      .get();

    if (allIntegrationsSnapshot.empty) {
      console.log('No integration documents found in the collection group.');
      return NextResponse.json({ success: true, message: 'No integration documents found.' });
    }

    console.log(`Found ${allIntegrationsSnapshot.docs.length} total integration documents. Filtering for 'youtube'...`);

    const youtubeIntegrationDocs = allIntegrationsSnapshot.docs.filter(doc => doc.id === 'youtube');

    if (youtubeIntegrationDocs.length === 0) {
        console.log('No users found with YouTube integrations after filtering.');
        return NextResponse.json({ success: true, message: 'No users with YouTube integrations found.' });
    }

    console.log(`Found ${youtubeIntegrationDocs.length} users with YouTube integrations after filtering.`);

    for (const integrationDoc of youtubeIntegrationDocs) {
      const userId = integrationDoc.ref.parent.parent?.id;

      if (!userId) {
        console.error('Could not extract userId from integration path:', integrationDoc.ref.path);
        continue;
      }

      try {
        const syncUrl = new URL(
          '/api/cron/sync-single-user-youtube-data',
          request.nextUrl.origin
        );

        const promise = fetch(syncUrl.toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.CRON_SECRET}`,
          },
          body: JSON.stringify({ userId }),
        })
        .then(async (res) => {
            if (!res.ok) {
                const errorBody = await res.text();
                console.error(`Failed to trigger sync for user ${userId}: ${res.status} ${res.statusText}`, errorBody);
            } else {
                console.log(`Successfully triggered sync job for user ${userId}`);
                triggeredJobs++;
            }
        })
        .catch((error) => {
            console.error(`Error triggering sync fetch for user ${userId}:`, error);
        });

        syncPromises.push(promise);

      } catch (triggerError) {
        console.error(`Error triggering sync job for user ${userId}:`, triggerError);
      }
    }

    if (syncPromises.length > 0) {
        console.log(`Waiting for ${syncPromises.length} sync trigger requests to complete...`);
        await Promise.all(syncPromises);
        console.log(`All ${syncPromises.length} sync trigger requests have completed.`);
    }

    console.log(`Sync-all-youtube-data cron job finished dispatching. Successfully triggered: ${triggeredJobs}.`);
    return NextResponse.json({ success: true, triggeredJobs: triggeredJobs });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error in sync-all-youtube-data cron job:', error);
    return new NextResponse(`Internal Server Error: ${errorMessage}`, { status: 500 });
  }
}
