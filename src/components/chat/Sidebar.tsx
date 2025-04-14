'use client';

import {
  ChevronLeft,
  ChevronRight,
  Calculator,
  History,
  HomeIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Conversation } from '../../lib/conversations';
import { ConversationList } from './ConversationList';

const sidebarVariants = {
  expanded: {
    width: '200px',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  collapsed: {
    width: '60px',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

interface SidebarProps {
  isExpanded: boolean;
  toggleSidebar: () => void;
  conversationHistory: Conversation[];
  activeConversation: string | null;
  onSelectConversation: (id: string) => void;
  onViewAllConversations: () => void;
  onGoToHome: () => void;
}

export function Sidebar({
  isExpanded,
  toggleSidebar,
  conversationHistory,
  activeConversation,
  onSelectConversation,
  onViewAllConversations,
  onGoToHome,
}: SidebarProps) {
  return (
    <motion.div
      className="border-r border-gray-800 flex flex-col relative h-full"
      initial={isExpanded ? 'expanded' : 'collapsed'}
      animate={isExpanded ? 'expanded' : 'collapsed'}
      variants={sidebarVariants}
    >
      <div className="p-4 flex items-center justify-center gap-2 border-b border-gray-800">
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.span
              key="expanded-title"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-semibold"
            >
              Aiccountant
            </motion.span>
          ) : (
            <motion.div
              key="collapsed-icon"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500 }}
            >
              <Calculator className="w-5 h-5 text-blue-300" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.button
        className="absolute -right-3 top-14 transform bg-gray-800 rounded-full p-1 border border-gray-700 z-10 hover:bg-gray-700 transition-colors"
        onClick={toggleSidebar}
        aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div
              key="chevron-left"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.div>
          ) : (
            <motion.div
              key="chevron-right"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="w-4 h-4" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <div className="flex-1 py-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div
              key="expanded-nav"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={fadeIn}
              className="space-y-4"
            >
              <div className="px-4">
                <h2 className="font-medium text-sm text-gray-400">
                  Recent Conversations
                </h2>
              </div>

              <ConversationList
                conversations={conversationHistory}
                activeConversation={activeConversation}
                onSelectConversation={onSelectConversation}
                onViewAllConversations={onViewAllConversations}
                maxVisible={5}
              />
            </motion.div>
          ) : (
            <motion.div
              key="collapsed-nav"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={fadeIn}
              className="flex flex-col items-center pt-4 space-y-6"
            >
              <motion.button
                onClick={onGoToHome}
                className="p-2 rounded-md hover:bg-white/5"
                aria-label="Home"
                whileHover={{
                  scale: 1.1,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }}
                whileTap={{ scale: 0.9 }}
              >
                <HomeIcon className="w-5 h-5" />
              </motion.button>
              <motion.button
                onClick={onViewAllConversations}
                className="p-2 rounded-md hover:bg-white/5"
                aria-label="View chat history"
                whileHover={{
                  scale: 1.1,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }}
                whileTap={{ scale: 0.9 }}
              >
                <History className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 border-t border-gray-800">
        <motion.button
          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          whileTap={{ scale: 0.95 }}
          className={`w-full flex items-center ${
            isExpanded ? 'px-2' : 'justify-center'
          } py-1.5 text-sm rounded-md`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="8" r="5" />
            <path d="M20 21a8 8 0 1 0-16 0" />
          </svg>
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="ml-2 overflow-hidden"
              >
                Me
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  );
}
