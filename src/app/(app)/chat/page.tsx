'use client';

import React from 'react';
import { ConversationHistory } from '@/components/ConversationHistory'; // Import actual component
import { NewChatInterface } from '@/components/NewChatInterface'; // Import actual component

export default function ChatPage() {
  return (
    // Ensure the container takes full height of its parent (likely the main app layout)
    <div className="flex h-full overflow-hidden">
      {/* Left Column: Conversation History */}
      {/* Fixed width, prevent shrinking, add padding */}
      <div className="w-64 md:w-72 lg:w-80 flex-shrink-0 border-r border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 p-4">
        <ConversationHistory />
      </div>

      {/* Right Column: Chat Interface */}
      {/* Takes remaining space, allows content to scroll internally */}
      <div className="flex-1 flex flex-col min-w-0"> {/* min-w-0 prevents content pushing layout */}
        <NewChatInterface />
      </div>
    </div>
  );
}
