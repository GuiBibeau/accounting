import { NextResponse, type NextRequest } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { adminAuth } from '@/lib/firebase-admin';
import { config } from '@/lib/config';

const scopes = [
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'https://www.googleapis.com/auth/yt-analytics.readonly',
];

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
    console.log(`Verified user ID: ${userId} for YouTube connect`);
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return NextResponse.json(
      { error: 'Unauthorized: Invalid token' },
      { status: 401 }
    );
  }

  if (!config.hasGoogleCredentials()) {
    console.error('Missing Google OAuth Client ID or Secret in config');
    return NextResponse.json(
      { error: 'Server configuration error: Missing Google OAuth credentials' },
      { status: 500 }
    );
  }

  const oauthClient = new OAuth2Client(
    config.googleClientId,
    config.googleClientSecret,
    config.googleRedirectUri
  );

  const state = userId;
  console.log(`Using Firebase UID as state: ${state}`);

  const authorizationUrl = oauthClient.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state: state,
    prompt: 'consent',
  });

  console.log('Redirecting user to Google for authentication...');
  return NextResponse.redirect(authorizationUrl);
}
