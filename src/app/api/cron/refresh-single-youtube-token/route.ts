import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { adminDb } from '@/lib/firebase-admin';
import { encrypt } from '@/lib/encryption';
import { YouTubeCredentials } from '@/lib/youtube';

/**
 * Generates the Firestore path for a user's YouTube credentials.
 * @param userId - The ID of the user.
 * @returns The Firestore document path string.
 */
const getCredentialsPath = (userId: string): string =>
  `users/${userId}/integrations/youtube`;

/**
 * API endpoint (POST) to refresh a single YouTube OAuth token.
 * Expects `userId` and `refreshToken` in the request body.
 * Uses the `googleapis` library to refresh the token.
 * Listens for the 'tokens' event to save the updated (encrypted) tokens
 * back to Firestore in the user's integration subcollection.
 * Handles `invalid_grant` errors by clearing the stored refresh token.
 * Requires a `CRON_SECRET` bearer token for authorization.
 * @param request - The incoming NextRequest containing userId and refreshToken.
 * @returns A NextResponse indicating success or failure of the refresh operation.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { userId, refreshToken } = await request.json();

    if (!userId || !refreshToken) {
      return NextResponse.json(
        { success: false, error: 'Missing userId or refreshToken' },
        { status: 400 }
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    let tokensSaved = false;
    oauth2Client.on('tokens', async (tokens) => {
      const updateData: Partial<YouTubeCredentials> = {
        updatedAt: new Date(),
        expiryDate: tokens.expiry_date ?? null,
        scopes: tokens.scope,
      };

      if (tokens.access_token) {
        updateData.encryptedAccessToken = encrypt(tokens.access_token);
      }

      if (tokens.refresh_token) {
        console.log(
          `Received NEW refresh token for user: ${userId}. Storing encrypted.`
        );
        updateData.encryptedRefreshToken = encrypt(tokens.refresh_token);
      }

      if (tokens.access_token || tokens.refresh_token) {
        try {
          await adminDb
            .doc(getCredentialsPath(userId))
            .set(updateData, { merge: true });
          console.log(
            `Successfully updated YouTube tokens in Firestore for user ${userId}`
          );
          tokensSaved = true;
        } catch (error) {
          console.error(
            `Failed to update YouTube tokens in Firestore for user ${userId}:`,
            error
          );
          tokensSaved = false;
        }
      }
    });

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    try {
      console.log(`Attempting to refresh token for user: ${userId}`);
      const { token: newAccessToken } = await oauth2Client.getAccessToken();

      if (tokensSaved) {
        console.log(`Token refresh successful and saved for user: ${userId}`);
        return NextResponse.json({ success: true });
      } else {
        console.warn(
          `Token refresh process completed for user ${userId}, but listener did not confirm save. Access token present: ${!!newAccessToken}`
        );
        return NextResponse.json({
          success: true,
          message:
            'Refresh process completed, check logs for save confirmation.',
        });
      }
    } catch (error: unknown) {
      let errorDetails: unknown = 'Unknown error';
      let isInvalidGrant = false;

      if (typeof error === 'object' && error !== null) {
        const potentialGaxiosError = error as {
          response?: { data?: { error?: string; message?: string } };
          message?: string;
        };
        errorDetails =
          potentialGaxiosError.response?.data ||
          potentialGaxiosError.message ||
          error;
        if (potentialGaxiosError.response?.data?.error === 'invalid_grant') {
          isInvalidGrant = true;
        }
      } else if (error instanceof Error) {
        errorDetails = error.message;
      }

      console.error(`Error refreshing token for user ${userId}:`, errorDetails);

      if (isInvalidGrant) {
        console.warn(
          `Invalid grant (refresh token likely revoked or expired) for user ${userId}. Clearing token.`
        );
        try {
          await adminDb.doc(getCredentialsPath(userId)).update({
            encryptedRefreshToken: null,
            encryptedAccessToken: null,
            expiryDate: null,
          });
          return NextResponse.json(
            {
              success: false,
              error: 'invalid_grant',
              message: 'Refresh token is invalid and has been cleared.',
            },
            { status: 400 }
          );
        } catch (dbError) {
          console.error(
            `Failed to clear invalid refresh token for user ${userId}:`,
            dbError
          );
          return NextResponse.json(
            {
              success: false,
              error: 'invalid_grant',
              message: 'Refresh token is invalid, failed to clear from DB.',
            },
            { status: 500 }
          );
        }
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Token refresh failed',
          details: errorDetails,
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error('Error in refresh-single-youtube-token handler:', error);
    const message =
      error instanceof Error ? error.message : 'Unknown internal server error';
    return NextResponse.json(
      { success: false, error: 'Internal Server Error', details: message },
      { status: 500 }
    );
  }
}
