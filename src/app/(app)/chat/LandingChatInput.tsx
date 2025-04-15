// Removed unused imports: DocumentData, DocumentReference
import { motion } from 'framer-motion';
import { PaperclipIcon, SendHorizontal } from 'lucide-react';
import { useRef, useState } from 'react';
import { createConversation } from '@/lib/conversations';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Removed Props type and component prop
export const LandingChatInput: React.FC = () => {
  const textareaRef = useRef(null);
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const router = useRouter();
  

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey && inputValue.trim()) {
        e.preventDefault();
        const conversationId = await createConversation({
          userId: user?.uid as string,
          message: inputValue,
        });

        router.push(`/chat/${conversationId}`);
    }
    };

  return (
    <motion.div
      className="relative mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="rainbow-border-container">
        <motion.div
          className="rounded-xl bg-[#333] border border-gray-700 overflow-hidden"
          whileHover={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
          animate={{
            boxShadow: [
              '0px 0px 0px rgba(0,0,0,0)',
              '0px 4px 12px rgba(0,0,0,0.1)',
              '0px 0px 0px rgba(0,0,0,0)',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: 'reverse',
          }}
        >
          <textarea
            ref={textareaRef}
            className="w-full bg-transparent px-4 py-3 outline-none resize-none h-20"
            placeholder="Ask anything, create anything"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="flex items-center justify-end px-3 py-2 border-t border-gray-700">
            <motion.button
              className="p-2 text-gray-400"
              whileHover={{ scale: 1.1, color: '#fff' }}
              whileTap={{ scale: 0.9 }}
            >
              <PaperclipIcon className="w-5 h-5" />
            </motion.button>
            <motion.button
              className="p-2 rounded-full bg-blue-500 ml-2"
              onClick={() => {
                if (inputValue.trim()) {
                  setInputValue('');
                }
              }}
              whileHover={{ scale: 1.1, backgroundColor: '#3b82f6' }}
              whileTap={{ scale: 0.9 }}
            >
              <SendHorizontal className="w-5 h-5 text-white" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
