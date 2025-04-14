'use client';

import Image from 'next/image';
import {
  PaperclipIcon,
  SendHorizontal,
  ChevronLeft,
  MessageSquare,
  Calculator,
  ArrowLeft,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { LandingChatInput } from './LandingChatInput';

const conversationHistory = [
  { id: 1, title: 'Monthly Expense Report', date: 'Apr 12' },
  { id: 2, title: 'Client Invoice #1042', date: 'Apr 10' },
  { id: 3, title: 'Payroll Processing', date: 'Apr 8' },
  { id: 4, title: 'Tax Deduction Analysis', date: 'Apr 7' },
  { id: 5, title: 'Vendor Payment Schedule', date: 'Apr 5' },
  { id: 6, title: 'Employee Timesheet Review', date: 'Apr 3' },
  { id: 7, title: 'Quarterly Financial Report', date: 'Apr 1' },
  { id: 8, title: 'testing this', date: 'Today', active: true },
];

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

export default function Home() {
  const [isChatting, setIsChatting] = useState(false);
  const [activeConversation, setActiveConversation] = useState(8);
  const [showMainChatHistory, setShowMainChatHistory] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [messages] = useState([
    { role: 'user', content: 'testing this' },
    {
      role: 'assistant',
      content:
        "Hello! I'd be happy to help you test this system. Is there something specific you'd like me to test or demonstrate for you?\n\nI can assist with a wide range of tasks such as:\n\n* Searching for information online\n* Answering questions on various topics\n* Creating visual content like images or slides\n* Finding products or travel information\n* Analyzing images or videos\n* And much more\n\nPlease",
    },
  ]);

  const startChat = () => {
    setIsChatting(true);
    setShowMainChatHistory(false);
  };

  const selectConversation = (id) => {
    setActiveConversation(id);
    setIsChatting(true);
    setShowMainChatHistory(false);
  };

  const goToHome = () => {
    setIsChatting(false);
    setShowMainChatHistory(false);
  };

  if (!mounted) return null;

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <AnimatePresence mode="wait">
        {showMainChatHistory ? (
          // Conversation History Page in Main Content - No top navigation
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
                onClick={goToHome}
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
                  onClick={() => selectConversation(conversation.id)}
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
          // Chat View
          <motion.div
            key="chat-view"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={pageTransition}
            className="flex-1 flex flex-col"
          >
            {/* Chat Header */}
            <div className="p-4 flex items-center">
              <div className="flex items-center gap-3">
                <motion.button
                  className="p-1 rounded-full"
                  onClick={() => setIsChatting(false)}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>
              </div>
              <div className="flex-1 text-center font-medium">
                {conversationHistory.find((c) => c.id === activeConversation)
                  ?.title || 'testing this'}
              </div>
              <div className="w-5"></div> {/* Empty div for balance */}
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4">
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

            {/* Chat Input */}
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
                  ></textarea>
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
          </motion.div>
        ) : (
          // Home View
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
              {[
                {
                  icon: (
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
                      className="w-3 h-3 sm:w-4 sm:h-4"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="M3 9h18" />
                      <path d="M9 21V9" />
                    </svg>
                  ),
                  text: 'Generate Timesheet',
                  mobileText: 'Timesheet',
                },
                {
                  icon: (
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
                      className="w-3 h-3 sm:w-4 sm:h-4"
                    >
                      <path d="M21 14H3" />
                      <path d="M21 9H3" />
                      <path d="M21 4H3" />
                      <path d="M21 19H3" />
                    </svg>
                  ),
                  text: 'Send Invoice',
                  mobileText: 'Invoice',
                },
                {
                  icon: (
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
                      className="w-3 h-3 sm:w-4 sm:h-4"
                    >
                      <circle cx="8" cy="21" r="1" />
                      <circle cx="19" cy="21" r="1" />
                      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                    </svg>
                  ),
                  text: 'View Payables',
                  mobileText: 'Payables',
                },
                {
                  icon: (
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
                      className="w-3 h-3 sm:w-4 sm:h-4"
                    >
                      <path d="M12 2v20" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  ),
                  text: 'Track Expenses',
                  mobileText: 'Expenses',
                },
                {
                  icon: (
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
                      className="w-3 h-3 sm:w-4 sm:h-4"
                    >
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <line x1="2" x2="22" y1="10" y2="10" />
                    </svg>
                  ),
                  text: 'Run Payroll',
                  mobileText: 'Payroll',
                },
              ].map((button, index) => (
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
                >
                  {button.icon}
                  <span className="hidden xs:inline">{button.text}</span>
                  <span className="xs:hidden">{button.mobileText}</span>
                </motion.button>
              ))}
            </motion.div>

            {/* Input Area */}

            <LandingChatInput />

            {/* Suggestion */}
            <motion.div
              className="flex justify-center mb-8 sm:mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.button
                className="flex items-center gap-2 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full bg-[#333] text-xs sm:text-sm"
                onClick={startChat}
                whileHover={{
                  backgroundColor: '#444',
                  scale: 1.02,
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="hidden sm:inline">
                  Create an invoice for my latest client project
                </span>
                <span className="sm:hidden">Create an invoice for client</span>
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
              {[
                {
                  src: '/financial-overview-dashboard.png',
                  alt: 'Financial planning dashboard',
                  title:
                    'Business Cash Flow Management: Optimizing Working Capital',
                },
                {
                  src: '/tax-documents-organized.png',
                  alt: 'Tax preparation documents',
                  title: 'Small Business Tax Strategies: Maximizing Deductions',
                },
                {
                  src: '/growth-strategy-overview.png',
                  alt: 'Investment portfolio analysis',
                  title:
                    'Inventory Management: Reducing Costs While Meeting Demand',
                },
                {
                  src: '/retirement-planning-abstract.png',
                  alt: 'Retirement planning calculator',
                  title:
                    'Employee Benefits Analysis: Balancing Costs and Retention',
                },
              ].map((card, index) => (
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
                >
                  <div className="relative h-40 sm:h-48">
                    <Image
                      src={card.src || '/placeholder.svg'}
                      alt={card.alt}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <motion.div
                    className="p-3 sm:p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="font-medium text-sm sm:text-base">
                      {card.title}
                    </h3>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}
