import { useState, useCallback, FormEvent } from 'react';

export interface Message {
  id: string;
  role: 'system' | 'user' | 'assistant' | 'data'; 
  content: string;
  createdAt?: Date;
}

interface UseChatOptions {
  initialMessages?: Message[];
  api?: string;
  id?: string;
  body?: Record<string, unknown>;
  onResponse?: (response: Response) => void;
  onFinish?: (message: Message) => void;
  onError?: (error: Error) => void;
  systemPrompt?: string; // Add systemPrompt option
}

interface UseChatHelpers {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  handleSubmit: (
    e: FormEvent<HTMLFormElement>,
    chatRequestOptions?: { body?: Record<string, unknown> }
  ) => void;
  append: (
    message: Message | Omit<Message, 'id'>,
    chatRequestOptions?: { body?: Record<string, unknown> }
  ) => Promise<string | null | undefined>;
  reload: (
    chatRequestOptions?: { body?: Record<string, unknown> }
  ) => Promise<string | null | undefined>;
  stop: () => void;
  isLoading: boolean;
  error: Error | undefined;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export function useChat(options: UseChatOptions = {}): UseChatHelpers {
  const {
    initialMessages = [],
    api = '/api/generate',
    body: initialBody = {},
    onResponse,
    onFinish,
    onError,
  } = options;

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
    },
    []
  );

  const append = useCallback(
    async (
      message: Message | Omit<Message, 'id'>,
      chatRequestOptions?: { body?: Record<string, unknown> }
    ): Promise<string | null | undefined> => {
      if (isLoading) return;

      const newMessage: Message = {
        id: generateId(),
        ...message,
        createdAt: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setIsLoading(true);
      setError(undefined);

      const currentMessages = [...messages, newMessage];
      // Prepare messages for API, potentially prepending system prompt
      let apiMessages = currentMessages.map(({ role, content }) => ({ role, content }));
      if (options.systemPrompt) {
        apiMessages = [{ role: 'system', content: options.systemPrompt }, ...apiMessages];
      }


      try {
        const response = await fetch(api, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: apiMessages,
            ...(initialBody ?? {}),
            ...(chatRequestOptions?.body ?? {}),
          }),
        });

        onResponse?.(response);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API Error (${response.status}): ${errorText}`);
        }

        if (!response.body) {
          throw new Error('Response body is null');
        }

        const assistantMessageId = generateId();
        setMessages((prevMessages) => [
          ...prevMessages,
          { id: assistantMessageId, role: 'assistant', content: '', createdAt: new Date() },
        ]);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedContent = '';
        let done = false;

        while (!done) {
          const { value, done: streamDone } = await reader.read();
          done = streamDone;
          const chunk = decoder.decode(value, { stream: true });

          const lines = chunk.split('\n').filter(line => line.trim() !== '');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataContent = line.substring(6).trim();
              if (dataContent === '[DONE]') {
                continue;
              }
              try {
                const parsed = JSON.parse(dataContent);
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) {
                  accumulatedContent += delta;
                  setMessages((prevMessages) =>
                    prevMessages.map((msg) =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: accumulatedContent }
                        : msg
                    )
                  );
                }
              } catch (e) {
                console.error('Failed to parse stream data chunk:', dataContent, e);
              }
            }
          }
        }

        const finalAssistantMessage = messages.find(msg => msg.id === assistantMessageId);
        if (finalAssistantMessage) {
          onFinish?.(finalAssistantMessage);
        }

      } catch (err) {
        console.error('useChat Error:', err);
        const fetchError = err instanceof Error ? err : new Error(String(err));
        setError(fetchError);
        onError?.(fetchError);
        setMessages((prevMessages) => prevMessages.slice(0, -2));
      } finally {
        setIsLoading(false);
      }
      return undefined;
    },
    [api, messages, isLoading, initialBody, onResponse, onFinish, onError, options.systemPrompt]
  );


  const handleSubmit = useCallback(
    (
      e: FormEvent<HTMLFormElement>,
      chatRequestOptions?: { body?: Record<string, unknown> }
    ) => {
      e.preventDefault();
      if (!input.trim()) return;
      const userMessage: Omit<Message, 'id'> = { role: 'user', content: input };
      append(userMessage, chatRequestOptions);
      setInput('');
    },
    [input, append]
  );

  const reload = useCallback(async (
    chatRequestOptions?: { body?: Record<string, unknown> }
  ): Promise<string | null | undefined> => {
    if (isLoading || messages.length === 0) return;

    setIsLoading(true);
    setError(undefined);
    const lastMessage = messages[messages.length - 1];

    const messagesToResend = messages.slice(0, -1);
    if (messagesToResend.length === 0 || lastMessage.role !== 'assistant') {
        setIsLoading(false);
        console.warn("Reload cannot proceed: No previous assistant message to regenerate.");
        return;
    }

    setMessages(messagesToResend);

    // Prepare messages for API, potentially prepending system prompt
    let apiMessages = messagesToResend.map(({ role, content }) => ({ role, content }));
     if (options.systemPrompt) {
        apiMessages = [{ role: 'system', content: options.systemPrompt }, ...apiMessages];
      }

    try {
        const response = await fetch(api, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: apiMessages,
            ...(initialBody ?? {}),
            ...(chatRequestOptions?.body ?? {}),
          }),
        });

        onResponse?.(response);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API Error (${response.status}): ${errorText}`);
        }
        if (!response.body) throw new Error('Response body is null');

        const assistantMessageId = generateId();
        setMessages((prevMessages) => [
          ...prevMessages,
          { id: assistantMessageId, role: 'assistant', content: '', createdAt: new Date() },
        ]);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedContent = '';
        let done = false;

        while (!done) {
          const { value, done: streamDone } = await reader.read();
          done = streamDone;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.trim() !== '');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataContent = line.substring(6).trim();
              if (dataContent === '[DONE]') continue;
              try {
                const parsed = JSON.parse(dataContent);
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) {
                  accumulatedContent += delta;
                  setMessages((prevMessages) =>
                    prevMessages.map((msg) =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: accumulatedContent }
                        : msg
                    )
                  );
                }
              } catch (e) { console.error('Failed to parse stream data chunk:', dataContent, e); }
            }
          }
        }

        const finalAssistantMessage = messages.find(msg => msg.id === assistantMessageId);
        if (finalAssistantMessage) onFinish?.(finalAssistantMessage);

    } catch (err) {
        console.error('useChat Reload Error:', err);
        const fetchError = err instanceof Error ? err : new Error(String(err));
        setError(fetchError);
        onError?.(fetchError);
    } finally {
        setIsLoading(false);
    }
    return undefined;
  }, [api, messages, isLoading, initialBody, onResponse, onFinish, onError, options.systemPrompt]);

  const stop = useCallback(() => {
    console.warn('stop() is not fully implemented yet.');
  }, []);

  return {
    messages,
    setMessages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    append,
    reload,
    stop,
    isLoading,
    error,
  };
}
