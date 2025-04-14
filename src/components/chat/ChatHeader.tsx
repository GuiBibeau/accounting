'use client';

import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

interface ChatHeaderProps {
  title: string;
  onBack: () => void;
}

export function ChatHeader({ title, onBack }: ChatHeaderProps) {
  return (
    <div className="p-4 flex items-center border-b border-gray-800">
      <div className="flex items-center gap-3">
        <motion.button
          className="p-1 rounded-full"
          onClick={onBack}
          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          whileTap={{ scale: 0.9 }}
          aria-label="Back to previous view"
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>
      </div>
      <div className="flex-1 text-center font-medium">{title}</div>
      <div className="w-5"></div> {/* Empty div for balance */}
    </div>
  );
}
