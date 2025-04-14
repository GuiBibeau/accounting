'use client';

import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { Conversation } from '../../lib/conversations';

const listItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
    },
  }),
};

interface ConversationListProps {
  conversations: Conversation[];
  activeConversation: string | null;
  onSelectConversation: (id: string) => void;
  onViewAllConversations: () => void;
  maxVisible?: number;
}

export function ConversationList({
  conversations,
  activeConversation,
  onSelectConversation,
  onViewAllConversations,
  maxVisible = 5,
}: ConversationListProps) {
  const visibleConversations = conversations.slice(0, maxVisible);
  const showViewAll = conversations.length > maxVisible;

  return (
    <div className="space-y-1">
      {visibleConversations.map((conversation, index) => (
        <motion.button
          key={conversation.id}
          custom={index}
          variants={listItemVariants}
          initial="hidden"
          animate="visible"
          whileHover={{
            x: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectConversation(conversation.id)}
          className={`w-full text-left flex items-center mx-2 px-2 py-1.5 text-sm rounded-md ${
            activeConversation === conversation.id ? 'bg-white/10' : ''
          }`}
          aria-current={activeConversation === conversation.id ? 'page' : undefined}
        >
          <MessageSquare className="w-4 h-4 flex-shrink-0" />
          <div className="ml-2 overflow-hidden">
            <div className="truncate">{conversation.title}</div>
            <div className="text-xs text-gray-400">{conversation.date}</div>
          </div>
        </motion.button>
      ))}

      {showViewAll && (
        <motion.button
          whileHover={{ x: 4, color: '#fff' }}
          whileTap={{ scale: 0.98 }}
          onClick={onViewAllConversations}
          className="w-full text-left flex items-center mx-2 px-2 py-1.5 text-sm text-gray-400 rounded-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: visibleConversations.length * 0.05 + 0.1 }}
        >
          <span className="ml-6">View all conversations...</span>
        </motion.button>
      )}
    </div>
  );
}
