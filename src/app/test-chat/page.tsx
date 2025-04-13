'use client';

import { useChat } from '@ai-sdk/react';

export default function TestChatPage() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat', // Pointing to the API route we created
  });

  return (
    <div>
      <h1>Test Groq Chat</h1>
      <div>
        {messages.map(m => (
          <div key={m.id}>
            <strong>{m.role === 'user' ? 'User: ' : 'AI: '}</strong>
            {m.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <label>
          Say something...
          <input value={input} onChange={handleInputChange} />
        </label>
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
