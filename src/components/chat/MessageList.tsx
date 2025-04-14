'use client';

import { useEffect, useRef } from 'react';
import { Message } from '../../lib/messages';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
      {messages.map((message, index) => (
        <MessageBubble key={index} message={message} index={index} />
      ))}
      {/* Add a scroll anchor div if needed for more precise scrolling */}
      {/* <div ref={messagesEndRef} /> */}
    </div>
  );
}
