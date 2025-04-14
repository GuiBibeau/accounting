'use client';

import { motion } from 'framer-motion';
import { Message } from '../../lib/messages';

interface MessageBubbleProps {
  message: Message;
  index: number; // For animation delay calculation
}

export function MessageBubble({ message, index }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  // Basic paragraph splitting for assistant messages
  const renderAssistantContent = (content: string) => {
    return content.split('\n\n').map((paragraph, i) => (
      <p key={i} className="mb-2 last:mb-0">
        {paragraph}
      </p>
    ));
  };

  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className={`mb-4 flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {isUser ? (
        <motion.div
          className="bg-blue-600 rounded-lg px-4 py-2 max-w-[80%] text-white"
          whileHover={{ backgroundColor: '#2563eb' }}
        >
          {message.content}
        </motion.div>
      ) : (
        <div className="max-w-[80%] bg-gray-700 rounded-lg px-4 py-2">
          {renderAssistantContent(message.content)}
          {/* Placeholder for potential typing indicator or actions */}
        </div>
      )}
    </motion.div>
  );
}
