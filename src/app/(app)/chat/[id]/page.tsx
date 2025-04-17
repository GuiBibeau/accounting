'use client';

import { motion } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { getMessages, saveMessage } from '@/lib/messages';
import { useChat, type Message } from '@/hooks/useChat';
import { useUser } from '@/contexts/AuthContext';
import { systemPrompt } from '@/lib/system-prompt'; // Import the system prompt
import { ChatInput } from './ChatInput';

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
    systemPrompt, // Pass the system prompt
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
    // Update dependency array
  }, [conversationId, append, isLoading, messages.length, setMessages]); // Removed handleSubmit, setInput, status; Added append, isLoading, messages.length

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
                <motion.div className="flex items-center gap-3 bg-accent rounded-full px-4 py-3 max-w-[90%] md:max-w-[80%] lg:max-w-[70%] w-full hover:bg-accent/90">
                  <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                    <AvatarImage src="/user-avatar.png" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>{message.content}</div>
                </motion.div>
              ) : (
                <div className="flex items-center  rounded-full px-4 py-3 max-w-[90%] md:max-w-[80%] lg:max-w-[70%] w-full">
                  <div className="text-foreground w-full">
                    {message.content
                      .split('\n\n')
                      .map((paragraph: string, i: number) => {
                        // Added types
                        if (paragraph.includes('* ')) {
                          const items = paragraph.split('* ').filter(Boolean);
                          return (
                            <motion.div
                              key={i}
                              className="mb-4"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.3 + i * 0.1 }}
                            >
                              <ul className="list-disc pl-5 space-y-1">
                                {items.map(
                                  (
                                    item: string,
                                    j: number // Added types
                                  ) => (
                                    <motion.li
                                      key={j}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: 0.4 + j * 0.05 }}
                                    >
                                      {item}
                                    </motion.li>
                                  )
                                )}
                              </ul>
                            </motion.div>
                          );
                        }
                        return (
                          <motion.p
                            key={i}
                            className="mb-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                          >
                            {paragraph}
                          </motion.p>
                        );
                      })}
                  </div>
                </div>
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
