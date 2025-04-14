'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/chat/Sidebar';
import { MainContent } from '@/components/chat/MainContent';
import { Conversation } from '@/lib/conversations';
import { Message } from '@/lib/messages';
import { ReactNode } from 'react'; // Import ReactNode for icon type

// Sample conversation history data (can be fetched from an API later)
const sampleConversationHistory: Conversation[] = [
  { id: 1, title: 'Monthly Expense Report', date: 'Apr 12' },
  { id: 2, title: 'Client Invoice #1042', date: 'Apr 10' },
  { id: 3, title: 'Payroll Processing', date: 'Apr 8' },
  { id: 4, title: 'Tax Deduction Analysis', date: 'Apr 7' },
  { id: 5, title: 'Vendor Payment Schedule', date: 'Apr 5' },
  { id: 6, title: 'Employee Timesheet Review', date: 'Apr 3' },
  { id: 7, title: 'Quarterly Financial Report', date: 'Apr 1' },
  { id: 8, title: 'testing this', date: 'Today', active: true },
];

// Sample messages (can be fetched based on active conversation)
const sampleMessages: Message[] = [
  { role: 'user', content: 'testing this' },
  {
    role: 'assistant',
    content:
      "Hello! I'd be happy to help you test this system. Is there something specific you'd like me to test or demonstrate for you?\n\nI can assist with a wide range of tasks such as:\n\n* Searching for information online\n* Answering questions on various topics\n* Creating visual content like images or slides\n* Finding products or travel information\n* Analyzing images or videos\n* And much more\n\nPlease let me know how I can help!", // Completed sentence
  },
];

// Define types for HomeView props (consider moving to a shared types file)
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

// Sample data for Home View (can be fetched later)
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
  const [activeConversation, setActiveConversation] = useState<number | null>(
    null
  ); // Start with no active conversation
  const [showMainChatHistory, setShowMainChatHistory] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // State for conversation history and messages
  const [conversationHistory, setConversationHistory] = useState<
    Conversation[]
  >([]);
  const [messages, setMessages] = useState<Message[]>([]);

  // Ensure animations only run after component is mounted
  useEffect(() => {
    setMounted(true);
    // Load initial data (replace with API calls later)
    setConversationHistory(sampleConversationHistory);
    // Optionally load messages for the default active conversation if any
    const defaultActive = sampleConversationHistory.find((c) => c.active);
    if (defaultActive) {
      setActiveConversation(defaultActive.id);
      setMessages(sampleMessages); // Load sample messages for the active chat
      setIsChatting(true); // Start in chat view if there's an active convo
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const viewAllConversations = () => {
    setShowMainChatHistory(true);
    setIsChatting(false);
    setActiveConversation(null); // Deactivate conversation when viewing history
  };

  const selectConversation = (id: number) => {
    setActiveConversation(id);
    // Fetch messages for this conversation (replace with API call)
    console.log(`Fetching messages for conversation ${id}`);
    setMessages(sampleMessages); // Use sample messages for now
    setIsChatting(true);
    setShowMainChatHistory(false);
  };

  const goToHome = () => {
    setIsChatting(false);
    setShowMainChatHistory(false);
    setActiveConversation(null); // Deactivate conversation when going home
  };

  const startChat = (initialMessage?: string) => {
    // Logic to start a new chat, potentially with an initial message
    console.log('Starting new chat with message:', initialMessage);
    setActiveConversation(null); // No active conversation ID for new chat yet
    setMessages(initialMessage ? [{ role: 'user', content: initialMessage }] : []);
    setIsChatting(true);
    setShowMainChatHistory(false);
    if (initialMessage) {
      setInputValue(''); // Clear input if suggestion was clicked
      // Potentially send the initial message to the backend here
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = { role: 'user', content: inputValue.trim() };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // TODO: Send message to backend API
    console.log('Sending message:', newMessage);
    // Simulate assistant response after a delay
    setTimeout(() => {
      const assistantResponse: Message = {
        role: 'assistant',
        content: `Okay, I received: "${newMessage.content}". I'm processing that now...`,
      };
      setMessages((prevMessages) => [...prevMessages, assistantResponse]);
    }, 1000);

    setInputValue(''); // Clear input field
  };

  if (!mounted) return null; // Prevent rendering server-side or before hydration

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
        conversationHistory={conversationHistory} // Pass full history for history view
        messages={messages}
        inputValue={inputValue}
        setInputValue={setInputValue}
        onSelectConversation={selectConversation} // Pass down for history view interaction
        onGoToHome={goToHome} // Pass down for history view interaction
        onStartChat={startChat} // Pass down for home view interaction
        onSendMessage={handleSendMessage} // Pass down for input interaction
        onSetIsChatting={setIsChatting} // Pass down for chat header back button
        // Pass down HomeView data
        actionButtons={sampleActionButtons}
        homeCards={sampleHomeCards}
      />
    </div>
  );
}
