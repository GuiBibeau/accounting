import { NextResponse, type NextRequest } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { adminDb } from '@/lib/firebase-admin';
import { encrypt } from '@/lib/encryption';

/**
 * Handles the Google OAuth callback for YouTube authentication.
 * Exchanges the authorization code for tokens, encrypts them, and stores in Firestore.
 * 
 * @param {NextRequest} request - The incoming request containing the authorization code and state
 * @returns {Promise<NextResponse>} Response indicating success or failure
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const userId = searchParams.get('state');

  if (!userId) {
    return NextResponse.json(
      { error: 'State parameter (User ID) missing.' },
      { status: 400 },
    );
  }

  if (!code) {
    return NextResponse.json(
      { error: 'Authorization code missing.' },
      { status: 400 },
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json(
      { error: 'Server configuration error: Missing Google OAuth credentials.' },
      { status: 500 },
    );
  }

  const oauthClient = new OAuth2Client(clientId, clientSecret, redirectUri);

  try {
    const { tokens } = await oauthClient.getToken(code);

    /** @type {{encryptedAccessToken: string, encryptedRefreshToken?: string, expiryDate: number | null, scopes: string | undefined, updatedAt: Date}} */
    const credentialsToStore = {
      encryptedAccessToken: encrypt(tokens.access_token!),
      expiryDate: tokens.expiry_date ?? null,
      scopes: tokens.scope,
      updatedAt: new Date(),
      ...(tokens.refresh_token && { 
        encryptedRefreshToken: encrypt(tokens.refresh_token) 
      })
    };

    await adminDb
      .collection('users')
      .doc(userId)
      .collection('integrations')
      .doc('youtube')
      .set(credentialsToStore, { merge: true });

    return new NextResponse(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>YouTube Connection Complete</title>
          <script>
            window.close();
          </script>
        </head>
        <body>
          <p>YouTube connection successful. You can now close this window.</p>
          <script>
            setTimeout(() => {
              window.close();
            }, 1000);
          </script>
        </body>
      </html>
    `, {
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    return NextResponse.json(

      { error: 'Failed to exchange authorization code for tokens.', details: error },
      { status: 500 },
    );
  }
}
