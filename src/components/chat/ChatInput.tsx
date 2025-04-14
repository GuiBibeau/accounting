'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { PaperclipIcon, SendHorizontal } from 'lucide-react';

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  onSendMessage: () => void;
  placeholder?: string;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>; // Allow potentially null ref
  containerClassName?: string; // Allow customizing container style
  inputAreaClassName?: string; // Allow customizing input area style
  showBorder?: boolean; // Control border visibility
}

export function ChatInput({
  inputValue,
  setInputValue,
  onSendMessage,
  placeholder = 'Ask anything...',
  textareaRef: externalRef, // Rename prop to avoid conflict
  containerClassName = 'p-4 border-t border-gray-800',
  inputAreaClassName = 'rounded-xl bg-[#333] border border-gray-700 overflow-hidden flex items-center group',
  showBorder = true,
}: ChatInputProps) {
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = externalRef || internalRef; // Use external ref if provided

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && inputValue.trim()) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    target.style.height = 'auto'; // Reset height
    // Set height based on scroll height, capped by max-height if needed
    const maxHeight = 150; // Match max-h-[150px]
    target.style.height = `${Math.min(target.scrollHeight, maxHeight)}px`;
  };

  return (
    <motion.div
      className={containerClassName}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }} // Consistent animation
    >
      <div className="relative">
        <motion.div
          className={`${inputAreaClassName} ${showBorder ? '' : 'border-none'}`} // Conditionally apply border class
          whileHover={
            showBorder ? { borderColor: 'rgba(255, 255, 255, 0.2)' } : {}
          } // Only apply hover if border shown
        >
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput} // Auto-resize height
            className="flex-1 bg-transparent px-4 py-3 outline-none resize-none min-h-[48px] max-h-[150px]" // Consistent height styles
            placeholder={placeholder}
            rows={1} // Start with 1 row
            style={{ height: 'auto' }} // Initial auto height
          />
          <div className="flex items-center px-2">
            <motion.button
              className="p-2 text-gray-400"
              whileHover={{ scale: 1.1, color: '#fff' }}
              whileTap={{ scale: 0.9 }}
              aria-label="Attach file"
            >
              <PaperclipIcon className="w-5 h-5" />
            </motion.button>
            <motion.button
              className={`p-2 rounded-full ml-2 ${
                inputValue.trim()
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
              onClick={onSendMessage}
              disabled={!inputValue.trim()}
              whileHover={{
                scale: inputValue.trim() ? 1.1 : 1,
                backgroundColor: inputValue.trim() ? '#3b82f6' : '#4b5563',
              }}
              whileTap={{ scale: inputValue.trim() ? 0.9 : 1 }}
              aria-label="Send message"
            >
              <SendHorizontal className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
