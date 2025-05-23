import { AiProvider, AiProviderId } from './types';
import { GroqProvider } from './providers/groq';
import { GeminiProvider } from './providers/gemini';
import { ClaudeProvider } from './providers/claude';

const providerInstances: Partial<Record<AiProviderId, AiProvider>> = {};

export function getAiProvider(providerId: AiProviderId): AiProvider {
  if (providerInstances[providerId]) {
    return providerInstances[providerId]!;
  }

  let provider: AiProvider;

  switch (providerId) {
    case 'groq':
      provider = new GroqProvider();
      break;
    case 'gemini':
      provider = new GeminiProvider();
      break;
    case 'claude':
      provider = new ClaudeProvider();
      break;
    default:
      throw new Error(`Unsupported AI provider: ${providerId}`);
  }

  providerInstances[providerId] = provider;
  return provider;
}

export function determineProviderFromModel(model: string): AiProviderId {
  if (
    model.startsWith('llama') ||
    model.startsWith('mixtral') ||
    model.startsWith('gemma')
  ) {
    return 'groq';
  }
  if (model.startsWith('gemini')) {
    return 'gemini';
  }
  if (model.startsWith('claude')) {
    return 'claude';
  }

  throw new Error(`Could not determine AI provider for model: ${model}`);
}
