export interface AiProviderMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiProviderOptions {
  messages: AiProviderMessage[];
  model: string;
  stream?: boolean;
}

export interface AiProvider {
  generate(options: AiProviderOptions): Promise<Response>;
}

export type AiProviderId = 'groq' | 'gemini' | 'claude';
