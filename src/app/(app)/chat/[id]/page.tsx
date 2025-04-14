'use client';

import { motion } from 'framer-motion';
import { PaperclipIcon, SendHorizontal } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getMessages, Message } from '@/lib/messages';

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [, setIsLoading] = useState(true);
  const { id: conversationId } = useParams();



  useEffect(() => {
    if (!conversationId) return;

    setIsLoading(true);
    const unsubscribe = getMessages(
      conversationId as string,
      (fetchedMessages) => {
        setMessages(fetchedMessages);
        setIsLoading(false);

      }
    );

    return () => unsubscribe();
  }, [conversationId]);

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 relative">
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2, duration: 0.4 }}
            className={`mb-6 ${message.role === 'user' ? 'flex justify-end' : ''}`}
          >
            {message.role === 'user' ? (
              <motion.div
                className="bg-white/10 rounded-full px-4 py-1.5 max-w-[80%]"
                whileHover={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                }}
              >
                {message.content}
              </motion.div>
            ) : (
              <div className="max-w-[80%]">
                <div className="text-white">
                  {message.content.split('\n\n').map((paragraph, i) => {
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
                            {items.map((item, j) => (
                              <motion.li
                                key={j}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + j * 0.05 }}
                              >
                                {item}
                              </motion.li>
                            ))}
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
                <motion.div
                  className="flex items-center mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.div
                    className="w-2 h-2 bg-blue-500 rounded-full mr-1"
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: 'reverse',
                    }}
                  ></motion.div>
                </motion.div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <motion.div
        className="p-4 border-t border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative">
          <motion.div
            className="rounded-xl bg-[#333] border border-gray-700 overflow-hidden"
            whileFocus={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}
            whileHover={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
          >
            <textarea
              className="w-full bg-transparent px-4 py-3 outline-none resize-none h-12"
              placeholder="Ask anything, create anything"
            />
            <div className="absolute right-2 bottom-2 flex items-center">
              <motion.button
                className="p-2 text-gray-400"
                whileHover={{ scale: 1.1, color: '#fff' }}
                whileTap={{ scale: 0.9 }}
              >
                <PaperclipIcon className="w-5 h-5" />
              </motion.button>
              <motion.button
                className="p-2 rounded-full bg-blue-500 ml-2"
                whileHover={{ scale: 1.1, backgroundColor: '#3b82f6' }}
                whileTap={{ scale: 0.9 }}
              >
                <SendHorizontal className="w-5 h-5 text-white" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
