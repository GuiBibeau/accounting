import { type NextRequest, NextResponse } from 'next/server';

// Define the expected structure for messages in the request body
interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  messages: GroqMessage[];
  model?: string; // Optional model override
}

export const runtime = 'edge'; // Use edge runtime for streaming

export async function POST(req: NextRequest) {
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!groqApiKey) {
    return NextResponse.json(
      { error: 'Groq API key not configured' },
      { status: 500 }
    );
  }

  let requestBody: RequestBody;
  try {
    requestBody = await req.json();
  } catch { // Removed unused 'error' variable
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { messages, model = 'llama3-70b-8192' } = requestBody;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'Missing or invalid messages array' }, { status: 400 });
  }

  const groqApiUrl = 'https://api.groq.com/openai/v1/chat/completions';

  try {
    const groqResponse = await fetch(groqApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        stream: true,
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error('Groq API Error:', errorText);
      return NextResponse.json(
        { error: `Groq API error: ${groqResponse.statusText}`, details: errorText },
        { status: groqResponse.status }
      );
    }

    // Ensure the response body is a ReadableStream
    if (!groqResponse.body) {
        return NextResponse.json({ error: 'Groq API response body is null' }, { status: 500 });
    }

    // Create a new ReadableStream to pipe the Groq stream through
    const responseStream = new ReadableStream({
      async start(controller) {
        const reader = groqResponse.body!.getReader();
        // Removed unused 'decoder' variable

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              break;
            }
            // Pass the chunk directly to the client
            controller.enqueue(value);
          }
        } catch (error) {
          console.error('Error reading Groq stream:', error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
      cancel(reason) {
        console.log('Stream cancelled:', reason);
        // You might want to add logic here if the underlying fetch needs cancellation
      }
    });

    // Return the stream response
    return new NextResponse(responseStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error calling Groq API:', error);
    return NextResponse.json(
      { error: 'Failed to call Groq API', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
