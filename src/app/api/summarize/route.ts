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
      prompt: `Write a summary of this chat message under 7 words. Return only the summary: ${message}`,
    });

    return NextResponse.json({ title });

  } catch (error) {
    console.error('Error in /api/summarize:', error);
    // Check if the error is an instance of Error to access the message property safely
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
