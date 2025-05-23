'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { getMessages, saveMessage } from '@/lib/messages';
import { useChat, type Message } from '@/hooks/useChat';
import { useUser } from '@/contexts/AuthContext';
import { systemPrompt } from '@/lib/system-prompt';
import { SiteHeader } from '@/components/site-header';
import { ChatInput } from './ChatInput';
import { AssistantMessage } from './AssistantMessage';
import { UserMessage } from './UserMessage';

export default function ChatPage() {
  const { user } = useUser();
  const { id: conversationId } = useParams();

  const onFinish = (message: Message) => {
    if (conversationId && typeof conversationId === 'string') {
      saveMessage(conversationId, {
        role: message.role,
        content: message.content,
      });
    } else {
      console.error(
        'Conversation ID is missing or invalid, cannot save message.'
      );
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    handleSubmit,
    messages,
    input,
    handleInputChange,
    setMessages,
    append,
    isLoading,
  } = useChat({
    onFinish,
    systemPrompt,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!conversationId) return;
    const unsubscribe = getMessages(
      conversationId as string,
      (firebaseMessages) => {
        if (
          firebaseMessages.length === 1 &&
          !isLoading &&
          messages.length === 0
        ) {
          append({ role: 'user', content: firebaseMessages[0].content });
        } else if (firebaseMessages.length > 1) {
          if (messages.length === 0) {
            setMessages(firebaseMessages);
          }
        }
      }
    );
    return () => unsubscribe();
  }, [conversationId, append, isLoading, messages.length, setMessages]);

  const handleSubmitMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(e);
    saveMessage(conversationId as string, {
      role: 'user',
      content: input,
    });
  };

  return (
    <>
      <SiteHeader title="Chat" />
      <div className="flex-1 overflow-y-auto p-4 relative">
        <div className="max-w-4xl mx-auto">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.25, duration: 0.6 }}
              className="mb-6 flex justify-center"
            >
              {message.role === 'user' ? (
                <UserMessage
                  content={message.content}
                  userEmail={user?.email}
                /> // Use the UserMessage component
              ) : (
                <AssistantMessage content={message.content} /> // Use the AssistantMessage component
              )}
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <ChatInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmitMessage={handleSubmitMessage}
      />
    </>
  );
}
