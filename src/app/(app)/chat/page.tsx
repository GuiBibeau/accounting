'use client';

import { useState, useEffect, ReactNode } from 'react';
import { Sidebar } from '@/components/chat/Sidebar';
import { MainContent } from '@/components/chat/MainContent';
import { Conversation, getConversations } from '@/lib/conversations';
import { Message } from '@/lib/messages';
import { useAuth } from '@/contexts/AuthContext';
import { Unsubscribe } from 'firebase/firestore';

const sampleMessages: Message[] = [
  { role: 'user', content: 'testing this' },
  {
    role: 'assistant',
    content:
      "Hello! I'd be happy to help you test this system. Is there something specific you'd like me to test or demonstrate for you?\n\nI can assist with a wide range of tasks such as:\n\n* Searching for information online\n* Answering questions on various topics\n* Creating visual content like images or slides\n* Finding products or travel information\n* Analyzing images or videos\n* And much more\n\nPlease let me know how I can help!",
  },
];

interface ActionButton {
  icon: ReactNode;
  text: string;
  mobileText: string;
}

interface HomeCard {
  src: string;
  alt: string;
  title: string;
}

const sampleActionButtons: ActionButton[] = [
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
];

const sampleHomeCards: HomeCard[] = [
  {
    src: '/financial-overview-dashboard.png',
    alt: 'Financial planning dashboard',
    title: 'Business Cash Flow Management: Optimizing Working Capital',
  },
  {
    src: '/tax-documents-organized.png',
    alt: 'Tax preparation documents',
    title: 'Small Business Tax Strategies: Maximizing Deductions',
  },
  {
    src: '/growth-strategy-overview.png',
    alt: 'Investment portfolio analysis',
    title: 'Inventory Management: Reducing Costs While Meeting Demand',
  },
  {
    src: '/retirement-planning-abstract.png',
    alt: 'Retirement planning calculator',
    title: 'Employee Benefits Analysis: Balancing Costs and Retention',
  },
];

export default function ChatPage() {
  const [isChatting, setIsChatting] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeConversation, setActiveConversation] = useState<string | null>(
    null
  );
  const [showMainChatHistory, setShowMainChatHistory] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { user } = useAuth();

  const [conversationHistory, setConversationHistory] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    setMounted(true);

    let unsubscribe: Unsubscribe = () => {};

    if (user?.uid) {
      unsubscribe = getConversations(user.uid, (fetchedConversations) => {
        setConversationHistory(fetchedConversations);
      });
    } else {
      setConversationHistory([]);
      setActiveConversation(null);
      setIsChatting(false);
    }

    return () => {
      unsubscribe();
    };
  }, [user]);

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const viewAllConversations = () => {
    setShowMainChatHistory(true);
    setIsChatting(false);
    setActiveConversation(null);
  };

  const selectConversation = (id: string) => {
    setActiveConversation(id);
    // TODO: Fetch messages for this conversation
    console.log(`Fetching messages for conversation ${id}`);
    setMessages(sampleMessages);
    setIsChatting(true);
    setShowMainChatHistory(false);
  };

  const goToHome = () => {
    setIsChatting(false);
    setShowMainChatHistory(false);
    setActiveConversation(null);
  };

  const startChat = (initialMessage?: string) => {
    console.log('Starting new chat with message:', initialMessage);
    setActiveConversation(null);
    setMessages(initialMessage ? [{ role: 'user', content: initialMessage }] : []);
    setIsChatting(true);
    setShowMainChatHistory(false);
    if (initialMessage) {
      setInputValue('');
      // Potentially send the initial message to the backend here
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = { role: 'user', content: inputValue.trim() };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // TODO: Send message to backend API & handle response
    console.log('Sending message:', newMessage);
    // Simulate assistant response
    setTimeout(() => {
      const assistantResponse: Message = {
        role: 'assistant',
        content: `Okay, I received: "${newMessage.content}". I'm processing that now...`,
      };
      setMessages((prevMessages) => [...prevMessages, assistantResponse]);
    }, 1000);

    setInputValue('');
  };

  if (!mounted) return null;

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      <Sidebar
        isExpanded={sidebarExpanded}
        toggleSidebar={toggleSidebar}
        conversationHistory={conversationHistory}
        activeConversation={activeConversation}
        onSelectConversation={selectConversation}
        onViewAllConversations={viewAllConversations}
        onGoToHome={goToHome}
      />
      <MainContent
        isChatting={isChatting}
        showMainChatHistory={showMainChatHistory}
        activeConversation={activeConversation}
        conversationHistory={conversationHistory}
        messages={messages}
        inputValue={inputValue}
        setInputValue={setInputValue}
        onSelectConversation={selectConversation}
        onGoToHome={goToHome}
        onStartChat={startChat}
        onSendMessage={handleSendMessage}
        onSetIsChatting={setIsChatting}
        actionButtons={sampleActionButtons}
        homeCards={sampleHomeCards}
      />
    </div>
  );
}
