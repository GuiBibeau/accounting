import { NextResponse, type NextRequest } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { adminAuth } from '@/lib/firebase-admin';

/** YouTube API scopes required for the application */
const SCOPES = [
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'https://www.googleapis.com/auth/yt-analytics.readonly',
];

/**
 * Generates a Google OAuth URL for YouTube authentication.
 * Verifies the Firebase ID token and returns an authorization URL.
 * 
 * @param {NextRequest} request - The incoming request containing the Firebase ID token
 * @returns {Promise<NextResponse>} Response containing the authorization URL or error
 */
export async function GET(request: NextRequest) {
  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Unauthorized: Missing Bearer token' }, 
      { status: 401 }
    );
  }

  const idToken = authorization.split('Bearer ')[1];
  let userId: string;

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    userId = decodedToken.uid;
  } catch (error: unknown ) {
    console.error('Error verifying ID token:', error);
    return NextResponse.json(
      { error: 'Unauthorized: Invalid token' }, 
      { status: 401 }
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
  const authorizationUrl = oauthClient.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    state: userId,
    prompt: 'consent',
  });

  return NextResponse.json({ authorizationUrl });
}
