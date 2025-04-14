'use client';

import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import {
  Calculator,
  ChevronLeft,
  ChevronRight,
  HomeIcon,
  History,
  MessageSquare,
} from 'lucide-react';
import { useState } from 'react';

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

export const SideNav = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeConversation] = useState(8);

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const selectConversation = (_: number) => {};

  const viewAllConversations = () => {};
  const goToHome = () => {};
  return (
    <motion.div
      className="border-r border-gray-800 flex flex-col relative"
      initial={sidebarExpanded ? 'expanded' : 'collapsed'}
      animate={sidebarExpanded ? 'expanded' : 'collapsed'}
      variants={sidebarVariants}
    >
      <div className="p-4 flex items-center justify-center gap-2 border-b border-gray-800">
        <AnimatePresence mode="wait">
          {sidebarExpanded ? (
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

      {/* Toggle Button */}
      <motion.button
        className="absolute -right-3 top-14 transform bg-gray-800 rounded-full p-1 border border-gray-700 z-10 hover:bg-gray-700 transition-colors"
        onClick={toggleSidebar}
        aria-label={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {sidebarExpanded ? (
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

      {/* Navigation */}
      <div className="flex-1 py-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          {sidebarExpanded ? (
            // Expanded view - Only show recent conversations, no chat history option
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

              <div className="space-y-1">
                {conversationHistory.slice(0, 5).map((conversation, index) => (
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
                    onClick={() => selectConversation(conversation.id)}
                    className={`w-full text-left flex items-center mx-2 px-2 py-1.5 text-sm rounded-md ${
                      activeConversation === conversation.id
                        ? 'bg-white/10'
                        : ''
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 flex-shrink-0" />
                    <div className="ml-2 overflow-hidden">
                      <div className="truncate">{conversation.title}</div>
                      <div className="text-xs text-gray-400">
                        {conversation.date}
                      </div>
                    </div>
                  </motion.button>
                ))}

                {conversationHistory.length > 5 && (
                  <motion.button
                    whileHover={{ x: 4, color: '#fff' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={viewAllConversations}
                    className="w-full text-left flex items-center mx-2 px-2 py-1.5 text-sm text-gray-400 rounded-md"
                  >
                    <span className="ml-6">View all conversations...</span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          ) : (
            // Collapsed view - Show home and history icons
            <motion.div
              key="collapsed-nav"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={fadeIn}
              className="flex flex-col items-center pt-4 space-y-6"
            >
              <motion.button
                onClick={goToHome}
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
                onClick={viewAllConversations}
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

      {/* Me Button */}
      <div className="p-4 border-t border-gray-800">
        <motion.button
          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          whileTap={{ scale: 0.95 }}
          className={`w-full flex items-center ${
            sidebarExpanded ? 'px-2' : 'justify-center'
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
            {sidebarExpanded && (
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
};
