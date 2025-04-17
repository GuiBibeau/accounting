import { type NextRequest, NextResponse } from 'next/server';
import {
  AiProviderMessage,
  AiProviderId,
  AiProviderOptions,
} from '@/lib/ai/types';
import { getAiProvider, determineProviderFromModel } from '@/lib/ai/service';


interface RequestBody {
  messages: AiProviderMessage[];
  model?: string;
  provider?: AiProviderId;
  stream?: boolean;
}

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  let requestBody: RequestBody;
  try {
    requestBody = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const {
    messages,
    model = 'llama3-70b-8192',
    provider: explicitProvider,
    stream = true,
  } = requestBody;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: 'Missing or invalid messages array' },
      { status: 400 }
    );
  }

  let providerId: AiProviderId;

  try {

    providerId = explicitProvider || determineProviderFromModel(model);
  } catch (error) {
    console.error('Error determining AI provider:', error);
    return NextResponse.json(
      {
        error: 'Could not determine AI provider',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 400 }
    );
  }

  try {
    const aiProvider = getAiProvider(providerId);

    const options: AiProviderOptions = {
      messages,
      model,
      stream,

    };


    const response = await aiProvider.generate(options);


    return response;
  } catch (error) {
    console.error(`Error calling ${providerId} provider:`, error);

    const status = error instanceof Error && error.message.startsWith('Unsupported AI provider') ? 400 : 500;
    return NextResponse.json(
      {
        error: `Failed to get response from ${providerId} provider`,
        details: error instanceof Error ? error.message : String(error),
      },
      { status }
    );
  }
}
