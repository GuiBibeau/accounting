import { createGroq } from '@ai-sdk/groq';

/**
 * Groq API client instance initialized with the API key from environment variables.
 * Logs a warning if the key is not found.
 * Will be null if the API key is not set.
 */
export const groq = (() => {
  const groqApiKey = process.env.GROQ_API_KEY;

  return createGroq({ apiKey: groqApiKey });
})();

/** The specific Groq model ID to use for summarization tasks. */
export const groqSummarizationModelId = 'llama3-8b-8192'; // Or your preferred Groq model
