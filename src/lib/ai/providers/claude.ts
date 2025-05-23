import { NextResponse } from 'next/server';
import { AiProvider, AiProviderOptions, AiProviderMessage } from '../types';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

function mapMessagesToClaudeFormat(messages: AiProviderMessage[]): {
  system?: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
} {
  let systemPrompt: string | undefined;
  const formattedMessages: { role: 'user' | 'assistant'; content: string }[] =
    [];

  for (const msg of messages) {
    if (msg.role === 'system') {
      if (!systemPrompt) {
        systemPrompt = msg.content;
      } else {
        console.warn(
          'Multiple system prompts found; combining or ignoring subsequent ones.'
        );

        const lastMessage = formattedMessages[formattedMessages.length - 1];
        if (lastMessage?.role === 'user') {
          lastMessage.content += `\n\n[System Note: ${msg.content}]`;
        }
      }
    } else if (msg.role === 'user' || msg.role === 'assistant') {
      const lastRole = formattedMessages[formattedMessages.length - 1]?.role;
      if (lastRole === msg.role) {
        console.warn(`Skipping message due to consecutive roles: ${msg.role}`);
        continue;
      }
      formattedMessages.push({ role: msg.role, content: msg.content });
    }
  }

  if (systemPrompt && formattedMessages[0]?.role !== 'user') {
    console.warn(
      "Conversation doesn't start with a user message after system prompt."
    );
  }

  return {
    ...(systemPrompt && { system: systemPrompt }),
    messages: formattedMessages,
  };
}

export class ClaudeProvider implements AiProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY || '';
    if (!this.apiKey) {
      console.error('Anthropic API key (ANTHROPIC_API_KEY) not configured');
    }
  }

  async generate(options: AiProviderOptions): Promise<Response> {
    if (!this.apiKey) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
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

    const { system, messages: claudeMessages } =
      mapMessagesToClaudeFormat(messages);

    if (claudeMessages.length === 0 || claudeMessages[0].role !== 'user') {
      return NextResponse.json(
        {
          error:
            'Invalid message sequence for Claude API. Must start with a user message.',
        },
        { status: 400 }
      );
    }

    try {
      const claudeResponse = await fetch(CLAUDE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': ANTHROPIC_VERSION,
        },
        body: JSON.stringify({
          model: model,
          ...(system && { system }),
          messages: claudeMessages,
          stream: stream,
        }),

        // @ts-expect-error - duplex is not in standard fetch types yet
        duplex: 'half',
      });

      if (!claudeResponse.ok) {
        const errorText = await claudeResponse.text();
        console.error('Claude API Error:', errorText);

        let details = errorText;
        try {
          const errorJson = JSON.parse(errorText);
          details = errorJson.error?.message || errorText;
        } catch {}
        return NextResponse.json(
          {
            error: `Claude API error: ${claudeResponse.statusText}`,
            details: details,
          },
          { status: claudeResponse.status }
        );
      }

      if (!stream) {
        const data = await claudeResponse.json();

        return NextResponse.json(data);
      }

      if (!claudeResponse.body) {
        return NextResponse.json(
          { error: 'Claude API response body is null for stream' },
          { status: 500 }
        );
      }

      const responseStream = new ReadableStream({
        async start(controller) {
          const reader = claudeResponse.body!.getReader();
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
            console.error('Error reading Claude stream:', error);
            controller.error(error);
          } finally {
            controller.close();
          }
        },
        cancel(reason) {
          console.log('Claude Stream cancelled:', reason);
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
      console.error('Error calling Claude API:', error);
      return NextResponse.json(
        {
          error: 'Failed to call Claude API',
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      );
    }
  }
}
