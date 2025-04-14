import { NextRequest, NextResponse } from 'next/server';
import { groq, groqSummarizationModelId } from '@/lib/groq'; // Use alias @/lib
import { generateText } from 'ai';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required and must be a string' }, { status: 400 });
    }

    // Generate the summary using Groq
    const { text: title } = await generateText({
      model: groq(groqSummarizationModelId),
      prompt: `The user is asking a question to a business agent that does accounting, tax, and bookkeeping. Summarize the question in 7 words or less. The summary will be used as the title of the conversation. Return only the summary of the question. No quotes or other text: ${message},`,
    });

    return NextResponse.json({ title });

  } catch (error) {
    console.error('Error in /api/summarize:', error);
    // Check if the error is an instance of Error to access the message property safely
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
