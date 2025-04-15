'use client';

import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import {
  Calculator,
  ChevronLeft,
  ChevronRight,
  HomeIcon,
  History,
  User,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { getConversations, Conversation } from '@/lib/conversations';
import { useAuth, useLogout } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  const [activeConversation] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<
    Conversation[]
  >([]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    
    const handleMediaChange = (e: MediaQueryListEvent) => {
      setSidebarExpanded(!e.matches);
    };

    setSidebarExpanded(!mediaQuery.matches);

    mediaQuery.addEventListener('change', handleMediaChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, []);
  const { user } = useAuth();
  const { logout } = useLogout();

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = getConversations(user.uid, (conversations) => {
      setConversationHistory(conversations);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const viewAllConversations = () => {};
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
              <Link href="/chat">Aiccountant</Link>
            </motion.span>
          ) : (
            <Link href="/chat">
              <motion.div
                key="collapsed-icon"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500 }}
              >
                <Calculator className="w-5 h-5 text-blue-300" />
              </motion.div>
            </Link>
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
                    className={`w-full text-left flex items-center mx-2 px-2 py-1.5 text-sm rounded-md ${
                      activeConversation === conversation.id
                        ? 'bg-white/10'
                        : ''
                    }`}
                  >
                    <Link href={`/chat/${conversation.id}`} className="block w-full">
                      <div className="overflow-hidden">
                        <div className="truncate">{conversation.title}</div>
                      </div>
                    </Link>
                  </motion.button>
                ))}

                {conversationHistory.length > 5 && (
                  <motion.button
                    whileHover={{ x: 4, color: '#fff' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={viewAllConversations}
                    className="w-full text-left flex items-center mx-2 px-2 py-1.5 text-sm text-gray-400 rounded-md"
                  >
                    <span>View all conversations...</span>
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
              <Link href="/chat" passHref>
              <motion.button
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
              </Link>
              <Link href="/chat/history" passHref>
                <motion.button
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
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Me Button / Account Dialog */}
      <div className="p-4 border-t border-gray-800">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className={`w-full flex items-center ${
                sidebarExpanded ? 'justify-start px-2' : 'justify-center px-0'
              } py-1.5 text-sm rounded-md`}
            >
              <User className="h-4 w-4 flex-shrink-0" />
              <AnimatePresence>
                {sidebarExpanded && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="ml-2 overflow-hidden whitespace-nowrap"
                  >
                    Me
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Account</DialogTitle>
              <DialogDescription>
                Manage your account settings. Click disconnect to log out.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Future account options can go here */}
              {user?.email && (
                 <div className="text-sm text-muted-foreground">Logged in as: {user.email}</div>
              )}
            </div>
             {/* Changed DialogFooter to just a Button for simplicity */}
            <Button variant="destructive" onClick={logout} className="w-full">
              Disconnect
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  );
};
