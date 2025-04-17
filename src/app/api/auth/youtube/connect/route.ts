import { NextResponse, type NextRequest } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { adminAuth } from '@/lib/firebase-admin'; // Import Firebase Admin Auth

// Define the required YouTube scopes
const scopes = [
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'https://www.googleapis.com/auth/yt-analytics.readonly',
];

export async function GET(request: NextRequest) {
  // --- Firebase Authentication ---
  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized: Missing Bearer token' }, { status: 401 });
  }
  const idToken = authorization.split('Bearer ')[1];

  let userId: string;
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    userId = decodedToken.uid;
    console.log(`Verified user ID: ${userId} for YouTube connect`);
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
  }
  // --- End Firebase Authentication ---

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    console.error('Missing Google OAuth credentials in environment variables');
    return NextResponse.json(
      { error: 'Server configuration error: Missing Google OAuth credentials.' },
      { status: 500 },
    );
  }

  const oauthClient = new OAuth2Client(clientId, clientSecret, redirectUri);

  // Use Firebase UID as state parameter
  const state = userId;
  console.log(`Using Firebase UID as state: ${state}`);

  const authorizationUrl = oauthClient.generateAuthUrl({
    access_type: 'offline', // Request refresh token
    scope: scopes,
    state: state, // Pass Firebase UID as state
    prompt: 'consent', // Force consent screen to ensure refresh token is requested
  });

  console.log('Redirecting user to Google for authentication...');
  // Redirect the user to Google's authorization page
  return NextResponse.redirect(authorizationUrl);
}
