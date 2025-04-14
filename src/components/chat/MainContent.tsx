'use client';

import { MessageSquare, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Conversation } from '../../lib/conversations';
import { Message } from '../../lib/messages';
import { useRef } from 'react';
import { ChatInput } from './ChatInput';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { HomeView } from './HomeView';
import { ReactNode } from 'react';

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

const pageTransition = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
};

interface MainContentProps {
  isChatting: boolean;
  showMainChatHistory: boolean;
  activeConversation: string | null;
  conversationHistory: Conversation[];
  messages: Message[];
  inputValue: string;
  setInputValue: (value: string) => void;
  onSelectConversation: (id: string) => void;
  onGoToHome: () => void;
  onStartChat: (message?: string) => void;
  onSendMessage: () => void;
  onSetIsChatting: (isChatting: boolean) => void;
  actionButtons: { icon: ReactNode; text: string; mobileText: string }[];
  homeCards: { src: string; alt: string; title: string }[];
}

export function MainContent({
  isChatting,
  showMainChatHistory,
  activeConversation,
  conversationHistory,
  messages,
  inputValue,
  setInputValue,
  onSelectConversation,
  onGoToHome,
  onStartChat,
  onSendMessage,
  onSetIsChatting,
  actionButtons,
  homeCards,
}: MainContentProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentConversationTitle =
    conversationHistory.find((c) => c.id === activeConversation)?.title ||
    'New Chat';

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <AnimatePresence mode="wait">
        {showMainChatHistory ? (
          <motion.div
            key="history-view"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={pageTransition}
            className="flex-1 flex flex-col p-6 overflow-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold">Conversation History</h1>
              <motion.button
                onClick={onGoToHome}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md"
                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {conversationHistory.map((conversation, index) => (
                <motion.div
                  key={conversation.id}
                  custom={index}
                  variants={listItemVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{
                    y: -4,
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectConversation(conversation.id)}
                  className="border border-gray-800 rounded-lg p-4 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <motion.div
                      className="bg-gray-700 rounded-full p-2"
                      whileHover={{ backgroundColor: '#4a5568' }}
                    >
                      <MessageSquare className="w-5 h-5" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{conversation.title}</h3>
                      <p className="text-sm text-gray-400">
                        {conversation.date}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : isChatting ? (
          <motion.div
            key="chat-view"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={pageTransition}
            className="flex-1 flex flex-col"
          >
            <ChatHeader
              title={currentConversationTitle}
              onBack={() => onSetIsChatting(false)}
            />

            <MessageList messages={messages} />

            <ChatInput
              inputValue={inputValue}
              setInputValue={setInputValue}
              onSendMessage={onSendMessage}
              placeholder="Ask anything..."
            />
          </motion.div>
        ) : (
          <HomeView
            actionButtons={actionButtons}
            homeCards={homeCards}
            inputValue={inputValue}
            setInputValue={setInputValue}
            onStartChat={onStartChat}
            onSendMessage={onSendMessage}
            textareaRef={textareaRef}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
