import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { randomBytes } from 'crypto';

// Define the required YouTube scopes
const scopes = [
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'https://www.googleapis.com/auth/yt-analytics.readonly',
];

export async function GET() {
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

  // Generate state for CSRF protection
  const state = randomBytes(16).toString('hex');
  // Note: In a full implementation, we'd store this state server-side (e.g., session, short-lived DB entry)
  // and verify it in the callback. For now, we generate it and pass it along.

  const authorizationUrl = oauthClient.generateAuthUrl({
    access_type: 'offline', // Request refresh token
    scope: scopes,
    state: state,
    prompt: 'consent', // Force consent screen to ensure refresh token is requested
  });

  console.log('Redirecting user to Google for authentication...');
  // Redirect the user to Google's authorization page
  return NextResponse.redirect(authorizationUrl);
}
