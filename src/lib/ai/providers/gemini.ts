import { NextResponse } from 'next/server';
import {
  AiProvider,
  AiProviderOptions,
  AiProviderMessage,
} from '../types';


const GEMINI_API_BASE_URL =
  'https://generativelanguage.googleapis.com/v1beta/models';


interface GeminiMessagePart {
  text: string;
}

interface GeminiMessageContent {
  role: 'user' | 'model';
  parts: GeminiMessagePart[];
}


function mapMessagesToGeminiFormat(messages: AiProviderMessage[]): GeminiMessageContent[] {

  return messages
    .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
    .map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

}

export class GeminiProvider implements AiProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    if (!this.apiKey) {
      console.error('Gemini API key not configured');
    }
  }

  async generate(options: AiProviderOptions): Promise<Response> {
    if (!this.apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
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

    const geminiMessages = mapMessagesToGeminiFormat(messages);
    const apiUrl = `${GEMINI_API_BASE_URL}/${model}:${stream ? 'streamGenerateContent' : 'generateContent'}?key=${this.apiKey}`;

    try {
      const geminiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: geminiMessages,


        }),

        // @ts-expect-error - duplex is not in standard fetch types yet
        duplex: 'half',
      });

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        console.error('Gemini API Error:', errorText);
        return NextResponse.json(
          {
            error: `Gemini API error: ${geminiResponse.statusText}`,
            details: errorText,
          },
          { status: geminiResponse.status }
        );
      }

      if (!stream) {
        const data = await geminiResponse.json();

        return NextResponse.json(data);
      }


      if (!geminiResponse.body) {
        return NextResponse.json(
          { error: 'Gemini API response body is null for stream' },
          { status: 500 }
        );
      }



      const responseStream = new ReadableStream({
        async start(controller) {
          const reader = geminiResponse.body!.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {

                break;
              }
              buffer += decoder.decode(value, { stream: true });


              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                 if (line.trim()) {


                    controller.enqueue(new TextEncoder().encode(line + '\n'));
                 }
              }
            }
          } catch (error) {
            console.error('Error reading Gemini stream:', error);
            controller.error(error);
          } finally {
            controller.close();
          }
        },
        cancel(reason) {
          console.log('Gemini Stream cancelled:', reason);
        },
      });


      return new NextResponse(responseStream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return NextResponse.json(
        {
          error: 'Failed to call Gemini API',
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      );
    }
  }
}
