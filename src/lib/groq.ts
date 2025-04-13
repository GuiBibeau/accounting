import { createGroq } from '@ai-sdk/groq';

/**
 * Groq API client instance initialized with the API key from environment variables.
 * Logs a warning if the key is not found.
 * Will be null if the API key is not set.
 */
export const groq = (() => {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    console.warn(
      'GROQ_API_KEY environment variable is not set. AI features requiring Groq will be disabled.'
    );
    return null;
  }
  try {
    return createGroq({ apiKey: groqApiKey });
  } catch (error) {
    console.error('Failed to initialize Groq client:', error);
    return null;
  }
})();

/** The specific Groq model ID to use for summarization tasks. */
export const groqSummarizationModelId = 'llama3-8b-8192'; // Or your preferred Groq model
