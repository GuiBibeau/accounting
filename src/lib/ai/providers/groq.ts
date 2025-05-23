import { NextResponse } from 'next/server';
import { AiProvider, AiProviderOptions } from '../types';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export class GroqProvider implements AiProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || '';
    if (!this.apiKey) {
      console.error('Groq API key not configured');
    }
  }

  async generate(options: AiProviderOptions): Promise<Response> {
    if (!this.apiKey) {
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 500 }
      );
    }

    const { messages, model, stream = true } = options;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid messages array' },
        { status: 400 }
      );
    }

    try {
      const groqResponse = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          stream: stream,
        }),

        // @ts-expect-error - duplex is not in standard fetch types yet
        duplex: 'half',
      });

      if (!groqResponse.ok) {
        const errorText = await groqResponse.text();
        console.error('Groq API Error:', errorText);
        return NextResponse.json(
          {
            error: `Groq API error: ${groqResponse.statusText}`,
            details: errorText,
          },
          { status: groqResponse.status }
        );
      }

      if (!stream) {
        const data = await groqResponse.json();
        return NextResponse.json(data);
      }

      if (!groqResponse.body) {
        return NextResponse.json(
          { error: 'Groq API response body is null for stream' },
          { status: 500 }
        );
      }

      const responseStream = new ReadableStream({
        async start(controller) {
          const reader = groqResponse.body!.getReader();
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                break;
              }
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
        },
      });

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
        {
          error: 'Failed to call Groq API',
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      );
    }
  }
}
