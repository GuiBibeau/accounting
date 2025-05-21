import { NextResponse } from 'next/server';
import { getChannelMetadata } from '@/lib/youtube'; // Server-side youtube lib
import { adminAuth } from '@/lib/firebase-admin'; // For getting current user

export async function GET(request: Request) {
  try {
    // TODO: Implement proper authentication to get userId
    // For now, assuming a way to get userId. This needs to be replaced
    // with actual session management or token verification.
    // const session = await getSession(); // Placeholder for actual auth
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    // const userId = session.user.id;

    // Placeholder for userId - THIS MUST BE REPLACED WITH ACTUAL AUTH
    // For the purpose of this example, let's assume a way to get it.
    // This is a critical security step.
    // We can extract it from the token if using Firebase Auth on client and passing ID token.
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing or invalid token' },
        { status: 401 }
      );
    }
    const idToken = authorizationHeader.split('Bearer ')[1];

    let userId: string;
    try {
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      userId = decodedToken.uid;
    } catch (error) {
      console.error('Error verifying ID token:', error);
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: User ID not found in token' },
        { status: 401 }
      );
    }

    const channelMetadata = await getChannelMetadata(userId);

    if (!channelMetadata || !channelMetadata.id) {
      return NextResponse.json(
        { error: 'YouTube channel not found or not integrated.' },
        { status: 404 }
      );
    }

    // We only need the channelId for now to fetch lastSyncedAt from its specific doc
    return NextResponse.json({
      channelId: channelMetadata.id,
      title: channelMetadata.title,
    });
  } catch (error) {
    console.error('Error in /api/youtube/channel-details:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
