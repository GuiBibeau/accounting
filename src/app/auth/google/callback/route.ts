import { NextResponse, type NextRequest } from 'next/server';
import { OAuth2Client } from 'google-auth-library';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  console.log('Received Google OAuth callback');
  console.log(`Code: ${code ? code.substring(0, 10) + '...' : 'N/A'}`); // Log only prefix for brevity/security
  console.log(`State: ${state}`);

  // --- State Verification ---
  // TODO: Implement proper state verification.
  // In the initiation route (connect/route.ts), the generated 'state' was not stored.
  // For security (CSRF protection), the 'state' generated during initiation should be
  // stored (e.g., in a short-lived cookie, session, or database entry tied to the user's session)
  // and compared with the 'state' received here.
  // Since we skipped storing it, we cannot verify it now. This is a security risk.
  if (!state) {
    console.warn('State parameter missing in callback.');
    // In a real app, you'd likely redirect to an error page or return an error response.
  }
  // Add actual verification logic here when state storage is implemented.
  // Example:
  // const storedState = request.cookies.get('oauth_state')?.value;
  // if (!state || !storedState || state !== storedState) {
  //   console.error('Invalid state parameter.');
  //   return NextResponse.json({ error: 'Invalid state parameter.' }, { status: 401 });
  // }
  // request.cookies.delete('oauth_state'); // Clear the state cookie

  if (!code) {
    console.error('Authorization code missing in callback.');
    return NextResponse.json(
      { error: 'Authorization code missing.' },
      { status: 400 },
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI; // Must match the one used in initiation

  if (!clientId || !clientSecret || !redirectUri) {
    console.error('Missing Google OAuth credentials in environment variables');
    return NextResponse.json(
      { error: 'Server configuration error: Missing Google OAuth credentials.' },
      { status: 500 },
    );
  }

  const oauthClient = new OAuth2Client(clientId, clientSecret, redirectUri);

  try {
    const { tokens } = await oauthClient.getToken(code);
    console.log('Successfully exchanged code for tokens:');
    console.log('Access Token:', tokens.access_token ? tokens.access_token.substring(0, 10) + '...' : 'N/A');
    console.log('Refresh Token:', tokens.refresh_token ? tokens.refresh_token.substring(0, 10) + '...' : 'N/A');
    console.log('Expiry Date:', tokens.expiry_date ? new Date(tokens.expiry_date).toLocaleString() : 'N/A');
    console.log('Scopes:', tokens.scope);

    // --- Token Storage (Placeholder) ---
    // TODO: Implement secure storage (e.g., Firestore, encrypted) associated with the user.
    // For now, we are just logging them as requested.

    // Redirect user to a success page or return a success message
    // For simplicity, returning JSON response. Could redirect:
    // const successUrl = new URL('/settings/integrations?status=youtube_success', request.nextUrl.origin);
    // return NextResponse.redirect(successUrl);

    return NextResponse.json({
      message: 'Authentication successful! Tokens received and logged.',
      details: `Access token expires around: ${tokens.expiry_date ? new Date(tokens.expiry_date).toLocaleString() : 'N/A'}`,
    });

  } catch (error: any) {
    console.error('Error exchanging code for tokens:', error.message);
    console.error('Error details:', error.response?.data); // Log Google's error response if available
    return NextResponse.json(
      { error: 'Failed to exchange authorization code for tokens.', details: error.message },
      { status: 500 },
    );
  }
}
