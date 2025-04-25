'use client';

import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import {
  Code2,
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
import { CollapsibleSectionHeader } from '@/components/ui/CollapsibleSectionHeader';
import { ConnectYouTubeButton } from '@/components/ConnectYouTubeButton';
import { YouTubeIcon } from '@/components/icons/YouTube';

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
  const { user, isYouTubeConnected } = useAuth();
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
      className="border-r border-border flex flex-col relative bg-background text-foreground"
      initial={sidebarExpanded ? 'expanded' : 'collapsed'}
      animate={sidebarExpanded ? 'expanded' : 'collapsed'}
      variants={sidebarVariants}
    >
      <div className="p-4 flex items-center justify-center gap-2 border-b border-border">
        <AnimatePresence mode="wait">
          {sidebarExpanded ? (
            <motion.span
              key="expanded-title"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-semibold"
            >
              <Link href="/chat">relation.dev</Link>
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
                <Code2 className="w-5 h-5 text-primary" />
              </motion.div>
            </Link>
          )}
        </AnimatePresence>
      </div>

      <motion.button
        className="absolute -right-3 top-14 transform bg-accent rounded-full p-1 border border-border z-10 hover:bg-accent/80 transition-colors"
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

      <div className="flex-1 py-4 overflow-y-auto scrollbar-gutter-stable">
        <AnimatePresence mode="wait">
          {sidebarExpanded ? (
            <motion.div
              key="expanded-nav"
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-2" 
            >
            
              <Link href="/chat/history" className="block px-2 py-1.5 text-sm rounded-md hover:bg-accent">
                <div className="flex items-center">
                  <History className="w-4 h-4 mr-2" />
                  Recent Conversations
                </div>
              </Link>

              <div className="px-2 py-1"> 
                {isYouTubeConnected ? (
                  <div>
                    <Link href="/youtube" className="block w-full py-1.5 text-sm rounded-md hover:bg-accent">
                      <div className="flex items-center">
                        <YouTubeIcon className="w-4 h-4 mr-2 text-muted-foreground flex-shrink-0" />
                        <span>YouTube</span>
                      </div>
                    </Link>
                  </div>
                ) : (
                  <ConnectYouTubeButton variant="full" />
                )}
              </div>

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
              <Link href="/chat" passHref>
              <motion.button
                className="p-2 rounded-md"
                aria-label="Home"
                whileHover={{
                  scale: 1.1,
                  backgroundColor: 'hsl(var(--accent))',
                }}
                whileTap={{ scale: 0.9 }}
              >
                <HomeIcon className="w-5 h-5" />
              </motion.button>
              </Link>
              <Link href="/chat/history" passHref>
                <motion.button
                  className="p-2 rounded-md"
                  aria-label="View chat history"
                whileHover={{
                  scale: 1.1,
                  backgroundColor: 'hsl(var(--accent))',
                }}
                  whileTap={{ scale: 0.9 }}
                >
                  <History className="w-5 h-5" />
                </motion.button>
              </Link>

              <div className="px-2">
                {isYouTubeConnected ? (
                  <Link href="/youtube" passHref>
                    <motion.button
                      className="p-2 rounded-md"
                      aria-label="YouTube Options"
                    whileHover={{
                      scale: 1.1,
                      backgroundColor: 'hsl(var(--accent))',
                    }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <YouTubeIcon className="w-5 h-5" />
                    </motion.button>
                  </Link>
                ) : (
                  <ConnectYouTubeButton variant="icon" />
                )}
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 border-t border-border">
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
              {user?.email && (
                 <div className="text-sm text-muted-foreground">Logged in as: {user.email}</div>
              )}
            </div>
            <Button variant="destructive" onClick={logout} className="w-full">
              Disconnect
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  );
};
