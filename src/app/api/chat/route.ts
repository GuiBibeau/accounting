import { streamText } from 'ai';
import { groq } from '@ai-sdk/groq';

// Assuming GROQ_API_KEY is set in your environment variables (.env.local)
// The Vercel AI SDK automatically picks up GROQ_API_KEY
// If you need custom settings, you can use createGroq:
// import { createGroq } from '@ai-sdk/groq';
// const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  try {
    const result = await streamText({
      // Use the groq provider instance
      // Specify the model, e.g., 'llama3-8b-8192', 'mixtral-8x7b-32768', 'gemma-7b-it'
      // Check Groq's documentation for available models: https://console.groq.com/docs/models
      model: groq('llama3-8b-8192'),
      messages,
    });

    // Respond with the stream
    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Error calling Groq API:', error);
    // Consider returning a more specific error response
    return new Response('Error processing request', { status: 500 });
  }
}
