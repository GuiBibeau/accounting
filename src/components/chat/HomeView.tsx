'use client';

import Image from 'next/image';
import { Calculator } from 'lucide-react';
import { motion } from 'framer-motion';
import { ChatInput } from './ChatInput';

// Define types for props - consider moving to a shared types file
interface ActionButton {
  icon: React.ReactNode;
  text: string;
  mobileText: string;
  // onClick?: () => void; // Add if needed
}

interface HomeCard {
  src: string;
  alt: string;
  title: string;
  // onClick?: () => void; // Add if needed
}

interface HomeViewProps {
  actionButtons: ActionButton[];
  homeCards: HomeCard[];
  inputValue: string;
  setInputValue: (value: string) => void;
  onStartChat: (message?: string) => void;
  onSendMessage: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

// Animation variants (Consider moving to a shared file)
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

export function HomeView({
  actionButtons,
  homeCards,
  inputValue,
  setInputValue,
  onStartChat,
  onSendMessage,
  textareaRef,
}: HomeViewProps) {
  return (
    <motion.main
      key="home-view"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={pageTransition}
      className="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12 flex-1 overflow-auto"
    >
      <motion.h1
        className="text-2xl sm:text-3xl font-semibold text-center text-blue-300 mb-6 sm:mb-8 flex items-center justify-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        Aiccountant
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
        >
          <Calculator className="w-5 h-5 ml-2 text-blue-300" />
        </motion.div>
      </motion.h1>

      {/* Action Buttons */}
      <motion.div
        className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {actionButtons.map((button, index) => (
          <motion.button
            key={index}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-1.5 rounded-full border border-gray-700 bg-[#333] text-xs sm:text-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            whileHover={{
              backgroundColor: '#444',
              y: -2,
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
            whileTap={{ scale: 0.95, y: 0 }}
            // Add onClick handler if needed
          >
            {button.icon}
            <span className="hidden xs:inline">{button.text}</span>
            <span className="xs:hidden">{button.mobileText}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Input Area using ChatInput */}
      <ChatInput
        inputValue={inputValue}
        setInputValue={setInputValue}
        onSendMessage={onSendMessage}
        placeholder="Ask anything, create anything"
        textareaRef={textareaRef} // Pass ref for focusInput to work
        containerClassName="relative mb-6" // Keep container styles
        inputAreaClassName="rounded-xl bg-[#333] border border-gray-700 overflow-hidden flex flex-col" // Keep input area styles
        // Animation is handled by ChatInput's container now
      />

      {/* Suggestion */}
      <motion.div
        className="flex justify-center mb-8 sm:mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          className="flex items-center gap-2 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full bg-[#333] text-xs sm:text-sm"
          onClick={() =>
            onStartChat('Create an invoice for my latest client project')
          } // Use handler
          whileHover={{
            backgroundColor: '#444',
            scale: 1.02,
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="text-gray-400">&ldquo;</span>
          <span className="hidden sm:inline">
            Create an invoice for my latest client project
          </span>
          <span className="sm:hidden">Create an invoice for client</span>
          <span className="text-gray-400">&rdquo;</span>
        </motion.button>
      </motion.div>

      {/* Content Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
              delayChildren: 0.6,
            },
          },
        }}
      >
        {homeCards.map((card, index) => (
          <motion.div
            key={index}
            className="rounded-xl overflow-hidden border border-gray-800 bg-[#222]"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                },
              },
            }}
            whileHover={{
              y: -8,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
            }}
            whileTap={{ scale: 0.98, y: -4 }}
            // Add onClick handler if needed
          >
            <div className="relative h-40 sm:h-48">
              <Image
                src={card.src || '/placeholder.svg'}
                alt={card.alt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 50vw" // Added sizes prop
              />
            </div>
            <motion.div
              className="p-3 sm:p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="font-medium text-sm sm:text-base">{card.title}</h3>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </motion.main>
  );
}
